import { prisma } from "../db/prisma.js";
import { Dog } from "../entities/Dog.js";
import { createRepository } from "./createRepository.js";

export const dogRepository = createRepository({
  delegate: prisma.dog,
  Entity: Dog,
});