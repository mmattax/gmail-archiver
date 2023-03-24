import { Knex } from "knex";

export default abstract class BaseRepo<T extends {}> {
  protected db: Knex;
  protected tableName: string;
  constructor(db: Knex, tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  find(params?: Partial<T>) {
    const query = this.db.select().from<T>(this.tableName);
    if (params) {
      query.where(params);
    }
    return query;
  }

  findById(id: string) {
    return this.db(this.tableName).where({ id }).first<T>();
  }

  create(data: T | T[]) {
    return this.db(this.tableName).insert(data).returning("*");
  }

  update(id: string, data: Partial<T>) {
    return this.db
      .update(data)
      .from(this.tableName)
      .where({ id })
      .returning("*");
  }
}
