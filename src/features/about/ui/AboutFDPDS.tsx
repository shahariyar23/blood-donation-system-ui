import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";

const AboutFDPDS = () => (
  <div className="bg-secondary relative overflow-hidden">
    <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-white/5 pointer-events-none" />
    <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full border border-white/5 pointer-events-none" />

    <SectionContainer>
      <MainContainer>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — checks list */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-10 bg-primary" />
              <span className="text-primary text-xxs font-bold tracking-[0.25em] uppercase">
                Our Technology
              </span>
            </div>
            <SectionHeading
              title="Fraud Detection & Verification System"
              align="left"
              className="text-white mb-5"
            />
            <p className="text-white/60 text-sm leading-relaxed mb-7">
              Before any donor appears in search results, they pass through our
              automated 5-layer FDPDS verification matrix — ensuring only genuine,
              trustworthy donors reach patients.
            </p>

            <div className="space-y-3">
              {[
                { label: "Email Verification",         desc: "Confirmed and validated email address"              },
                { label: "Account Longevity",          desc: "Account age and platform activity history"          },
                { label: "Donation Track Record",      desc: "History of completed donations via BloodConnect"    },
                { label: "Community Trust Score",      desc: "Number of reports or flags from other users"        },
                { label: "Location Consistency",       desc: "Active location matches established behavior patterns" },
              ].map(({ label, desc }) => (
                <div key={label}
                  className="flex items-start gap-3 rounded-xs px-4 py-3
                    hover:bg-white/10 transition-colors duration-200">
                  <div className="w-7 h-7 rounded-xs center-flex shrink-0 mt-0.5">
                    <Icons.Check className="text-primary" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold leading-tight">{label}</p>
                    <p className="text-white/50 text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — verified badge visual */}
          <div className="center-flex">
            <div className="bg-white/5 rounded-xs p-8 sm:p-10 text-center border border-white/10 w-full max-w-xs">
              <div className="w-20 h-20 rounded-full bg-primary center-flex mx-auto mb-5 shadow-xl">
                <Icons.Shield className="text-white" />
              </div>
              <p className="font-serif text-white text-xl font-bold mb-1">FDPDS Verified</p>
              <p className="text-white/50 text-xs mb-6">5-layer automated screening</p>
              <div className="space-y-2">
                {["Email ✓", "Account Age ✓", "Donations ✓", "Reports ✓", "Location ✓"].map(item => (
                  <div key={item}
                    className="bg-white/10 rounded-xs py-2 px-4 text-white text-xs font-semibold
                      flex items-center justify-between">
                    <span>{item.replace(" ✓", "")}</span>
                    <Icons.Check className=" text-green-400" />
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-white/10">
                <span className="blood-badge text-xs">Trusted Donor</span>
              </div>
            </div>
          </div>
        </div>
      </MainContainer>
    </SectionContainer>
  </div>
);


export default AboutFDPDS;