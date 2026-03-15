import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Icons } from "../icons/Icons";
import Button from "../button/CustomButton";
import MainContainer from "../main-container/MainContainer";

const navLinks = [
  { label: "Home",         href: "/"            },
  { label: "Find Donor",   href: "/find-donor"  },
  { label: "Donate Blood", href: "/donate"      },
  { label: "Request Blood",href: "/request"     },
  { label: "Blood Banks",  href: "/blood-banks" },
  { label: "About",        href: "/about"       },
];

interface NavbarProps {
  scrolled: boolean;
}

const Navbar = ({ scrolled }: NavbarProps) => {
  const [menuOpen,    setMenuOpen]    = useState(false);
  // rendered controls whether the overlay is in the DOM
  // visible controls the CSS transition (opacity + translateX)
  const [rendered,    setRendered]    = useState(false);
  const [visible,     setVisible]     = useState(false);

  // Open: mount first, then trigger transition on next frame
  const openMenu = () => {
    setRendered(true);
    // small delay so the element is in the DOM before transition starts
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    setMenuOpen(true);
    document.body.style.overflow = "hidden";
  };

  // Close: trigger transition out, then unmount after it finishes
  const closeMenu = () => {
    setVisible(false);
    setMenuOpen(false);
    document.body.style.overflow = "";
    // wait for transition (300ms) before removing from DOM
    setTimeout(() => setRendered(false), 320);
  };

  const toggleMenu = () => (menuOpen ? closeMenu() : openMenu());

  // Clean up overflow lock on unmount
  useEffect(() => {
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      {/* ───── Navbar ───── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
          ${scrolled ? "bg-white shadow-md" : "bg-white/80 backdrop-blur-md"}`}
      >
        <MainContainer>
          <div className="flex items-center justify-between py-4">

            {/* Logo */}
            <NavLink
              to="/"
              className="flex items-center gap-2 font-bold text-lg hover:scale-105 transition"
            >
              <Icons.Blood className="!w-5 !h-5 text-primary" />
              <span className="text-dark font-semibold font-serif">
                Blood<span className="text-primary">Connect</span>
              </span>
            </NavLink>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.href}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors duration-200
                    ${isActive ? "text-primary" : "text-dark hover:text-primary"}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Desktop buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <NavLink to="/login">
                <Button variant="outline" size="sm" radius="xs">Login</Button>
              </NavLink>
              <NavLink to="/request">
                <Button variant="primary" size="sm" radius="xs">Request Blood</Button>
              </NavLink>
            </div>

            {/* Mobile — login button + menu toggle */}
            <div className="flex lg:hidden items-center gap-2">
              <NavLink to="/login">
                <Button variant="outline" size="xs" radius="xs">Login</Button>
              </NavLink>

              <button
                className="p-1 rounded-xs hover:bg-gray-100 transition-colors"
                onClick={toggleMenu}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                <div className="relative w-6 h-6 center-flex">
                  {/* Hamburger → X with rotation animation */}
                  <span
                    className={`absolute transition-all duration-300
                      ${menuOpen ? "opacity-100 rotate-0" : "opacity-0 rotate-90"}`}
                  >
                    <Icons.Close className="!w-5 !h-5" />
                  </span>
                  <span
                    className={`absolute transition-all duration-300
                      ${menuOpen ? "opacity-0 -rotate-90" : "opacity-100 rotate-0"}`}
                  >
                    <Icons.Menu className="!w-5 !h-5" />
                  </span>
                </div>
              </button>
            </div>

          </div>
        </MainContainer>
      </header>

      {/* ───── Mobile Menu Overlay ───── */}
      {rendered && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeMenu}
            className={`lg:hidden fixed inset-0 bg-black/40 z-40
              transition-opacity duration-300
              ${visible ? "opacity-100" : "opacity-0"}`}
          />

          {/* Drawer — slides in from right */}
          <div
            className={`lg:hidden fixed top-0 right-0 bottom-0 w-[80vw] max-w-xs
              bg-white z-50 flex flex-col shadow-2xl
              transition-transform duration-300 ease-in-out
              ${visible ? "translate-x-0" : "translate-x-full"}`}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4
              border-b border-gray-100">
              <NavLink
                to="/"
                onClick={closeMenu}
                className="flex items-center gap-2"
              >
                <Icons.Blood className="!w-4 !h-4 text-primary" />
                <span className="font-serif font-bold text-dark text-base">
                  Blood<span className="text-primary">Connect</span>
                </span>
              </NavLink>
              <button
                onClick={closeMenu}
                className="w-8 h-8 rounded-xs bg-gray-100 center-flex
                  hover:bg-red-50 hover:text-primary transition-colors"
              >
                <Icons.Close className="!w-4 !h-4" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-4 py-4">
              {navLinks.map((link, index) => (
                <NavLink
                  key={link.label}
                  to={link.href}
                  onClick={closeMenu}
                  style={{
                    transitionDelay: visible ? `${index * 40}ms` : "0ms",
                  }}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-3 rounded-xs mb-1
                    text-sm font-medium
                    transition-all duration-300
                    ${visible
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-4"
                    }
                    ${isActive
                      ? "bg-primary/10 text-primary"
                      : "text-dark hover:bg-gray-50 hover:text-primary"
                    }`
                  }
                >
                  <span>{link.label}</span>
                  <Icons.ArrowForward className="!w-3.5 !h-3.5 text-primary/60" />
                </NavLink>
              ))}
            </nav>

            {/* CTA buttons */}
            <div className="px-4 pb-6 pt-3 border-t border-gray-100 flex flex-col gap-2.5">
              <NavLink to="/login" onClick={closeMenu}>
                <Button variant="outline" size="md" radius="xs" fullWidth>
                  Login
                </Button>
              </NavLink>
              <NavLink to="/request" onClick={closeMenu}>
                <Button variant="primary" size="md" radius="xs" fullWidth>
                  Request Blood
                </Button>
              </NavLink>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;