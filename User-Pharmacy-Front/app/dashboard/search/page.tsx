'use client';

import React, { useState, useEffect } from 'react';
import DashboardNavbar from '@/components/DashboardNavbar';
import DashboardSearch from '@/components/dashboard/DashboardSearch';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Pill, ChevronRight, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Mock Data representing medication catalog wrapped in a function to support translation
const getMedicationCategories = (t: (key: string) => string) => [
  {
    title: t('findMeds.cat.pain'),
    medications: [
      { id: 'm1', brandName: t('findMeds.med.tylenol'), genericName: t('findMeds.gen.acetaminophen'), drugClass: t('findMeds.drugClass.analgesic'), approvalHistory: t('findMeds.desc.tylenol'), image: 'https://picsum.photos/seed/tylenol/800/600', pharmacyName: t('findPharmacies.mockName') },
      { id: 'm2', brandName: t('findMeds.med.advil'), genericName: t('findMeds.gen.ibuprofen'), drugClass: t('findMeds.drugClass.nsaid'), approvalHistory: t('findMeds.desc.advil'), image: 'https://picsum.photos/seed/advil/800/600', pharmacyName: 'Aksum Pharmacy' },
      { id: 'm3', brandName: t('findMeds.med.aleve'), genericName: t('findMeds.gen.naproxen'), drugClass: t('findMeds.drugClass.nsaid'), approvalHistory: t('findMeds.desc.aleve'), image: 'https://picsum.photos/seed/aleve/800/600', pharmacyName: 'Bole MedCare' },
    ]
  },
  {
    title: t('findMeds.cat.antibiotics'),
    medications: [
      { id: 'm4', brandName: t('findMeds.med.amoxil'), genericName: t('findMeds.gen.amoxicillin'), drugClass: t('findMeds.drugClass.penicillin'), approvalHistory: t('findMeds.desc.amoxil'), image: 'https://picsum.photos/seed/amoxil/800/600', pharmacyName: t('findPharmacies.mockName') },
      { id: 'm5', brandName: t('findMeds.med.zithromax'), genericName: t('findMeds.gen.azithromycin'), drugClass: t('findMeds.drugClass.macrolide'), approvalHistory: t('findMeds.desc.zithromax'), image: 'https://picsum.photos/seed/zithromax/800/600', pharmacyName: 'Aksum Pharmacy' },
      { id: 'm6', brandName: t('findMeds.med.cipro'), genericName: t('findMeds.gen.ciprofloxacin'), drugClass: t('findMeds.drugClass.fluoroquinolone'), approvalHistory: t('findMeds.desc.cipro'), image: 'https://picsum.photos/seed/cipro/800/600', pharmacyName: 'Bole MedCare' },
    ]
  },
  {
    title: t('findMeds.cat.cardio'),
    medications: [
      { id: 'm7', brandName: t('findMeds.med.prinivil'), genericName: t('findMeds.gen.lisinopril'), drugClass: t('findMeds.drugClass.ace'), approvalHistory: t('findMeds.desc.prinivil'), image: 'https://picsum.photos/seed/prinivil/800/600', pharmacyName: t('findPharmacies.mockName') },
      { id: 'm8', brandName: t('findMeds.med.lipitor'), genericName: t('findMeds.gen.atorvastatin'), drugClass: t('findMeds.drugClass.statin'), approvalHistory: t('findMeds.desc.lipitor'), image: 'https://picsum.photos/seed/lipitor/800/600', pharmacyName: 'Lifeline Pharmacy' },
    ]
  }
];

function MedicationCard({ medication }: { medication: any }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const { t } = useLanguage();

  const handleAddToCart = () => {
    addToCart({
      id: medication.id,
      name: medication.brandName,
      price: medication.price || 150.00,
      quantity: 1,
      requiresPrescription: medication.requiresPrescription !== undefined ? medication.requiresPrescription : true,
      pharmacyId: medication.pharmacyId || '507f1f77bcf86cd799439017',
      pharmacyName: medication.pharmacyName || t('findPharmacies.mockName'),
      image: medication.image,
    });
  };

  return (
    <div className="min-w-[280px] sm:min-w-[320px] snap-start group">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-4 mb-4">
          <Link href={`/dashboard/search/${medication.id}`} className="relative w-full h-40 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 block">
            <Image 
              src={medication.image} 
              alt={medication.brandName} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-500" 
              referrerPolicy="no-referrer" 
            />
          </Link>
          <Link href={`/dashboard/search/${medication.id}`} className="block">
            <h3 className="font-bold text-gray-900 leading-tight text-lg group-hover:text-brand-700 transition-colors">{medication.brandName}</h3>
            <p className="text-sm text-gray-500 italic mb-2">{medication.genericName}</p>
            <div className="flex flex-wrap gap-2">
              <p className="text-xs font-bold text-brand-600 bg-brand-50 inline-block px-2 py-0.5 rounded-full uppercase tracking-wider">{medication.drugClass}</p>
              {medication.pharmacyName && (
                <p className="text-xs font-bold text-purple-600 bg-purple-50 inline-block px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  {medication.pharmacyName}
                </p>
              )}
            </div>
          </Link>
        </div>
        
        <div className="mt-auto space-y-3 pt-4 border-t border-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-gray-900 text-lg">{(medication.price || 150.00).toFixed(2)} ETB</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md">
              <CheckCircle2 className="w-3 h-3" /> In Stock
            </span>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="w-full bg-white hover:bg-brand-50 border border-brand-200 text-brand-700 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" /> {t('findMeds.addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FindMedicationsPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = React.useState(getMedicationCategories(t));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedications = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch medications from backend API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/search?type=medication`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_access_token') || localStorage.getItem('medcare_access_token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch medications');
        }

        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          // Group medications by category
          const medicationsByCategory: { [key: string]: any[] } = {};
          
          data.data.forEach((med: any) => {
            const category = med.category || 'Other';
            if (!medicationsByCategory[category]) {
              medicationsByCategory[category] = [];
            }
            
            medicationsByCategory[category].push({
              id: med._id,
              brandName: med.name,
              genericName: med.genericName || med.name,
              drugClass: med.category,
              approvalHistory: med.description || 'Available from verified pharmacy',
              image: med.imageUrl || 'https://picsum.photos/seed/med/800/600',
              pharmacyId: med.pharmacyId,
              pharmacyName: med.pharmacyName || 'Partner Pharmacy',
              price: med.price || 150.00,
              stockStatus: med.stockStatus,
              requiresPrescription: med.requiresPrescription || false,
            });
          });

          // Convert to categories array
          const realCategories = Object.entries(medicationsByCategory).map(([title, medications]) => ({
            title,
            medications
          }));

          // Combine with mock data
          setCategories([...realCategories, ...getMedicationCategories(t)]);
        } else {
          // If no real data, just use mock data
          setCategories(getMedicationCategories(t));
        }
      } catch (err: any) {
        console.error('Error fetching medications:', err);
        setError(err.message);
        // Fall back to mock data on error
        setCategories(getMedicationCategories(t));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedications();

    // Also check localStorage for any cached inventory
    try {
      const stored = localStorage.getItem('medcare_inventory');
      if (stored) {
        const inventoryItems = JSON.parse(stored);
        if (inventoryItems && inventoryItems.length > 0) {
          const availableMedications = inventoryItems
            .filter((i: any) => i.status === 'In Stock')
            .map((i: any) => ({
              id: i.id,
              brandName: i.name,
              genericName: i.amharicName || i.name,
              drugClass: i.category,
              approvalHistory: i.description || 'Verified stock from partner pharmacy.',
              image: 'https://picsum.photos/seed/med/800/600',
              pharmacyName: i.pharmacyName,
              price: i.price,
              requiresPrescription: true,
            }));
          
          if (availableMedications.length > 0) {
            setCategories(prev => {
              const base = prev.filter(c => c.title !== 'Live Pharmacy Inventory');
              return [
                {
                  title: 'Live Pharmacy Inventory',
                  medications: availableMedications
                },
                ...base
              ];
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading cached inventory:', error);
    }
  }, [t]);

  return (
    <main className="min-h-screen flex flex-col bg-accent-50 pb-20 md:pb-0">
      <DashboardNavbar />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-serif text-brand-950 mb-2">{t('findMeds.title')}</h1>
          <p className="text-gray-500 font-medium">{t('findMeds.subtitle')}</p>
        </div>
        
        <div className="mb-12">
          <DashboardSearch />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Loading medications...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                <Pill className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 mb-1">Unable to load live inventory</h3>
                <p className="text-sm text-amber-700 mb-3">Showing sample medications. {error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="text-sm font-bold text-amber-700 hover:text-amber-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Medication Categories */}
        {!isLoading && categories.map((category, sectionIndex) => (
          <section key={category.title} className="mb-12">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900">{category.title}</h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-brand-700 hover:border-brand-200 transition-colors">
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-brand-700 hover:border-brand-200 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 gap-4 sm:gap-6 snap-x snap-mandatory scrollbar-hide">
              {category.medications.map((medication, index) => (
                <motion.div 
                  key={medication.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <MedicationCard medication={medication} />
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
