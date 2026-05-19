import { prisma } from "../db/prisma.js";
import { Service } from "../entities/Service.js";
import { createRepository } from "./createRepository.js";

export const serviceRepository = createRepository({
  delegate: prisma.service,
  Entity: Service,
});

serviceRepository.findByGroomerId = async (groomerProfileId) => {
  const rows = await prisma.service.findMany({
    where: { groomer_profile_id: groomerProfileId, is_active: true }
  });
  return rows.map(row => Service.fromPrisma(row));
};