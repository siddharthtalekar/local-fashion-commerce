'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Upload, CheckCircle2, ChevronRight, ChevronLeft, PackageOpen, Camera, Tag, MapPin, IndianRupee } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useStoreProfileStore } from '@/store/storeProfile';
import { apiFetch } from '@/lib/api';
import { toast } from '@local-fashion/utils';
import { uploadImageToCloudinary } from '@local-fashion/utils';

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];
const STEPS = ['Basic Info', 'Brand & Category', 'Pricing & Sizes', 'Photos'];

interface Category { id: string; name: string; slug: string; }
interface Brand { id: string; name: string; slug: string; }

export default function NewProductWizard() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const myStore = useStoreProfileStore((s) => s.myStore);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const [formData, setFormData] = useState({
    title: '', brandId: '', categoryId: '', description: '',
    price: '', discountedPrice: '', imageUrls: [''],
  });
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set(['S', 'M', 'L']));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [requestBrand, setRequestBrand] = useState('');
  const [showRequestBrand, setShowRequestBrand] = useState(false);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      apiFetch<Category[]>('/categories', { token }),
      apiFetch<Brand[]>('/brands', { token }).catch(() => [])
    ]).then(([cats, brnds]) => {
      setCategories(cats); setBrands(brnds);
      if (cats.length > 0) setFormData(f => ({ ...f, categoryId: cats[0].id }));
      if (brnds.length > 0) setFormData(f => ({ ...f, brandId: brnds[0].id }));
    }).catch(console.error);
  }, [token]);

  const canGoNext = () => {
    if (step === 0) return formData.title.trim().length > 2;
    if (step === 1) return formData.categoryId && (formData.brandId || requestBrand.trim().length > 1);
    if (step === 2) return parseFloat(formData.price) > 0 && selectedSizes.size > 0;
    return true;
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...formData.imageUrls];
    newUrls[index] = value;
    setFormData({ ...formData, imageUrls: newUrls });
  };
  const addImageUrl = () => setFormData({ ...formData, imageUrls: [...formData.imageUrls, ''] });
  const removeImageUrl = (index: number) => {
    const newUrls = formData.imageUrls.filter((_, i) => i !== index);
    if (newUrls.length === 0) newUrls.push('');
    setFormData({ ...formData, imageUrls: newUrls });
  };
  const toggleSize = (size: string) => {
    const newSizes = new Set(selectedSizes);
    if (newSizes.has(size)) newSizes.delete(size); else newSizes.add(size);
    setSelectedSizes(newSizes);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadImageToCloudinary(
        file,
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ''
      );
      // Find first empty slot or add new
      const newUrls = [...formData.imageUrls];
      const emptyIdx = newUrls.findIndex(u => !u.trim());
      if (emptyIdx >= 0) {
        newUrls[emptyIdx] = url;
      } else {
        newUrls.push(url);
      }
      setFormData({ ...formData, imageUrls: newUrls });
      toast.success('Image uploaded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBrandRequest = async () => {
    if (!requestBrand.trim()) return;
    try {
      await apiFetch('/brands/request', {
        method: 'POST',
        token: token!,
        body: JSON.stringify({ name: requestBrand }),
      });
      toast.success('Brand request submitted! We will review it shortly.');
      setShowRequestBrand(false);
      // Just to let them proceed, we can select a dummy brand or use the first brand for now
      if (brands.length > 0) {
        setFormData(f => ({ ...f, brandId: brands[0].id }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to request brand');
    }
  };

  const handleSubmit = async () => {
    if (!myStore || !token) return;
    
    if (showRequestBrand && requestBrand.trim()) {
      await handleBrandRequest();
    }

    setLoading(true);
    try {
      const price = parseFloat(formData.price);
      const discountedPrice = formData.discountedPrice ? parseFloat(formData.discountedPrice) : undefined;
      const validImageUrls = formData.imageUrls.filter(url => url.trim() !== '');

      if (!formData.title || !formData.categoryId || !formData.brandId || isNaN(price) || validImageUrls.length === 0) {
        throw new Error('Please fill in all required fields and provide at least one valid image URL.');
      }
      if (selectedSizes.size === 0) throw new Error('Please select at least one size in stock.');

      await apiFetch(`/products/store/${myStore.id}`, {
        method: 'POST', token,
        body: JSON.stringify({
          title: formData.title, description: formData.description, categoryId: formData.categoryId,
          brandId: formData.brandId, price, discountedPrice,
          sizes: Array.from(selectedSizes).map(size => ({ size, inStock: true })),
          imageUrls: validImageUrls, colors: [], tags: [],
        })
      });
      toast.success('Product published successfully!');
      router.push('/products');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create product');
      setLoading(false);
    }
  };

  const discountPercent = (() => {
    const p = parseFloat(formData.price);
    const d = parseFloat(formData.discountedPrice);
    if (isNaN(p) || isNaN(d) || p <= 0 || d >= p) return null;
    return Math.round(((p - d) / p) * 100);
  })();

  const inputClass = "w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-[#282C3F] font-medium outline-none focus:ring-2 focus:ring-[#FF3E6C]/30 focus:border-[#FF3E6C] focus:bg-white transition-all placeholder:text-stone-400";
  const labelClass = "block text-sm font-bold text-[#282C3F] mb-2";

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-in">
        <Link href="/products" className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors press-effect">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>Add New Product</h1>
          <p className="text-sm text-stone-400 mt-1">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full flex-1 transition-all ${i <= step ? 'bg-[#FF3E6C]' : 'bg-stone-200'}`} />
        ))}
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-stone-100 animate-slide-up">
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><PackageOpen size={16} /></div>
              <h2 className="text-lg font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>Basic Information</h2>
            </div>
            <div>
              <label className={labelClass}>Product Title <span className="text-[#FF3E6C]">*</span></label>
              <input type="text" required placeholder="e.g., Pure Cotton Printed Casual Shirt" className={inputClass}
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} autoFocus />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea rows={4} className={`${inputClass} resize-none`} placeholder="Describe the material, fit, and care instructions..."
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>
        )}

        {/* Step 1: Brand & Category */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Tag size={16} /></div>
              <h2 className="text-lg font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>Categorization</h2>
            </div>
            <div>
              <label className={labelClass}>Category <span className="text-[#FF3E6C]">*</span></label>
              <select required className={`${inputClass} appearance-none`}
                value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                <option value="" disabled>Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-[#282C3F]">Brand <span className="text-[#FF3E6C]">*</span></label>
                <button onClick={() => setShowRequestBrand(!showRequestBrand)} className="text-xs font-bold text-[#FF3E6C] hover:underline">
                  {showRequestBrand ? "Cancel" : "Brand not listed?"}
                </button>
              </div>
              
              {!showRequestBrand ? (
                <select required className={`${inputClass} appearance-none`}
                  value={formData.brandId} onChange={e => setFormData({...formData, brandId: e.target.value})}>
                  <option value="" disabled>Select brand</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              ) : (
                <div className="space-y-3 p-4 bg-[#FF3E6C]/5 rounded-2xl border border-[#FF3E6C]/20">
                  <p className="text-xs font-medium text-stone-600">Enter your brand name. We'll add it to our system.</p>
                  <input type="text" placeholder="Brand Name" className={inputClass}
                    value={requestBrand} onChange={e => setRequestBrand(e.target.value)} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Pricing & Sizes */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">₹</div>
              <h2 className="text-lg font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>Pricing & Stock</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 relative">
              <div>
                <label className={labelClass}>MRP Price <span className="text-[#FF3E6C]">*</span></label>
                <input type="number" required min="0" step="0.01" className={inputClass} placeholder="0"
                  value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Selling Price</label>
                <div className="relative">
                  <input type="number" min="0" step="0.01" className={inputClass} placeholder="Optional"
                    value={formData.discountedPrice} onChange={e => setFormData({...formData, discountedPrice: e.target.value})} />
                  {discountPercent !== null && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-black">
                      {discountPercent}% OFF
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-stone-100">
              <label className={labelClass}>Available Sizes <span className="text-[#FF3E6C]">*</span></label>
              <div className="flex flex-wrap gap-3 mt-3">
                {AVAILABLE_SIZES.map(size => (
                  <button key={size} type="button" onClick={() => toggleSize(size)}
                    className={`h-12 px-4 rounded-xl flex items-center justify-center font-bold transition-all press-effect border-2 ${
                      selectedSizes.has(size) 
                        ? 'border-[#FF3E6C] bg-[#FF3E6C]/10 text-[#FF3E6C] shadow-sm' 
                        : 'border-stone-200 text-stone-400 hover:border-stone-300 bg-white hover:text-stone-600'
                    }`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Photos */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4 mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Camera size={16} /></div>
              <h2 className="text-lg font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>Photos</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.imageUrls.filter(url => url.trim() !== '').map((url, index) => (
                <div key={index} className="relative aspect-square rounded-2xl border border-stone-200 overflow-hidden group">
                  <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImageUrl(index)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 text-stone-600 flex items-center justify-center shadow-sm opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={16} />
                  </button>
                </div>
              ))}
              
              <div className="aspect-square rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center text-stone-400 hover:border-[#FF3E6C]/50 hover:bg-[#FF3E6C]/5 transition-colors group cursor-pointer relative overflow-hidden"
                   onClick={() => fileInputRef.current?.click()}>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                {uploadingImage ? (
                  <span className="w-6 h-6 border-2 border-stone-400/40 border-t-stone-500 rounded-full animate-spin" />
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Camera size={18} className="text-[#FF3E6C]" />
                    </div>
                    <span className="text-xs font-bold text-stone-500">Tap to Upload</span>
                  </>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <p className="text-xs font-bold text-stone-400 mb-3">Or paste an image URL:</p>
              <div className="space-y-3">
                {formData.imageUrls.map((url, index) => {
                  if (url.trim() !== '' && formData.imageUrls.length > 1) return null; // Only show empty URL inputs if there are images
                  return (
                    <div key={`input-${index}`} className="flex gap-2">
                      <input type="url" placeholder="https://example.com/image.jpg" className={`${inputClass} flex-1`}
                        value={url} onChange={(e) => handleImageUrlChange(index, e.target.value)} />
                      <button type="button" onClick={addImageUrl} className="px-4 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 font-bold transition-colors">
                        Add
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-stone-100">
          {step > 0 && (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="px-6 py-3.5 rounded-2xl border border-stone-200 text-sm font-bold text-stone-600 hover:bg-stone-50 transition-all press-effect">
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canGoNext()}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white transition-all press-effect disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #FF3E6C 0%, #FF6B35 100%)', boxShadow: '0 8px 24px rgba(255,62,108,0.3)' }}>
              Next Step <ChevronRight size={18} />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading || formData.imageUrls.filter(u => u.trim()).length === 0}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white transition-all press-effect disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #FF3E6C 0%, #FF6B35 100%)', boxShadow: '0 8px 24px rgba(255,62,108,0.3)' }}>
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <><CheckCircle2 size={18} /> Publish Product</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
