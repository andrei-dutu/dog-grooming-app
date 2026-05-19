import { Router } from "express";
import { createCrudRouter } from "./createCrudRouter.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

import dogRoutes from "./dog.routes.js";
import bookingRoutes from "./booking.routes.js";
import serviceRoutes from "./service.routes.js";
import groomerWorkingHoursRoutes from "./groomerWorkingHours.routes.js";
import groomerTimeBlockRoutes from "./groomerTimeBlock.routes.js";
import groomerProfileRoutes from "./groomerProfile.routes.js";
import customerProfileRoutes from "./customerProfile.routes.js";

import {
  userRepository,
  customerProfileRepository,
  groomerProfileRepository,
  groomerWorkingHoursRepository,
  groomerTimeBlockRepository,
  dogRepository,
  bookingRepository,
  serviceRepository,
  salonInfoRepository,
  salonOpeningHoursRepository,
} from "../repositories/index.js";
import authRoutes from "./auth.routes.js";


const router = Router();
router.use("/users", authenticate, authorize("ADMIN"), createCrudRouter(userRepository));

router.use("/customer-profiles", customerProfileRoutes);

router.use("/groomer-profiles", groomerProfileRoutes);

router.use("/groomer-working-hours", groomerWorkingHoursRoutes);

router.use("/groomer-time-blocks", groomerTimeBlockRoutes);

router.use("/dogs", dogRoutes);

router.use("/bookings", bookingRoutes);

router.use("/services", serviceRoutes);

router.use("/salon-info", createCrudRouter(salonInfoRepository));

router.use("/salon-opening-hours", createCrudRouter(salonOpeningHoursRepository));

router.use("/auth", authRoutes);

export default router;
