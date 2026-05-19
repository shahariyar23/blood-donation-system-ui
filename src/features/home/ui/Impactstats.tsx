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

const ImpactStats = ({
  stats = [],
  loading = false,
  error,
}: ImpactStatsProps) => {
  const displayStats = stats ?? [];

  return (
    <div className="bg-primary">
      <SectionContainer>
        <MainContainer>
          <SectionHeading
            title="Numbers That Matter"
            description="Every number represents a life touched. Together, we're making Bangladesh healthier — one drop at a time."
            align="center"
            className="mb-10 sm:mb-14 text-white [&_p]:text-red-100"
          />

          {error && (
            <div
              style={{
                padding: "1rem",
                marginBottom: "1rem",
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "0.5rem",
                color: "white",
                fontSize: "0.875rem",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Loading impact stats...
            </div>
          ) : displayStats.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {displayStats.map(({ value, label, emoji }) => (
                <div
                  key={label}
                  className="glass flex flex-col items-center rounded-xl border border-white/20 p-5 text-center text-white transition-all duration-300 hover:bg-white/20 sm:p-6"
                >
                  <span className="mb-3 text-3xl sm:text-4xl">{emoji}</span>
                  <span className="mb-1 font-serif text-2xl font-black sm:text-3xl lg:text-4xl">
                    {value}
                  </span>
                  <span className="text-xxs font-semibold uppercase tracking-widest text-red-100 sm:text-xs">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/20 bg-white/10 px-6 py-8 text-center text-white">
              No impact statistics are available right now.
            </div>
          )}
        </MainContainer>
      </SectionContainer>
    </div>
  );
};

export default ImpactStats;
