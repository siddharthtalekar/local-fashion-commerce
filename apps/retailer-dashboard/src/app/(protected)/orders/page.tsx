'use client';

import { useEffect, useState } from 'react';
import { apiFetch, getToken } from '@/lib/api';
import { Package, Clock, CheckCircle2, Truck, Check, ChevronRight } from 'lucide-react';
import { toast } from '@local-fashion/utils';

interface OrderItem {
  id: string; quantity: number; price: number; size?: string; color?: string;
  product: { title: string; images: { url: string }[]; };
}

interface Order {
  id: string; status: string; totalAmount: number; createdAt: string;
  user: { name: string; phone: string; };
  address: { line1: string; city: string; pincode: string; } | null;
  items: OrderItem[];
}

const TABS = ['All', 'Pending', 'Confirmed', 'Dispatched', 'Delivered'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const fetchOrders = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const data = await apiFetch<Order[]>('/orders/retailer', { token });
      setOrders(data);
    } catch (e) {
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId: string, status: string) => {
    const token = getToken();
    if (!token) return;
    try {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      await apiFetch(`/orders/retailer/${orderId}/status`, {
        method: 'PATCH', token, body: JSON.stringify({ status })
      });
      toast.success(`Order marked as ${status}`);
    } catch (e) {
      toast.error('Failed to update status');
      fetchOrders(); // Revert on fail
    }
  };

  const filteredOrders = activeTab === 'All' 
    ? orders 
    : orders.filter(o => o.status.toLowerCase() === activeTab.toLowerCase());

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'dispatched': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock size={12} />;
      case 'confirmed': return <CheckCircle2 size={12} />;
      case 'dispatched': return <Truck size={12} />;
      case 'delivered': return <Check size={12} />;
      default: return <Clock size={12} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-slide-down">
        <h1 className="text-2xl font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>Orders</h1>
        <p className="text-stone-400 text-sm mt-1">Manage and track your incoming customer orders.</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2 animate-slide-up">
        {TABS.map(tab => {
          const count = tab === 'All' 
            ? orders.length 
            : orders.filter(o => o.status.toLowerCase() === tab.toLowerCase()).length;
          const isActive = activeTab === tab;
          
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all press-effect whitespace-nowrap ${
                isActive 
                  ? 'bg-[#282C3F] text-white shadow-md' 
                  : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-50'
              }`}>
              {tab}
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20' : 'bg-stone-100 text-stone-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-48 rounded-3xl" />)}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-stone-100 shadow-sm animate-fade-in flex flex-col items-center">
          <div className="w-20 h-20 bg-stone-100 rounded-3xl flex items-center justify-center mb-6">
            <Package size={32} className="text-stone-400" />
          </div>
          <h3 className="text-xl font-black text-[#282C3F] mb-2" style={{ fontFamily: 'var(--font-display)' }}>No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} orders</h3>
          <p className="text-stone-400 text-sm">When customers place orders, they will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map((order, i) => (
            <div key={order.id} className="bg-white rounded-3xl border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              {/* Order Header */}
              <div className="border-b border-stone-100 bg-stone-50/50 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-black text-[#282C3F] uppercase tracking-wider">Order #{order.id.slice(-6)}</span>
                    <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-stone-400">{new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto mt-2 md:mt-0">
                  {order.status === 'pending' && (
                    <button onClick={() => updateStatus(order.id, 'confirmed')} 
                      className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all press-effect shadow-[0_4px_12px_rgba(37,99,235,0.2)]">
                      <CheckCircle2 size={16} /> Accept Order
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button onClick={() => updateStatus(order.id, 'dispatched')} 
                      className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all press-effect shadow-[0_4px_12px_rgba(147,51,234,0.2)]">
                      <Truck size={16} /> Mark Dispatched
                    </button>
                  )}
                  {order.status === 'dispatched' && (
                    <button onClick={() => updateStatus(order.id, 'delivered')} 
                      className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all press-effect shadow-[0_4px_12px_rgba(5,150,105,0.2)]">
                      <Check size={16} /> Mark Delivered
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-5 flex flex-col md:flex-row gap-8">
                {/* Items */}
                <div className="flex-1 space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Order Items</h4>
                  {order.items.map(item => (
                    <div key={item.id} className="flex gap-4 p-3 rounded-2xl border border-stone-100 hover:bg-stone-50 transition-colors">
                      <div className="w-16 h-20 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 shadow-sm">
                        {item.product.images[0] && (
                          <img src={item.product.images[0].url} alt={item.product.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <p className="font-bold text-[#282C3F] text-sm line-clamp-1">{item.product.title}</p>
                        <p className="text-xs font-medium text-stone-500 mt-1">
                          Qty: {item.quantity} {item.size && <span className="mx-1">•</span>} {item.size && `Size: ${item.size}`}
                        </p>
                        <p className="font-black text-[#FF3E6C] mt-1.5">₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Details */}
                <div className="w-full md:w-72 space-y-6 md:border-l border-stone-100 md:pl-8">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Customer</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 font-bold flex items-center justify-center flex-shrink-0">
                        {order.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[#282C3F] text-sm">{order.user.name}</p>
                        <p className="text-xs font-medium text-stone-500 mt-0.5">{order.user.phone}</p>
                      </div>
                    </div>
                  </div>
                  
                  {order.address && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Delivery</h4>
                      <p className="text-sm font-medium text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                        {order.address.line1}<br />
                        {order.address.city} - {order.address.pincode}
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-stone-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Total Amount</p>
                    <p className="text-2xl font-black text-[#282C3F]">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
