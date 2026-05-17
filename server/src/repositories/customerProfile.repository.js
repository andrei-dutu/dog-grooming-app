import { prisma } from "../db/prisma.js";
import { CustomerProfile } from "../entities/CustomerProfile.js";
import { createRepository } from "./createRepository.js";

export const customerProfileRepository = createRepository({
  delegate: prisma.customerProfile,
  Entity: CustomerProfile,
});
