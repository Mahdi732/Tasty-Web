'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Outfit } from 'next/font/google';
import { NAV_LINKS, NAV_SCROLL_COLLAPSE_Y } from '../config/navbar.config';
import { useNavbarMorph } from '../model/useNavbarMorph';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

export const IslandNavbar = () => {
  const { isCollapsed } = useNavbarMorph(NAV_SCROLL_COLLAPSE_Y);

  return (
    <div className={`${outfit.className} fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6`}>
      <motion.nav
        layout
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-[auto_auto_auto] items-center gap-x-6 md:gap-x-[320px]"
      >
        <div className="flex w-[170px] justify-center">
          <motion.div
            layout
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className={`flex h-14 items-center justify-center rounded-full bg-white/5 px-7 backdrop-blur-2xl ${isCollapsed ? 'w-[76px]' : 'w-[170px]'}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isCollapsed ? (
                <motion.span
                  key="menu-icon"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.24 }}
                  className="text-[1.35rem] font-semibold leading-none tracking-[0.08em] text-white"
                >
                  ☰
                </motion.span>
              ) : (
                <motion.span
                  key="logo"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.24 }}
                  className="text-[1.45rem] font-extrabold tracking-tight text-white"
                >
                  Tasty
                  <span className="text-[#b10f18]">.</span>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="hidden w-[370px] justify-center sm:flex">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                key="center-island"
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                className="flex h-14 items-center rounded-full bg-white/5 px-8 backdrop-blur-2xl"
              >
                <div className="flex items-center gap-9">
                  {NAV_LINKS.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="text-[0.8rem] font-medium uppercase tracking-[0.3em] text-white/88"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex w-[236px] justify-center">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                key="right-island"
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                className="flex h-14 items-center gap-2 rounded-full bg-white/5 px-3 backdrop-blur-2xl"
              >
                <button
                  type="button"
                  className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className="rounded-full bg-[#9f1118] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                >
                  Sign Up
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </div>
  );
};
