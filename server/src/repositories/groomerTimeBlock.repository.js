import { prisma } from "../db/prisma.js";
import { GroomerTimeBlock } from "../entities/GroomerTimeBlock.js";
import { createRepository } from "./createRepository.js";

function parseDateFields(data) {
  if (!data) return data;
  const parsed = { ...data };
  if (parsed.start_datetime) {
    parsed.start_datetime = new Date(parsed.start_datetime);
  }
  if (parsed.end_datetime) {
    parsed.end_datetime = new Date(parsed.end_datetime);
  }
  return parsed;
}

export const groomerTimeBlockRepository = createRepository({
  delegate: prisma.groomerTimeBlock,
  Entity: GroomerTimeBlock,
  beforeCreate: parseDateFields,
  beforeUpdate: parseDateFields,
});
