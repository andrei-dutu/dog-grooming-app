export class BaseEntity {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  static fromPrisma(record) {
    if (!record) return null;
    return new this(record);
  }

  toJSON() {
    return { ...this };
  }
}
