'use client';

import { useEffect, useState } from 'react';
import { Bell, ChevronLeft, Package, Tag, Check, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface Notification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const token = useAuthStore(s => s.token);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    if (!token) return;
    setLoading(true);
    apiFetch<Notification[]>('/notifications', { token })
      .then(data => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch notifications:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PATCH', token });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await apiFetch(`/notifications/read-all`, { method: 'PATCH', token });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };
  
  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('order')) return <Package size={22} />;
    if (t.includes('offer') || t.includes('sale')) return <Tag size={22} />;
    return <Info size={22} />;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="bg-white/80 backdrop-blur-md px-4 py-3 border-b border-stone-100 sticky top-0 z-50 shadow-sm flex items-center gap-4">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 text-stone-900 press-effect">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-black text-stone-900 flex-1 tracking-tight" style={{ fontFamily: 'var(--font-display), system-ui' }}>Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button onClick={markAllAsRead} className="p-2 -mr-2 rounded-full hover:bg-stone-100 transition" title="Mark all as read">
            <Check size={20} className="text-stone-600" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-3 max-w-lg mx-auto mt-2">
        {loading ? (
          <div className="text-center p-10 text-stone-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm text-center flex flex-col items-center mt-10">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mb-4">
              <Bell size={32} />
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">No Notifications</h2>
            <p className="text-sm text-stone-500 mb-6">You're all caught up!</p>
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              onClick={() => !n.isRead && markAsRead(n.id)}
              className={`${n.isRead ? 'bg-transparent opacity-70' : 'bg-white border-stone-100 shadow-sm cursor-pointer'} rounded-3xl p-5 border flex gap-4 relative transition`}
            >
              {!n.isRead && <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-rose-500 rounded-full"></div>}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${n.isRead ? 'bg-stone-200 text-stone-600' : 'bg-blue-50 text-blue-600'}`}>
                {getIcon(n.title)}
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">{n.title}</h3>
                <p className="text-xs text-stone-500 mt-1">{n.body}</p>
                <p className="text-[10px] font-semibold text-stone-400 mt-2 uppercase tracking-wide">{timeAgo(n.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
