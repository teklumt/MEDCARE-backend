'use client';

import DashboardNavbar from '@/components/DashboardNavbar';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Phone, Activity, ChevronLeft, Clock, ShieldCheck, Navigation, CheckCircle2, XCircle, ShoppingCart, Pill, MessageSquare } from 'lucide-react';
import { use, useState } from 'react';
import { useCart } from '@/lib/CartContext';
import { useRouter } from 'next/navigation';
import WriteReviewModal from '@/components/dashboard/WriteReviewModal';

// Mock Data
const getPharmacyData = (id: string) => {
  const base = {
    id,
    name: `Pharmacy ${id.toUpperCase()}`,
    address: 'Addis Ababa, Ethiopia',
    service: 'Retail Pharmacy',
    rating: 4.0,
    reviews: 100,
    phone: '+251 11 000 0000',
    distance: '5.0 km',
    image: `https://picsum.photos/seed/${id}/800/600`,
    description: 'This is a sample pharmacy description. In the real app, this will be populated from the Google Places API or your backend database.',
    hours: 'Open 24 Hours',
    status: 'open',
    availability: 'medium',
    website: 'www.example.com',
  };

  if (id === 'p1') return { ...base, name: 'Kenema Pharmacy #4', address: 'Bole Road, near Dembel', service: '24/7 Pharmacy', rating: 4.8, reviews: 1245, phone: '+251 11 551 1211', distance: '0.8 km', image: 'https://picsum.photos/seed/kenema/800/600', description: 'Kenema Pharmacy is one of the most trusted government-affiliated pharmacy chains in Addis Ababa, ensuring high-quality and affordable medications.', status: 'open', availability: 'high' };
  if (id === 'p2') return { ...base, name: 'Lion International Pharmacy', address: 'Africa Avenue', service: 'Retail Pharmacy', rating: 4.5, reviews: 890, phone: '+251 11 275 0122', distance: '1.2 km', image: 'https://picsum.photos/seed/lion/800/600', description: 'Lion International Pharmacy provides a wide range of imported and local medications, supplements, and personal care products.', status: 'open', availability: 'medium' };
  if (id === 'p3') return { ...base, name: 'Addis Health Pharmacy', address: 'Megenagna', service: 'Retail Pharmacy', rating: 4.2, reviews: 450, phone: '+251 11 629 5421', distance: '2.5 km', image: 'https://picsum.photos/seed/addis/800/600', description: 'Addis Health Pharmacy focuses on community health, offering prescription filling, health consultations, and over-the-counter medicines.', status: 'closed', availability: 'low', hours: '8:00 AM - 8:00 PM' };
  if (id === 'p4') return { ...base, name: 'Cure Well Pharmacy', address: 'Piassa', service: 'Retail Pharmacy', rating: 4.6, reviews: 320, phone: '+251 11 667 2384', distance: '3.1 km', image: 'https://picsum.photos/seed/cure/800/600', description: 'Cure Well Pharmacy is a modern retail pharmacy located in the heart of Piassa, known for its excellent customer service and reliable stock.', status: 'open', availability: 'high' };

  return base;
};

export default function PharmacyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart } = useCart();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  
  // In a real app, fetch pharmacy data based on ID
  const pharmacy = getPharmacyData(id);

  const mockMedications = [
    { id: 'm1', brandName: 'Tylenol', genericName: 'Acetaminophen', drugClass: 'Analgesic', image: 'https://picsum.photos/seed/tylenol/800/600', price: 150.00, inStock: true },
    { id: 'm4', brandName: 'Amoxil', genericName: 'Amoxicillin', drugClass: 'Antibiotic', image: 'https://picsum.photos/seed/amoxil/800/600', price: 200.00, inStock: true },
    { id: 'm8', brandName: 'Lipitor', genericName: 'Atorvastatin', drugClass: 'Statin', image: 'https://picsum.photos/seed/lipitor/800/600', price: 350.00, inStock: true },
  ];

  const handleAddToCart = (med: any) => {
    addToCart({
      id: med.id,
      name: med.brandName,
      price: med.price,
      quantity: 1,
      requiresPrescription: true,
      pharmacyName: pharmacy.name,
      image: med.image,
    });
  };

  // Google Maps URL (Fallback to a placeholder if key is missing)
  const mapKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapQuery = encodeURIComponent(`${pharmacy.name} ${pharmacy.address}`);
  const mapUrl = mapKey 
    ? `https://www.google.com/maps/embed/v1/place?key=${mapKey}&q=${mapQuery}`
    : `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.5!2d38.75!3d9.03!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMDEnNDguMCJOIDM4wrA0NScwMC4wIkU!5e0!3m2!1sen!2set!4v1600000000000!5m2!1sen!2set`;

  return (
    <main className="min-h-screen flex flex-col bg-accent-50 pb-20 md:pb-0">
      <DashboardNavbar />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <Link href="/dashboard/pharmacies" className="inline-flex items-center text-brand-700 font-medium hover:text-brand-900 transition-colors mb-8">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Pharmacies
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Pharmacy Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="relative h-64 sm:h-80 w-full rounded-3xl overflow-hidden shadow-sm border border-brand-100">
              <Image 
                src={pharmacy.image} 
                alt={pharmacy.name} 
                fill 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <Star className="w-4 h-4 text-amber-500 fill-current" />
                <span className="text-sm font-bold text-gray-900">{pharmacy.rating}</span>
                <span className="text-xs text-gray-500 font-medium">({pharmacy.reviews})</span>
              </div>
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <span className={`w-2.5 h-2.5 rounded-full ${pharmacy.status === 'open' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">{pharmacy.status === 'open' ? 'Open' : 'Closed'}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider">
                  {pharmacy.service}
                </span>
                <span className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
                  <ShieldCheck className="w-4 h-4" /> Verified Pharmacy
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-brand-950 mb-4 leading-tight">
                {pharmacy.name}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {pharmacy.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Address</p>
                  <p className="text-sm font-medium text-gray-900">{pharmacy.address}</p>
                  <p className="text-xs text-brand-600 font-bold mt-1">{pharmacy.distance} away</p>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contact</p>
                  <p className="text-sm font-medium text-gray-900">{pharmacy.phone}</p>
                  <a href={`tel:${pharmacy.phone}`} className="text-xs text-brand-600 font-bold mt-1 hover:underline">Call Now</a>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Hours</p>
                  <p className="text-sm font-medium text-gray-900">{pharmacy.hours}</p>
                  <p className={`text-xs font-bold mt-1 ${pharmacy.status === 'open' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {pharmacy.status === 'open' ? 'Open Now' : 'Currently Closed'}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  pharmacy.availability === 'high' ? 'bg-emerald-50 text-emerald-600' : 
                  pharmacy.availability === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                }`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Stock Level</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {pharmacy.availability === 'high' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {pharmacy.availability === 'medium' && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                    {pharmacy.availability === 'low' && <XCircle className="w-4 h-4 text-red-500" />}
                    <span className={`text-sm font-bold capitalize ${
                      pharmacy.availability === 'high' ? 'text-emerald-700' : 
                      pharmacy.availability === 'medium' ? 'text-amber-700' : 'text-red-700'
                    }`}>
                      {pharmacy.availability} Availability
                    </span>
                  </div>
                </div>
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
                  title={`Map showing location of ${pharmacy.name}`}
                ></iframe>
              </div>
              
              <div className="p-6">
                <button className="w-full bg-brand-900 hover:bg-brand-800 text-white py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md mb-3">
                  <Navigation className="w-5 h-5" /> Get Directions
                </button>
                <button 
                  onClick={() => setIsReviewOpen(true)}
                  className="w-full bg-white border-2 border-brand-100 hover:border-brand-200 text-brand-900 py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageSquare className="w-5 h-5" /> Write a Review
                </button>
              </div>
            </div>
          </motion.div>

        </div>

        <WriteReviewModal 
          isOpen={isReviewOpen} 
          onClose={() => setIsReviewOpen(false)} 
          pharmacyId={id as string}
          pharmacyName={pharmacy.name}
        />

        {/* Medications in Stock - Full Width */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 pt-8 border-t border-brand-100"
        >
          <h2 className="text-2xl font-bold text-brand-950 mb-6 flex items-center gap-2">
            <Pill className="w-6 h-6 text-brand-600" /> Medications in Stock
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockMedications.map(med => (
              <div key={med.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-4 mb-4">
                  <div className="relative w-full h-40 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <Image src={med.image} alt={med.brandName} fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight text-lg">{med.brandName}</h3>
                    <p className="text-sm text-gray-500 italic mb-2">{med.genericName}</p>
                    <div className="flex flex-wrap gap-2">
                      <p className="text-xs font-bold text-brand-600 bg-brand-50 inline-block px-2 py-0.5 rounded-full uppercase tracking-wider">{med.drugClass}</p>
                      <p className="text-xs font-bold text-purple-600 bg-purple-50 inline-block px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        {pharmacy.name}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto space-y-3 pt-4 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900 text-lg">{med.price.toFixed(2)} ETB</span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md">
                      <CheckCircle2 className="w-3 h-3" /> In Stock
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => handleAddToCart(med)}
                    className="w-full bg-white hover:bg-brand-50 border border-brand-200 text-brand-700 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
