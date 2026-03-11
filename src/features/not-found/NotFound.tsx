import { Icons } from "../../shared/icons/Icons";
import { Link } from "react-router-dom";
import Button from "../../shared/button/CustomButton";

const quickLinks = [
  { label: "Find Donor", to: "/find-donor" },
  { label: "Donate Blood", to: "/donate" },
  { label: "Request Blood", to: "/request" },
  { label: "Blood Banks", to: "/blood-banks" },
];

const NotFound = () => {
  return (
    <div className="min-h-screen bg-light flex flex-col items-center justify-center px-4 pb-20 text-center">

      {/* ───── 404 Background Number ───── */}
      <div className="relative w-full max-w-2xl mx-auto">

        <h1
          className="
            font-serif font-extrabold
            text-primary/30
            leading-none
            select-none
            text-[110px]
            sm:text-[170px]
            md:text-[220px]
            lg:text-[260px]
          "
        >
          404
        </h1>

        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">

          <Icons.Blood className="text-primary mb-2" />

          <span className="text-primary text-xs font-bold tracking-widest uppercase">
            Oops!
          </span>

          <h2 className="text-xl sm:text-3xl md:text-4xl font-serif font-semibold text-dark">
            Page Not Found
          </h2>

        </div>
      </div>

      {/* ───── Divider ───── */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px w-10 bg-primary" />
        <Icons.Search className="text-primary" />
        <div className="h-px w-10 bg-primary" />
      </div>

      {/* ───── Description ───── */}
      <p className="text-gray-500 max-w-md mb-10 text-sm leading-relaxed">
        The page you are looking for might have been removed or moved to a new
        location. Let's help you find a blood donor or return to the homepage.
      </p>

      {/* ───── Buttons ───── */}
      <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-3">

        <Link to="/">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Icons.Home />}
          >
            Back to Home
          </Button>
        </Link>

        <Link to="/find-donor">
          <Button
            variant="outline"
            size="md"
            leftIcon={<Icons.Search />}
          >
            Find Donor
          </Button>
        </Link>

      </div>

      {/* ───── Quick Links ───── */}
      <div className="mt-16 border-t border-gray-200 pt-8 w-full max-w-md">

        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-4 font-semibold">
          Quick Links
        </p>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">

          {quickLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-sm text-dark hover:text-primary transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}

        </div>

      </div>

    </div>
  );
};

export default NotFound;