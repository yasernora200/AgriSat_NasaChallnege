import { motion } from "framer-motion"
import { Link } from "react-router-dom";
import {ArrowRight,Play} from "lucide-react";
const Before_Footer = () => {
  return (
  <section className="px-8 py-20 bg-gradient-to-r from-green-900/40 to-blue-900/40">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-6">
            ابدأ رحلتك نحو الزراعة الذكية اليوم
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            انضم لآلاف المزارعين والباحثين الذين يستخدمون بيانات ناسا لتحسين
            إنتاجيتهم الزراعية
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/SignUp"
                className="group px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-xl font-semibold rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>إنشاء حساب مجاني</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/demo"
                className="group px-8 py-4 border-2 border-green-400/50 hover:bg-green-700/30 text-xl font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>تجربة العرض التوضيحي</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
  )
}

export default Before_Footer
