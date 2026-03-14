import MainContainer from "../../../shared/main-container/MainContainer";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";

interface FindDonorHeroProps {
  donorCount: number;
}

const FindDonorHero = ({ donorCount }: FindDonorHeroProps) => {
  return (
    <div className="bg-primary pt-10 pb-20 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-16 -right-6  w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

      <MainContainer>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-red-200 text-xxs font-bold uppercase tracking-widest mb-1">
              BloodConnect
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white font-bold leading-snug">
              Find Blood Donors
            </h1>
            <p className="text-red-100 text-sm mt-2">
              {donorCount} verified donors found near you
            </p>
          </div>

          <CustomButton
            variant="secondary"
            size="sm"
            radius="full"
            leftIcon={<Icons.Emergency className="w-4 h-4" />}
          >
            Emergency Request
          </CustomButton>
        </div>
      </MainContainer>
    </div>
  );
};

export default FindDonorHero;