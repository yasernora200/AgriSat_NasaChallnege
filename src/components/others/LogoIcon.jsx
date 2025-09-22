import { motion } from "framer-motion";

const LogoIcon = () => (
  <motion.div
    className="w-20 h-20 relative flex items-center justify-center"
    whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
    transition={{ duration: 0.3 }}
  >
    {/* Background Circle with Gradient */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 via-blue-500 to-green-600 shadow-lg">
      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>

    {/* Satellite Icon */}
    <motion.div
      className="relative z-10 text-white"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      <svg
        className="w-10 h-10"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        {/* Satellite body */}
        <rect x="9" y="9" width="6" height="6" rx="1" />

        {/* Solar panels */}
        <rect x="4" y="10" width="4" height="4" rx="0.5" opacity="0.8" />
        <rect x="16" y="10" width="4" height="4" rx="0.5" opacity="0.8" />

        {/* Signal waves */}
        <motion.circle
          cx="12" cy="12" r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.6"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        />
        <motion.circle
          cx="12" cy="12" r="11"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
          opacity="0.4"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ delay: 0.6, duration: 1 }}
        />

        {/* Earth representation */}
        <motion.circle
          cx="18" cy="18" r="2"
          fill="currentColor"
          opacity="0.7"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
        />
      </svg>
    </motion.div>

    {/* Animated orbit ring */}
    <motion.div
      className="absolute inset-0 rounded-full border border-green-300/30"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />
  </motion.div>
);

export default LogoIcon;
