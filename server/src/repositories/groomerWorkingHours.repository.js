import { prisma } from "../db/prisma.js";
import { GroomerWorkingHours } from "../entities/GroomerWorkingHours.js";
import { createRepository } from "./createRepository.js";

export const groomerWorkingHoursRepository = createRepository({
  delegate: prisma.groomerWorkingHours,
  Entity: GroomerWorkingHours,
});
