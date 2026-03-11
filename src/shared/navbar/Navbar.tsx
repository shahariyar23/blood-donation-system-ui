import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Icons } from "../icons/Icons";
import Button from "../button/CustomButton";
import MainContainer from "../main-container/MainContainer";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Find Donor", href: "/find-donor" },
  { label: "Donate Blood", href: "/donate" },
  { label: "Request Blood", href: "/request" },
  { label: "Blood Banks", href: "/blood-banks" },
  { label: "About", href: "/about" },
];

interface NavbarProps {
  scrolled: boolean;
}

const Navbar = ({ scrolled }: NavbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* ───── Navbar ───── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${scrolled ? "bg-white shadow-md" : "bg-white/80 backdrop-blur-md"}`}
      >
        <MainContainer>
          <div className="flex items-center justify-between py-4">

            {/* ─── Logo ─── */}
            <NavLink
              to="/"
              className="flex items-center gap-2 font-bold text-lg hover:scale-105 transition"
            >
              <Icons.Blood className="text-primary w-6 h-6" />
              <span className="text-dark font-semibold">
                Blood<span className="text-primary">Connect</span>
              </span>
            </NavLink>

            {/* ─── Desktop Navigation ─── */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.href}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors duration-200
                    ${
                      isActive
                        ? "text-primary"
                        : "text-dark hover:text-primary"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* ─── Desktop Buttons ─── */}
            <div className="hidden lg:flex items-center gap-3">
              <NavLink to="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </NavLink>

              <NavLink to="/request">
                <Button variant="primary" size="sm">
                  Request Blood
                </Button>
              </NavLink>
            </div>

            {/* ─── Mobile Menu Toggle ─── */}
            <button
              className="lg:hidden p-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <Icons.Close /> : <Icons.Menu />}
            </button>

          </div>
        </MainContainer>
      </header>

      {/* ───── Mobile Menu ───── */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-40 pt-24 px-6 flex flex-col gap-4">

          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.href}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 border-b text-base font-medium
                ${
                  isActive
                    ? "text-primary"
                    : "text-dark hover:text-primary"
                }`
              }
            >
              <Icons.ArrowForward className="w-4 h-4 text-primary" />
              {link.label}
            </NavLink>
          ))}

          <div className="mt-6 flex flex-col gap-3">
            <NavLink to="/login">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Button>
            </NavLink>

            <NavLink to="/request">
              <Button
                variant="primary"
                fullWidth
                onClick={() => setMenuOpen(false)}
              >
                Request Blood
              </Button>
            </NavLink>
          </div>

        </div>
      )}
    </>
  );
};

export default Navbar;