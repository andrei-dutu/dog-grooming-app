import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { authController } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", asyncHandler(authController.register));
router.post("/groomer/register", asyncHandler(authController.groomerRegister));
router.post(
  "/groomer/invite",
  asyncHandler(authenticate),
  asyncHandler(authorize("ADMIN")),
  asyncHandler(authController.inviteGroomer)
);

router.post("/login", asyncHandler(authController.login));
router.post("/logout", asyncHandler(authController.logout));
router.get("/me", authenticate, asyncHandler(authController.me));
router.get(
    "/admin-test",
    authenticate,
    authorize("ADMIN"),
    (_req, res) => {
      res.json({ message: "Admin access granted" });
    }
  );

export default router;