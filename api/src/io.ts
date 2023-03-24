import { Server } from "socket.io";
import http from "http";

export const createSocketIoServer = (server: http.Server) => {
  const io = new Server(server, {
    path: "/io",
    cors: {
      origin: "*",
    },
  });
  io.on("connection", (socket) => {
    console.log("a user connected");
  });
  return io;
};
