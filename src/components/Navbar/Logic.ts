import { NAV_SCROLL_COLLAPSE_Y } from './Config';
import { useNavbarMorph } from '@/services/navbar/useNavbarMorph';

export const useNavbarLogic = () => {
  const { isCollapsed } = useNavbarMorph(NAV_SCROLL_COLLAPSE_Y);

  return {
    isCollapsed,
  };
};
