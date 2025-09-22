import { motion } from "framer-motion";
import { Leaf, Droplet, CloudRain, Sun } from "lucide-react";
const Features_Home = () => {
  return (
         <section id="features" className="px-8 py-20">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Powered by NASA Earth Observation
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            استخدم أحدث تقنيات الأقمار الصناعية لاتخاذ قرارات زراعية ذكية ومستدامة
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-white/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="text-green-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-center mb-3">صحة النبات (NDVI)</h3>
            <p className="text-sm text-gray-300 text-center">
              متابعة حالة المحاصيل بالاعتماد على صور أقمار ناسا MODIS لقياس صحة النباتات وكثافة الغطاء النباتي.
            </p>
            <div className="text-center mt-4">
              <span className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded-full">NASA MODIS</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-white/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Droplet className="text-blue-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-center mb-3">رطوبة التربة</h3>
            <p className="text-sm text-gray-300 text-center">
              بيانات دقيقة من NASA SMAP لقياس رطوبة التربة وتحديد الوقت الأمثل للري وتوفير المياه.
            </p>
            <div className="text-center mt-4">
              <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded-full">NASA SMAP</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-white/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-cyan-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CloudRain className="text-cyan-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-center mb-3">الأمطار والطقس</h3>
            <p className="text-sm text-gray-300 text-center">
              تتبع هطول الأمطار وتوقعات الطقس من NASA GPM لتخطيط أنشطة الري والحماية من الظروف الجوية.
            </p>
            <div className="text-center mt-4">
              <span className="text-xs bg-cyan-900/30 text-cyan-300 px-2 py-1 rounded-full">NASA GPM</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-white/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-yellow-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sun className="text-yellow-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-center mb-3">بيانات الطاقة الشمسية</h3>
            <p className="text-sm text-gray-300 text-center">
              معلومات شاملة عن الإشعاع الشمسي ودرجات الحرارة من NASA POWER لتحسين إنتاجية المحاصيل.
            </p>
            <div className="text-center mt-4">
              <span className="text-xs bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded-full">NASA POWER</span>
            </div>
          </motion.div>
        </div>
      </section>
  )
}

export default Features_Home
