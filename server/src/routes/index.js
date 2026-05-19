import { Router } from "express";
import { createCrudRouter } from "./createCrudRouter.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

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

router.use(
  "/customer-profiles",
  authenticate,
  authorize("CLIENT", "ADMIN"),
  createCrudRouter(customerProfileRepository),
);

router.use("/groomer-profiles", createCrudRouter(groomerProfileRepository));

router.use(
  "/groomer-working-hours",
  authenticate,
  authorize("GROOMER", "ADMIN"),
  createCrudRouter(groomerWorkingHoursRepository),
);

router.use(
  "/groomer-time-blocks",
  authenticate,
  authorize("GROOMER", "ADMIN"),
  createCrudRouter(groomerTimeBlockRepository),
);

router.use(
  "/dogs",
  authenticate,
  authorize("CLIENT", "ADMIN"),
  createCrudRouter(dogRepository),
);

router.use(
  "/bookings",
  authenticate,
  authorize("CLIENT", "GROOMER", "ADMIN"),
  createCrudRouter(bookingRepository),
);

router.use("/services", createCrudRouter(serviceRepository));

router.use("/salon-info", createCrudRouter(salonInfoRepository));

router.use("/salon-opening-hours", createCrudRouter(salonOpeningHoursRepository));

router.use("/auth", authRoutes);

export default router;
