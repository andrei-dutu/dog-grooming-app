import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { requireDogOwnership } from "../middleware/ownership.js";
import { dogRepository } from "../repositories/index.js";
import { prisma } from "../db/prisma.js";

const router = Router();

router.use(authenticate);
router.use(authorize("CLIENT", "ADMIN"));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    if (req.user.role === "ADMIN") {
      const dogs = await dogRepository.findAll();
      return res.json(dogs.map((dog) => dog.toJSON()));
    }

    const dogs = await prisma.dog.findMany({
      where: {
        customer_profile: {
          userId: req.user.id,
        },
      },
    });

    res.json(dogs);
  }),
);

router.get(
  "/:id",
  requireDogOwnership,
  asyncHandler(async (req, res) => {
    const dog = await dogRepository.findById(req.params.id);
    res.json(dog.toJSON());
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!customerProfile) {
      return res.status(404).json({ error: "Customer profile not found" });
    }

    const dog = await dogRepository.create({
      ...req.body,
      customer_profile_id: customerProfile.id,
    });

    res.status(201).json(dog.toJSON());
  }),
);

router.put(
  "/:id",
  requireDogOwnership,
  asyncHandler(async (req, res) => {
    const dog = await dogRepository.update(req.params.id, req.body);
    res.json(dog.toJSON());
  }),
);

router.delete(
  "/:id",
  requireDogOwnership,
  asyncHandler(async (req, res) => {
    const dog = await dogRepository.delete(req.params.id);
    res.json(dog.toJSON());
  }),
);

export default router;