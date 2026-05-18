import { prisma } from "../db/prisma.js";
import { GroomerProfile } from "../entities/GroomerProfile.js";
import { createRepository } from "./createRepository.js";

export const groomerProfileRepository = createRepository({
  delegate: prisma.groomerProfile,
  Entity: GroomerProfile,
});
