import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma.js";
import { authenticate } from "../middleware/authenticate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

const router = Router();

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    res.json(user);
  })
);

router.patch(
  "/me/password",
  authenticate,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new HttpError(400, "Current password and new password are required");
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new HttpError(400, "Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        password: hashedPassword,
      },
    });

    res.json({ message: "Password updated successfully" });
  })
);

router.delete(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    await prisma.user.delete({
      where: { id: req.user.id },
    });

    res.status(204).send();
  })
);

export default router;