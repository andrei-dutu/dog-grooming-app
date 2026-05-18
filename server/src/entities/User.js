import { BaseEntity } from "./BaseEntity.js";

export class User extends BaseEntity {
  toJSON() {
    const { password, ...safe } = this;
    return safe;
  }
}
