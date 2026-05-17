import { prisma } from "../db/prisma.js";
import { Service } from "../entities/Service.js";
import { createRepository } from "./createRepository.js";

export const serviceRepository = createRepository({
  delegate: prisma.service,
  Entity: Service,
});