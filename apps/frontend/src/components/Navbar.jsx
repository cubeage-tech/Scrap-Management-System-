import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Menu, X, Bell } from "lucide-react";
import { useAuth } from "../core/hooks/useAuth";
import { ROLE_LABELS } from "../core/constants/app.constant";
import { ROLE_SETTINGS_ROUTE } from "../core/constants/routes.constant";

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "For Who", href: "#for-who" },
  { label: "Pricing", href: "#pricing" },
];

const Navbar = ({ dashboard = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Features");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNavClick = (label) => {
    setActiveLink(label);
    setIsMenuOpen(false);
  };

  const goToSettings = () => {
    const target = user?.role ? ROLE_SETTINGS_ROUTE[user.role] : null;
    if (target) navigate(target);
  };

  if (dashboard) {
    const initials = getInitials(user?.contactName);
    const roleLabel = user?.role ? ROLE_LABELS[user.role] : "";

    return (
      <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-brand text-white border-b border-white/10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 rounded-lg p-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-accent flex items-center justify-center text-brand font-bold text-base sm:text-lg">
              SS
            </div>
            <span className="text-lg sm:text-2xl font-bold tracking-tight whitespace-nowrap">
              SmartScrap
            </span>
          </Link>

          {/* Right side: notifications + profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>

            {user && (
              <button
                type="button"
                onClick={goToSettings}
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
            )}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-brand text-white border-b border-white/10 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">

        {/* Top Navbar */}
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


          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4">
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
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-3 border-t border-white/10 pt-4 max-h-[70vh] overflow-y-auto">

            {/* Mobile Links */}
            <div className="flex flex-col gap-1">
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

            {/* Mobile Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
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
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;