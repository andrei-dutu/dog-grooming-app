import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/index.js";
import jwt from "jsonwebtoken"
import { HttpError } from "../utils/httpError.js";

export const authService = {
    async register({ email, password, role, birthday }) {
        const existing = await userRepository.findByEmail(email);
        if (existing) {
          throw new HttpError(409, "Email already in use");
        }
      
        const user = await userRepository.create({
          email,
          password,
          role,
          birthday,
          status: "ACTIVE",
        });
      
        return user;
      },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new HttpError(401, "Invalid credentials");
    }
  
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new HttpError(401, "Invalid credentials");
    }
  
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
  
    return { token, user };
  },
};