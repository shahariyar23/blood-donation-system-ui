import { useState } from "react";
import { Icons } from "../../../shared/icons/Icons";

const contactInfo = [
  {
    icon: <Icons.Phone size={22} />,
    label: "Reservations",
    value: "1 888 HOLIDAY",
    sub: "+1 888 465 4329",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: <Icons.Mail size={22} />,
    label: "Email Us",
    value: "hello@hotelmusafir.com",
    sub: "We reply within 2 hours",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: <Icons.Location size={22} />,
    label: "Our Address",
    value: "12 Golden Crescent, Dubai",
    sub: "UAE — Marina District",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: <Icons.Clock size={22} />,
    label: "Front Desk",
    value: "Open 24 / 7",
    sub: "Always here for you",
    color: "bg-secondary/10 text-secondary",
  },
];

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputClass = (field: string) =>
    `w-full bg-white/60 border-b-2 px-0 py-3 text-sm text-secondary placeholder-gray-400
     outline-none transition-all duration-300 bg-transparent
     ${
       focused === field
         ? "border-primary"
         : "border-gray-200 hover:border-gray-400"
     }`;

  return (
    <div className="min-h-screen bg-light">
      {/* <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.4; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .anim-fade-up   { animation: fadeUp    0.6s ease forwards; }
        .anim-slide-r   { animation: slideRight 0.6s ease forwards; }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.2s; opacity: 0; }
        .delay-3 { animation-delay: 0.3s; opacity: 0; }
        .delay-4 { animation-delay: 0.4s; opacity: 0; }
        .delay-5 { animation-delay: 0.5s; opacity: 0; }
        .pulse-ring::before {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid var(--color-primary, #f5c518);
          animation: pulse-ring 1.8s ease-out infinite;
        }
      `}</style> */}

      {/*BANNER*/}
      <div
        className="relative h-[380px] bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600)",
        }}
      >
        <div className="absolute inset-0 bg-secondary/70" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/50 text-xs tracking-widest uppercase mb-5 anim-fade-up delay-1">
            <a
              href="/"
              className="hover:text-primary transition-colors duration-200"
            >
              Home
            </a>
            <Icons.ArrowForward size={10} className="text-white/30" />
            <span className="text-primary font-semibold">Contact</span>
          </nav>

          <div className="flex items-center gap-3 mb-4 anim-fade-up delay-2">
            <div className="h-px w-10 bg-primary/70" />
            <span className="text-primary text-xs font-bold tracking-[0.3em] uppercase">
              Get In Touch
            </span>
            <div className="h-px w-10 bg-primary/70" />
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 leading-none anim-fade-up delay-3">
            Contact Us
          </h1>
          <p className="text-white/65 text-sm md:text-base max-w-lg anim-fade-up delay-4">
            We'd love to hear from you. Our concierge team is available around
            the clock to assist with any enquiry.
          </p>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            className="w-full h-16 block"
          >
            <path
              d="M0,0 C360,80 1080,80 1440,0 L1440,80 L0,80 Z"
              fill="#f5f0eb"
            />
          </svg>
        </div>
      </div>

      {/* CONTACT INFO CARDS*/}
      <div className="max-w-6xl mx-auto px-4 -mt-2 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {contactInfo.map((item, i) => (
            <div
              key={item.label}
              className={`bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl
                transition-all duration-300 hover:-translate-y-1 group
                anim-fade-up delay-${i + 1}`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${item.color}`}
              >
                {item.icon}
              </div>
              <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-1">
                {item.label}
              </p>
              <p className="text-sm font-semibold text-secondary leading-tight break-all">
                {item.value}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT — Form + Map*/}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* ── Left: Form (3 cols) ── */}
          <div className="lg:col-span-3 anim-slide-r delay-2">
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 relative overflow-hidden">
              {/* Gold decorative corner */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px]" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/30" />

              <div className="mb-8">
                <span className="text-primary text-xs font-bold tracking-widest uppercase">
                  Send A Message
                </span>
                <h2 className="text-2xl md:text-3xl font-serif text-secondary mt-1">
                  How Can We Help?
                </h2>
              </div>

              {submitted ? (
                /* ── Success state ── */
                <div className="flex flex-col items-center justify-center py-16 text-center anim-fade-up delay-1">
                  <div className="relative w-16 h-16 mb-6 pulse-ring">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icons.Check size={28} className="text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-secondary mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-gray-500 text-sm max-w-xs">
                    Thank you, <strong>{form.name}</strong>. Our concierge will
                    reach out within 2 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        name: "",
                        email: "",
                        phone: "",
                        subject: "General Inquiry",
                        message: "",
                      });
                    }}
                    className="mt-6 text-sm text-primary font-semibold hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                /* ── Form ── */
                <form onSubmit={handleSubmit} className="space-y-7">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                    {/* Name */}
                    <div className="relative">
                      <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase block mb-1">
                        Full Name *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        onFocus={() => setFocused("name")}
                        onBlur={() => setFocused(null)}
                        className={inputClass("name")}
                      />
                    </div>

                    {/* Email */}
                    <div className="relative">
                      <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase block mb-1">
                        Email Address *
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="john@email.com"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        onFocus={() => setFocused("email")}
                        onBlur={() => setFocused(null)}
                        className={inputClass("email")}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                    {/* Phone */}
                    <div>
                      <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase block mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        onFocus={() => setFocused("phone")}
                        onBlur={() => setFocused(null)}
                        className={inputClass("phone")}
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase block mb-1">
                        Subject
                      </label>
                      <select
                        value={form.subject}
                        onChange={(e) =>
                          setForm({ ...form, subject: e.target.value })
                        }
                        onFocus={() => setFocused("subject")}
                        onBlur={() => setFocused(null)}
                        className={inputClass("subject") + " cursor-pointer"}
                      >
                        {[
                          "General Inquiry",
                          "Room Reservation",
                          "Special Occasion",
                          "Complaint",
                          "Feedback",
                          "Partnership",
                        ].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase block mb-1">
                      Your Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Tell us how we can assist you..."
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      onFocus={() => setFocused("message")}
                      onBlur={() => setFocused(null)}
                      className={inputClass("message") + " resize-none"}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full bg-secondary text-white font-bold text-sm tracking-widest uppercase
                      py-4 rounded-xl hover:bg-secondary/90 hover:shadow-xl
                      active:scale-[0.98] transition-all duration-300
                      flex items-center justify-center gap-2 group"
                  >
                    Send Message
                    <Icons.ArrowForward
                      size={16}
                      className="group-hover:translate-x-1 transition-transform duration-300"
                    />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* ── Right: Map + Social (2 cols) ── */}
          <div className="lg:col-span-2 flex flex-col gap-6 anim-fade-up delay-3">
            {/* Map */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex-1 min-h-[280px] relative">
              <iframe
                title="Hotel Musafir Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3648.0380363972536!2d90.38808457519184!3d23.88826987857671!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c469610d01b9%3A0xaa41c726134f443b!2sIUBAT%20-%20International%20University%20of%20Business%20Agriculture%20and%20Technology!5e0!3m2!1sen!2sbd!4v1772650085243!5m2!1sen!2sbd"
                className="w-full h-full min-h-[280px] border-0 grayscale hover:grayscale-0 transition-all duration-500"
                loading="lazy"
              />
              {/* Map pin overlay */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow">
                <p className="text-[10px] font-bold text-secondary tracking-widest uppercase">
                  Hotel Musafir
                </p>
                <p className="text-xs text-gray-500">Marina District, Dubai</p>
              </div>
            </div>

            {/* Social + Hours card */}
            <div className="bg-secondary rounded-3xl p-6 shadow-xl text-white">
              <p className="text-[10px] text-primary font-bold tracking-widest uppercase mb-4">
                Follow Our Journey
              </p>
              <div className="flex gap-3 mb-6">
                {[
                  { icon: <Icons.Facebook size={18} />, label: "Facebook" },
                  { icon: <Icons.Instagram size={18} />, label: "Instagram" },
                  { icon: <Icons.Youtube size={18} />, label: "YouTube" },
                  { icon: <Icons.Twitter size={18} />, label: "Twitter" },
                ].map((s) => (
                  <button
                    key={s.label}
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center
                      hover:bg-primary hover:text-secondary hover:border-primary
                      transition-all duration-300"
                    title={s.label}
                  >
                    {s.icon}
                  </button>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-[10px] text-primary font-bold tracking-widest uppercase mb-3">
                  Working Hours
                </p>
                {[
                  { day: "Front Desk", hours: "24 / 7" },
                  { day: "Restaurant", hours: "07:00 – 23:00" },
                  { day: "Spa & Wellness", hours: "09:00 – 21:00" },
                  { day: "Concierge", hours: "24 / 7" },
                ].map((h) => (
                  <div
                    key={h.day}
                    className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0"
                  >
                    <span className="text-xs text-white/70">{h.day}</span>
                    <span className="text-xs font-semibold text-primary">
                      {h.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
