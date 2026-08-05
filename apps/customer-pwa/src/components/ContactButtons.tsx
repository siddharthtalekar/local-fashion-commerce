'use client';

import {
  buildDirectionsUrl,
  buildTelUrl,
  buildWhatsAppUrl,
  IntentType,
  type ProductDetailDto,
  type StoreDetailDto,
} from '@local-fashion/shared-types';
import { trackIntent } from '@/lib/intents';

interface ContactButtonsProps {
  store: Pick<StoreDetailDto, 'id' | 'name' | 'phone' | 'whatsapp' | 'latitude' | 'longitude'>;
  product?: Pick<ProductDetailDto, 'id' | 'title'>;
}

export function ContactButtons({ store, product }: ContactButtonsProps) {
  const handleCall = () => {
    trackIntent({ type: IntentType.CALL, storeId: store.id, productId: product?.id });
    window.location.href = buildTelUrl(store.phone);
  };

  const handleWhatsApp = () => {
    trackIntent({ type: IntentType.WHATSAPP, storeId: store.id, productId: product?.id });
    const url = product
      ? buildWhatsAppUrl(store.whatsapp, product.title, store.name)
      : buildWhatsAppUrl(store.whatsapp, 'your products', store.name);
    window.open(url, '_blank');
  };

  const handleDirections = () => {
    trackIntent({ type: IntentType.DIRECTIONS, storeId: store.id, productId: product?.id });
    window.open(buildDirectionsUrl(store.latitude, store.longitude), '_blank');
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={handleCall}
        className="flex items-center justify-center gap-2 py-3 px-4 bg-neutral-900 text-white font-semibold rounded-xl active:scale-95 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
        </svg>
        Call
      </button>
      
      <button
        onClick={handleWhatsApp}
        className="flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white font-semibold rounded-xl active:scale-95 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M12.023 2C6.47 2 1.954 6.516 1.954 12.069c0 1.77.464 3.494 1.34 5.01L1.933 22l5.068-1.33A9.972 9.972 0 0012.023 22c5.552 0 10.068-4.516 10.068-10.069C22.091 6.378 17.575 2 12.023 2zm-4.75 6.012c-.22-.054-.429-.026-.642.026a1.442 1.442 0 00-.916 1.35c0 .765.418 1.942 1.745 3.513 1.328 1.572 3.129 2.502 4.417 2.656 1.288.154 2.11-.115 2.585-.568.475-.453.642-1.07.642-1.07l-1.924-.954c-.165-.082-.363-.035-.494.12l-.994 1.201a.343.343 0 01-.413.094c-.664-.326-1.746-.92-2.315-1.751a.342.342 0 01.073-.424l.872-1.057c.131-.157.108-.387-.058-.469L7.915 8.012z" clipRule="evenodd" />
        </svg>
        Chat
      </button>

      <button
        onClick={handleDirections}
        className="col-span-2 flex items-center justify-center gap-2 py-3 px-4 bg-neutral-100 text-neutral-800 font-semibold rounded-xl active:bg-neutral-200 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.53 5.485 5.485 0 00.065.029l.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
        </svg>
        Get directions
      </button>
    </div>
  );
}
