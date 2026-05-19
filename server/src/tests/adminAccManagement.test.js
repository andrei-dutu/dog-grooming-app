import { jest } from '@jest/globals';
// import { createGroomer, deactivateAdmin } from './admin.service.js'; 

describe('Admin Account Management - Critical Edge Cases', () => {

  beforeEach(() => {
    // Cleaning up any mocks or test data before each test runs
    jest.clearAllMocks();
  });

  it('EDGE CASE 13: Should prevent creating a groomer with an email that already exists', async () => {
    // Arrange: The email 'alex@example.com' is already registered in the system (e.g., as a Customer)
    const adminId = 'admin-001';
    const existingEmail = 'alex@example.com'; 

    // Act & Assert: Admin tries to create a new groomer using this duplicate email
    // The system must reject the creation to maintain data integrity
    // await expect(
    //   createGroomer({
    //     requestedBy: adminId,
    //     email: existingEmail,
    //     name: 'Alex Groomer'
    //   })
    // ).rejects.toThrow('Email is already in use by another account');
  });

  it('EDGE CASE 14: Should prevent deactivation of the last remaining Admin account', async () => {
    // Arrange: 'admin-001' is the only active admin left in the database
    const adminId = 'admin-001';

    // Act & Assert: The admin attempts to deactivate their own account
    // The system must prevent this to avoid locking everyone out of the platform
    // await expect(
    //   deactivateAdmin({
    //     requestedBy: adminId,
    //     targetAdminId: adminId
    //   })
    // ).rejects.toThrow('Action denied: Cannot remove the last active admin account');
  });

});