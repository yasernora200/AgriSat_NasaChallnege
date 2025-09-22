import ProfessionalLogo from "./ProfessionalLogo";

const Footer = () => {
  return (
   <footer id="contact" className=" text-center py-12 text-gray-400 text-sm border-t border-gray-800 bg-black/20">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex items-center justify-center mb-6">
            <ProfessionalLogo size="small" variant="full"/>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8 text-left">
            <div>
              <h4 className="text-white font-semibold mb-3">المنصة</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="hover:text-green-400 transition-colors"
                  >
                    المميزات
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="hover:text-green-400 transition-colors"
                  >
                    حول المنصة
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-green-400 transition-colors"
                  >
                    الأسعار
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">المساعدة</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#support"
                    className="hover:text-green-400 transition-colors"
                  >
                    الدعم الفني
                  </a>
                </li>
                <li>
                  <a
                    href="#docs"
                    className="hover:text-green-400 transition-colors"
                  >
                    الدليل
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="hover:text-green-400 transition-colors"
                  >
                    الأسئلة الشائعة
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">
                NASA Data Sources
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="https://smap.jpl.nasa.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors"
                  >
                    SMAP - Soil Moisture
                  </a>
                </li>
                <li>
                  <a
                    href="https://modis.gsfc.nasa.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-green-400 transition-colors"
                  >
                    MODIS - NDVI
                  </a>
                </li>
                <li>
                  <a
                    href="https://gpm.nasa.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    GPM - Precipitation
                  </a>
                </li>
                <li>
                  <a
                    href="https://power.larc.nasa.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    POWER - Solar Energy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <p className="mb-2">
              🌱 Powered by NASA Earth Data | Developed for NASA Space Apps
              Challenge 2025
            </p>
            <p className="text-xs">
              © 2025 AgriSat Platform. Built with 🚀 for sustainable
              agriculture.
            </p>
          </div>
        </div>
      </footer>
  )
}

export default Footer
