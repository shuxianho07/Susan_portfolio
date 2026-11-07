import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaEnvelope, FaLinkedin, FaGithub } from 'react-icons/fa';

const navItems = [
  { label: 'home', to: '/' },
  { label: 'about me', to: '/about' },
  { label: 'skills', to: '/skills' },
  { label: 'projects', to: '/projects' },
  { label: 'resume', to: '/resume' },
  { label: 'contact', to: '/contact' }
];

export default function Navbar({ theme, onToggleTheme }) {
  const gameUrl = import.meta.env.DEV ? `${window.location.protocol}//${window.location.hostname}:8000/` : '/';
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleRef = useRef(null);
  const navRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const dismiss = event => {
      if (event.type === 'keydown' && event.key === 'Escape') {
        setMobileOpen(false);
        toggleRef.current?.focus();
      } else if (event.type === 'pointerdown' && !navRef.current?.contains(event.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', dismiss);
    document.addEventListener('pointerdown', dismiss);
    return () => {
      document.removeEventListener('keydown', dismiss);
      document.removeEventListener('pointerdown', dismiss);
    };
  }, [mobileOpen]);

  return (
    <nav ref={navRef} aria-label="Main navigation" className="sticky top-0 z-50 w-full flex items-center justify-between gap-3 px-4 lg:px-8 py-4 bg-hogwarts-bg/95 backdrop-blur-md border-b border-hogwarts-gold/20 font-['Patrick_Hand'] pointer-events-auto">
      
      {/* Back to Game Button */}
      <a href={gameUrl} className="px-4 py-2 bg-white/90 dark:bg-hogwarts-gold/90 text-hogwarts-gold dark:text-hogwarts-bg font-['Cinzel'] text-sm font-semibold rounded-lg shadow-md hover:scale-105 transition-transform shrink-0">
        ⬅ Game
      </a>

      {/* Desktop Links Container */}
      <div className="hidden lg:flex items-center gap-4 xl:gap-6 text-lg">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            end={item.to === '/'}
            to={item.to}
            className={({ isActive }) =>
              `text-hogwarts-gold hover:text-white transition-colors duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] hover:drop-shadow-[0_0_10px_rgba(var(--hogwarts-gold-rgb),0.4)] ${isActive ? 'text-white drop-shadow-[0_0_10px_rgba(var(--hogwarts-gold-rgb),0.4)]' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Desktop Socials */}
      <div className="hidden lg:flex gap-4 items-center">
        <button
          onClick={onToggleTheme}
          className="text-hogwarts-gold hover:text-white transition-colors duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] hover:drop-shadow-[0_0_10px_rgba(var(--hogwarts-gold-rgb),0.4)]"
          aria-label="Toggle Light/Dark Theme"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? 'Lumos' : 'Nox'}
        </button>
        <a aria-label="Email Susan" href="mailto:s39ho@uwaterloo.ca" target="_blank" rel="noreferrer" className="text-hogwarts-gold hover:text-white transition-colors duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] hover:drop-shadow-[0_0_10px_rgba(var(--hogwarts-gold-rgb),0.4)]">
          <FaEnvelope className="text-xl" />
        </a>
        <a aria-label="Susan on LinkedIn" href="https://www.linkedin.com/in/shuxian-susan-ho/" target="_blank" rel="noreferrer" className="text-hogwarts-gold hover:text-white transition-colors duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] hover:drop-shadow-[0_0_10px_rgba(var(--hogwarts-gold-rgb),0.4)]">
          <FaLinkedin className="text-xl" />
        </a>
        <a aria-label="Susan on GitHub" href="https://github.com/shuxianho07" target="_blank" rel="noreferrer" className="text-hogwarts-gold hover:text-white transition-colors duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] hover:drop-shadow-[0_0_10px_rgba(var(--hogwarts-gold-rgb),0.4)]">
          <FaGithub className="text-xl" />
        </a>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="lg:hidden flex items-center gap-4">
        <button
          ref={toggleRef}
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileOpen(value => !value)}
          className="min-h-11 min-w-11 flex items-center justify-center text-hogwarts-gold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        >
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div id="mobile-navigation" className="absolute top-full right-4 flex flex-col gap-4 p-4 bg-hogwarts-bg/95 border border-hogwarts-gold/30 rounded-xl backdrop-blur-md lg:hidden min-w-[200px] max-h-[calc(100dvh-6rem)] overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className="min-h-11 flex items-center text-hogwarts-gold hover:opacity-70"
            >
              {item.label}
            </NavLink>
          ))}
          <div className="h-[1px] bg-hogwarts-gold/20 my-2"></div>
          <button onClick={() => { onToggleTheme(); setMobileOpen(false); }} className="text-hogwarts-gold text-left">
            {theme === 'dark' ? 'Lumos' : 'Nox'}
          </button>
        </div>
      )}
    </nav>
  );
}
