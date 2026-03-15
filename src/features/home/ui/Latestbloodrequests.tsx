import { useNavigate } from "react-router-dom";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";

const requests = [
  {
    bloodGroup: "B−",
    patientName: "Md. Salim",
    hospital: "Dhaka Medical College",
    location: "Dhaka",
    units: 2,
    postedAt: "10 min ago",
    urgent: true,
  },
  {
    bloodGroup: "O+",
    patientName: "Fatema Khanam",
    hospital: "Square Hospital",
    location: "Dhaka",
    units: 1,
    postedAt: "35 min ago",
    urgent: false,
  },
  {
    bloodGroup: "A−",
    patientName: "Rakibul Islam",
    hospital: "BIRDEM Hospital",
    location: "Dhaka",
    units: 3,
    postedAt: "1 hr ago",
    urgent: true,
  },
  {
    bloodGroup: "AB+",
    patientName: "Nazia Sultana",
    hospital: "Apollo Hospital",
    location: "Dhaka",
    units: 1,
    postedAt: "2 hrs ago",
    urgent: false,
  },
  {
    bloodGroup: "O−",
    patientName: "Kamal Hossain",
    hospital: "Enam Medical College",
    location: "Savar",
    units: 2,
    postedAt: "3 hrs ago",
    urgent: true,
  },
  {
    bloodGroup: "B+",
    patientName: "Sufia Begum",
    hospital: "National Heart Foundation",
    location: "Dhaka",
    units: 2,
    postedAt: "4 hrs ago",
    urgent: false,
  },
];

const LatestBloodRequests = () => {
  const nevigate = useNavigate()
  return (
    <SectionContainer>
      <MainContainer>
        {/* Heading row */}
        <div
          id="requests"
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-10 sm:mb-12"
        >
          <SectionHeading
            title="Latest Blood Requests"
            description="Active requests from hospitals and families across Bangladesh."
            align="left"
          />
          <a
            href="/requests"
            className="shrink-0 text-sm font-semibold text-primary border border-red-200 hover:border-primary hover:bg-red-50 px-4 py-2 rounded-lg transition-all duration-300"
          >
            View All →
          </a>
        </div>

        {/* Request cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {requests.map((req) => (
            <div
              key={req.patientName}
              className={`donor-card border-2 transition-all duration-300
                ${req.urgent ? "border-red-200" : "border-gray-100"}`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Blood group box */}
                  <div className="w-12 h-12 rounded-xl bg-primary center-flex text-white font-black text-sm shrink-0">
                    {req.bloodGroup}
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark text-sm leading-tight">
                      {req.patientName}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {req.hospital}
                    </p>
                  </div>
                </div>

                {/* Urgent badge */}
                {req.urgent && (
                  <span className="shrink-0 flex items-center gap-1 bg-red-100 text-primary text-xxs font-black uppercase tracking-wide px-2 py-1 rounded-full">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                    </span>
                    Urgent
                  </span>
                )}
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <Icons.LocationPin className="w-3 h-3 text-primary" />
                  {req.location}
                </span>
                <span className="flex items-center gap-1">
                  <Icons.Blood className="w-3 h-3 text-primary" />
                  {req.units} unit{req.units > 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Icons.Clock className="w-3 h-3" />
                  {req.postedAt}
                </span>
              </div>

              {/* CTA */}
              <CustomButton variant="primary" size="sm" radius="lg" fullWidth>
                I Can Donate
              </CustomButton>
            </div>
          ))}
        </div>

        {/* Post Request banner */}
        <div className="mt-10 p-6 sm:p-8 rounded-xl border-2 border-dashed border-red-200 bg-red-50 text-center">
          <h3 className="font-serif text-lg font-bold text-dark mb-1">
            Need Blood Urgently?
          </h3>
          <p className="text-gray-500 text-sm mb-5">
            Post a request and reach hundreds of nearby donors instantly.
          </p>
          <CustomButton onClick={ () => nevigate('/request')} variant="primary" size="md" radius="full">
            Post a Blood Request
          </CustomButton>
        </div>
      </MainContainer>
    </SectionContainer>
  );
};

export default LatestBloodRequests;
