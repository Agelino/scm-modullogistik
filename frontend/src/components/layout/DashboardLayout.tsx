import { Outlet, useLocation } from 'react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef<HTMLElement | null>(null);

  // Close sidebar when route changes (e.g., user clicks a menu item)
  useEffect(() => {
    setIsSidebarOpen(false);
    // Focus main content so user lands on the selected page
    window.requestAnimationFrame(() => {
      mainRef.current?.focus();
    });
  }, [location.pathname]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (!isSidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isSidebarOpen]);

  const sidebarClassName = useMemo(
    () => (isSidebarOpen ? 'app-sidebar app-sidebar-open' : 'app-sidebar'),
    [isSidebarOpen]
  );

  return (
    <div className="app-frame">
      <div className="app-shell">
        {isSidebarOpen && (
          <div
            className="sidebar-backdrop"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <Sidebar
          className={sidebarClassName}
          onNavigate={() => {
            setIsSidebarOpen(false);
            window.requestAnimationFrame(() => {
              mainRef.current?.focus();
            });
          }}
        />
        <div className="app-content">
          <Header
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
          />
          <main className="app-main" ref={mainRef} tabIndex={-1}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
