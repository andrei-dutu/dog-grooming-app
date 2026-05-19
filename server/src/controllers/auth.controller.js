import { authService } from "../services/auth.service.js";

export const authController = {
  async register(req, res) {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  },
  
  async login(req, res) {
    const result = await authService.login(req.body);
    res.json(result);
  },

  async logout(req, res) {
    res.json({ message: "Logged out successfully" });
  },

  async me(req, res) {
    res.json({ user: req.user });
  },
};
