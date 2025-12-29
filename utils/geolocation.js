// utils/geolocation.js
import axios from "axios";

export async function getGeo(ip) {
  try {
    const res = await axios.get(`https://ipapi.co/${ip}/json/`);
    const data = res.data;
    return {
      country: data.country_name || null,
      city: data.city || null,
      isp: data.org || null,
      lat: data.latitude || null,
      lon: data.longitude || null
    };
  } catch {
    return {
      country: null,
      city: null,
      isp: null,
      lat: null,
      lon: null
    };
  }
}