import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";

const steps = [
  {
    number: "01",
    emoji: Icons.Search,
    title: "Search Donors",
    description:
      "Enter your blood group and location to instantly find verified donors near you.",
  },
  {
    number: "02",
    emoji: Icons.Phone,
    title: "Connect Directly",
    description:
      "Contact the donor directly via phone or message — no middleman, no delay.",
  },
  {
    number: "03",
    emoji: Icons.Blood,
    title: "Save a Life",
    description:
      "The donor arrives and donates. A precious life is saved within hours.",
  },
  {
    number: "04",
    emoji: Icons.HandShake,
    title: "Become a Donor",
    description:
      "Register yourself as a donor to be there for others in their time of need.",
  },
];

const HowItWorks = () => {
  return (
    <SectionContainer>
      <MainContainer>
        {/* Heading */}
        <SectionHeading
          title="How It Works"
          description="Find a blood donor in just a few simple steps. Fast, free, and fully verified."
          align="left"
          className="mb-10 sm:mb-14"
        />

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Connector line — desktop only */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(50%+52px)] w-[calc(100%-104px)] h-px bg-red-100 z-0" />
              )}

              {/* Icon circle */}
              <div
                className="relative z-10 w-15 h-15 sm:w-17 sm:h-17 md:w-20 md:h-20 rounded-full bg-red-50 border-2 border-red-100
    group-hover:bg-primary group-hover:border-primary transition-all duration-300
    center-flex mb-4 shadow-sm"
              >
                <span className="text-primary group-hover:text-white group-hover:scale-110 transition-all duration-300">
                  <step.emoji/>
                </span>
              </div>

              {/* Step label */}
              <span className="text-xxs font-black tracking-widest text-accent uppercase mb-1">
                Step {step.number}
              </span>

              <h3 className="font-serif text-base font-bold text-dark mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </MainContainer>
    </SectionContainer>
  );
};

export default HowItWorks;
