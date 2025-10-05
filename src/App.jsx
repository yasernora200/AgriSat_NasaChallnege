
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from "./pages/SignUp";
import Dashboard from './pages/Dashboard';
import WhatIf from './pages/WhatIfChat';
import IoTDevices from './pages/IoTDevices';
import ActuatorDashboard from './components/actuators/ActuatorDashboard';


export default function App(){
return (
<Routes>
<Route path="/" element={<Home />} />
<Route path="/login" element={<Login />} />
<Route path="/SignUp" element={<SignUp />} />
<Route path="/Dashboard" element={<Dashboard />} />
<Route path="/what-if" element={<WhatIf/>} />
<Route path="/iot-devices" element={<IoTDevices />} />
<Route path="/actuators" element={<ActuatorDashboard />} />
</Routes>
)
}
