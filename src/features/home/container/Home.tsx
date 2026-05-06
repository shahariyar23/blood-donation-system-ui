import { useEffect, useState } from "react";
import HeroSection from "./HeroSection";
import EmergencyBanner from "../ui/EmergencyBanner";
import HowItWorks from "../ui/HowItWorks";
import LatestBloodRequests from "../ui/Latestbloodrequests";
import FAQ from "../ui/Faq";
import {
  fetchBloodRequest,
  type BloodRequest,
} from "../service/homeApi";

const Home = () => {
  // State for all data
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [urgentRequest, setUrgentRequest] = useState<BloodRequest | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch all home page data
  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      const newErrors: Record<string, string> = {};

      try {
        // Fetch latest blood requests
        try {
          const requestsResult = await fetchBloodRequest();
          setBloodRequests(requestsResult.requests || []);
          setUrgentRequest(requestsResult.requests?.[0] || null);
        } catch (err: any) {
          newErrors.requests = err?.message || "Failed to load blood requests";
          console.error("Requests error:", err);
        }

        setErrors(newErrors);
      } finally {
        setLoading(false);
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

      {/* How It Works - Static content */}
      <HowItWorks />

      {/* Latest Blood Requests - Dynamic */}
      <LatestBloodRequests requests={bloodRequests} loading={loading} error={errors.requests} />

      {/* FAQ - Static content */}
      <FAQ />
    </main>
  );
};

export default Home;
