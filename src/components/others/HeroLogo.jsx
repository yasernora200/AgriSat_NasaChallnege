import { motion } from "framer-motion";

const HeroLogo = () => {
  return (
    <motion.div 
      className="flex items-center justify-center space-x-4 mb-8"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, type: "spring" }}
    >
      <div className="relative">
        <motion.div
          className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 via-blue-500 to-green-600 shadow-2xl flex items-center justify-center"
          animate={{ 
            boxShadow: [
              "0 0 20px rgba(34, 197, 94, 0.5)",
              "0 0 40px rgba(59, 130, 246, 0.5)",
              "0 0 20px rgba(34, 197, 94, 0.5)"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
            <rect x="9" y="9" width="6" height="6" rx="1" />
            <rect x="4" y="10" width="4" height="4" rx="0.5" opacity="0.8" />
            <rect x="16" y="10" width="4" height="4" rx="0.5" opacity="0.8" />
            <motion.circle 
              cx="12" cy="12" r="8" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.5" 
              opacity="0.6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            />
          </svg>
        </motion.div>
        
        {/* Orbiting elements */}
        <motion.div
          className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "12px 12px" }}
        />
        <motion.div
          className="absolute -bottom-2 -left-2 w-3 h-3 bg-green-400 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "12px 12px" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-green-300 bg-clip-text text-transparent">
          AgriSat
        </h1>
        <p className="text-green-300/80 text-lg font-medium tracking-wide">
          🚀 NASA Earth Data Platform
        </p>
      </motion.div>
    </motion.div>
  );
};

export default HeroLogo;