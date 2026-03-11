import { useState, useEffect } from "react";
import Navbar from "../../navbar/Navbar";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Spacer — pushes page content below fixed navbar */}
      <div className="h-[73px]" />

      {/* Navbar is fixed, positioned at top */}
      <Navbar scrolled={scrolled} />
    </>
  );
};

export default Header;