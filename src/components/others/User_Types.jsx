import { motion } from "framer-motion";
import { Users, BarChart3 } from "lucide-react";
const User_Types = () => {
  return (
      <section id="about" className="px-8 py-20 bg-gradient-to-r from-green-900/20 to-blue-900/20">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">
            مناسب لكل المهتمين بالزراعة
          </h2>
          <p className="text-xl text-gray-300">
            سواء كنت مزارع أو باحث، منصتنا تلبي احتياجاتك
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <motion.div
            className="bg-gradient-to-br from-green-900/30 to-green-700/20 p-8 rounded-2xl border border-green-500/20"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center mb-6">
              <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mr-4">
                <Users className="text-green-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-green-400">للمزارعين</h3>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                اختيار موقع المزرعة بالنقر على الخريطة
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                توصيات ذكية للري والتسميد
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                متابعة حالة المحاصيل يومياً
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                تقارير مفصلة عن الإنتاجية
              </li>
            </ul>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-blue-900/30 to-blue-700/20 p-8 rounded-2xl border border-blue-500/20"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center mb-6">
              <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mr-4">
                <BarChart3 className="text-blue-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-blue-400">للباحثين</h3>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                رفع ملفات GIS وShapefiles
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                تحليل مناطق واسعة من الأراضي
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                مقارنة البيانات التاريخية
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                تصدير النتائج والإحصائيات
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

  )
}

export default User_Types
