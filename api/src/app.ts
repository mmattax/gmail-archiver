import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";

import logger from "./logger";
import oauthRoutes from "./routes/oauth";
import meRoutes from "./routes/me";

import { userRepo } from "./db";
import { archiveEmails } from "./archiver";
import schedule from "./cron/archiver";
import { createSocketIoServer } from "./io";
import auth from "./middleware/auth";

const PORT = process.env.PORT ?? 5000;

const app = express();
const server = http.createServer(app);
const io = createSocketIoServer(server);

app.use((req, res, next) => {
  // Put the io instance on the request so we can access it in the routes
  req.io = io;
  next();
});
app.use(cors());
app.use(express.json());
app.use(auth);
app.use("/oauth", oauthRoutes);
app.use("/me", meRoutes);

if (process.env.USE_CRON === "true") {
  logger.info("Using cron to schedule archiving");
  schedule(io);
}

server.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});
