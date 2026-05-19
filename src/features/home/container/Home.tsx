import { useEffect, useState } from "react";
import HeroSection from "./HeroSection";
import EmergencyBanner from "../ui/EmergencyBanner";
import HowItWorks from "../ui/HowItWorks";
import LatestBloodRequests from "../ui/Latestbloodrequests";
import FAQ from "../ui/Faq";
import {
  fetchImpactStats,
  fetchLatestBloodRequests,
  type BloodRequest,
  type ImpactStatsResponse,
} from "../service/homeApi";
import ImpactStats from "../ui/Impactstats";
import NearbyDonors from "../ui/Nearbydonors";
import BloodGroupAvailability from "../ui/Bloodgroupavailability";

const Home = () => {
  // State for all data
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [urgentRequest, setUrgentRequest] = useState<BloodRequest | null>(null);
  const [impactStats, setImpactStats] = useState<ImpactStatsResponse | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [impactStatsLoading, setImpactStatsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch all home page data
  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      setImpactStatsLoading(true);
      const newErrors: Record<string, string> = {};

      try {
        // Fetch latest blood requests
        try {
          const requestsResult = await fetchLatestBloodRequests(6);
          setBloodRequests(requestsResult);
          setUrgentRequest(requestsResult[0] || null);
        } catch (err: any) {
          newErrors.requests = err?.message || "Failed to load blood requests";
          console.error("Requests error:", err);
        }

        try {
          const statsResult = await fetchImpactStats();
          setImpactStats(statsResult);
        } catch (err: any) {
          newErrors.stats = err?.message || "Failed to load impact stats";
          console.error("Impact stats error:", err);
        }

        setErrors(newErrors);
      } finally {
        setLoading(false);
        setImpactStatsLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <main>
      {/* Hero Section with Slider & blood search */}
      <HeroSection />

      {/* Emergency Blood Request Banner */}
      <EmergencyBanner urgentRequest={urgentRequest || undefined} />

      <NearbyDonors/>
      {/* How It Works - Static content */}
      <HowItWorks />
      <BloodGroupAvailability/>

      <ImpactStats
        stats={impactStats ? [
          { value: String(impactStats.activeUsers), label: "Active Users", emoji: "👥" },
          { value: String(impactStats.activeDonors), label: "Active Donors", emoji: "🙋" },
          { value: String(impactStats.successfulDonations), label: "Successful Donations", emoji: "❤️" },
          { value: String(impactStats.collectedBloodRequests), label: "Collected Requests", emoji: "🩸" },
        ] : []}
        loading={impactStatsLoading}
        error={errors.stats}
      />

      {/* Latest Blood Requests - Dynamic */}
      <LatestBloodRequests requests={bloodRequests} loading={loading} error={errors.requests} />

      {/* FAQ - Static content */}
      <FAQ />
    </main>
  );
};

export default Home;
