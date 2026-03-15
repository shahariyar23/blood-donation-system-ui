import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";

const AboutCTA = () => (
  <div className="bg-primary relative overflow-hidden">
    <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
    <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

    <SectionContainer>
      <MainContainer>
        <div className="text-center max-w-xl mx-auto relative z-10">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-10 bg-white/40" />
            <Icons.Heartbeat className=" text-white" />
            <div className="h-px w-10 bg-white/40" />
          </div>
          <SectionHeading
            title="Ready to Save a Life?"
            description="Join thousands of donors making a difference every day. Register today — it only takes 2 minutes."
            align="center"
            className="text-white mb-8 [&_p]:text-red-100"
          />
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <CustomButton variant="secondary" size="md" radius="xs"
              leftIcon={<Icons.Check/>}>
              Register as Donor
            </CustomButton>
            <CustomButton variant="ghost" size="md" radius="xs"
              leftIcon={<Icons.Search/>}
              className="border border-white/30 text-white hover:bg-white/10">
              Find Donors
            </CustomButton>
          </div>
        </div>
      </MainContainer>
    </SectionContainer>
  </div>
);


export default AboutCTA;