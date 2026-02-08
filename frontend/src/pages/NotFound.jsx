import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// أيقونة سيارة احترافية SVG بلون كروة الأصفر 🚕
const CarIcon = () => (
  <svg width="80" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_0_8px_#FACC15]">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h2" stroke="#FACC15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7" cy="17" r="2" stroke="#FACC15" strokeWidth="1.5"/>
    <circle cx="17" cy="17" r="2" stroke="#FACC15" strokeWidth="1.5"/>
    <path d="M7 10h4" stroke="#FACC15" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center px-4 overflow-hidden text-white">
      
      {/* الـ 404 الكبيرة (التصميم القديم) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <h1 className="text-[10rem] md:text-[15rem] font-black text-[#94A3B8]/10 select-none italic">
          404
        </h1>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full">
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-4xl font-bold mb-2 text-[#FACC15]"
          >
            تيهت الطريق؟ 🕵️‍♂️
          </motion.p>
          <motion.p 
            whileHover={{ scale: 1.1 }}
            className="bg-[#FACC15] text-[#0F172A] px-4 py-1 inline-block font-mono font-extrabold rounded-sm shadow-[0_0_15px_rgba(250,204,21,0.5)]"
          >
            Error404 was here!
          </motion.p>
        </div>
      </motion.div>

      {/* الشارع وحركة السيارة (تطلع كبل وتختفي وترجع) 🛣️ */}
      <div className="relative w-full max-w-2xl h-[2px] bg-[#94A3B8]/20 mt-8">
        <motion.div 
          animate={{ x: ["-20vw", "120vw"] }} // تبدأ من بره الشاشة وتطلع لبره الشاشة من الجهة الثانية
          transition={{ 
            repeat: Infinity, 
            duration: 4, 
            ease: "linear" 
          }}
          className="absolute -top-10"
        >
          <CarIcon />
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-8"
      >
        <h2 className="text-xl text-[#94A3B8] mb-8 max-w-sm font-medium">
          هاي الصفحة "خارج نطاق كروة".. لا تشيل هم،<br />هذا الزر يرجعك بلمح البصر
        </h2>
        
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#FACC15", color: "#0F172A" }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer border-2 border-[#FACC15] text-[#FACC15] px-10 py-3 rounded-full font-bold text-lg transition-all duration-300 shadow-[0_0_10px_rgba(250,204,21,0.2)]"
          >
            ارجع للرئيسية
          </motion.button>
        </Link>
      </motion.div>

      {/* Footer بصمة المبرمج */}
      <motion.p 
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="mt-20 text-[#94A3B8]/40 text-xs tracking-widest uppercase"
      >
        &copy; 2026 Error404 | كروة للخطوط الذكية
      </motion.p>
    </div>
  );
};

export default NotFound;