import { Icons } from "../../../shared/icons/Icons";

const urgencyLevels = [
  { color: "bg-red-500",    label: "Critical",  desc: "Within hours — life threatening"  },
  { color: "bg-orange-400", label: "Urgent",    desc: "Within 24 hours"                  },
  { color: "bg-yellow-400", label: "Moderate",  desc: "Within 3 days"                    },
  { color: "bg-green-500",  label: "Planned",   desc: "Within a week — scheduled surgery"},
];

const guidelines = [
  "Provide accurate patient and hospital information",
  "Make sure your contact number is reachable 24/7",
  "One unit equals approximately 450ml of whole blood",
  "Request expires automatically after the needed-by date",
  "Only post genuine requests — misuse leads to account ban",
];

const RequestBloodSidebar = () => {
  return (
    <div className="flex flex-col gap-5">

      {/* Urgency guide */}
      <div className="bg-white rounded-xs shadow-md p-5">
        <h3 className="font-serif font-bold text-dark text-sm mb-4 flex items-center gap-2">
          <Icons.Emergency className="w-4 h-4 text-primary" />
          Urgency Levels
        </h3>
        <div className="space-y-3">
          {urgencyLevels.map(({ color, label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <span className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
              <div>
                <p className="text-xs font-bold text-dark">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-white rounded-xs shadow-md p-5">
        <h3 className="font-serif font-bold text-dark text-sm mb-4 flex items-center gap-2">
          <Icons.Check className="w-4 h-4 text-primary" />
          Guidelines
        </h3>
        <ul className="space-y-2.5">
          {guidelines.map((g) => (
            <li key={g} className="flex items-start gap-2.5 text-xs text-gray-500 leading-relaxed">
              <Icons.Check className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
              {g}
            </li>
          ))}
        </ul>
      </div>

      {/* Emergency contact */}
      <div className="bg-primary rounded-xs p-5 text-white">
        <h3 className="font-serif font-bold text-sm mb-1 flex items-center gap-2">
          <Icons.Phone className="w-4 h-4" />
          Emergency Helpline
        </h3>
        <p className="text-red-100 text-xs mb-3">
          Can't find a donor? Call our 24/7 emergency line.
        </p>
        <a
          href="tel:+8801XXXXXXXXX"
          className="block bg-white text-primary font-bold text-sm text-center
            py-2.5 rounded-xs hover:bg-red-50 transition-colors"
        >
          +880 1X-XXXX-XXXX
        </a>
      </div>
    </div>
  );
};

export default RequestBloodSidebar;