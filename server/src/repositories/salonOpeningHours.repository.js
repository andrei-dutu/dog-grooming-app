import { prisma } from "../db/prisma.js";
import { SalonOpeningHours } from "../entities/SalonOpeningHours.js";
import { createRepository } from "./createRepository.js";

export const salonOpeningHoursRepository = createRepository({
  delegate: prisma.salonOpeningHours,
  Entity: SalonOpeningHours,
});