type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

type Listener = (toasts: ToastItem[]) => void;

class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l([...this.toasts]));
  }

  add(message: string, type: ToastType) {
    const id = `${Date.now()}-${Math.random()}`;
    this.toasts = [{ id, message, type }, ...this.toasts].slice(0, 5);
    this.notify();
    setTimeout(() => this.remove(id), 4000);
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }
}

export const toastManager = new ToastManager();

export const toast = {
  success: (message: string) => toastManager.add(message, 'success'),
  error: (message: string) => toastManager.add(message, 'error'),
  info: (message: string) => toastManager.add(message, 'info'),
  warning: (message: string) => toastManager.add(message, 'warning'),
};
