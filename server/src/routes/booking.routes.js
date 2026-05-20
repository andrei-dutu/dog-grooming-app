import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { requireBookingOwnership } from "../middleware/ownership.js";
import { bookingRepository } from "../repositories/index.js";
import { prisma } from "../db/prisma.js";
import { availabilityService } from "../services/availability.service.js";
import { bookingService } from "../services/booking.service.js";
import { createCrudRouter } from "./createCrudRouter.js";
import { HttpError } from "../utils/httpError.js";

const router = Router();

router.get(
    "/availability",
    asyncHandler(async (req, res) => {
        const { groomerProfileId, serviceId, date } = req.query;
        const slots = await availabilityService.getAvailableSlots(
            groomerProfileId,
            serviceId,
            date
        );
        res.json({ slots });
    })
);

router.use(authenticate);
router.use(authorize("CLIENT", "GROOMER", "ADMIN"));

router.get(
    "/",
    asyncHandler(async (req, res) => {
        if (req.user.role === "ADMIN") {
            const bookings = await prisma.booking.findMany({
                include: {
                    dog: true,
                    service: true,
                    groomer_profile: true,
                    customer_profile: true,
                },
                orderBy: { start_datetime: "desc" },
            });
            return res.json(bookings);
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
    })
);

router.post(
    "/",
    authorize("CLIENT", "ADMIN"),
    asyncHandler(async (req, res) => {
        if (req.user.role === "ADMIN") {
            // Admin poate crea booking direct
            const booking = await bookingService.createBooking({
                customerId: req.body.customerId,
                dogId: req.body.dogId,
                groomerProfileId: req.body.groomerProfileId,
                serviceId: req.body.serviceId,
                start_datetime: req.body.start_datetime,
                end_datetime: req.body.end_datetime,
            });
            return res.status(201).json(booking);
        }

        const customerProfile = await prisma.customerProfile.findUnique({
            where: { userId: req.user.id },
        });

        if (!customerProfile) {
            throw new HttpError(404, "Customer profile not found");
        }

        const booking = await bookingService.createBooking({
            customerId: customerProfile.id,
            dogId: req.body.dogId,
            groomerProfileId: req.body.groomerProfileId,
            serviceId: req.body.serviceId,
            start_datetime: req.body.start_datetime,
            end_datetime: req.body.end_datetime,
        });

        res.status(201).json(booking);
    })
);

router.get(
    "/:id",
    requireBookingOwnership,
    asyncHandler(async (req, res) => {
        const booking = await bookingRepository.findById(req.params.id);
        res.json(booking.toJSON());
    })
);

router.put(
    "/:id",
    requireBookingOwnership,
    asyncHandler(async (req, res) => {
        const booking = await bookingRepository.update(req.params.id, req.body);
        res.json(booking.toJSON());
    })
);

router.delete(
    "/:id",
    requireBookingOwnership,
    asyncHandler(async (req, res) => {
        const booking = await bookingRepository.delete(req.params.id);
        res.json(booking.toJSON());
    })
);

export default router;