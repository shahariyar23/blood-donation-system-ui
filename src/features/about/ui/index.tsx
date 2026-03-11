import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";

const stats = [
  { value: "1987", label: "Est. Year", icon: <Icons.Star size={18} /> },
  { value: "38+", label: "Years of Excellence", icon: <Icons.Clock size={18} /> },
  { value: "9.4", label: "Guest Rating", icon: <Icons.Star size={18} /> },
  { value: "50K+", label: "Happy Guests", icon: <Icons.User size={18} /> },
];

const values = [
  {
    icon: <Icons.Star size={24} />,
    title: "Luxury Redefined",
    desc: "Every detail is curated to deliver an experience that transcends the ordinary — from hand-picked linens to bespoke butler service.",
  },
  {
    icon: <Icons.Shield size={24} />,
    title: "Trust & Integrity",
    desc: "Transparency and honesty are the foundation of every guest relationship. We honour every promise, every time.",
  },
  {
    icon: <Icons.Global size={24} />,
    title: "Cultural Warmth",
    desc: "Born from a spirit of travel and hospitality, we celebrate diversity and make every guest feel deeply at home.",
  },
  {
    icon: <Icons.Meal size={24} />,
    title: "Culinary Excellence",
    desc: "Our kitchens serve as a stage for world-class chefs who craft menus inspired by global destinations and local heritage.",
  },
];

const team = [
  {
    name: "Isabella Romano",
    role: "General Manager",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
    quote: "Excellence is not an act — it is a habit.",
  },
  {
    name: "Hassan Al-Farsi",
    role: "Head Concierge",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    quote: "Every guest has a story. We help write the best chapter.",
  },
  {
    name: "Priya Sharma",
    role: "Executive Chef",
    image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400",
    quote: "Food is the language of love — I speak it fluently.",
  },
  {
    name: "Michael Chen",
    role: "Spa Director",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    quote: "Wellness is a journey, not a destination.",
  },
];

const milestones = [
  { year: "1987", event: "Hotel Musafir founded in Dubai Marina" },
  { year: "1995", event: "Expanded to 6 floors, added the Rooftop Penthouse" },
  { year: "2003", event: "Awarded 5-Star rating by UAE Tourism Board" },
  { year: "2010", event: "Launched the Musafir Spa & Wellness Centre" },
  { year: "2018", event: "Recognised as Middle East's Best Boutique Hotel" },
  { year: "2024", event: "Completed full luxury renovation across all suites" },
];

const About = () => {
  return (
    <div className="bg-light">
      {/*BANNER*/}
      <div
        className="relative h-[420px] bg-cover bg-center"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600)" }}
      >
        <div className="absolute inset-0 bg-secondary/65" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/50 text-xs tracking-widest uppercase mb-5 anim-up d1">
            <a href="/" className="hover:text-primary transition-colors">Home</a>
            <Icons.ArrowForward size={10} className="text-white/30" />
            <span className="text-primary font-semibold">About Us</span>
          </nav>

          <div className="flex items-center gap-4 mb-4 anim-up d2">
            <div className="h-px w-12 bg-primary/60" />
            <Icons.Star size={14} className="text-primary" />
            <div className="h-px w-12 bg-primary/60" />
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 leading-none anim-up d3">
            Our Story
          </h1>
          <p className="text-white/65 text-sm md:text-base max-w-xl leading-relaxed anim-up d4">
            Since 1987, Hotel Musafir has been a sanctuary of luxury, culture,
            and warmth — a place where every journey finds its perfect rest.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 block">
            <path d="M0,0 C360,80 1080,80 1440,0 L1440,80 L0,80 Z" fill="#f5f0eb" />
          </svg>
        </div>
      </div>

      {/*STATS ROW*/}
      <div className="max-w-5xl mx-auto px-4 mt-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`bg-white rounded-2xl p-6 shadow-lg text-center hover:-translate-y-1
                hover:shadow-xl transition-all duration-300 anim-up d${i + 1}`}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
                {stat.icon}
              </div>
              <p className="text-3xl font-extrabold font-serif text-secondary">{stat.value}</p>
              <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* WHO WE ARE — Split layout*/}
      <section className="px-4 py-20">
        <MainContainer>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Image collage */}
          <div className="relative h-[480px] anim-right d2">
            <img
              src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=700"
              alt="Hotel lobby"
              className="absolute top-0 left-0 w-3/4 h-72 object-cover rounded-2xl shadow-xl"
            />
            <img
              src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=700"
              alt="Hotel pool"
              className="absolute bottom-0 right-0 w-3/4 h-64 object-cover rounded-2xl shadow-xl border-4 border-light"
            />
            {/* Gold badge */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-2 bg-primary rounded-2xl p-5 shadow-2xl text-center z-10">
              <p className="text-secondary text-3xl font-extrabold font-serif leading-none">38</p>
              <p className="text-secondary text-[10px] font-bold tracking-widest uppercase mt-1">Years of<br/>Excellence</p>
            </div>
          </div>

          {/* Text */}
          <div className="anim-left d2">
            <span className="text-primary text-xs font-bold tracking-widest uppercase">Who We Are</span>
            <h2 className="text-3xl md:text-4xl font-serif text-secondary mt-2 mb-6 leading-tight">
              More Than a Hotel —<br />
              <em>A Home Away From Home</em>
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Hotel Musafir — "the traveller" in Arabic — was founded in 1987
              with a single vision: to create a sanctuary where every guest,
              regardless of origin, feels genuinely welcomed and deeply cared for.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Nestled in Dubai's Marina District, our property blends
              contemporary luxury with the warmth of traditional Arabian
              hospitality. Every corridor, suite, and garden has been designed
              to tell a story — your story.
            </p>

            <div className="flex flex-col gap-3">
              {["Award-winning concierge team", "Locally inspired cuisine", "Sustainable luxury practices"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <Icons.Check size={11} className="text-primary" />
                  </div>
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        </MainContainer>
      </section>

      {/*OUR VALUES*/}
      <section className="bg-secondary py-20 px-4 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full border border-primary/10" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full border border-primary/10" />

        <div className="relative z-10">
            <MainContainer>
          <div className="text-center mb-12">
            <span className="text-primary text-xs font-bold tracking-widest uppercase">What Drives Us</span>
            <h2 className="text-3xl md:text-4xl font-serif text-white mt-2">Our Core Values</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div
                key={v.title}
                className={`bg-white/5 border border-white/10 rounded-2xl p-6
                  hover:bg-white/10 hover:border-primary/30 hover:-translate-y-1
                  transition-all duration-300 group anim-up d${i + 1}`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-4
                  group-hover:bg-primary group-hover:text-secondary transition-all duration-300">
                  {v.icon}
                </div>
                <h3 className="text-white font-semibold font-serif text-base mb-2">{v.title}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
          </MainContainer>
        </div>
      </section>

      {/* TIMELINE*/}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <span className="text-primary text-xs font-bold tracking-widest uppercase">Our Journey</span>
          <h2 className="text-3xl md:text-4xl font-serif text-secondary mt-2">Milestones</h2>
        </div>

        <div className="relative pl-8 border-l-2 border-primary/20">
          {milestones.map((m, i) => (
            <div
              key={m.year}
              className={`relative mb-8 last:mb-0 timeline-dot anim-right d${Math.min(i + 1, 5)}`}
            >
              <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                <span className="text-primary font-extrabold text-sm tracking-widest">{m.year}</span>
                <p className="text-secondary text-sm font-medium mt-1">{m.event}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/*MEET THE TEAM*/}
      <section className="bg-white py-20 px-4">
        <MainContainer>
          <div className="text-center mb-12">
            <span className="text-primary text-xs font-bold tracking-widest uppercase">The Faces Behind</span>
            <h2 className="text-3xl md:text-4xl font-serif text-secondary mt-2">Meet Our Team</h2>
            <p className="text-gray-400 text-sm mt-3 max-w-xl mx-auto">
              Passionate professionals dedicated to crafting unforgettable moments for every guest.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <div
                key={member.name}
                className={`group text-center anim-up d${i + 1}`}
              >
                {/* Photo */}
                <div className="relative w-36 h-36 mx-auto mb-4">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-light shadow-lg
                    group-hover:border-primary transition-all duration-300">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {/* Gold ring on hover */}
                  <div className="absolute inset-0 rounded-full border-2 border-primary/0 group-hover:border-primary/40
                    scale-110 transition-all duration-300" />
                </div>

                <h3 className="font-serif font-semibold text-secondary text-base">{member.name}</h3>
                <p className="text-primary text-xs font-bold tracking-widest uppercase mt-0.5 mb-3">{member.role}</p>
                <p className="text-gray-400 text-xs italic leading-relaxed px-2">"{member.quote}"</p>
              </div>
            ))}
          </div>
        </MainContainer>
      </section>

      {/*CTA BANNER*/}
      <section
        className="relative py-24 px-4 bg-cover bg-center"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?w=1600)" }}
      >
        <div className="absolute inset-0 bg-secondary/75" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-12 bg-primary/60" />
            <Icons.Star size={16} className="text-primary" />
            <div className="h-px w-12 bg-primary/60" />
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
            Ready to Experience Musafir?
          </h2>
          <p className="text-white/65 text-sm mb-8">
            Book your stay today and let us craft an experience you'll carry with you forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/rooms"
              className="bg-primary text-secondary font-bold text-sm tracking-widest uppercase
                px-8 py-4 rounded-xl hover:bg-yellow-400 hover:shadow-xl
                active:scale-95 transition-all duration-300"
            >
              Explore Rooms
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white font-bold text-sm tracking-widest uppercase
                px-8 py-4 rounded-xl hover:bg-white hover:text-secondary
                active:scale-95 transition-all duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;