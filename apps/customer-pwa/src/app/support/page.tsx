'use client';

import { HelpCircle, ChevronLeft, MessageCircle, PhoneCall, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const SUPPORT_PHONE = '+91 80 1234 5678';
const SUPPORT_WHATSAPP = '918012345678';

const FAQ_ITEMS = [
  {
    question: 'How do I track my order?',
    answer: 'Go to My Orders in your profile. Each order shows a real-time status timeline: Pending → Confirmed → Shipped → Delivered.',
  },
  {
    question: 'Can I return or exchange a product?',
    answer: 'Returns and exchanges are managed directly by the store. Contact the store via WhatsApp or call from the product page within 7 days of delivery.',
  },
  {
    question: 'How do I add a delivery address?',
    answer: 'Go to Profile → Addresses → Add New Address. You can save multiple addresses and set a default one for faster checkout.',
  },
  {
    question: 'Is Cash on Delivery available?',
    answer: 'Yes! You can choose Cash on Delivery (COD) at checkout. The amount is paid to the delivery person at your doorstep.',
  },
  {
    question: 'How do I contact a store directly?',
    answer: 'Open any store page or product page and tap the WhatsApp or Call button to connect directly with the store owner.',
  },
];

export default function SupportPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hi, I need help with my LocalFashion order.');
    window.open(`https://wa.me/${SUPPORT_WHATSAPP}?text=${message}`, '_blank');
  };

  const handleCall = () => {
    window.location.href = `tel:${SUPPORT_PHONE.replace(/\s/g, '')}`;
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="bg-white px-4 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-stone-100 active:bg-stone-200 transition">
          <ChevronLeft size={24} className="text-stone-700" />
        </button>
        <h1 className="text-lg font-bold text-stone-900 flex-1">Help Center</h1>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto mt-4">
        
        {/* Hero Card */}
        <div className="bg-stone-900 text-white rounded-3xl p-8 relative overflow-hidden text-center flex flex-col items-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl translate-x-1/2 -translate-y-1/2"></div>
          <HelpCircle size={48} className="text-stone-400 mb-4" strokeWidth={1.5} />
          <h2 className="text-xl font-bold mb-2">How can we help?</h2>
          <p className="text-sm text-stone-400 mb-6">Our support team is available Mon–Sat, 10am–7pm.</p>
          
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 w-full bg-white text-stone-900 font-bold py-3.5 px-6 rounded-2xl shadow-md active:scale-95 transition hover:bg-stone-50"
          >
            <MessageCircle size={20} className="text-green-600" />
            Chat on WhatsApp
          </button>
        </div>

        {/* Contact Options */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
          <button
            onClick={handleCall}
            className="flex items-center gap-4 w-full p-4 border-b border-stone-50 hover:bg-stone-50 transition text-left active:bg-stone-100"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <PhoneCall size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-stone-900">Call Support</h3>
              <p className="text-xs text-stone-500 mt-0.5">{SUPPORT_PHONE} · Speak to an agent</p>
            </div>
          </button>
        </div>

        {/* FAQ Section */}
        <div className="mt-2">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1 mb-2 flex items-center gap-1">
            <FileText size={12} />
            Frequently Asked Questions
          </p>
          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden divide-y divide-stone-50">
            {FAQ_ITEMS.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex items-center gap-3 w-full p-4 text-left hover:bg-stone-50 transition"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-stone-900 text-sm">{faq.question}</h3>
                  </div>
                  {openFaq === i
                    ? <ChevronUp size={16} className="text-stone-400 flex-shrink-0" />
                    : <ChevronDown size={16} className="text-stone-400 flex-shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-stone-500 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
