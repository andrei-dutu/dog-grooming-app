import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { requireCustomerProfileOwnership } from "../middleware/ownership.js";
import { customerProfileRepository } from "../repositories/index.js";
import { prisma } from "../db/prisma.js";

const router = Router();

router.use(authenticate);
router.use(authorize("CLIENT", "ADMIN"));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    if (req.user.role === "ADMIN") {
      const profiles = await customerProfileRepository.findAll();
      return res.json(profiles.map((profile) => profile.toJSON()));
    }

    const profile = await prisma.customerProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        dogs: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: "Customer profile not found" });
    }

    res.json(profile);
  }),
);

router.get(
  "/:id",
  requireCustomerProfileOwnership,
  asyncHandler(async (req, res) => {
    const profile = await customerProfileRepository.findById(req.params.id);
    res.json(profile.toJSON());
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    if (req.user.role === "ADMIN") {
      const profile = await customerProfileRepository.create(req.body);
      return res.status(201).json(profile.toJSON());
    }

    const existingProfile = await prisma.customerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (existingProfile) {
      return res.status(409).json({ error: "Customer profile already exists" });
    }

    const profile = await customerProfileRepository.create({
      ...req.body,
      userId: req.user.id,
    });

    res.status(201).json(profile.toJSON());
  }),
);

router.put(
  "/:id",
  requireCustomerProfileOwnership,
  asyncHandler(async (req, res) => {
    const profile = await customerProfileRepository.update(
      req.params.id,
      req.body,
    );
    res.json(profile.toJSON());
  }),
);

router.delete(
  "/:id",
  requireCustomerProfileOwnership,
  asyncHandler(async (req, res) => {
    const profile = await customerProfileRepository.delete(req.params.id);
    res.json(profile.toJSON());
  }),
);

export default router;
