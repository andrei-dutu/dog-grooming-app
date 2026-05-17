import { prisma } from "../db/prisma.js";
import { SalonInfo } from "../entities/SalonInfo.js";
import { createRepository } from "./createRepository.js";

export const salonInfoRepository = createRepository({
  delegate: prisma.salonInfo,
  Entity: SalonInfo,
});