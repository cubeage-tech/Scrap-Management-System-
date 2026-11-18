import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Menu, X, Bell, LogOut, Settings } from "lucide-react";
import { useAuth } from "../core/hooks/useAuth";
import { ROLE_LABELS } from "../core/constants/app.constant";
import { ROLE_SETTINGS_ROUTE } from "../core/constants/routes.constant";
import { useNotificationStore } from "../store/notificationStore";

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "For Who", href: "#for-who" },
  { label: "Pricing", href: "#pricing" },
];

const ProfileDropdown = ({ user, onClose }) => {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  const goToProfile = () => {
    const target = user?.role ? ROLE_SETTINGS_ROUTE[user.role] : null;
    if (target) navigate(target);
    onClose();
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/");
    onClose();
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
      {/* User info header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="text-sm font-semibold text-gray-900 truncate">{user?.contactName}</div>
        <div className="text-xs text-gray-500 truncate">{user?.email}</div>
        {user?.role && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wide">
            {ROLE_LABELS[user.role] || user.role}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="py-1">
        <button
          onClick={goToProfile}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
        >
          <Settings className="w-4 h-4 text-gray-400" />
          Profile & Settings
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

const Navbar = ({ dashboard = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Features");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNavClick = (label) => {
    setActiveLink(label);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/");
    setDropdownOpen(false);
    setIsMenuOpen(false);
  };

  const goToSettings = () => {
    const target = user?.role ? ROLE_SETTINGS_ROUTE[user.role] : null;
    if (target) navigate(target);
    setDropdownOpen(false);
  };

  const initials = getInitials(user?.contactName);
  const roleLabel = user?.role ? ROLE_LABELS[user.role] : "";

  const { unreadCount, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user?.id]);

  // Dashboard navbar (inside role layout)
  if (dashboard) {
    return (
      <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-brand text-white border-b border-white/10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 rounded-lg p-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-accent flex items-center justify-center text-brand font-bold text-base sm:text-lg">
              SS
            </div>
            <span className="text-lg sm:text-2xl font-bold tracking-tight whitespace-nowrap">
              SmartScrap
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2.5 rounded-lg p-1 pr-2 sm:pr-3 hover:bg-white/10 transition-colors text-left cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-brand-accent flex items-center justify-center text-brand font-bold text-sm shrink-0">
                    {initials}
                  </div>
                  <div className="hidden sm:block leading-tight">
                    <div className="text-sm font-semibold">{user.contactName}</div>
                    <div className="text-xs text-white/70">{roleLabel}</div>
                  </div>
                </button>

                {dropdownOpen && (
                  <ProfileDropdown user={user} onClose={() => setDropdownOpen(false)} />
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }

  // Public navbar — show profile avatar if logged in, else Sign In / Get Started
  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-brand text-white border-b border-white/10 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            onClick={() => setActiveLink("")}
            className="flex items-center gap-2 sm:gap-3 rounded-lg p-1"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-accent flex items-center justify-center text-brand font-bold text-base sm:text-lg">
              SS
            </div>
            <span className="text-lg sm:text-2xl font-bold tracking-tight whitespace-nowrap">
              SmartScrap AI
            </span>
          </Link>

          {/* Desktop Nav Links — only when not logged in */}
          {!user && (
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => handleNavClick(link.label)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeLink === link.label
                      ? "text-brand-accent bg-white/10"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4">
            {user ? (
              /* Logged-in: profile avatar + dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2.5 rounded-lg p-1 pr-3 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-brand-accent flex items-center justify-center text-brand font-bold text-sm shrink-0">
                    {initials}
                  </div>
                  <div className="leading-tight text-left">
                    <div className="text-sm font-semibold">{user.contactName}</div>
                    <div className="text-xs text-white/70">{roleLabel}</div>
                  </div>
                </button>

                {dropdownOpen && (
                  <ProfileDropdown user={user} onClose={() => setDropdownOpen(false)} />
                )}
              </div>
            ) : (
              /* Guest: Sign In + Get Started */
              <>
                <Link
                  to="/login"
                  className="px-4 xl:px-5 py-2.5 rounded-lg border border-white/20 text-sm font-semibold hover:bg-white/10 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 xl:px-5 py-2.5 rounded-lg bg-brand-accent text-foreground text-sm font-semibold hover:bg-brand-accent/90 transition-all flex items-center gap-2 shadow-[0_0_15px_color-mix(in_oklch,var(--brand-accent)_30%,transparent)]"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-3 border-t border-white/10 pt-4 max-h-[70vh] overflow-y-auto">
            {!user && (
              <div className="flex flex-col gap-1 mb-4">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => handleNavClick(link.label)}
                    className={`px-3 py-3 rounded-lg transition-colors duration-300 ${
                      activeLink === link.label
                        ? "text-brand-accent bg-white/5"
                        : "text-gray-200 hover:text-brand-accent hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            {user ? (
              /* Mobile logged-in menu */
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-brand-accent flex items-center justify-center text-brand font-bold text-sm shrink-0">
                    {initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{user.contactName}</div>
                    <div className="text-xs text-white/60">{roleLabel}</div>
                  </div>
                </div>
                <button
                  onClick={() => { goToSettings(); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                >
                  <Settings className="w-4 h-4" />
                  Profile & Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full sm:w-auto text-center px-5 py-2.5 rounded-lg border border-white/20 text-sm font-semibold hover:bg-white/10"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-lg bg-brand-accent text-foreground text-sm font-semibold flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;