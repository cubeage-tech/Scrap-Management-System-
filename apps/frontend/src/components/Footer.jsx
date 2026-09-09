import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative w-full mt-auto bg-foreground text-slate-300 font-sans antialiased border-t border-slate-800/80"
      style={{
        fontFamily:
          "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Global layout styles to pin footer to bottom & import Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        html, body, #root {
          min-height: 100vh;
          margin: 0;
          display: flex;
          flex-direction: column;
        }

        #root {
          flex: 1;
        }

        #root > main,
        #root > div:not(footer):not(nav),
        #root > section {
          flex: 1 0 auto;
        }
      `}</style>

      {/* Spacing wrapper for half-floating CTA card */}
      <div className="pt-20 sm:pt-24" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-6">
        {/* ================= FULL-WIDTH FLOATING CTA CARD ================= */}
        <div
          className="relative -mt-36 sm:-mt-44 z-20 w-full overflow-hidden rounded-3xl px-8 py-8 sm:px-14 sm:py-10 shadow-2xl gradient-brand border border-brand-glow/30"
        >

          <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
                Turn Scrap Into Value.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-blue-100 sm:text-base font-normal max-w-xl">
                Connect industries, dealers and buyers through one smarter scrap
                management platform.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                to="/signup"
                className="group inline-flex items-center gap-3.5 rounded-full bg-white px-7 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base font-bold text-slate-950 shadow-xl transition-all duration-200 hover:bg-slate-100 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95"
              >
                <span>Explore Marketplace</span>
                <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-brand-accent text-slate-950 font-black transition-transform duration-200 group-hover:rotate-45">
                  <svg
                    className="h-4 w-4 sm:h-4.5 sm:w-4.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-12 lg:gap-12">
          {/* Brand Info & Ratings (5 Columns) */}
          <div className="md:col-span-12 lg:col-span-5 space-y-4 pr-0 lg:pr-8">
          

          
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center">
                SmartScrap AI
              </h3>
          

            {/* Description */}
            <p className="max-w-md text-sm sm:text-base leading-relaxed text-slate-300 font-normal">
              Enterprise industrial scrap management — digitizing the complete
              lifecycle from inventory to auction to sale.
            </p>

                
              <div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Trusted by industrial businesses
              </p>
            </div>
          </div>

          {/* Platform Column (2 Columns) */}
          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white mb-5">
              PLATFORM
            </h4>
            <ul className="space-y-3.5 text-sm sm:text-[15px] text-slate-300">
              <li>
                <Link
                  to="/"
                  className="transition-colors duration-150 hover:text-white hover:underline"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="transition-colors duration-150 hover:text-white hover:underline"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="transition-colors duration-150 hover:text-white hover:underline"
                >
                  Live Auctions
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="transition-colors duration-150 hover:text-white hover:underline"
                >
                  Tenders
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="transition-colors duration-150 hover:text-white hover:underline"
                >
                  Quotations
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="transition-colors duration-150 hover:text-white hover:underline"
                >
                  Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* For Users Column (2 Columns) */}
          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white mb-5">
              FOR USERS
            </h4>
            <ul className="space-y-3.5 text-sm sm:text-[15px] text-slate-300">
              <li>
                <Link
                  to="/"
                  className="transition-colors duration-150 hover:text-white hover:underline"
                >
                  Industry
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="transition-colors duration-150 hover:text-white hover:underline"
                >
                  Dealers
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="transition-colors duration-150 hover:text-white hover:underline"
                >
                  Buyers
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="transition-colors duration-150 hover:text-white hover:underline"
                >
                  Admin Panel
                </Link>
              </li>
              <li>
                <Link
                  to="/help-center"
                  className="transition-colors duration-150 hover:text-white hover:underline"
                >
                  API Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column (3 Columns) */}
          <div className="md:col-span-4 lg:col-span-3">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white mb-5">
              COMPANY
            </h4>
            <ul className="space-y-3.5 text-sm sm:text-[15px] text-slate-300">
              <li>
                <Link
                  to="/about"
                  className="transition-colors duration-150 hover:text-white hover:underline"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="transition-colors duration-150 hover:text-white hover:underline"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="transition-colors duration-150 hover:text-white hover:underline"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="transition-colors duration-150 hover:text-white hover:underline"
                >
                  Press Kit
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="transition-colors duration-150 hover:text-white hover:underline"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ================= BOTTOM COPYRIGHT & LEGAL ================= */}
        <div className="mt-10 border-t border-slate-800/80 pt-5">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left text-xs sm:text-sm text-slate-400">
            <div>
              <p>© {currentYear} SmartScrap AI.</p>
              <p className="mt-0.5 text-slate-500">All rights reserved.</p>
            </div>

            <div className="flex items-center gap-6">
              <Link
                to="/about"
                className="transition-colors hover:text-white"
              >
                Privacy Policy
              </Link>
              <Link
                to="/about"
                className="transition-colors hover:text-white"
              >
                Terms of Service
              </Link>
              <Link
                to="/about"
                className="transition-colors hover:text-white"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;