
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from "./pages/SignUp";
import Dashboard from './pages/Dashboard';
import WhatIf from './pages/WhatIf';


export default function App(){
return (
<Routes>
<Route path="/" element={<Home />} />
<Route path="/login" element={<Login />} />
<Route path="/SignUp" element={<SignUp />} />
<Route path="/Dashboard" element={<Dashboard />} />
<Route path="/what-if" element={<WhatIf/>} />
</Routes>
)
}
