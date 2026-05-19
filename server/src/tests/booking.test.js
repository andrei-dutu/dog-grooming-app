import { jest } from '@jest/globals';
// import function for creating bookings from the booking service (to be implemented in the future)
// import { createBooking } from './booking.service.js';

describe('Booking Business Logic - Edge Cases', () => {
  
  // Mock data for testing
  const mockGroomerId = 'groomer-123';
  const mockCustomerId = 'customer-456';
  const mockDogId = 'dog-789';

  beforeEach(() => {
    // Cleaning up any mocks or test data before each test runs
    jest.clearAllMocks();
  });

  it('EDGE CASE 1: Should prevent double-booking for the exact same time slot', async () => {
    // Arrange: There is already a booking for the groomer at 10:00 - 11:00
    const existingBooking = { startTime: '10:00', endTime: '11:00' };
    
    // Act & Assert: We expect an attempt to create a new booking exactly at 10:00 to throw an error
    // await expect(
    //   createBooking({
    //     groomerId: mockGroomerId,
    //     customerId: mockCustomerId,
    //     dogId: mockDogId,
    //     serviceId: 'service-bath', // 1 hour duration
    //     startTime: '10:00'
    //   })
    // ).rejects.toThrow('Time slot is already booked');
  });

  it('EDGE CASE 2: Should prevent booking if service duration overlaps with an existing appointment', async () => {
    // Arrange: A "Full Groom (2 hrs)" already exists from 10:00 to 12:00
    const existingBooking = { startTime: '10:00', endTime: '12:00' };

    // Act & Assert: We attempt a short booking at 11:30. It will overlap by 30 mins.
    // await expect(
    //   createBooking({
    //     groomerId: mockGroomerId,
    //     startTime: '11:30', 
    //     serviceDurationMinutes: 30 
    //   })
    // ).rejects.toThrow('Booking overlaps with an existing appointment');
  });

  it('EDGE CASE 3: Should reject booking if service duration exceeds end of working hours', async () => {
    // Arrange: The groomer works until 17:00.
    const groomerSchedule = { shiftEnd: '17:00' };

    // Act & Assert: A 2-hour booking starting at 16:00 should be rejected
    // await expect(
    //   createBooking({
    //     groomerId: mockGroomerId,
    //     startTime: '16:00',
    //     serviceDurationMinutes: 120 // 2 hours -> would finish at 18:00
    //   })
    // ).rejects.toThrow('Service duration exceeds groomer working hours');
  });

  it('EDGE CASE 4: Should reject booking if it overlaps with a groomers blocked break', async () => {
    // Arrange: The groomer has blocked 13:00 - 14:00 for lunch
    const groomerBreak = { startTime: '13:00', endTime: '14:00', type: 'BREAK' };

    // Act & Assert: We attempt to book at 13:30
    // await expect(
    //   createBooking({
    //     groomerId: mockGroomerId,
    //     startTime: '13:30',
    //     serviceDurationMinutes: 30
    //   })
    // ).rejects.toThrow('Cannot book during a blocked time slot');
  });

  it('EDGE CASE 5: Should allow booking exactly back-to-back (no overlap)', async () => {
    // Arrange: There is an existing booking from 09:00 to 10:00
    const existingBooking = { startTime: '09:00', endTime: '10:00' };

    // Act & Assert: A booking starting EXACTLY at 10:00 should be allowed (Edge Happy Path)
    // const newBooking = await createBooking({
    //   groomerId: mockGroomerId,
    //   startTime: '10:00',
    //   serviceDurationMinutes: 60
    // });
    //
    // expect(newBooking).toBeDefined();
    // expect(newBooking.status).toBe('CONFIRMED');
  });

});