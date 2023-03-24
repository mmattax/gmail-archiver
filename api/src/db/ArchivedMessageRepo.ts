import BaseRepo from "./BaseRepo";

export interface ArchivedMessage {
  id?: string;
  userId: string;
  messageId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default class ArchivedMessageRepo extends BaseRepo<ArchivedMessage> {
  async getArchivedMessageCount(userId: string) {
    const res = await this.db(this.tableName)
      .where({ userId })
      .count("id as archivedCount")
      .first<{ archivedCount: number }>();
    return res.archivedCount;
  }
}
