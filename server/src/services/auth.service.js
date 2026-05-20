import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { HttpError } from "../utils/httpError.js";
import { isValidEmail, normalizeEmail } from "../utils/emailValidation.js";
import { isValidPhone, normalizePhone } from "../utils/phoneValidation.js";
import { isValidName, normalizeName } from "../utils/nameValidation.js";
import { userRepository, customerProfileRepository, groomerProfileRepository } from "../repositories/index.js";

export const authService = {
  async register({ email: rawEmail, password, birthday, firstName, lastName, phone }) {
    const email = normalizeEmail(rawEmail);

    if (!isValidEmail(email)) {
      throw new HttpError(400, "Invalid email format");
    }

    if (!isValidPhone(phone)) {
      throw new HttpError(400, "Invalid phone number");
    }

    const normalizedPhone = normalizePhone(phone);

    if (!isValidName(firstName) || !isValidName(lastName)) {
      throw new HttpError(400, "Names can only contain letters");
    }

    const normalizedFirstName = normalizeName(firstName);
    const normalizedLastName = normalizeName(lastName);

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
      first_name: normalizedFirstName,
      last_name: normalizedLastName,
      phone: normalizedPhone,
    });
  
    return user;
  },

  async groomerRegister({ token, password, displayName, bio, credentials, specialties }) {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new HttpError(401, "Invalid or expired invitation token");
    }

    const email = normalizeEmail(decoded.email);

    if (!isValidEmail(email)) {
      throw new HttpError(400, "Invalid email in invitation token");
    }
    
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new HttpError(409, "This email is already registered");
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

  generateGroomerInvitationToken(rawEmail) {
    const email = normalizeEmail(rawEmail);

    if (!isValidEmail(email)) {
      throw new HttpError(400, "Invalid email format");
    }

    return jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
},

  async login({ email: rawEmail, password }) {
    const email = normalizeEmail(rawEmail);

    if (!isValidEmail(email)) {
      throw new HttpError(400, "Invalid email format");
    }

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