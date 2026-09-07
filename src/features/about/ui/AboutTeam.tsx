// Updated: September 2026 - Team member profiles and showcase
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import { team } from "../service/aboutData";

/* ── colour for each card index ─────────────────────────────── */
const accents = [
  { ring: "#fca5a5", bg: "#fff1f2", text: "#e11d48" }, // rose
  { ring: "#fcd34d", bg: "#fffbeb", text: "#d97706" }, // amber
  { ring: "#6ee7b7", bg: "#ecfdf5", text: "#059669" }, // emerald
  { ring: "#93c5fd", bg: "#eff6ff", text: "#2563eb" }, // blue
];

const AboutTeam = () => (
  <div className="relative overflow-hidden bg-[#faf9f7] py-20 sm:py-28">

    {/* ── decorative background blobs ── */}
    <div
      aria-hidden
      className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full
        bg-primary/5 blur-3xl"
    />
    <div
      aria-hidden
      className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full
        bg-rose-200/30 blur-3xl"
    />

    <SectionContainer>
      <MainContainer>

        {/* ── section label ── */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="h-px w-12 bg-primary/40" />
          <span className="text-primary text-[10px] font-extrabold tracking-[0.3em] uppercase">
            The People
          </span>
          <span className="h-px w-12 bg-primary/40" />
        </div>

        {/* ── heading ── */}
        <div className="text-center mb-4">
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-gray-900 leading-tight">
            Meet the Builder
          </h2>
        </div>

        {/* ── sub-description ── */}
        <p className="text-center text-gray-500 text-sm sm:text-base max-w-xl mx-auto mb-14 leading-relaxed">
          One developer wearing every hat — designed, engineered, and shipped
          with patients at heart.
        </p>

        {/* ── cards grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {team.map((member, i) => {
            const accent = accents[i % accents.length];
            return (
              <div
                key={member.name}
                className="group relative bg-white rounded-2xl shadow-sm border border-gray-100
                  p-6 sm:p-7 text-center overflow-hidden
                  hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* coloured top stripe */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl transition-all
                    duration-300 group-hover:h-1.5"
                  style={{ backgroundColor: accent.text }}
                />

                {/* soft bg wash on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100
                    transition-opacity duration-300 rounded-2xl pointer-events-none"
                  style={{ backgroundColor: accent.bg }}
                />

                {/* avatar */}
                <div
                  className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full mx-auto mb-5
                    flex items-center justify-center font-black text-2xl
                    border-2 transition-all duration-300"
                  style={{
                    backgroundColor: accent.bg,
                    borderColor: accent.ring,
                    color: accent.text,
                  }}
                >
                  {member.avatar}

                  {/* subtle pulse ring on hover */}
                  <span
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
                      group-hover:scale-125 transition-all duration-500"
                    style={{ boxShadow: `0 0 0 6px ${accent.ring}55` }}
                  />
                </div>

                {/* name */}
                <h3 className="relative font-serif font-semibold text-gray-900
                  text-sm sm:text-[15px] leading-snug mb-1">
                  {member.name}
                </h3>

                {/* role badge */}
                <span
                  className="relative inline-block px-2.5 py-0.5 rounded-full text-[10px]
                    font-bold tracking-widest uppercase mb-4"
                  style={{ backgroundColor: accent.bg, color: accent.text }}
                >
                  {member.role}
                </span>

                {/* divider */}
                <div
                  className="relative w-8 h-px mx-auto mb-4 transition-all duration-300
                    group-hover:w-16"
                  style={{ backgroundColor: accent.ring }}
                />

                {/* quote */}
                <p className="relative text-gray-400 text-xs italic leading-relaxed">
                  &ldquo;{member.quote}&rdquo;
                </p>
              </div>
            );
          })}
        </div>

      </MainContainer>
    </SectionContainer>
  </div>
);

export default AboutTeam;