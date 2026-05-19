import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { requireServiceOwnership } from "../middleware/ownership.js";
import { serviceRepository } from "../repositories/index.js";
import { prisma } from "../db/prisma.js";

const router = Router();

/**
 * PUBLIC - service catalog
 */
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const services = await prisma.service.findMany({
      where: {
        is_active: true,
      },
      include: {
        groomer_profile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(services);
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const service = await serviceRepository.findById(req.params.id);
    res.json(service.toJSON());
  }),
);

/**
 * PROTECTED
 */
router.use(authenticate);
router.use(authorize("GROOMER", "ADMIN"));

router.post(
  "/",
  asyncHandler(async (req, res) => {
    if (req.user.role === "ADMIN") {
      const service = await serviceRepository.create(req.body);
      return res.status(201).json(service.toJSON());
    }

    const groomerProfile = await prisma.groomerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!groomerProfile) {
      return res.status(404).json({ error: "Groomer profile not found" });
    }

    const service = await serviceRepository.create({
      ...req.body,
      groomer_profile_id: groomerProfile.id,
    });

    res.status(201).json(service.toJSON());
  }),
);

router.put(
  "/:id",
  requireServiceOwnership,
  asyncHandler(async (req, res) => {
    const service = await serviceRepository.update(req.params.id, req.body);
    res.json(service.toJSON());
  }),
);

router.delete(
  "/:id",
  requireServiceOwnership,
  asyncHandler(async (req, res) => {
    const service = await serviceRepository.delete(req.params.id);
    res.json(service.toJSON());
  }),
);

export default router;