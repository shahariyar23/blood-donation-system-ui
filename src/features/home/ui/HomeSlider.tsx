import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { useState } from "react";
import { slides } from "../service/homeData";
import { Link } from "react-router-dom";
import Button from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";

const BloodHeroSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative w-full h-[60vh] sm:h-[65vh] md:h-[80vh] lg:h-[85vh] overflow-hidden">
      <style>
        {`
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0 }
  to { opacity: 1 }
}

@keyframes zoomImage {
  from { transform: scale(1) }
  to { transform: scale(1.05) }
}

.slide-category {
  animation: fadeUp 0.6s ease 0.2s both;
}

.slide-title {
  animation: fadeUp 0.7s ease 0.35s both;
}

.slide-subtitle {
  animation: fadeUp 0.7s ease 0.5s both;
}

.slide-buttons {
  animation: fadeUp 0.7s ease 0.65s both;
}

.overlay-fade {
  animation: fadeIn 1s ease both;
}
`}
      </style>
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        speed={700}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            {({ isActive }) => (
              <div className="relative w-full h-full">
                {/* Background image */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    transform: isActive ? "scale(1.05)" : "scale(1)",
                    transition: "transform 6s ease",
                  }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 overlay-fade bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-2xl px-4 sm:px-6 md:px-12 lg:px-20">
                    {/* Category */}
                    <div className="slide-category flex items-center gap-3 mb-5">
                      <div className="h-px w-12 bg-primary" />
                      <span className="text-primary text-xs font-bold tracking-[0.3em] uppercase">
                        {slide.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="slide-title font-serif text-white font-bold leading-tight mb-6 text-xl sm:text-3xl md:text-5xl lg:text-6xl">
                      {slide.title}
                    </h2>

                    {/* Subtitle */}
                    <p className="slide-subtitle text-white/70 text-xs sm:text-sm md:text-base leading-relaxed mb-8 max-w-md">
                      {slide.subtitle}
                    </p>

                    {/* CTA buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                      <Link to="/find-donor" className="w-full sm:w-auto">
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            leftIcon={<Icons.Search />}
                          >
                            Find Donor
                          </Button>
                        </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Slide counter */}
      <div className="absolute top-6 right-6 text-white flex items-center gap-1 text-sm">
        <span className="font-bold">
          {String(activeIndex + 1).padStart(2, "0")}
        </span>
        <span className="text-white/40">/</span>
        <span className="text-white/60">
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
};

export default BloodHeroSlider;
