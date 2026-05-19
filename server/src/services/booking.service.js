import { bookingRepository, dogRepository, serviceRepository, groomerProfileRepository } from "../repositories/index.js";
import { groomerTimeBlockRepository } from "../repositories/index.js";
import { groomerWorkingHoursRepository } from "../repositories/index.js";
import { HttpError } from "../utils/httpError.js";
import { prisma } from "../db/prisma.js";

export const bookingService = {
  async createBooking(data) {

    return await prisma.$transaction(async (tx) => {
      const dog = await tx.dog.findUnique({ where: { id: data.dogId } });
      if (!dog || dog.customer_profile_id !== data.customerId) {
        throw new HttpError(403, "Dog does not belong to this customer");
      }

      const service = await tx.service.findUnique({ where: { id: data.serviceId } });
      if (!service || service.groomer_profile_id !== data.groomerProfileId) {
        throw new HttpError(400, "Service does not belong to this groomer");
      }

      const startTime = new Date(data.start_datetime);
      const endTime = new Date(data.end_datetime);
      const expectedEndTime = new Date(startTime.getTime() + service.duration_minutes * 60000);
      
      if (endTime.getTime() !== expectedEndTime.getTime()) {
        throw new HttpError(400, "Booking duration does not match service duration");
      }

      const dayOfWeek = startTime.getDay();
      const workingHours = await tx.groomerWorkingHours.findMany({
        where: {
          groomer_profile_id: data.groomerProfileId,
          day_of_week: dayOfWeek,
        },
      });

      if (workingHours.length === 0) {
        throw new HttpError(400, "Groomer does not work on this day");
      }

      const { start_time: whStart, end_time: whEnd } = workingHours[0];
      const bookingStartMinutes = startTime.getHours() * 60 + startTime.getMinutes();
      const bookingEndMinutes = endTime.getHours() * 60 + endTime.getMinutes();
      const [whStartHour, whStartMin] = whStart.split(":").map(Number);
      const [whEndHour, whEndMin] = whEnd.split(":").map(Number);
      const whStartMinutes = whStartHour * 60 + whStartMin;
      const whEndMinutes = whEndHour * 60 + whEndMin;

      if (bookingStartMinutes < whStartMinutes || bookingEndMinutes > whEndMinutes) {
        throw new HttpError(400, "Booking is outside working hours");
      }

      const timeBlocks = await tx.groomerTimeBlock.findMany({
        where: { groomer_profile_id: data.groomerProfileId },
      });

      const overlapsTimeBlock = timeBlocks.some(tb => {
        const tbStart = new Date(tb.start_datetime);
        const tbEnd = new Date(tb.end_datetime);
        return startTime < tbEnd && endTime > tbStart;
      });

      if (overlapsTimeBlock) {
        throw new HttpError(400, "Booking overlaps with groomer's time block");
      }

      const existingBookings = await tx.booking.findMany({
        where: {
          groomer_profile_id: data.groomerProfileId,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      });

      const overlapsBooking = existingBookings.some(b => {
        const bStart = new Date(b.start_datetime);
        const bEnd = new Date(b.end_datetime);
        return startTime < bEnd && endTime > bStart;
      });

      if (overlapsBooking) {
        throw new HttpError(409, "This time slot is already booked");
      }

      const booking = await tx.booking.create({
        data: {
          customer_profile_id: data.customerId,
          groomer_profile_id: data.groomerProfileId,
          dog_id: data.dogId,
          service_id: data.serviceId,
          start_datetime: startTime,
          end_datetime: endTime,
          status: "PENDING",
        },
      });

      return booking;
    });
  },
};