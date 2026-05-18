import { HttpError } from "../utils/httpError.js";

export function createRepository({ delegate, Entity, beforeCreate, beforeUpdate }) {
  return {
    async findAll() {
      const rows = await delegate.findMany();
      return rows.map((row) => Entity.fromPrisma(row));
    },

    async findById(id) {
      const row = await delegate.findUnique({ where: { id } });
      if (!row) {
        throw new HttpError(404, "Record not found");
      }
      return Entity.fromPrisma(row);
    },

    async create(data) {
      const payload = beforeCreate ? await beforeCreate(data) : data;
      const row = await delegate.create({ data: payload });
      return Entity.fromPrisma(row);
    },

    async update(id, data) {
      await this.findById(id);
      const payload = beforeUpdate ? await beforeUpdate(data) : data;
      const row = await delegate.update({ where: { id }, data: payload });
      return Entity.fromPrisma(row);
    },

    async delete(id) {
      await this.findById(id);
      const row = await delegate.delete({ where: { id } });
      return Entity.fromPrisma(row);
    },
  };
}
