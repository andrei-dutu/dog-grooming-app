import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { requireGroomerProfileOwnership } from "../middleware/ownership.js";
import { groomerProfileRepository } from "../repositories/index.js";
import { prisma } from "../db/prisma.js";

const router = Router();

/**
 * PUBLIC - groomer discovery/listing
 */
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    // Include the linked user and their photo so clients can render avatars
    const groomers = await prisma.groomerProfile.findMany({
      where: {
        is_public: true,
      },
      include: {
        // include the user's public fields and their photo (Media)
        user: {
          include: {
            photo: true,
          },
        },
        services: {
          where: {
            is_active: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(groomers);
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    // Return the single groomer with the related user and user's photo
    const groomer = await prisma.groomerProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: { include: { photo: true } },
          services: {
              where: {
                  is_active: true,
              },
          },
      },
    });

    if (!groomer) {
      return res.status(404).json({ error: "Groomer not found" });
    }

    res.json(groomer);
  }),
);

router.get(
  "/:id/services",
  asyncHandler(async (req, res) => {
    const services = await prisma.service.findMany({
      where: {
        groomer_profile_id: req.params.id,
        is_active: true,
      },
    });
    res.json(services);
  }),
);

/**
 * PROTECTED - own profile/admin management
 */
router.use(authenticate);
router.use(authorize("GROOMER", "ADMIN"));

router.get(
    "/:id/my-services",
    requireGroomerProfileOwnership,
    asyncHandler(async (req, res) => {
        const services = await prisma.service.findMany({
            where: {
                groomer_profile_id: req.params.id,
            },
        });
        res.json(services);
    }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    if (req.user.role === "ADMIN") {
      const groomer = await groomerProfileRepository.create(req.body);
      return res.status(201).json(groomer.toJSON());
    }

    const existingProfile = await prisma.groomerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (existingProfile) {
      return res.status(409).json({ error: "Groomer profile already exists" });
    }

    const groomer = await groomerProfileRepository.create({
      ...req.body,
      userId: req.user.id,
    });

    res.status(201).json(groomer.toJSON());
  }),
);

router.put(
  "/:id",
  requireGroomerProfileOwnership,
  asyncHandler(async (req, res) => {
    const groomer = await groomerProfileRepository.update(
      req.params.id,
      req.body,
    );
    res.json(groomer.toJSON());
  }),
);

router.delete(
  "/:id",
  requireGroomerProfileOwnership,
  asyncHandler(async (req, res) => {
    const groomer = await groomerProfileRepository.delete(req.params.id);
    res.json(groomer.toJSON());
  }),
);

export default router;
