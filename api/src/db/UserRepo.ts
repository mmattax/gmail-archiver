import BaseRepo from "./BaseRepo";

export interface UserSettings {
  isEnabled: boolean;
  daysToWait: number;
  skip: {
    respondedTo: boolean;
    starred: boolean;
    important: boolean;
  };
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  isEnabled: false,
  daysToWait: 3,
  skip: {
    respondedTo: true,
    starred: true,
    important: true,
  },
};

export interface User {
  id?: string;
  googleId: string;
  googleCredentials: string;
  email: string;
  firstName: string;
  lastName: string;
  settings?: UserSettings;
  isEnabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export default class UserRepo extends BaseRepo<User> {
  findByGoogleId(googleId: string) {
    return this.db(this.tableName).where({ google_id: googleId }).first();
  }
}
