import { useState } from 'react';
import { NAV_SCROLL_COLLAPSE_Y } from './Config';
import { useNavbarMorph } from '@/services/navbar/useNavbarMorph';

export const useNavbarLogic = () => {
  const { isCollapsed } = useNavbarMorph(NAV_SCROLL_COLLAPSE_Y);
  const [isMenuOpenRaw, setIsMenuOpenRaw] = useState(false);
  const isMenuOpen = isCollapsed && isMenuOpenRaw;

  const toggleMenu = () => {
    if (!isCollapsed) {
      return;
    }

    setIsMenuOpenRaw((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpenRaw(false);
  };

  return {
    isCollapsed,
    isMenuOpen,
    toggleMenu,
    closeMenu,
  };
};
