import { create } from "zustand";

import {
  getStoredUser,
  setStoredUser,
  setToken,
  clearSession,
} from "../core/services/storage.service";

const MOCK_USERS = {
  SUPER_ADMIN: {
    id: "admin-demo-id",
    organisationId: null,
    contactName: "Super Admin",
    email: "admin@smartscrap.com",
    phoneNumber: "9000000001",
    role: "SUPER_ADMIN",
    isActive: true,
  },

  INDUSTRY: {
    id: "industry-demo-id",
    organisationId: "industry-org-id",
    contactName: "Industry User",
    email: "industry@smartscrap.com",
    phoneNumber: "9000000002",
    role: "INDUSTRY",
    isActive: true,
  },

  DEALER: {
    id: "dealer-demo-id",
    organisationId: "dealer-org-id",
    contactName: "Dealer User",
    email: "dealer@smartscrap.com",
    phoneNumber: "9000000003",
    role: "DEALER",
    isActive: true,
  },

  BUYER: {
    id: "buyer-demo-id",
    organisationId: "buyer-org-id",
    contactName: "Buyer User",
    email: "buyer@smartscrap.com",
    phoneNumber: "9000000004",
    role: "BUYER",
    isActive: true,
  },
};

export const useAuthStore = create((set) => ({
  user: getStoredUser(),

  login: ({ user, token }) => {
    setToken(token);
    setStoredUser(user);

    set({
      user,
    });
  },

  logout: () => {
    clearSession();

    set({
      user: null,
    });
  },

  // Temporary role switcher for frontend testing
  setMockRole: (role) => {
    const mockUser = MOCK_USERS[role];

    if (!mockUser) return;

    setStoredUser(mockUser);

    set({
      user: mockUser,
    });
  },
}));