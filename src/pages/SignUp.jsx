import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Lock, Mail } from "lucide-react";

export default function SignUp() {
  const [role, setRole] = useState("farmer");
  const navigate = useNavigate();

  function handleSignUp(e) {
    e.preventDefault();
    // هنا ممكن تضيفي منطق الربط مع الـ backend
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-green-950 to-black px-4">
      <motion.form
        onSubmit={handleSignUp}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-green-800"
      >
        <h2 className="text-3xl font-extrabold text-center mb-6 text-green-400">
          Create Account 🌱
        </h2>

        {/* ===== Full Name ===== */}
        <label className="block text-gray-300 mb-2">Full Name</label>
        <div className="flex items-center bg-black/40 rounded-lg mb-4 px-3">
          <User className="text-green-400" size={20} />
          <input
            type="text"
            required
            placeholder="Enter your name"
            className="w-full p-3 bg-transparent outline-none text-white"
          />
        </div>

        {/* ===== Email ===== */}
        <label className="block text-gray-300 mb-2">Email</label>
        <div className="flex items-center bg-black/40 rounded-lg mb-4 px-3">
          <Mail className="text-green-400" size={20} />
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="w-full p-3 bg-transparent outline-none text-white"
          />
        </div>

        {/* ===== Password ===== */}
        <label className="block text-gray-300 mb-2">Password</label>
        <div className="flex items-center bg-black/40 rounded-lg mb-4 px-3">
          <Lock className="text-green-400" size={20} />
          <input
            type="password"
            required
            placeholder="Create a password"
            className="w-full p-3 bg-transparent outline-none text-white"
          />
        </div>

        {/* ===== Role Select ===== */}
        <label className="block text-gray-300 mb-2">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-3 rounded-lg bg-black/40 text-white border border-green-600 mb-6"
        >
          <option value="farmer">👨‍🌾 Farmer</option>
          <option value="researcher">🔬 Researcher</option>
        </select>

        {/* ===== Sign Up Button ===== */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="w-full bg-green-600 hover:bg-green-500 text-lg font-semibold text-white py-3 rounded-xl shadow-lg transition"
        >
          Sign Up
        </motion.button>

        {/* ===== Login Link ===== */}
        <p className="text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-green-400 hover:underline">
            Login
          </a>
        </p>
      </motion.form>
    </div>
  );
}
