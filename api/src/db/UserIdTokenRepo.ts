import { Knex } from "knex";
import BaseRepo from "./BaseRepo";

export interface UserIdToken {
  id?: string;
  idToken: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default class UserIdTokenRepo extends BaseRepo<UserIdToken> {
  findByIdToken(idToken: string) {
    return this.db(this.tableName).where({ idToken }).first<UserIdToken>();
  }
}
