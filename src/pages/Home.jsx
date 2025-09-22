
import Landing from "../components/others/Landing";
import Features_Home from "../components/others/Features_Home";
import User_Types from "../components/others/User_Types";
import Statistic_Home from "../components/others/Statistic_Home";
import Footer from "../components/others/Footer";
import Before_Footer from "../components/others/Before_Footer";
import Header_Home from "../components/others/Header_Home";




 // Hero Logo for main section
        
export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black via-green-950 to-black text-white flex flex-col">
      {/* ===== Professional Header ===== */}
       <Header_Home/>
      {/* ===== Landing Page ===== */}
      <Landing />
      {/* =====  Features Section ===== */}
      <Features_Home />
      {/* ===== User Types Section ===== */}
      <User_Types />
      {/* ===== Statistics Section ===== */}
      <Statistic_Home />
      {/* ===== Before Footer ===== */}
      <Before_Footer/>
      {/* ===== Enhanced Footer ===== */}
      <Footer/>
      
    </div>
  );
}
