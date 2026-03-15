import MainContainer from "../../../shared/main-container/MainContainer";
import { Icons } from "../../../shared/icons/Icons";

const stats = [
  { value: "8+",    label: "Banks Listed",     icon: Icons.Hospital  },
  { value: "2,280", label: "Units Available",  icon: Icons.Blood     },
  { value: "24/7",  label: "Always Open",      icon: Icons.Clock     },
  { value: "100%",  label: "Verified",         icon: Icons.Check     },
];

interface BloodBankHeroProps {
  totalCount: number;
}

const BloodBankHero = ({ totalCount }: BloodBankHeroProps) => {
  return (
    <div className="bg-primary relative overflow-hidden pt-10 pb-24">
      {/* Decorative circles */}
      <div className="absolute -top-12 -right-12 w-60 h-60 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-20 -right-4  w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />

      <MainContainer>
        {/* Heading */}
        <div className="max-w-xl mb-10">
          <p className="text-red-200 text-xxs font-bold uppercase tracking-widest mb-2">
            BloodConnect
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white font-bold leading-snug mb-3">
            Blood Banks Near You
          </h1>
          <p className="text-red-100 text-sm leading-relaxed">
            Find verified blood banks with real-time availability.{" "}
            <span className="font-semibold text-white">{totalCount} banks</span> listed
            across Bangladesh.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="bg-white/10 rounded-xs px-4 py-3 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xs bg-white/15 center-flex shrink-0">
                <Icon className="!w-4 !h-4 text-white" />
              </div>
              <div>
                <p className="font-serif font-black text-white text-base leading-none">
                  {value}
                </p>
                <p className="text-red-200 text-xxs font-medium mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </MainContainer>
    </div>
  );
};

export default BloodBankHero;