import { Router } from "express";
import { createCrudRouter } from "./createCrudRouter.js";
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

const router = Router();

router.use("/users", createCrudRouter(userRepository));
router.use("/customer-profiles", createCrudRouter(customerProfileRepository));
router.use("/groomer-profiles", createCrudRouter(groomerProfileRepository));
router.use(
  "/groomer-working-hours",
  createCrudRouter(groomerWorkingHoursRepository),
);
router.use("/groomer-time-blocks", createCrudRouter(groomerTimeBlockRepository));
router.use("/dogs", createCrudRouter(dogRepository));
router.use("/bookings", createCrudRouter(bookingRepository));
router.use("/services", createCrudRouter(serviceRepository));
router.use("/salon-info", createCrudRouter(salonInfoRepository));
router.use("/salon-opening-hours", createCrudRouter(salonOpeningHoursRepository));

export default router;
