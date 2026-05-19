import { serviceRepository } from "../repositories/index.js";
import { groomerWorkingHoursRepository } from "../repositories/index.js";
import { groomerTimeBlockRepository } from "../repositories/index.js";
import { bookingRepository } from "../repositories/index.js";
import { HttpError } from "../utils/httpError.js";

export const availabilityService = {
  async getAvailableSlots(groomerProfileId, serviceId, dateString) {
    
    if (!groomerProfileId || !serviceId || !dateString) {
      throw new HttpError(400, "Missing required parameters");
    }

    const service = await serviceRepository.findById(serviceId);
    if (!service) {
      throw new HttpError(404, "Service not found");
    }
    
    const durationMinutes = service.duration_minutes;

    if (service.groomer_profile_id !== groomerProfileId) {
      throw new HttpError(400, "Service does not belong to this groomer");
    }

    const dayOfWeek = new Date(dateString).getDay();
    const workingHours = await groomerWorkingHoursRepository.findMany({
      filters: {
        groomer_profile_id: groomerProfileId,
        day_of_week: dayOfWeek,
      },
    });

    if (workingHours.length === 0) {
      return [];
    }

    const { start_time, end_time } = workingHours[0];

    const [startHour, startMin] = start_time.split(":").map(Number);
    const [endHour, endMin] = end_time.split(":").map(Number);
    const startMinutesFromMidnight = startHour * 60 + startMin;
    const endMinutesFromMidnight = endHour * 60 + endMin;


    const slots = [];
    for (let i = startMinutesFromMidnight; i + durationMinutes <= endMinutesFromMidnight; i += 30) {
      slots.push({
        start_minute: i,
        end_minute: i + durationMinutes,
      });
    }

    const dateStart = new Date(`${dateString}T00:00:00`);
    const dateEnd = new Date(`${dateString}T23:59:59`);
    
    const timeBlocks = await groomerTimeBlockRepository.findMany({
      filters: {
        groomer_profile_id: groomerProfileId,
      },
    });

    const todayTimeBlocks = timeBlocks.filter(tb => {
      const tbStart = new Date(tb.start_datetime);
      const tbEnd = new Date(tb.end_datetime);
      return tbStart >= dateStart && tbEnd <= dateEnd;
    });

    const bookings = await bookingRepository.findMany({
      filters: {
        groomer_profile_id: groomerProfileId,
        status: ["PENDING", "CONFIRMED"],
      },
    });

    const todayBookings = bookings.filter(b => {
      const bStart = new Date(b.start_datetime);
      const bEnd = new Date(b.end_datetime);
      return bStart >= dateStart && bEnd <= dateEnd;
    });

    const availableSlots = slots.filter(slot => {
      const slotStart = new Date(`${dateString}T${this.minutesToTime(slot.start_minute)}`);
      const slotEnd = new Date(`${dateString}T${this.minutesToTime(slot.end_minute)}`);

      const overlapsTimeBlock = todayTimeBlocks.some(tb => {
        const tbStart = new Date(tb.start_datetime);
        const tbEnd = new Date(tb.end_datetime);
        return slotStart < tbEnd && slotEnd > tbStart;
      });

      if (overlapsTimeBlock) return false;

      const overlapsBooking = todayBookings.some(b => {
        const bStart = new Date(b.start_datetime);
        const bEnd = new Date(b.end_datetime);
        return slotStart < bEnd && slotEnd > bStart;
      });

      if (overlapsBooking) return false;

      return true;
    });

    return availableSlots.map(slot => ({
      start_time: this.minutesToTime(slot.start_minute),
      end_time: this.minutesToTime(slot.end_minute),
    }));
  },

  minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  },
};