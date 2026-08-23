import { motion } from "framer-motion";
import { ArrowRight, Heart, Users, Sparkles } from "lucide-react";
import img from "../assets/img.jpeg";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-12 md:py-20 relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#9c27b0] rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#e91e63] rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
        
        {/* Left Column: Text Content */}
        <div className="flex flex-col items-start text-left space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1b0c30] border border-purple-900/60"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-purple-200 tracking-wide uppercase">Redefining Companionship</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight"
          >
            Find the perfect <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-500">
              companion
            </span> for every moment.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-300 max-w-lg leading-relaxed"
          >
            Whether you need a listening ear, a plus-one for an event, or just someone to share a coffee with, BuddyUp connects you with genuine people to remove loneliness from your life.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full pt-4"
          >
            <Link to="/explore" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-semibold transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] active:scale-95">
              Find a Buddy
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1b0c30] hover:bg-[#281347] border border-purple-900/60 text-white rounded-2xl font-semibold transition-all active:scale-95">
              How it works
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center gap-6 pt-8 mt-4 border-t border-white/10 w-full"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-400" />
              <span className="text-sm text-gray-300"><strong className="text-white">1000+</strong> Buddies</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-300"><strong className="text-white">4.9/5</strong> Rating</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Visual/Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative w-full aspect-square md:aspect-4/3 lg:aspect-square flex items-center justify-center"
        >
          {/* Main Image Container */}
          <div className="relative w-full max-w-md aspect-3/4 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <div className="absolute inset-0 bg-linear-to-t from-[#160020] via-transparent to-transparent z-10"></div>
            <img 
              src={img} 
              alt="Friendly companions" 
              className="w-full h-full object-cover object-center"
            />
            
            {/* Floating Glassmorphism Badge */}
           
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-linear-to-br from-purple-500 to-pink-500 rounded-full mix-blend-overlay filter blur-2xl opacity-60"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-linear-to-br from-blue-500 to-purple-500 rounded-full mix-blend-overlay filter blur-2xl opacity-60"></div>
        </motion.div>

      </div>
    </div>
  );
}
