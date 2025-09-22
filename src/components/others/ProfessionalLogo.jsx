import { motion } from "framer-motion";
import LogoIcon from "./LogoIcon";

const ProfessionalLogo = ({ size = "medium", variant = "full" }) => {
  const sizes = {
    small: { container: "w-8 h-8", text: "text-base", icon: "w-5 h-5" },
    medium: { container: "w-12 h-12", text: "text-xl", icon: "w-7 h-7" },
    large: { container: "w-16 h-16", text: "text-2xl", icon: "w-10 h-10" },
  };

  const currentSize = sizes[size];

  <LogoIcon />;

  if (variant === "icon-only") {
    return <LogoIcon/>;
  }

  return (
    <motion.div
      className="flex items-center space-x-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
    >
      <LogoIcon />

      {variant === "full" && (
        <div className="flex flex-col">
          <motion.h1
            className={`${currentSize.text} font-bold tracking-wider bg-gradient-to-r from-green-400 via-blue-400 to-green-300 bg-clip-text text-transparent`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            AgriSat
          </motion.h1>
          <motion.p
            className="text-xs text-green-300/80 font-medium tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            NASA Earth Data
          </motion.p>
        </div>
      )}
    </motion.div>
  );
};

export default ProfessionalLogo;

