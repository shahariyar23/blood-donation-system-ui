import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";

interface StatData {
  value: string;
  label: string;
  emoji: string;
}

interface ImpactStatsProps {
  stats?: StatData[];
  loading?: boolean;
  error?: string;
}

const fallbackStats = [
  { value: "12,400+", label: "Lives Saved",          emoji: "❤️" },
  { value: "8,900+",  label: "Active Donors",         emoji: "🙋" },
  { value: "64",      label: "Districts Covered",     emoji: "📍" },
  { value: "98%",     label: "Requests Fulfilled",    emoji: "✅" },
];

const ImpactStats = ({ stats = [], loading = false, error }: ImpactStatsProps) => {
  const displayStats = stats && stats.length > 0 ? stats : fallbackStats;

  return (
    /* Override section bg to primary red */
    <div className="bg-primary">
      <SectionContainer>
        <MainContainer>
          {/* Heading — white on red */}
          <SectionHeading
            title="Numbers That Matter"
            description="Every number represents a life touched. Together, we're making Bangladesh healthier — one drop at a time."
            align="center"
            className="mb-10 sm:mb-14 text-white [&_p]:text-red-100"
          />

          {/* Error State */}
          {error && (
            <div style={{ 
              padding: "1rem", 
              marginBottom: "1rem", 
              background: "rgba(255,255,255,0.2)", 
              border: "1px solid rgba(255,255,255,0.3)", 
              borderRadius: "0.5rem",
              color: "white",
              fontSize: "0.875rem",
              textAlign: "center"
            }}>
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div style={{ 
              padding: "2rem", 
              textAlign: "center", 
              color: "rgba(255,255,255,0.7)" 
            }}>
              Loading impact stats...
            </div>
          ) : (
            <>
              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {displayStats.map(({ value, label, emoji }) => (
                  <div
                    key={label}
                    className="glass border border-white/20 rounded-xl p-5 sm:p-6 flex flex-col items-center text-center text-white hover:bg-white/20 transition-all duration-300"
                  >
                    <span className="text-3xl sm:text-4xl mb-3">{emoji}</span>
                    <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black mb-1">
                      {value}
                    </span>
                    <span className="text-red-100 text-xxs sm:text-xs font-semibold uppercase tracking-widest">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </MainContainer>
      </SectionContainer>
    </div>
  );
};

export default ImpactStats;