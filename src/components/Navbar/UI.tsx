'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { Outfit } from 'next/font/google';
import { NAV_LINKS } from './Config';
import { useNavbarLogic } from './Logic';
import { NAVBAR_TRANSITIONS } from './Animation';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

export const Navbar = () => {
  const { isCollapsed, isMenuOpen, toggleMenu, closeMenu } = useNavbarLogic();

  return (
    <div className={`${outfit.className} pointer-events-none fixed inset-x-0 top-4 z-50 flex px-4 sm:top-6 ${isCollapsed ? 'justify-start' : 'justify-center'}`}>
      {isCollapsed ? (
        <div className="pointer-events-auto relative">
          <motion.button
            type="button"
            layout
            onClick={toggleMenu}
            transition={NAVBAR_TRANSITIONS.island}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white/8 text-[1.35rem] font-semibold leading-none tracking-[0.08em] text-white backdrop-blur-2xl"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isMenuOpen ? 'menu-close' : 'menu-open'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={NAVBAR_TRANSITIONS.contentSwap}
              >
                {isMenuOpen ? '×' : '☰'}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -8, scale: 0.96 }}
                transition={NAVBAR_TRANSITIONS.popup}
                className="absolute left-full top-full ml-3 mt-2 max-h-[calc(100vh-2.5rem)] w-[250px] overflow-y-auto rounded-2xl border border-white/20 bg-[#2b1d16]/90 p-3 shadow-[0_16px_38px_rgba(0,0,0,0.36)] backdrop-blur-2xl"
              >
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-white/70">Menu</span>
                  <button
                    type="button"
                    onClick={closeMenu}
                    className="rounded-full px-2 py-1 text-xs font-semibold text-white/80 hover:bg-white/10"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-1">
                  {NAV_LINKS.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={closeMenu}
                      className="block rounded-xl px-3 py-2 text-[0.78rem] font-medium uppercase tracking-[0.22em] text-white/90 hover:bg-white/10"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>

                <div className="mt-3 flex gap-2">
                  <Link
                    href="/sign-in"
                    onClick={closeMenu}
                    className="flex-1 rounded-full px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-white/10"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={closeMenu}
                    className="flex-1 rounded-full bg-[#9f1118] px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white"
                  >
                    Sign Up
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <motion.nav
          layout
          transition={NAVBAR_TRANSITIONS.shell}
          className="pointer-events-auto grid grid-cols-[auto_auto_auto] items-center gap-x-6 md:gap-x-[320px]"
        >
          <div className="flex w-[170px] justify-center">
            <motion.div
              layout
              transition={NAVBAR_TRANSITIONS.island}
              className="flex h-14 w-[170px] items-center justify-center rounded-full bg-white/5 px-7 backdrop-blur-2xl"
            >
              <motion.span
                key="logo"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={NAVBAR_TRANSITIONS.contentSwap}
                className="text-[1.45rem] font-extrabold tracking-tight text-white"
              >
                Tasty
                <span className="text-[#b10f18]">.</span>
              </motion.span>
            </motion.div>
          </div>

          <div className="hidden w-[370px] justify-center sm:flex">
            <motion.div
              key="center-island"
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={NAVBAR_TRANSITIONS.reveal}
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
          </div>

          <div className="flex w-[236px] justify-center">
            <motion.div
              key="right-island"
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={NAVBAR_TRANSITIONS.reveal}
              className="flex h-14 items-center gap-2 rounded-full bg-white/5 px-3 backdrop-blur-2xl"
            >
              <Link
                href="/sign-in"
                className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-[#9f1118] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Sign Up
              </Link>
            </motion.div>
          </div>
        </motion.nav>
      )}
    </div>
  );
};
