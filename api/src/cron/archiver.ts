import cron from "node-cron";
import { archiveEmails } from "../archiver";
import { userRepo } from "../db";
import pino from "../logger";
import { Server } from "socket.io";

const logger = pino.child({
  module: "cron/archiver",
});
export default function schedule(io?: Server) {
  cron.schedule("*/1 * * * *", async () => {
    const start = new Date();
    logger.info(
      {
        start,
      },
      "Starting archiver cron job"
    );
    const users = await userRepo.find({
      isEnabled: true, // Only archive for users that have enabled the archiver
    });
    const promises = users.map((user) => {
      return archiveEmails(user, io);
    });
    await Promise.allSettled(promises);
    const end = new Date();
    logger.info(
      {
        start,
        end: new Date(),
        duration: (end.getTime() - start.getTime()) / 1000,
      },
      "Finished archiver cron job"
    );
  });
}
