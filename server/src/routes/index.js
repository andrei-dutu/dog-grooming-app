import { Router } from "express";
import { createCrudRouter } from "./createCrudRouter.js";
import {
  userRepository,
  customerProfileRepository,
  groomerProfileRepository,
  groomerWorkingHoursRepository,
  groomerTimeBlockRepository,
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

export default router;
