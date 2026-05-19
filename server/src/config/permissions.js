/**
 * PawBook MVP Permission Matrix
 *
 * Roles:
 * - PUBLIC: unauthenticated users
 * - CLIENT: authenticated customer
 * - GROOMER: authenticated groomer
 * - ADMIN: authenticated admin
 *
 * This file documents route-level access rules from the PRD.
 * It is intentionally simple and can be used later for tests or route guards.
 */

export const ROLES = {
    CLIENT: "CLIENT",
    GROOMER: "GROOMER",
    ADMIN: "ADMIN",
  };
  
  export const PERMISSIONS = {
    auth: {
      register: {
        method: "POST",
        path: "/auth/register",
        public: true,
        roles: [],
        notes: "Public registration creates CLIENT accounts only.",
      },
      login: {
        method: "POST",
        path: "/auth/login",
        public: true,
        roles: [],
        notes: "Public login endpoint.",
      },
      me: {
        method: "GET",
        path: "/auth/me",
        public: false,
        roles: [ROLES.CLIENT, ROLES.GROOMER, ROLES.ADMIN],
        notes: "Returns authenticated user from JWT.",
      },
      logout: {
        method: "POST",
        path: "/auth/logout",
        public: false,
        roles: [ROLES.CLIENT, ROLES.GROOMER, ROLES.ADMIN],
        notes: "For MVP logout can be client-side token deletion.",
      },
    },
  
    salonInfo: {
      read: {
        method: "GET",
        path: "/salon-info",
        public: true,
        roles: [],
        notes: "Any visitor can view salon public information.",
      },
      update: {
        method: "PUT/PATCH",
        path: "/salon-info/:id",
        public: false,
        roles: [ROLES.ADMIN],
        notes: "Only ADMIN can update salon information.",
      },
    },
  
    salonOpeningHours: {
      read: {
        method: "GET",
        path: "/salon-opening-hours",
        public: true,
        roles: [],
        notes: "Any visitor can view salon opening hours.",
      },
      manage: {
        method: "POST/PUT/PATCH/DELETE",
        path: "/salon-opening-hours",
        public: false,
        roles: [ROLES.ADMIN],
        notes: "Only ADMIN can manage salon opening hours.",
      },
    },
  
    groomerProfiles: {
      list: {
        method: "GET",
        path: "/groomer-profiles",
        public: true,
        roles: [],
        notes: "Public groomer listing/discovery.",
      },
      detail: {
        method: "GET",
        path: "/groomer-profiles/:id",
        public: true,
        roles: [],
        notes: "Public groomer profile page.",
      },
      updateOwn: {
        method: "PUT/PATCH",
        path: "/groomer-profiles/:id",
        public: false,
        roles: [ROLES.GROOMER, ROLES.ADMIN],
        notes: "GROOMER can update own profile; ADMIN can manage all.",
      },
    },
  
    services: {
      catalogRead: {
        method: "GET",
        path: "/services",
        public: true,
        roles: [],
        notes: "Public service catalog/read access.",
      },
      manage: {
        method: "POST/PUT/PATCH/DELETE",
        path: "/services",
        public: false,
        roles: [ROLES.GROOMER, ROLES.ADMIN],
        notes: "GROOMER manages own services; ADMIN can manage all.",
      },
    },
  
    dogs: {
      manageOwn: {
        method: "GET/POST/PUT/PATCH/DELETE",
        path: "/dogs",
        public: false,
        roles: [ROLES.CLIENT, ROLES.ADMIN],
        notes: "CLIENT can manage own dogs only; ADMIN can access all.",
      },
    },
  
    bookings: {
      create: {
        method: "POST",
        path: "/bookings",
        public: false,
        roles: [ROLES.CLIENT, ROLES.ADMIN],
        notes: "CLIENT can create own bookings; ADMIN can create/manage if needed.",
      },
      customerDashboard: {
        method: "GET",
        path: "/bookings/my",
        public: false,
        roles: [ROLES.CLIENT],
        notes: "CLIENT sees own upcoming and past bookings.",
      },
      groomerSchedule: {
        method: "GET",
        path: "/bookings/groomer",
        public: false,
        roles: [ROLES.GROOMER],
        notes: "GROOMER sees own schedule only.",
      },
      cancel: {
        method: "PATCH",
        path: "/bookings/:id/cancel",
        public: false,
        roles: [ROLES.CLIENT, ROLES.GROOMER, ROLES.ADMIN],
        notes: "CLIENT can cancel own booking; GROOMER own schedule; ADMIN all.",
      },
      adminCalendar: {
        method: "GET",
        path: "/bookings/admin/calendar",
        public: false,
        roles: [ROLES.ADMIN],
        notes: "ADMIN sees master calendar.",
      },
    },
  
    groomerWorkingHours: {
      manage: {
        method: "GET/POST/PUT/PATCH/DELETE",
        path: "/groomer-working-hours",
        public: false,
        roles: [ROLES.GROOMER, ROLES.ADMIN],
        notes: "GROOMER manages own working hours; ADMIN can manage all.",
      },
    },
  
    groomerTimeBlocks: {
      manage: {
        method: "GET/POST/PUT/PATCH/DELETE",
        path: "/groomer-time-blocks",
        public: false,
        roles: [ROLES.GROOMER, ROLES.ADMIN],
        notes: "GROOMER manages own blocked slots; ADMIN can manage all.",
      },
    },
  
    adminUsers: {
      createGroomer: {
        method: "POST",
        path: "/admin/groomers",
        public: false,
        roles: [ROLES.ADMIN],
        notes: "ADMIN creates groomer accounts. Groomers do not self-register.",
      },
      deactivateGroomer: {
        method: "PATCH",
        path: "/admin/groomers/:id/deactivate",
        public: false,
        roles: [ROLES.ADMIN],
        notes: "ADMIN can deactivate groomer accounts.",
      },
    },
  };