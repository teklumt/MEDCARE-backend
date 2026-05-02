'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Mic, Camera, MapPin, ArrowRight } from 'lucide-react';

export default function Hero() {
  const [searchMode, setSearchMode] = useState<'text' | 'voice' | 'image'>('text');

  return (
    <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-brand-100/50 blur-3xl opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent-200/30 blur-3xl opacity-60"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-brand-950 tracking-tight leading-tight mb-6"
          >
            Find your medication, <br className="hidden md:block" />
            <span className="text-brand-600">delivered to your door.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-gray-600 mb-8"
          >
            Search real-time inventory across verified pharmacies in Ethiopia. 
            Upload a prescription, type a name, or use your voice.
          </motion.p>
        </div>

        {/* Search Interface */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl shadow-brand-900/5 border border-brand-100 overflow-hidden"
        >
          {/* Search Tabs */}
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setSearchMode('text')}
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${searchMode === 'text' ? 'text-brand-900 border-b-2 border-brand-600 bg-brand-50/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <Search className="w-4 h-4" /> Text Search
            </button>
            <button 
              onClick={() => setSearchMode('voice')}
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${searchMode === 'voice' ? 'text-brand-900 border-b-2 border-brand-600 bg-brand-50/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <Mic className="w-4 h-4" /> Voice Search
            </button>
            <button 
              onClick={() => setSearchMode('image')}
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${searchMode === 'image' ? 'text-brand-900 border-b-2 border-brand-600 bg-brand-50/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <Camera className="w-4 h-4" /> Upload Prescription
            </button>
          </div>

          {/* Search Content */}
          <div className="p-6 md:p-8">
            {searchMode === 'text' && (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none" 
                    placeholder="e.g. Paracetamol, Amoxicillin..." 
                  />
                </div>
                <div className="md:w-1/3 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none" 
                    placeholder="Addis Ababa" 
                    defaultValue="Addis Ababa"
                  />
                </div>
                <button className="bg-brand-900 hover:bg-brand-800 text-white py-4 px-8 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2">
                  Search <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {searchMode === 'voice' && (
              <div className="flex flex-col items-center justify-center py-8">
                <button className="w-20 h-20 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center hover:bg-brand-200 transition-colors mb-4 relative group">
                  <div className="absolute inset-0 bg-brand-300 rounded-full animate-ping opacity-20 group-hover:opacity-40"></div>
                  <Mic className="w-8 h-8 relative z-10" />
                </button>
                <p className="text-gray-900 font-medium text-lg">Tap to speak</p>
                <p className="text-gray-500 text-sm mt-1">Supports Amharic and English</p>
              </div>
            )}

            {searchMode === 'image' && (
              <div className="border-2 border-dashed border-brand-200 bg-brand-50/50 rounded-2xl p-8 text-center hover:bg-brand-50 transition-colors cursor-pointer">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Camera className="w-6 h-6 text-brand-600" />
                </div>
                <p className="text-gray-900 font-medium text-lg mb-1">Upload your prescription</p>
                <p className="text-gray-500 text-sm mb-6">Our AI will read it and find your medications instantly.</p>
                <button className="bg-white border border-gray-200 text-gray-700 hover:border-brand-300 hover:text-brand-900 py-2.5 px-6 rounded-xl font-medium transition-all shadow-sm">
                  Choose File
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
