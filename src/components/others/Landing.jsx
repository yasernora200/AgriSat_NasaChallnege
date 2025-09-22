import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Globe } from "lucide-react";
import HeroLogo from "./HeroLogo";


const Landing = () => {
  return (
    <main className="flex flex-col items-center justify-center text-center px-6 mt-10">
      {/* Logo Section */}
      <HeroLogo/>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight"
      >
        Sustainable Farming <br /> with{" "}
        <span className="text-green-400">NASA Earth Data</span>
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-3xl text-lg text-gray-300 mb-10 leading-relaxed"
      >
        منصة تفاعلية تساعد{" "}
        <span className="text-green-300 font-bold">المزارعين والباحثين</span>{" "}
        على اتخاذ قرارات أفضل باستخدام بيانات{" "}
        <span className="text-green-300 font-bold">NASA Earth Observation</span>{" "}
        لمراقبة التربة، الغطاء النباتي، الأمطار والطقس بهدف تحقيق{" "}
        <span className="font-bold">الزراعة المستدامة 🌱</span>.
      </motion.p>

      {/* Buttons */}
      <motion.div
        className="flex flex-col sm:flex-row gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        {/* Login */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/login"
            className="group px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-lg font-semibold rounded-2xl shadow-lg transition-all duration-300 flex items-center space-x-2"
          >
            <span>ابدأ الآن</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Demo */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/demo"
            className="group px-8 py-4 border-2 border-green-400/50 hover:bg-green-700/30 text-lg font-semibold rounded-2xl transition-all duration-300 flex items-center space-x-2"
          >
            <Play className="w-5 h-5" />
            <span>مشاهدة العرض</span>
          </Link>
        </motion.div>

        {/* NASA Link */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <a
            href="https://earthdata.nasa.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="group px-8 py-4 border border-blue-400/50 hover:bg-blue-700/30 text-lg font-semibold rounded-2xl transition-all duration-300 flex items-center space-x-2"
          >
            <Globe className="w-5 h-5" />
            <span>Explore NASA Data</span>
          </a>
        </motion.div>
      </motion.div>
    </main>
  );
};

export default Landing;
