import AboutBanner from "./AboutBanner";
import AboutStats from "./AboutStats";
import AboutMission from "./AboutMission";
import AboutValues from "./AboutValues";
import AboutFDPDS from "./AboutFDPDS";
import AboutTimeline from "./AboutTimeline";
import AboutTeam from "./AboutTeam";
import AboutFAQ from "./AboutFAQ";
import AboutCTA from "./AboutCTA";



// ── Main Page ──────────────────────────────────────────
const AboutPage = () => {
  return (
    <div className="min-h-screen bg-light">
      <AboutBanner />
      <AboutStats />
      <AboutMission />
      <AboutValues />
      <AboutFDPDS />
      <AboutTimeline />
      <AboutTeam />
      <AboutFAQ />
      <AboutCTA />
    </div>
  );
};

export default AboutPage;