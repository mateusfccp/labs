/**
 * Lightweight Toast Notification Utility
 */

export function showToast(message, type = 'info') {
  const existing = document.getElementById('sim-toast-container');
  const container =
    existing ||
    (() => {
      const el = document.createElement('div');
      el.id = 'sim-toast-container';
      el.className =
        'fixed bottom-4 right-4 left-4 sm:left-auto z-50 flex flex-col items-end gap-2 pointer-events-none';
      document.body.appendChild(el);
      return el;
    })();

  const colorClasses =
    type === 'warn'
      ? 'bg-amber-900 text-amber-50 border-amber-700'
      : 'bg-slate-900 text-white border-slate-700';

  const toast = document.createElement('div');
  toast.className = `toast-enter pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-xl text-xs font-semibold ${colorClasses}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    setTimeout(() => toast.remove(), 220);
  }, 2400);
}
