import { NAVBAR_MOTION_EASE } from './Config';

export const NAVBAR_TRANSITIONS = {
  shell: { duration: 0.5, ease: NAVBAR_MOTION_EASE },
  island: { duration: 0.55, ease: NAVBAR_MOTION_EASE },
  reveal: { duration: 0.34, ease: NAVBAR_MOTION_EASE },
  contentSwap: { duration: 0.24 },
} as const;
