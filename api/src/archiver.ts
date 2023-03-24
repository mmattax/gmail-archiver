import { google, gmail_v1 } from "googleapis";
import { Logger } from "pino";
import { archivedMessageRepo, userRepo } from "./db";
import { Server } from "socket.io";

import { DEFAULT_USER_SETTINGS, User } from "./db/UserRepo";
import pino from "./logger";

const MAX_ITERATIONS = 5;
const BATCH_SIZE = 10;

const shouldArchiveMessage = async (
  user: User,
  gmail: gmail_v1.Gmail,
  message: gmail_v1.Schema$Message,
  logger?: Logger
) => {
  if (message.id == null) {
    return false;
  }

  // Grab the message
  const { data } = await gmail.users.messages.get({
    userId: "me",
    id: message.id,
  });

  // If it's starred or important, don't archive it
  const skipLabelsIds: string[] = [];
  if (user.settings?.skip.starred) {
    skipLabelsIds.push("STARRED");
  }
  if (user.settings?.skip.important) {
    skipLabelsIds.push("IMPORTANT");
  }

  const hasSkipLabel = data.labelIds?.some((labelId) => {
    return skipLabelsIds.includes(labelId);
  });

  if (hasSkipLabel) {
    return false;
  }

  if (user.settings?.skip.respondedTo) {
    // TODO: Check if the message has been responded to
  }

  return false;
};

export const archiveEmails = async (user: User, io?: Server) => {
  if (user.id == null) {
    throw new Error("User ID is required");
  }
  const logger = pino.child({
    module: "archiver",
    user: {
      id: user.id,
      email: user.email,
    },
  });

  if (!user.settings?.isEnabled) {
    logger.info("Archiver is disabled for this user, skipping");
    return;
  }

  // Setup the Gmail API
  const googleCredentials = JSON.parse(user.googleCredentials);
  const oauth2Client = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  });
  oauth2Client.setCredentials(googleCredentials);
  const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client,
  });

  let pageToken: string | undefined;
  let i = 0;
  while (i < MAX_ITERATIONS || pageToken == null) {
    if (user.id) {
      // Refresh the user to get the latest settings
      user = await userRepo.findById(user.id);
      if (!user) {
        logger.error("User not found during archiver loop");
        break;
      }
    }

    if (!user.settings?.isEnabled) {
      logger.info("Archiver is disabled for this user, skipping");
      break;
    }

    // Build the list query
    const daysToWait =
      user.settings.daysToWait ?? DEFAULT_USER_SETTINGS.daysToWait;
    const q = [`older_than:${daysToWait}d`];
    const listParams = {
      userId: "me",
      labelIds: ["INBOX"],
      maxResults: BATCH_SIZE,
      q: q.join(" "),
    };

    // Grab the first 10 emails in the inbox
    logger.debug({ i }, "Fetching messages from inbox");
    const { data } = await gmail.users.messages.list({
      pageToken,
      ...listParams,
    });
    pageToken = data.nextPageToken ?? undefined;

    const shouldArchivePromises = data.messages?.map(async (message) => {
      return shouldArchiveMessage(user, gmail, message, logger);
    });
    if (shouldArchivePromises == null) {
      logger.debug("No messages to archive");
      return;
    }

    const shouldArchiveLookup = await Promise.all(shouldArchivePromises);
    const messageIdsToArchive = data.messages
      ?.filter((message, index) => {
        return message.id != null && shouldArchiveLookup[index];
      })
      .map((message) => {
        return message.id;
      }) as string[];

    logger.debug(
      {
        messageIdsToArchive,
      },
      "Messages to archive"
    );

    // Batch archive the messages
    if (messageIdsToArchive?.length) {
      await gmail.users.messages.batchModify({
        userId: "me",
        requestBody: {
          ids: messageIdsToArchive,
          removeLabelIds: ["INBOX"],
        },
      });
      await archivedMessageRepo.create(
        messageIdsToArchive.map((messageId) => ({
          messageId,
          userId: user.id!,
        }))
      );

      const ioMessage = {
        count: messageIdsToArchive.length,
      };
      io?.emit("countUpdate", ioMessage);
      io?.emit(`countUpdate:${user.id}`, ioMessage);
    } else {
      logger.debug("No messages to archive");
    }
    i++;
  }
};
