import axios from 'axios';

// Point this at your backend (see ../backend). Use your machine's LAN IP
// when testing on a physical device — "localhost" won't resolve from the phone.
export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api',
});

// TODO: attach JWT access token from auth store to every request,
// and wire a refresh-token interceptor once auth.service.ts is implemented.
