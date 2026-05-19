import bcrypt from "bcryptjs";
import { normalizeEmail } from "../utils/emailValidation.js";
import { prisma } from "../db/prisma.js";
import { User } from "../entities/User.js";
import { createRepository } from "./createRepository.js";

async function hashPasswordIfPresent(data) {
  if (!data?.password) return data;
  const { password, ...rest } = data;
  return { ...rest, password: await bcrypt.hash(password, 10) };
}

export const userRepository = createRepository({
  delegate: prisma.user,
  Entity: User,
  beforeCreate: hashPasswordIfPresent,
  beforeUpdate: hashPasswordIfPresent,
});

userRepository.findByEmail = async (email) => {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  const row = await prisma.user.findUnique({ where: { email: normalized } });
  if (!row) return null;
  return User.fromPrisma(row);
};