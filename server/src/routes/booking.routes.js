import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { requireBookingOwnership } from "../middleware/ownership.js";
import { bookingRepository } from "../repositories/index.js";
import { prisma } from "../db/prisma.js";

const router = Router();

router.use(authenticate);
router.use(authorize("CLIENT", "GROOMER", "ADMIN"));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    if (req.user.role === "ADMIN") {
      const bookings = await bookingRepository.findAll();
      return res.json(bookings.map((booking) => booking.toJSON()));
    }

    if (req.user.role === "CLIENT") {
      const bookings = await prisma.booking.findMany({
        where: {
          customer_profile: {
            userId: req.user.id,
          },
        },
        include: {
          dog: true,
          service: true,
          groomer_profile: true,
        },
        orderBy: {
          start_datetime: "asc",
        },
      });

      return res.json(bookings);
    }

    if (req.user.role === "GROOMER") {
      const bookings = await prisma.booking.findMany({
        where: {
          groomer_profile: {
            userId: req.user.id,
          },
        },
        include: {
          dog: true,
          service: true,
          customer_profile: true,
        },
        orderBy: {
          start_datetime: "asc",
        },
      });

      return res.json(bookings);
    }

    res.json([]);
  }),
);

router.get(
  "/:id",
  requireBookingOwnership,
  asyncHandler(async (req, res) => {
    const booking = await bookingRepository.findById(req.params.id);
    res.json(booking.toJSON());
  }),
);

router.post(
  "/",
  authorize("CLIENT", "ADMIN"),
  asyncHandler(async (req, res) => {
    if (req.user.role === "ADMIN") {
      const booking = await bookingRepository.create(req.body);
      return res.status(201).json(booking.toJSON());
    }

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!customerProfile) {
      return res.status(404).json({ error: "Customer profile not found" });
    }

    const booking = await bookingRepository.create({
      ...req.body,
      customer_profile_id: customerProfile.id,
    });

    res.status(201).json(booking.toJSON());
  }),
);

router.put(
  "/:id",
  requireBookingOwnership,
  asyncHandler(async (req, res) => {
    const booking = await bookingRepository.update(req.params.id, req.body);
    res.json(booking.toJSON());
  }),
);

router.delete(
  "/:id",
  requireBookingOwnership,
  asyncHandler(async (req, res) => {
    const booking = await bookingRepository.delete(req.params.id);
    res.json(booking.toJSON());
  }),
);

export default router;
