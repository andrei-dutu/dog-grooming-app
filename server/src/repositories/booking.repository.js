import { prisma } from "../db/prisma.js";
import { Booking } from "../entities/Booking.js";
import { createRepository } from "./createRepository.js";

export const bookingRepository = createRepository({
  delegate: prisma.booking,
  Entity: Booking,
});