'use client';

import DashboardNavbar from '@/components/DashboardNavbar';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ShoppingCart, Pill, AlertTriangle, ShieldAlert, Clock, Activity, FileText, CheckCircle2, MapPin } from 'lucide-react';
import { use } from 'react';
import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Mock Data representing an internal catalog
const getDrugData = (id: string, t: (key: string) => string) => {
  const base = {
    id,
    brandName: `Medication ${id.toUpperCase()}`,
    genericName: 'Sample Generic Name',
    drugClass: 'Sample Class',
    activeIngredients: 'Active Ingredient 500mg',
    image: `https://picsum.photos/seed/${id}/800/600`,
    indications: 'This is a sample indication for the selected medication. In the real app, this will be populated from a backend database.',
    dosing: 'Take as directed by your healthcare provider.',
    route: t('findMeds.route.oral'),
    timing: 'As directed',
    sideEffects: 'Sample side effects. Consult your doctor.',
    contraindications: 'Sample contraindications.',
    interactions: 'Sample interactions.',
    approvalHistory: 'Sample approval history.',
    regulatoryInfo: 'Sample regulatory info.'
  };

  if (id === 'm1') {
    return { ...base, brandName: t('findMeds.med.tylenol'), genericName: t('findMeds.gen.acetaminophen'), drugClass: t('findMeds.drugClass.analgesic'), activeIngredients: t('findMeds.act.m1'), image: 'https://picsum.photos/seed/tylenol/800/600', indications: t('findMeds.indications.m1'), dosing: t('findMeds.dosing.m1'), timing: t('findMeds.timing.m1'), sideEffects: t('findMeds.sideEffects.m1'), contraindications: t('findMeds.contra.m1'), interactions: t('findMeds.interact.m1'), approvalHistory: t('findMeds.desc.tylenol'), regulatoryInfo: t('findMeds.reg.m1') };
  }
  if (id === 'm2') {
    return { ...base, brandName: t('findMeds.med.advil'), genericName: t('findMeds.gen.ibuprofen'), drugClass: t('findMeds.drugClass.nsaid'), activeIngredients: t('findMeds.act.m2'), image: 'https://picsum.photos/seed/advil/800/600', indications: t('findMeds.indications.m2'), dosing: t('findMeds.dosing.m2'), timing: t('findMeds.timing.m2'), sideEffects: t('findMeds.sideEffects.m2'), contraindications: t('findMeds.contra.m2'), interactions: t('findMeds.interact.m2'), approvalHistory: t('findMeds.desc.advil'), regulatoryInfo: t('findMeds.reg.m2') };
  }
  if (id === 'm3') {
    return { ...base, brandName: t('findMeds.med.aleve'), genericName: t('findMeds.gen.naproxen'), drugClass: t('findMeds.drugClass.nsaid'), activeIngredients: t('findMeds.act.m3'), image: 'https://picsum.photos/seed/aleve/800/600', indications: t('findMeds.indications.m3'), dosing: t('findMeds.dosing.m3'), timing: t('findMeds.timing.m3'), sideEffects: t('findMeds.sideEffects.m3'), contraindications: t('findMeds.contra.m3'), interactions: t('findMeds.interact.m3'), approvalHistory: t('findMeds.desc.aleve'), regulatoryInfo: t('findMeds.reg.m3') };
  }
  if (id === 'm4') {
    return { ...base, brandName: t('findMeds.med.amoxil'), genericName: t('findMeds.gen.amoxicillin'), drugClass: t('findMeds.drugClass.penicillin'), activeIngredients: t('findMeds.act.m4'), image: 'https://picsum.photos/seed/amoxil/800/600', indications: t('findMeds.indications.m4'), dosing: t('findMeds.dosing.m4'), timing: t('findMeds.timing.m4'), sideEffects: t('findMeds.sideEffects.m4'), contraindications: t('findMeds.contra.m4'), interactions: t('findMeds.interact.m4'), approvalHistory: t('findMeds.desc.amoxil'), regulatoryInfo: t('findMeds.reg.m4') };
  }
  if (id === 'm5') {
    return { ...base, brandName: t('findMeds.med.zithromax'), genericName: t('findMeds.gen.azithromycin'), drugClass: t('findMeds.drugClass.macrolide'), activeIngredients: t('findMeds.act.m5'), image: 'https://picsum.photos/seed/zithromax/800/600', indications: t('findMeds.indications.m5'), dosing: t('findMeds.dosing.m5'), timing: t('findMeds.timing.m5'), sideEffects: t('findMeds.sideEffects.m5'), contraindications: t('findMeds.contra.m5'), interactions: t('findMeds.interact.m5'), approvalHistory: t('findMeds.desc.zithromax'), regulatoryInfo: t('findMeds.reg.m5') };
  }
  if (id === 'm6') {
    return { ...base, brandName: t('findMeds.med.cipro'), genericName: t('findMeds.gen.ciprofloxacin'), drugClass: t('findMeds.drugClass.fluoroquinolone'), activeIngredients: t('findMeds.act.m6'), image: 'https://picsum.photos/seed/cipro/800/600', indications: t('findMeds.indications.m6'), dosing: t('findMeds.dosing.m6'), timing: t('findMeds.timing.m6'), sideEffects: t('findMeds.sideEffects.m6'), contraindications: t('findMeds.contra.m6'), interactions: t('findMeds.interact.m6'), approvalHistory: t('findMeds.desc.cipro'), regulatoryInfo: t('findMeds.reg.m6') };
  }
  if (id === 'm7') {
    return { ...base, brandName: t('findMeds.med.prinivil'), genericName: t('findMeds.gen.lisinopril'), drugClass: t('findMeds.drugClass.ace'), activeIngredients: t('findMeds.act.m7'), image: 'https://picsum.photos/seed/prinivil/800/600', indications: t('findMeds.indications.m7'), dosing: t('findMeds.dosing.m7'), timing: t('findMeds.timing.m7'), sideEffects: t('findMeds.sideEffects.m7'), contraindications: t('findMeds.contra.m7'), interactions: t('findMeds.interact.m7'), approvalHistory: t('findMeds.desc.prinivil'), regulatoryInfo: t('findMeds.reg.m7') };
  }
  if (id === 'm8') {
    return { ...base, brandName: t('findMeds.med.lipitor'), genericName: t('findMeds.gen.atorvastatin'), drugClass: t('findMeds.drugClass.statin'), activeIngredients: t('findMeds.act.m8'), image: 'https://picsum.photos/seed/lipitor/800/600', indications: t('findMeds.indications.m8'), dosing: t('findMeds.dosing.m8'), timing: t('findMeds.timing.m8'), sideEffects: t('findMeds.sideEffects.m8'), contraindications: t('findMeds.contra.m8'), interactions: t('findMeds.interact.m8'), approvalHistory: t('findMeds.desc.lipitor'), regulatoryInfo: t('findMeds.reg.m8') };
  }

  return base;
};

export default function DrugDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addToCart } = useCart();
  const router = useRouter();
  const { t } = useLanguage();
  
  // Mock drug data lookup
  const drug = getDrugData(id, t);

  const handleAddToCart = () => {
    addToCart({
      id: drug.id,
      name: drug.brandName,
      price: 150.00, // Mock price
      quantity: 1,
      requiresPrescription: true, // Mock requirement
      pharmacyName: 'Med-Care Central Pharmacy',
      image: drug.image,
    });
  };

  return (
    <main className="min-h-screen flex flex-col bg-accent-50 pb-20 md:pb-0">
      <DashboardNavbar />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <Link href="/dashboard/search" className="inline-flex items-center text-brand-700 font-medium hover:text-brand-900 transition-colors mb-8">
          <ChevronLeft className="w-4 h-4 mr-1" /> {t('drugDetails.back')}
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Image & Order CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden sticky top-28">
              <div className="relative h-64 sm:h-80 w-full bg-gray-100">
                <Image 
                  src={drug.image} 
                  alt={drug.brandName} 
                  fill 
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <Pill className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">{drug.drugClass}</span>
                </div>
              </div>
              
              <div className="p-6">
                <h1 className="text-3xl font-serif font-bold text-brand-950 mb-1 leading-tight">
                  {drug.brandName}
                </h1>
                <p className="text-gray-500 font-medium italic mb-6">
                  {drug.genericName}
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">{t('drugDetails.activeIngredient')}</span>
                    <span className="font-bold text-gray-900">{drug.activeIngredients}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">{t('drugDetails.route')}</span>
                    <span className="font-bold text-gray-900">{drug.route}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleAddToCart}
                    className="w-full bg-white hover:bg-brand-50 border border-brand-200 text-brand-700 py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ShoppingCart className="w-5 h-5" /> {t('findMeds.addToCart')}
                  </button>
                  <button 
                    onClick={() => {
                      handleAddToCart();
                      router.push('/dashboard/cart');
                    }}
                    className="w-full bg-brand-900 hover:bg-brand-800 text-white py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    {t('findMeds.orderNow')}
                  </button>
                  <button className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-brand-900 py-4 rounded-2xl font-bold text-lg transition-colors shadow-sm flex items-center justify-center gap-2">
                    <MapPin className="w-5 h-5" /> {t('drugDetails.findInPharmacy')}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Detailed Medical Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-8 space-y-6"
          >
            {/* Indications & Usage */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-serif font-bold text-gray-900">{t('drugDetails.indications')}</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {drug.indications}
              </p>
            </div>

            {/* Dosing & Administration */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Clock className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-serif font-bold text-gray-900">{t('drugDetails.dosing')}</h2>
              </div>
              <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 mb-4">
                <p className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-1">{t('drugDetails.timing')}</p>
                <p className="text-blue-900 font-medium">{drug.timing}</p>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {drug.dosing}
              </p>
            </div>

            {/* Warnings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Side Effects */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-serif font-bold text-gray-900">{t('drugDetails.sideEffects')}</h2>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {drug.sideEffects}
                </p>
              </div>

              {/* Contraindications */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-serif font-bold text-gray-900">{t('drugDetails.contraindications')}</h2>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {drug.contraindications}
                </p>
              </div>
            </div>

            {/* Drug Interactions */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <Activity className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-serif font-bold text-gray-900">{t('drugDetails.interactions')}</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {drug.interactions}
              </p>
            </div>

            {/* Regulatory Info */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-serif font-bold text-gray-900">{t('drugDetails.approval')}</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{t('drugDetails.history')}</p>
                  <p className="text-gray-700 font-medium">{drug.approvalHistory}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{t('drugDetails.regulatory')}</p>
                  <p className="text-gray-700 font-medium">{drug.regulatoryInfo}</p>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </main>
  );
}
