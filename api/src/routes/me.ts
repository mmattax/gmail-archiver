import express from "express";
import { archivedMessageRepo, userRepo } from "../db";
import { DEFAULT_USER_SETTINGS, User, UserSettings } from "../db/UserRepo";
import logger from "../logger";

const router = express.Router();

const publicSettings = (user: User) => {
  let defaultSettings: UserSettings = {
    ...DEFAULT_USER_SETTINGS,
  };

  if (user?.settings == null) {
    return defaultSettings;
  }

  const userSettings =
    typeof user.settings === "string"
      ? JSON.parse(user.settings)
      : user.settings;
  return {
    ...defaultSettings,
    isEnabled: userSettings.isEnabled,
    daysToWait: userSettings.daysToWait,
    skip: {
      ...defaultSettings.skip,
      ...userSettings.skip,
    },
  };
};

const publicData = async (user: User) => {
  if (user?.id == null) {
    return null;
  }
  const archivedCount = await archivedMessageRepo.getArchivedMessageCount(
    user.id
  );
  return {
    archivedCount,
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    settings: publicSettings(user),
  };
};

router.get("/", async (req, res) => {
  if (!req.currentUser) {
    throw new Error("No current user");
  }
  const user = await publicData(req.currentUser);
  res.json({
    user,
  });
});

router.put("/settings", async (req, res) => {
  if (!req.currentUser?.id) {
    throw new Error("No current user");
  }

  if (req.body.isEnabled == null) {
    res.status(400).json({
      error: "isEnabled is required",
    });
  }

  if (req.body.daysToWait == null) {
    res.status(400).json({
      error: "daysToWait is required",
    });
  }

  if (req.body.skip == null) {
    res.status(400).json({
      error: "skip is required",
    });
  }

  const settings: any = {
    isEnabled: req.body.isEnabled ?? DEFAULT_USER_SETTINGS.isEnabled,
    daysToWait: req.body.daysToWait ?? DEFAULT_USER_SETTINGS.daysToWait,
    skip: {
      respondedTo:
        req.body.skip.respondedTo ?? DEFAULT_USER_SETTINGS.skip.respondedTo,
      starred: req.body.skip.starred ?? DEFAULT_USER_SETTINGS.skip.starred,
      important:
        req.body.skip.important ?? DEFAULT_USER_SETTINGS.skip.important,
    },
  };

  await userRepo.update(req.currentUser.id, {
    isEnabled: settings.isEnabled,
    settings,
  });

  const user = {
    ...req.currentUser,
    settings,
  };

  res.json({ user: await publicData(user) });
});

export default router;
