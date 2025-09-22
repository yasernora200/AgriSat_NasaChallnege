import { motion } from "framer-motion"
import ProfessionalLogo from "./ProfessionalLogo";
import { Link } from "react-router-dom";
const Header_Home = () => {
  return (
        <header className="flex justify-between items-center px-8 py-6 bg-black/40 backdrop-blur-sm sticky top-0 z-50 border-b border-green-900/20">
        <ProfessionalLogo size="medium" variant="full"/>
         
        <nav className="hidden md:flex space-x-8 font-medium">
          <a
            href="#features"
            className="text-gray-300 hover:text-green-400 transition-colors duration-300 relative group"
          >
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-400 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a
            href="#about"
            className="text-gray-300 hover:text-green-400 transition-colors duration-300 relative group"
          >
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-400 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a
            href="#contact"
            className="text-gray-300 hover:text-green-400 transition-colors duration-300 relative group"
          >
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-400 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a
            href="#team"
            className="text-gray-300 hover:text-green-400 transition-colors duration-300 relative group"
          >
            Team
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-400 group-hover:w-full transition-all duration-300"></span>
          </a>
        </nav>
        <div className="flex items-center space-x-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/login"
              className="px-4 py-2 text-green-400 border border-green-400/50 rounded-lg hover:bg-green-400/10 transition-all duration-300"
            >
              Login
            </Link>
          </motion.div>
          <motion.div
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 20px rgba(34, 197, 94, 0.5)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/SignUp"
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow-lg hover:shadow-xl hover:from-green-400 hover:to-blue-400 transition-all duration-300"
            >
              SignUp
            </Link>
          </motion.div>
        </div>
      </header>
  )
}

export default Header_Home
