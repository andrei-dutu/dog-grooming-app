import { HttpError } from "../utils/httpError.js";
import { prisma } from "../db/prisma.js";

export async function requireDogOwnership(req, _res, next) {
  if (req.user.role === "ADMIN") return next();

  const dog = await prisma.dog.findUnique({
    where: { id: req.params.id },
    include: {
      customer_profile: true,
    },
  });

  if (!dog) {
    return next(new HttpError(404, "Dog not found"));
  }

  if (dog.customer_profile.userId !== req.user.id) {
    return next(new HttpError(403, "Forbidden"));
  }

  next();
}

export async function requireBookingOwnership(req, _res, next) {
  if (req.user.role === "ADMIN") return next();

  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: {
      customer_profile: true,
      groomer_profile: true,
    },
  });

  if (!booking) {
    return next(new HttpError(404, "Booking not found"));
  }

  const isCustomerOwner =
    req.user.role === "CLIENT" &&
    booking.customer_profile.userId === req.user.id;

  const isGroomerOwner =
    req.user.role === "GROOMER" &&
    booking.groomer_profile.userId === req.user.id;

  if (!isCustomerOwner && !isGroomerOwner) {
    return next(new HttpError(403, "Forbidden"));
  }

  next();
}

export async function requireServiceOwnership(req, _res, next) {
  if (req.user.role === "ADMIN") return next();

  const service = await prisma.service.findUnique({
    where: { id: req.params.id },
    include: {
      groomer_profile: true,
    },
  });

  if (!service) {
    return next(new HttpError(404, "Service not found"));
  }

  if (service.groomer_profile.userId !== req.user.id) {
    return next(new HttpError(403, "Forbidden"));
  }

  next();
}

export async function requireGroomerWorkingHoursOwnership(req, _res, next) {
  if (req.user.role === "ADMIN") return next();

  const workingHours = await prisma.groomerWorkingHours.findUnique({
    where: { id: req.params.id },
    include: {
      groomer_profile: true,
    },
  });

  if (!workingHours) {
    return next(new HttpError(404, "Working hours not found"));
  }

  if (workingHours.groomer_profile.userId !== req.user.id) {
    return next(new HttpError(403, "Forbidden"));
  }

  next();
}

export async function requireGroomerTimeBlockOwnership(req, _res, next) {
  if (req.user.role === "ADMIN") return next();

  const timeBlock = await prisma.groomerTimeBlock.findUnique({
    where: { id: req.params.id },
    include: {
      groomer_profile: true,
    },
  });

  if (!timeBlock) {
    return next(new HttpError(404, "Time block not found"));
  }

  if (timeBlock.groomer_profile.userId !== req.user.id) {
    return next(new HttpError(403, "Forbidden"));
  }

  next();
}

export async function requireGroomerProfileOwnership(req, _res, next) {
  if (req.user.role === "ADMIN") return next();

  const groomerProfile = await prisma.groomerProfile.findUnique({
    where: { id: req.params.id },
  });

  if (!groomerProfile) {
    return next(new HttpError(404, "Groomer profile not found"));
  }

  if (groomerProfile.userId !== req.user.id) {
    return next(new HttpError(403, "Forbidden"));
  }

  next();
}

export async function requireCustomerProfileOwnership(req, _res, next) {
  if (req.user.role === "ADMIN") return next();

  const customerProfile = await prisma.customerProfile.findUnique({
    where: { id: req.params.id },
  });

  if (!customerProfile) {
    return next(new HttpError(404, "Customer profile not found"));
  }

  if (customerProfile.userId !== req.user.id) {
    return next(new HttpError(403, "Forbidden"));
  }

  next();
}

