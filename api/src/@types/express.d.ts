import { Server } from "socket.io";
import { User } from "../db/UserRepo";

// to make the file a module and avoid the TypeScript error
export {};

declare global {
  namespace Express {
    export interface Request {
      io?: Server;
      currentUser?: User;
    }
  }
}
