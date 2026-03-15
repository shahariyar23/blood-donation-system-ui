import { Icons } from "../../../shared/icons/Icons";

export const stats = [
  { value: "12,400+", label: "Lives Saved",       icon: Icons.Heartbeat  },
  { value: "8,900+",  label: "Active Donors",      icon: Icons.Users      },
  { value: "64",      label: "Districts Covered",  icon: Icons.Location   },
  { value: "98%",     label: "Requests Fulfilled", icon: Icons.Check      },
];

export const values = [
  {
    icon:  Icons.Heartbeat,
    title: "Save Lives First",
    desc:  "Every decision we make is guided by one goal — getting blood to patients as fast as possible.",
  },
  {
    icon:  Icons.Shield,
    title: "Trust & Verification",
    desc:  "All donors are verified through our FDPDS system to ensure every profile is genuine and reliable.",
  },
  {
    icon:  Icons.Users,
    title: "Community Driven",
    desc:  "BloodConnect is built on the generosity of thousands of volunteers who donate their time and blood.",
  },
  {
    icon:  Icons.LocationPin,
    title: "Location Precision",
    desc:  "Our proximity-based routing ensures patients always reach the nearest verified donor first.",
  },
];

export const milestones = [
  { year: "2020", event: "BloodConnect founded with a mission to digitize blood donation in Bangladesh" },
  { year: "2021", event: "Launched donor verification system (FDPDS) across 8 districts"              },
  { year: "2022", event: "Reached 1,000 active donors and 500 successful donations"                   },
  { year: "2023", event: "Expanded to all 64 districts with real-time blood bank integration"         },
  { year: "2024", event: "Crossed 10,000 lives saved — the biggest milestone in our journey"         },
  { year: "2025", event: "Launched mobile app and emergency alert system nationwide"                  },
];

export const team = [
  {
    name:   "Dr. Arif Rahman",
    role:   "Founder & CEO",
    avatar: "A",
    quote:  "One drop of blood can spark a lifetime of hope.",
  },
  {
    name:   "Sumaiya Akter",
    role:   "Head of Operations",
    avatar: "S",
    quote:  "Efficiency in crisis is what separates life from loss.",
  },
  {
    name:   "Imran Hossain",
    role:   "Lead Engineer",
    avatar: "I",
    quote:  "Technology should serve humanity — not the other way around.",
  },
  {
    name:   "Nusrat Jahan",
    role:   "Community Manager",
    avatar: "N",
    quote:  "Every donor is a hero who chose to show up.",
  },
];

export const faqs = [
  { q: "Is BloodConnect free to use?", a: "Yes, completely free for donors and recipients. We are a non-profit initiative." },
  { q: "How are donors verified?",     a: "Donors go through our FDPDS — checking email, donation history, location consistency, and community flags." },
  { q: "How fast can I find a donor?", a: "Most requests are matched within minutes. Our system shows the nearest available verified donor first." },
  { q: "Can blood banks join?",        a: "Yes. Registered blood banks can list their availability on our platform by contacting our team." },
];