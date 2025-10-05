
import { Link, useLocation } from 'react-router-dom'
import NotificationPanel from '../iot/NotificationPanel'

export default function Header(){
  const location = useLocation();
  
  return (
    <header className="p-3 bg-green-700 text-white flex justify-between items-center">
      <div className="flex items-center space-x-6">
        <h1 className="font-bold text-xl">🌱 AgriSat Dashboard</h1>
        
        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-4">
          <Link 
            to="/Dashboard" 
            className={`px-3 py-1 rounded transition-colors ${
              location.pathname === '/Dashboard' 
                ? 'bg-green-600 text-white' 
                : 'text-green-100 hover:bg-green-600/50'
            }`}
          >
            📊 Dashboard
          </Link>
          <Link 
            to="/iot-devices" 
            className={`px-3 py-1 rounded transition-colors ${
              location.pathname === '/iot-devices' 
                ? 'bg-green-600 text-white' 
                : 'text-green-100 hover:bg-green-600/50'
            }`}
          >
            🌐 IoT Devices
          </Link>
          <Link 
            to="/actuators" 
            className={`px-3 py-1 rounded transition-colors ${
              location.pathname === '/actuators' 
                ? 'bg-green-600 text-white' 
                : 'text-green-100 hover:bg-green-600/50'
            }`}
          >
            🎛️ Actuators
          </Link>
          <Link 
            to="/what-if" 
            className={`px-3 py-1 rounded transition-colors ${
              location.pathname === '/what-if' 
                ? 'bg-green-600 text-white' 
                : 'text-green-100 hover:bg-green-600/50'
            }`}
          >
            🤖 What-If Analysis
          </Link>
        </nav>
      </div>
      
      {/* Right side - Notifications and Logout */}
      <div className="flex items-center space-x-4">
        <NotificationPanel />
        <Link 
          to="/" 
          className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded transition-colors text-sm"
        >
          Logout
        </Link>
      </div>
    </header>
  )
}