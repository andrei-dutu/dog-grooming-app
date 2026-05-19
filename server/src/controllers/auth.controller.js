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
    const { email, adminId } = req.body;
    
    // TODO: Verifică că adminId este ADMIN (middleware de auth)
    
    const token = authService.generateGroomerInvitationToken(email);
    const inviteLink = `${process.env.FRONTEND_URL}/groomer-signup?token=${token}`;
    
    // TODO: Trimite email cu link-ul
    
    res.json({ 
      message: "Invitation sent",
      inviteLink // Pentru testing, în prod șterge asta
    });
  },
  
  async login(req, res) {
    const result = await authService.login(req.body);
    res.json(result);
  },

  async logout(req, res) {
    res.json({ message: "Logged out successfully" });
  },
};
