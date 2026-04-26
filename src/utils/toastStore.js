/**
 * toastStore.js — Singleton event emitter cho hệ thống thông báo tập trung.
 *
 * Cho phép notify.js (plain JS) gọi toast mà không cần React context.
 * AppToast.jsx subscribe vào store này và render lên màn hình.
 *
 * type: 'success' | 'error'
 */

let listeners = [];

export const toastStore = {
  /** Hiển thị thông báo. */
  show(message, type = "success") {
    const id = Date.now().toString() + Math.random().toString();
    listeners.forEach(fn => fn({ id, message, type }));
  },

  /** Component AppToast gọi hàm này để đăng ký lắng nghe. Trả về unsubscribe. */
  subscribe(fn) {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter(l => l !== fn);
    };
  },
};
