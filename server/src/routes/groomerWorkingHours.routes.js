import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { requireGroomerWorkingHoursOwnership } from "../middleware/ownership.js";
import { groomerWorkingHoursRepository } from "../repositories/index.js";
import { prisma } from "../db/prisma.js";

const router = Router();

router.use(authenticate);
router.use(authorize("GROOMER", "ADMIN"));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    if (req.user.role === "ADMIN") {
      const workingHours = await groomerWorkingHoursRepository.findAll();
      return res.json(workingHours.map((item) => item.toJSON()));
    }

    const workingHours = await prisma.groomerWorkingHours.findMany({
      where: {
        groomer_profile: {
          userId: req.user.id,
        },
      },
      orderBy: [
        { day_of_week: "asc" },
        { start_time: "asc" },
      ],
    });

    res.json(workingHours);
  }),
);

router.get(
  "/:id",
  requireGroomerWorkingHoursOwnership,
  asyncHandler(async (req, res) => {
    const workingHours = await groomerWorkingHoursRepository.findById(req.params.id);
    res.json(workingHours.toJSON());
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    if (req.user.role === "ADMIN") {
      const workingHours = await groomerWorkingHoursRepository.create(req.body);
      return res.status(201).json(workingHours.toJSON());
    }

    const groomerProfile = await prisma.groomerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!groomerProfile) {
      return res.status(404).json({ error: "Groomer profile not found" });
    }

    const workingHours = await groomerWorkingHoursRepository.create({
      ...req.body,
      groomer_profile_id: groomerProfile.id,
    });

    res.status(201).json(workingHours.toJSON());
  }),
);

router.put(
  "/:id",
  requireGroomerWorkingHoursOwnership,
  asyncHandler(async (req, res) => {
    const workingHours = await groomerWorkingHoursRepository.update(req.params.id, req.body);
    res.json(workingHours.toJSON());
  }),
);

router.delete(
  "/:id",
  requireGroomerWorkingHoursOwnership,
  asyncHandler(async (req, res) => {
    const workingHours = await groomerWorkingHoursRepository.delete(req.params.id);
    res.json(workingHours.toJSON());
  }),
);

export default router;