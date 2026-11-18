// export const APP_NAME = 'Scrap Management System';

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  INDUSTRY: 'INDUSTRY',
  DEALER: 'DEALER',
  BUYER: 'BUYER',
};

export const ROLE_LABELS = {
  [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
  [USER_ROLES.INDUSTRY]: 'Industry',
  [USER_ROLES.DEALER]: 'Dealer',
  [USER_ROLES.BUYER]: 'Buyer',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'sms_auth_token',
  AUTH_USER: 'sms_auth_user',
};

// Export APPLICATION_CONSTANTS for backward compatibility
export const APPLICATION_CONSTANTS = {
  STORAGE: {
    TOKEN: STORAGE_KEYS.AUTH_TOKEN,
    USER_DETAILS: STORAGE_KEYS.AUTH_USER,
  },
};
