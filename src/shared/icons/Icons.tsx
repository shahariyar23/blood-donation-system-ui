import {
  FaHome,
  FaUser,
  FaUsers,
  FaSearch,
  FaPhoneAlt,
  FaHospital,
  FaHeartbeat,
  FaTint,
  FaAmbulance,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaFacebook
} from "react-icons/fa";

import { MdDashboard, MdEmail, MdBloodtype } from "react-icons/md";
import { GrLocationPin } from "react-icons/gr";


import { AiOutlineMenu, AiOutlineSetting } from "react-icons/ai";

import { BsCheckCircleFill, BsClockHistory, BsInstagram, BsMailbox, BsTrash } from "react-icons/bs";
import { CiTwitter } from "react-icons/ci";


import { CgClose, CgCopyright } from "react-icons/cg";

import { IoIosArrowForward, IoMdArrowForward } from "react-icons/io";
import { LuHandshake } from "react-icons/lu";
import { CiClock2 } from "react-icons/ci";
import { FiPlus } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";




const responsiveIcon ="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7";

const createIcon = (IconComponent: any) => {
  return ({ className = "", ...props }: any) => (
    <IconComponent className={`${responsiveIcon} ${className}`} {...props} />
  );
};

export const Icons = {
  Home: createIcon(FaHome),
  Dashboard: createIcon(MdDashboard),
  Menu: createIcon(AiOutlineMenu),
  Close: createIcon(CgClose),
  ArrowForward: createIcon(IoMdArrowForward),

  User: createIcon(FaUser),
  Users: createIcon(FaUsers),

  Search: createIcon(FaSearch),
  Phone: createIcon(FaPhoneAlt),
  Email: createIcon(MdEmail),

  Blood: createIcon(FaTint),
  BloodType: createIcon(MdBloodtype),
  Heartbeat: createIcon(FaHeartbeat),

  Emergency: createIcon(FaAmbulance),

  Hospital: createIcon(FaHospital),

  Location: createIcon(FaMapMarkerAlt),
  LocationPin: createIcon(GrLocationPin),

  Check: createIcon(BsCheckCircleFill),
  Clock: createIcon(BsClockHistory),
  Trash: createIcon(BsTrash),

  Setting: createIcon(AiOutlineSetting),
  Logout: createIcon(FaSignOutAlt),

  Facebook: createIcon(FaFacebook),
  Twitter: createIcon(CiTwitter),
  Instagram: createIcon(BsInstagram),
  Mail: createIcon(BsMailbox),
  Copy: createIcon(CgCopyright),
  HandShake: createIcon(LuHandshake),
  Time: createIcon(CiClock2),
  Plus: createIcon(FiPlus),
  Cross: createIcon(RxCross2),
  Arrow: createIcon(IoIosArrowForward)
};