import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { requireGroomerTimeBlockOwnership } from "../middleware/ownership.js";
import { groomerTimeBlockRepository } from "../repositories/index.js";
import { prisma } from "../db/prisma.js";

const router = Router();

router.use(authenticate);
router.use(authorize("GROOMER", "ADMIN"));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    if (req.user.role === "ADMIN") {
      const timeBlocks = await groomerTimeBlockRepository.findAll();
      return res.json(timeBlocks.map((item) => item.toJSON()));
    }

    const timeBlocks = await prisma.groomerTimeBlock.findMany({
      where: {
        groomer_profile: {
          userId: req.user.id,
        },
      },
      orderBy: {
        start_datetime: "asc",
      },
    });

    res.json(timeBlocks);
  }),
);

router.get(
  "/:id",
  requireGroomerTimeBlockOwnership,
  asyncHandler(async (req, res) => {
    const timeBlock = await groomerTimeBlockRepository.findById(req.params.id);
    res.json(timeBlock.toJSON());
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    if (req.user.role === "ADMIN") {
      const timeBlock = await groomerTimeBlockRepository.create(req.body);
      return res.status(201).json(timeBlock.toJSON());
    }

    const groomerProfile = await prisma.groomerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!groomerProfile) {
      return res.status(404).json({ error: "Groomer profile not found" });
    }

    const timeBlock = await groomerTimeBlockRepository.create({
      ...req.body,
      groomer_profile_id: groomerProfile.id,
    });

    res.status(201).json(timeBlock.toJSON());
  }),
);

router.put(
  "/:id",
  requireGroomerTimeBlockOwnership,
  asyncHandler(async (req, res) => {
    const timeBlock = await groomerTimeBlockRepository.update(req.params.id, req.body);
    res.json(timeBlock.toJSON());
  }),
);

router.delete(
  "/:id",
  requireGroomerTimeBlockOwnership,
  asyncHandler(async (req, res) => {
    const timeBlock = await groomerTimeBlockRepository.delete(req.params.id);
    res.json(timeBlock.toJSON());
  }),
);

export default router;