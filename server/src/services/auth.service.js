import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/index.js";
import jwt from "jsonwebtoken"
import { HttpError } from "../utils/httpError.js";

export const authService = {
  async register({ email, password, birthday, firstName, lastName, phone }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new HttpError(409, "Email already in use");
    }
  
    const user = await userRepository.create({
      email,
      password,
      role: "CLIENT",
      birthday,
      status: "ACTIVE",
    });
  
    await customerProfileRepository.create({
      userId: user.id,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
    });
  
    return user;
  },

  async groomerRegister({ token, password, displayName, bio, credentials, specialties }) {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired invitation token");
    }

    const { email } = decoded;
    
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new Error("This email is already registered");
    }
  
    const user = await userRepository.create({
      email,
      password,
      role: "GROOMER",
      status: "ACTIVE",
    });
  
    await groomerProfileRepository.create({
      userId: user.id,
      display_name: displayName,
      bio: bio || null,
      credentials: credentials || null,
      specialties: specialties || null,
      is_public: false,
    });
  
    return user;
  },

  generateGroomerInvitationToken(email) {
    return jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
},

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new HttpError(401, "Invalid credentials");
    }
  
    if (user.status === "BANNED") {
      throw new HttpError(403, "This account has been banned");
    }

    if (user.status === "INACTIVE") {
      throw new HttpError(403, "This account is inactive");
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