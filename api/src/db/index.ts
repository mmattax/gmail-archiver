import knex from "knex";
import knexStringcase from "knex-stringcase";
import UserIdTokenRepo from "./UserIdTokenRepo";
import UserRepo from "./UserRepo";
import ArchivedMessageRepo from "./ArchivedMessageRepo";

const db = knex(
  knexStringcase({
    client: "pg",
    connection: process.env.DATABASE_URL,
  })
);

export const userRepo = new UserRepo(db, "user");
export const userIdTokenRepo = new UserIdTokenRepo(db, "user_id_token");
export const archivedMessageRepo = new ArchivedMessageRepo(
  db,
  "archived_message"
);

export default db;
