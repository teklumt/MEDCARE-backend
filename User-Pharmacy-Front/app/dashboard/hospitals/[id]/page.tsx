'use client';

import DashboardNavbar from '@/components/DashboardNavbar';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Phone, Activity, ChevronLeft, Clock, ShieldCheck, Navigation } from 'lucide-react';
import { use } from 'react';

// Mock Data
const getHospitalData = (id: string) => {
  const base = {
    id,
    name: `Hospital ${id.toUpperCase()}`,
    address: 'Addis Ababa, Ethiopia',
    service: 'General Hospital',
    rating: 4.0,
    reviews: 100,
    phone: '+251 11 000 0000',
    distance: '5.0 km',
    image: `https://picsum.photos/seed/${id}/800/600`,
    description: 'This is a sample hospital description. In the real app, this will be populated from the Google Places API or your backend database.',
    specialties: ['General Practice', 'Emergency Care'],
    hours: 'Open 24 Hours',
    website: 'www.example.com',
  };

  if (id === 'h1') return { ...base, name: 'Black Lion Hospital', address: 'Churchill Ave, Addis Ababa', service: 'General Hospital', rating: 4.2, reviews: 1245, phone: '+251 11 551 1211', distance: '2.4 km', image: 'https://picsum.photos/seed/blacklion/800/600', description: 'Tikur Anbessa (Black Lion) Specialized Hospital is the largest referral hospital in Ethiopia. It serves as the main teaching hospital for Addis Ababa University and provides comprehensive medical, surgical, and specialized care.', specialties: ['Oncology', 'Cardiology', 'Pediatrics', 'Neurology', 'Emergency Care'] };
  if (id === 'h2') return { ...base, name: 'St. Paul\'s Hospital', address: 'Swaziland St, Addis Ababa', service: 'General Hospital', rating: 4.5, reviews: 890, phone: '+251 11 275 0122', distance: '3.1 km', image: 'https://picsum.photos/seed/stpaul/800/600', description: 'St. Paul\'s Hospital Millennium Medical College is a prominent medical institution providing specialized care and medical education.', specialties: ['Maternal Health', 'Surgery', 'Internal Medicine', 'Pediatrics'] };
  if (id === 'h3') return { ...base, name: 'Korean Hospital (MCM)', address: 'Gerji, Addis Ababa', service: 'General Hospital', rating: 4.8, reviews: 2100, phone: '+251 11 629 5421', distance: '5.2 km', image: 'https://picsum.photos/seed/mcm/800/600', description: 'Myungsung Christian Medical Center (MCM), commonly known as Korean Hospital, is known for its modern facilities and high-quality medical services.', specialties: ['Orthopedics', 'Cardiology', 'Neurology', 'Internal Medicine'] };
  if (id === 'h4') return { ...base, name: 'Nordic Medical Centre', address: 'Bole, Addis Ababa', service: 'Private Hospital', rating: 4.7, reviews: 450, phone: '+251 11 667 2384', distance: '1.5 km', image: 'https://picsum.photos/seed/nordic/800/600', description: 'Nordic Medical Centre provides international standard healthcare services with a focus on emergency and family medicine.', specialties: ['Family Medicine', 'Emergency Care', 'Diagnostics'] };
  
  // Pediatrics
  if (id === 'p1') return { ...base, name: 'Ethio-American Hospital', address: 'CMC, Addis Ababa', service: 'Pediatrics', rating: 4.6, reviews: 320, phone: '+251 11 646 0000', distance: '6.8 km', image: 'https://picsum.photos/seed/ped1/800/600', specialties: ['Pediatrics', 'Neonatology', 'Child Surgery'] };
  if (id === 'p2') return { ...base, name: 'Yekatit 12 Hospital', address: 'Sidist Kilo, Addis Ababa', service: 'Pediatrics', rating: 4.1, reviews: 560, phone: '+251 11 155 3222', distance: '3.5 km', image: 'https://picsum.photos/seed/ped2/800/600', specialties: ['Pediatrics', 'Burn Treatment', 'Cleft Lip Surgery'] };
  if (id === 'p3') return { ...base, name: 'Zewditu Memorial', address: 'Bole Road, Addis Ababa', service: 'Pediatrics', rating: 4.0, reviews: 410, phone: '+251 11 551 5888', distance: '2.1 km', image: 'https://picsum.photos/seed/ped3/800/600', specialties: ['Pediatrics', 'Internal Medicine'] };
  
  // Cardiac
  if (id === 'c1') return { ...base, name: 'Cardiac Center Ethiopia', address: 'Black Lion Compound', service: 'Cardiac', rating: 4.9, reviews: 850, phone: '+251 11 553 7474', distance: '2.4 km', image: 'https://picsum.photos/seed/cardiac1/800/600', specialties: ['Cardiology', 'Cardiothoracic Surgery', 'Pediatric Cardiology'] };
  if (id === 'c2') return { ...base, name: 'Landmark General', address: 'Mexico Square', service: 'Cardiac', rating: 4.4, reviews: 290, phone: '+251 11 552 5444', distance: '1.8 km', image: 'https://picsum.photos/seed/cardiac2/800/600', specialties: ['Cardiology', 'Internal Medicine'] };
  
  // Oncology
  if (id === 'o1') return { ...base, name: 'Black Lion Oncology', address: 'Churchill Ave', service: 'Oncology', rating: 4.3, reviews: 620, phone: '+251 11 551 1211', distance: '2.4 km', image: 'https://picsum.photos/seed/onc1/800/600', specialties: ['Medical Oncology', 'Radiation Oncology', 'Surgical Oncology'] };
  if (id === 'o2') return { ...base, name: 'Wudassie Diagnostic', address: 'Bole', service: 'Oncology', rating: 4.7, reviews: 180, phone: '+251 11 661 0000', distance: '4.2 km', image: 'https://picsum.photos/seed/onc2/800/600', specialties: ['Diagnostic Imaging', 'Oncology Screening'] };

  return base;
};

export default function HospitalDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  // In a real app, fetch hospital data based on ID
  const hospital = getHospitalData(id);

  // Google Maps URL (Fallback to a placeholder if key is missing)
  const mapKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapQuery = encodeURIComponent(`${hospital.name} ${hospital.address}`);
  const mapUrl = mapKey 
    ? `https://www.google.com/maps/embed/v1/place?key=${mapKey}&q=${mapQuery}`
    : `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.5!2d38.75!3d9.03!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMDEnNDguMCJOIDM4wrA0NScwMC4wIkU!5e0!3m2!1sen!2set!4v1600000000000!5m2!1sen!2set`;

  return (
    <main className="min-h-screen flex flex-col bg-accent-50 pb-20 md:pb-0">
      <DashboardNavbar />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <Link href="/dashboard/hospitals" className="inline-flex items-center text-brand-700 font-medium hover:text-brand-900 transition-colors mb-8">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Hospitals
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Hospital Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="relative h-64 sm:h-80 w-full rounded-3xl overflow-hidden shadow-sm border border-brand-100">
              <Image 
                src={hospital.image} 
                alt={hospital.name} 
                fill 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <Star className="w-4 h-4 text-amber-500 fill-current" />
                <span className="text-sm font-bold text-gray-900">{hospital.rating}</span>
                <span className="text-xs text-gray-500 font-medium">({hospital.reviews})</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider">
                  {hospital.service}
                </span>
                <span className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
                  <ShieldCheck className="w-4 h-4" /> Verified Facility
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-brand-950 mb-4 leading-tight">
                {hospital.name}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {hospital.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Address</p>
                  <p className="text-sm font-medium text-gray-900">{hospital.address}</p>
                  <p className="text-xs text-brand-600 font-bold mt-1">{hospital.distance} away</p>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contact</p>
                  <p className="text-sm font-medium text-gray-900">{hospital.phone}</p>
                  <a href={`tel:${hospital.phone}`} className="text-xs text-brand-600 font-bold mt-1 hover:underline">Call Now</a>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Hours</p>
                  <p className="text-sm font-medium text-gray-900">{hospital.hours}</p>
                  <p className="text-xs text-emerald-600 font-bold mt-1">Open Now</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Specialties & Services</h3>
              <div className="flex flex-wrap gap-2">
                {hospital.specialties.map(spec => (
                  <span key={spec} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Map & Actions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-[400px] w-full bg-gray-100 relative">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={mapUrl}
                  title={`Map showing location of ${hospital.name}`}
                ></iframe>
              </div>
              
              <div className="p-6">
                <button className="w-full bg-brand-900 hover:bg-brand-800 text-white py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md mb-3">
                  <Navigation className="w-5 h-5" /> Get Directions
                </button>
                <button className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-brand-900 py-4 rounded-2xl font-bold text-lg transition-colors shadow-sm">
                  Book Appointment
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  );
}
