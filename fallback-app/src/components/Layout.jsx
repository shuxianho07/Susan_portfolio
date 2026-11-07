import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import AnimatedBackground from './AnimatedBackground';

export default function Layout({ theme, onToggleTheme }) {
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const previousPath = useRef(pathname);

  useEffect(() => {
    const pageNames = { '/': 'Home', '/about': 'About', '/projects': 'Projects', '/skills': 'Skills', '/resume': 'Resume', '/contact': 'Contact' };
    const name = pageNames[pathname.replace(/\/$/, '') || '/'] || 'Page not found';
    document.title = `${name} | Susan Ho`;
    if (previousPath.current !== pathname) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      mainRef.current?.focus({ preventScroll: true });
      previousPath.current = pathname;
    }
  }, [pathname]);

  return (
    <MotionConfig reducedMotion="user">
    <div className="site-shell relative isolate min-h-screen overflow-x-hidden text-hogwarts-parchment transition-colors duration-500">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <AnimatedBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar theme={theme} onToggleTheme={onToggleTheme} />
        <main id="main-content" ref={mainRef} tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 sm:px-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
    </MotionConfig>
  );
}
