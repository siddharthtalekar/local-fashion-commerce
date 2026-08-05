'use client';

import type { IntentType } from '@local-fashion/shared-types';
import { API_URL } from '@/lib/api';

export function trackIntent(params: {
  type: IntentType;
  storeId: string;
  productId?: string;
  metadata?: Record<string, unknown>;
}) {
  fetch(`${API_URL}/intents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    keepalive: true,
  }).catch(() => {
    // fire-and-forget
  });
}
