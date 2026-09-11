// Backend API იგივე მისამართზეა: production-ში .NET თვითონ აწვდის Angular-ს,
// dev-ში (ng serve) /api მოთხოვნებს proxy.conf.json გადაამისამართებს 57709-ზე.
export const API_URL = '/api';

// სათადარიგო სურათი — თუ ოთახის ImageUrl არ იმუშავებს
export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80';
