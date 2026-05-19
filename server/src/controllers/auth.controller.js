import { authService } from "../services/auth.service.js";

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
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      throw new HttpError(400, "Valid email is required");
    }

    const invitationToken = authService.generateGroomerInvitationToken(email);
    const inviteLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/groomer-signup?token=${invitationToken}`;

    // TODO: Trimite email (implementa serviciu email)
    console.log(`Invitation for ${email}: ${inviteLink}`);

    res.status(200).json({
      message: "Invitation generated successfully",
      email,
      inviteLink, // Șterge în producție
    });
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
