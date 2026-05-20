import { authService } from "../services/auth.service.js";
import { HttpError } from "../utils/httpError.js";
import { isValidEmail, normalizeEmail } from "../utils/emailValidation.js";

export const authController = {
  async register(req, res) {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  },

  async groomerRegister(req, res) {
    const user = await authService.groomerRegister(req.body);
    res.status(201).json(user);
  },

  async inviteGroomer(req, res) {
    const result = await authService.inviteGroomer(req.body);
    res.status(201).json(result);
  },

  async login(req, res) {
    const result = await authService.login(req.body);
    res.json(result);
  },

  async logout(req, res) {
    res.json({ message: "Logged out successfully" });
  },

  async changePassword(req, res) {
    await authService.changePassword(req.user.id, req.body);
    res.json({ message: "Password changed successfully" });
  },

  async deleteAccount(req, res) {
    await authService.deleteAccount(req.user.id);
    res.json({ message: "Account deleted successfully" });
  },

  async me(req, res) {
    res.json({ user: req.user });
  },
};