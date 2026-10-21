// Post-payment trip status (email-OTP gated).
// Mirrors the public v2 iframe endpoints under /api/v2/iframe/<uuid>/track/.
// No invoice call: billing is handled by the office, never by the rider.
import axios from 'axios';
import { API_URL, ATS } from '../config';

const base = `${API_URL}/api/v2/iframe/${ATS.iframeUuid}/track`;

export const requestTrackCode = (ref) =>
  axios.post(`${base}/request/`, { ref }).then((r) => r.data);

export const verifyTrackCode = (ref, code) =>
  axios.post(`${base}/verify/`, { ref, code }).then((r) => r.data);

// -> { trips: [{ status, date, time, pick_up_address, drop_off_address }] }
export const getTrackStatus = (ref, token) =>
  // Token in a header, not the query string — it's a bearer secret and the
  // query string ends up in server access logs and browser history.
  axios.get(`${base}/`, { params: { ref }, headers: { 'X-Track-Token': token } })
    .then((r) => r.data);
