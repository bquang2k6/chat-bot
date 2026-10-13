// Địa chỉ server API
// Khi dev local: dùng proxy của Vite (không cần prefix)
// Khi build production: nếu cần gọi cross-origin, dùng VITE_URL_SERVER
export const API_BASE = import.meta.env.VITE_URL_SERVER
  ? import.meta.env.VITE_URL_SERVER
  : '';
