import { Link } from "react-router-dom";
import { Icons } from "../../icons/Icons";
import MainContainer from "../../main-container/MainContainer";

/* ───────── Footer Links ───────── */

const exploreLinks = [
  { label: "Home", to: "/" },
  { label: "Find Donor", to: "/find-donor" },
  { label: "Donate Blood", to: "/donate" },
  { label: "Request Blood", to: "/request" },
];

const resourceLinks = [
  { label: "Blood Banks", to: "/blood-banks" },
  { label: "Donation Guide", to: "/guide" },
  { label: "Eligibility", to: "/eligibility" },
  { label: "FAQ", to: "/faq" },
];

const legalLinks = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms & Conditions", to: "/terms" },
];

/* ───────── Footer Component ───────── */

const Footer = () => {
  return (
    <footer className="bg-dark text-white">

      {/* ───── Top Section ───── */}
      <MainContainer>
        <div className="py-12 md:py-16 grid gap-10
          grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

          {/* ── Logo + Description ── */}
          <div className="flex flex-col gap-5">

            <div className="flex items-center gap-2">
              <Icons.Blood className="text-primary w-7 h-7" />
              <span className="text-xl font-bold">
                Blood<span className="text-primary">Connect</span>
              </span>
            </div>

            <p className="text-sm text-white/60 leading-relaxed">
              BloodConnect helps patients quickly find nearby blood donors
              during emergencies using a location-based intelligent search system.
            </p>

            {/* Social */}
            <div>
              <p className="text-[10px] tracking-widest text-white/40 uppercase mb-3">
                Follow Us
              </p>

              <div className="flex items-center gap-4">

                <a
                  href="#"
                  className="w-9 h-9 flex items-center justify-center
                  rounded-full bg-white/5 hover:bg-primary
                  transition-all duration-300"
                >
                  <Icons.Facebook />
                </a>

                <a
                  href="#"
                  className="w-9 h-9 flex items-center justify-center
                  rounded-full bg-white/5 hover:bg-primary
                  transition-all duration-300"
                >
                  <Icons.Twitter />
                </a>

                <a
                  href="#"
                  className="w-9 h-9 flex items-center justify-center
                  rounded-full bg-white/5 hover:bg-primary
                  transition-all duration-300"
                >
                  <Icons.Instagram />
                </a>

              </div>
            </div>
          </div>

          {/* ── Explore ── */}
          <div>
            <p className="text-xs font-bold tracking-widest text-white/40 uppercase mb-6">
              Explore
            </p>

            <ul className="flex flex-col gap-3">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/70 hover:text-primary transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Resources ── */}
          <div>
            <p className="text-xs font-bold tracking-widest text-white/40 uppercase mb-6">
              Resources
            </p>

            <ul className="flex flex-col gap-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/70 hover:text-primary transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <p className="text-xs font-bold tracking-widest text-white/40 uppercase mb-6">
              Contact
            </p>

            <ul className="flex flex-col gap-4">

              <li className="flex items-center gap-3 text-sm text-white/70">
                <Icons.Phone className="text-primary" />
                +880 1757-529976
              </li>

              <li className="flex items-center gap-3 text-sm text-white/70">
                <Icons.Mail className="text-primary" />
                support@bloodconnect.com
              </li>

              <li className="flex items-center gap-3 text-sm text-white/70">
                <Icons.Location className="text-primary" />
                Dhaka, Bangladesh
              </li>

            </ul>
          </div>

        </div>

        {/* ───── Divider ───── */}
        <div className="border-t border-white/10" />

        {/* ───── Bottom Bar ───── */}
        <div className="py-6 flex flex-col md:flex-row
          items-center justify-between gap-4">

          {/* Legal Links */}
          <div className="flex items-center gap-6 text-xs text-white/40">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="hover:text-primary transition"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs text-white/40 flex items-center gap-1 text-center">
            <Icons.Copy className="w-3 h-3" />
            {new Date().getFullYear()} BloodConnect. All rights reserved.
          </p>

          {/* Developer */}
          <p className="text-xs text-white/30">
            Developed by
            <span className="text-primary ml-1 font-medium">
              BloodConnect Dev
            </span>
          </p>

        </div>

      </MainContainer>
    </footer>
  );
};

export default Footer;