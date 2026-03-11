import HeroSection from "./HeroSection";
import EmergencyBanner from "../ui/EmergencyBanner";
import { rooms } from "../service/homeData";
import HowItWorks from "../ui/HowItWorks";
import BloodGroupAvailability from "../ui/Bloodgroupavailability";
import NearbyDonors from "../ui/Nearbydonors";
import ImpactStats from "../ui/Impactstats";
import LatestBloodRequests from "../ui/Latestbloodrequests";
import FAQ from "../ui/Faq";

const Home = () => {
  console.log(rooms  )
  return (
    <main>
      {/* Hero Section with Slider & blood search */}
      <HeroSection />
      {/* Emergency Blood */}
      <EmergencyBanner/>
      {/* how it works */}
      <HowItWorks />
      {/* Bloodgroupavailability  */}
      <BloodGroupAvailability />
      {/* Nearbydonors  */}
      <NearbyDonors />
      {/* Impactstats  */}
      <ImpactStats />
      {/* Latestbloodrequests  */}
      <LatestBloodRequests />
      {/* Faq  */}
      <FAQ/>
    </main>
  );
};

export default Home;
