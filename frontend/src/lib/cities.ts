/**
 * Cities with dedicated panchang / rahu kaal / choghadiya pages.
 * Selected and ordered by measured search demand (DataForSEO keyword data, Oct 2026).
 * Coordinates and IANA timezones from GeoNames (CC BY 4.0).
 */
export interface City {
  slug: string;
  name: string;
  region: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export const CITIES: City[] = [
  { slug: "mumbai", name: "Mumbai", region: "Maharashtra", country: "India", countryCode: "IN", latitude: 19.0728, longitude: 72.8826, timezone: "Asia/Kolkata" },
  { slug: "delhi", name: "Delhi", region: "Delhi", country: "India", countryCode: "IN", latitude: 28.6519, longitude: 77.2315, timezone: "Asia/Kolkata" },
  { slug: "bengaluru", name: "Bengaluru", region: "Karnataka", country: "India", countryCode: "IN", latitude: 12.9719, longitude: 77.5937, timezone: "Asia/Kolkata" },
  { slug: "pune", name: "Pune", region: "Maharashtra", country: "India", countryCode: "IN", latitude: 18.5196, longitude: 73.8554, timezone: "Asia/Kolkata" },
  { slug: "ahmedabad", name: "Ahmedabad", region: "Gujarat", country: "India", countryCode: "IN", latitude: 23.0258, longitude: 72.5873, timezone: "Asia/Kolkata" },
  { slug: "jaipur", name: "Jaipur", region: "Rajasthan", country: "India", countryCode: "IN", latitude: 26.9196, longitude: 75.7878, timezone: "Asia/Kolkata" },
  { slug: "kolkata", name: "Kolkata", region: "West Bengal", country: "India", countryCode: "IN", latitude: 22.5626, longitude: 88.363, timezone: "Asia/Kolkata" },
  { slug: "surat", name: "Surat", region: "Gujarat", country: "India", countryCode: "IN", latitude: 21.1959, longitude: 72.8302, timezone: "Asia/Kolkata" },
  { slug: "hyderabad", name: "Hyderabad", region: "Telangana", country: "India", countryCode: "IN", latitude: 17.384, longitude: 78.4564, timezone: "Asia/Kolkata" },
  { slug: "gurugram", name: "Gurugram", region: "Haryana", country: "India", countryCode: "IN", latitude: 28.4601, longitude: 77.0263, timezone: "Asia/Kolkata" },
  { slug: "noida", name: "Noida", region: "Uttar Pradesh", country: "India", countryCode: "IN", latitude: 28.58, longitude: 77.33, timezone: "Asia/Kolkata" },
  { slug: "lucknow", name: "Lucknow", region: "Uttar Pradesh", country: "India", countryCode: "IN", latitude: 26.8393, longitude: 80.9231, timezone: "Asia/Kolkata" },
  { slug: "vadodara", name: "Vadodara", region: "Gujarat", country: "India", countryCode: "IN", latitude: 22.2994, longitude: 73.2081, timezone: "Asia/Kolkata" },
  { slug: "indore", name: "Indore", region: "Madhya Pradesh", country: "India", countryCode: "IN", latitude: 22.7179, longitude: 75.8333, timezone: "Asia/Kolkata" },
  { slug: "ludhiana", name: "Ludhiana", region: "Punjab", country: "India", countryCode: "IN", latitude: 30.912, longitude: 75.8538, timezone: "Asia/Kolkata" },
  { slug: "jammu", name: "Jammu", region: "Jammu and Kashmir", country: "India", countryCode: "IN", latitude: 32.7353, longitude: 74.8617, timezone: "Asia/Kolkata" },
  { slug: "jodhpur", name: "Jodhpur", region: "Rajasthan", country: "India", countryCode: "IN", latitude: 26.2684, longitude: 73.0059, timezone: "Asia/Kolkata" },
  { slug: "thane", name: "Thane", region: "Maharashtra", country: "India", countryCode: "IN", latitude: 19.197, longitude: 72.9635, timezone: "Asia/Kolkata" },
  { slug: "ghaziabad", name: "Ghaziabad", region: "Uttar Pradesh", country: "India", countryCode: "IN", latitude: 28.6654, longitude: 77.4391, timezone: "Asia/Kolkata" },
  { slug: "chandigarh", name: "Chandigarh", region: "Chandigarh", country: "India", countryCode: "IN", latitude: 30.7363, longitude: 76.7884, timezone: "Asia/Kolkata" },
  { slug: "nagpur", name: "Nagpur", region: "Maharashtra", country: "India", countryCode: "IN", latitude: 21.1463, longitude: 79.0849, timezone: "Asia/Kolkata" },
  { slug: "nashik", name: "Nashik", region: "Maharashtra", country: "India", countryCode: "IN", latitude: 19.9973, longitude: 73.791, timezone: "Asia/Kolkata" },
  { slug: "bhopal", name: "Bhopal", region: "Madhya Pradesh", country: "India", countryCode: "IN", latitude: 23.2547, longitude: 77.4029, timezone: "Asia/Kolkata" },
  { slug: "rajkot", name: "Rajkot", region: "Gujarat", country: "India", countryCode: "IN", latitude: 22.2916, longitude: 70.7932, timezone: "Asia/Kolkata" },
  { slug: "patna", name: "Patna", region: "Bihar", country: "India", countryCode: "IN", latitude: 25.5941, longitude: 85.1356, timezone: "Asia/Kolkata" },
  { slug: "chennai", name: "Chennai", region: "Tamil Nadu", country: "India", countryCode: "IN", latitude: 13.0878, longitude: 80.2785, timezone: "Asia/Kolkata" },
  { slug: "faridabad", name: "Faridabad", region: "Haryana", country: "India", countryCode: "IN", latitude: 28.4112, longitude: 77.3132, timezone: "Asia/Kolkata" },
  { slug: "kanpur", name: "Kanpur", region: "Uttar Pradesh", country: "India", countryCode: "IN", latitude: 26.4652, longitude: 80.3498, timezone: "Asia/Kolkata" },
  { slug: "udaipur", name: "Udaipur", region: "Rajasthan", country: "India", countryCode: "IN", latitude: 24.5858, longitude: 73.7135, timezone: "Asia/Kolkata" },
  { slug: "jalandhar", name: "Jalandhar", region: "Punjab", country: "India", countryCode: "IN", latitude: 31.3256, longitude: 75.5792, timezone: "Asia/Kolkata" },
  { slug: "dehradun", name: "Dehradun", region: "Uttarakhand", country: "India", countryCode: "IN", latitude: 30.3244, longitude: 78.0339, timezone: "Asia/Kolkata" },
  { slug: "raipur", name: "Raipur", region: "Chhattisgarh", country: "India", countryCode: "IN", latitude: 21.2333, longitude: 81.6333, timezone: "Asia/Kolkata" },
  { slug: "bikaner", name: "Bikaner", region: "Rajasthan", country: "India", countryCode: "IN", latitude: 28.0176, longitude: 73.3149, timezone: "Asia/Kolkata" },
  { slug: "varanasi", name: "Varanasi", region: "Uttar Pradesh", country: "India", countryCode: "IN", latitude: 25.3167, longitude: 83.0104, timezone: "Asia/Kolkata" },
  { slug: "meerut", name: "Meerut", region: "Uttar Pradesh", country: "India", countryCode: "IN", latitude: 28.98, longitude: 77.7064, timezone: "Asia/Kolkata" },
  { slug: "agra", name: "Agra", region: "Uttar Pradesh", country: "India", countryCode: "IN", latitude: 27.1833, longitude: 78.0167, timezone: "Asia/Kolkata" },
  { slug: "kolhapur", name: "Kolhapur", region: "Maharashtra", country: "India", countryCode: "IN", latitude: 16.6956, longitude: 74.2317, timezone: "Asia/Kolkata" },
  { slug: "guwahati", name: "Guwahati", region: "Assam", country: "India", countryCode: "IN", latitude: 26.1844, longitude: 91.7458, timezone: "Asia/Kolkata" },
  { slug: "shimla", name: "Shimla", region: "Himachal Pradesh", country: "India", countryCode: "IN", latitude: 31.1044, longitude: 77.1666, timezone: "Asia/Kolkata" },
  { slug: "amritsar", name: "Amritsar", region: "Punjab", country: "India", countryCode: "IN", latitude: 31.6223, longitude: 74.8753, timezone: "Asia/Kolkata" },
  { slug: "mysuru", name: "Mysuru", region: "Karnataka", country: "India", countryCode: "IN", latitude: 12.2979, longitude: 76.6393, timezone: "Asia/Kolkata" },
  { slug: "solapur", name: "Solapur", region: "Maharashtra", country: "India", countryCode: "IN", latitude: 17.6715, longitude: 75.9104, timezone: "Asia/Kolkata" },
  { slug: "ranchi", name: "Ranchi", region: "Jharkhand", country: "India", countryCode: "IN", latitude: 23.3432, longitude: 85.3094, timezone: "Asia/Kolkata" },
  { slug: "kota", name: "Kota", region: "Rajasthan", country: "India", countryCode: "IN", latitude: 25.1825, longitude: 75.8391, timezone: "Asia/Kolkata" },
  { slug: "mohali", name: "Mohali", region: "Punjab", country: "India", countryCode: "IN", latitude: 30.68, longitude: 76.7221, timezone: "Asia/Kolkata" },
  { slug: "ajmer", name: "Ajmer", region: "Rajasthan", country: "India", countryCode: "IN", latitude: 26.4521, longitude: 74.6387, timezone: "Asia/Kolkata" },
  { slug: "bhubaneswar", name: "Bhubaneswar", region: "Odisha", country: "India", countryCode: "IN", latitude: 20.2724, longitude: 85.8338, timezone: "Asia/Kolkata" },
  { slug: "jabalpur", name: "Jabalpur", region: "Madhya Pradesh", country: "India", countryCode: "IN", latitude: 23.167, longitude: 79.9501, timezone: "Asia/Kolkata" },
  { slug: "jamnagar", name: "Jamnagar", region: "Gujarat", country: "India", countryCode: "IN", latitude: 22.4729, longitude: 70.0667, timezone: "Asia/Kolkata" },
  { slug: "panchkula", name: "Panchkula", region: "Haryana", country: "India", countryCode: "IN", latitude: 30.6946, longitude: 76.8504, timezone: "Asia/Kolkata" },
  { slug: "gwalior", name: "Gwalior", region: "Madhya Pradesh", country: "India", countryCode: "IN", latitude: 26.2298, longitude: 78.1734, timezone: "Asia/Kolkata" },
  { slug: "prayagraj", name: "Prayagraj", region: "Uttar Pradesh", country: "India", countryCode: "IN", latitude: 25.4448, longitude: 81.8432, timezone: "Asia/Kolkata" },
  { slug: "mathura", name: "Mathura", region: "Uttar Pradesh", country: "India", countryCode: "IN", latitude: 27.5035, longitude: 77.6722, timezone: "Asia/Kolkata" },
  { slug: "bareilly", name: "Bareilly", region: "Uttar Pradesh", country: "India", countryCode: "IN", latitude: 28.3668, longitude: 79.4317, timezone: "Asia/Kolkata" },
  { slug: "gandhinagar", name: "Gandhinagar", region: "Gujarat", country: "India", countryCode: "IN", latitude: 23.2167, longitude: 72.6833, timezone: "Asia/Kolkata" },
  { slug: "visakhapatnam", name: "Visakhapatnam", region: "Andhra Pradesh", country: "India", countryCode: "IN", latitude: 17.7331, longitude: 83.3162, timezone: "Asia/Kolkata" },
  { slug: "vijayawada", name: "Vijayawada", region: "Andhra Pradesh", country: "India", countryCode: "IN", latitude: 16.5074, longitude: 80.6466, timezone: "Asia/Kolkata" },
  { slug: "coimbatore", name: "Coimbatore", region: "Tamil Nadu", country: "India", countryCode: "IN", latitude: 11.0055, longitude: 76.9661, timezone: "Asia/Kolkata" },
  { slug: "madurai", name: "Madurai", region: "Tamil Nadu", country: "India", countryCode: "IN", latitude: 9.919, longitude: 78.1195, timezone: "Asia/Kolkata" },
  { slug: "kochi", name: "Kochi", region: "Kerala", country: "India", countryCode: "IN", latitude: 9.9399, longitude: 76.2602, timezone: "Asia/Kolkata" },
  { slug: "thiruvananthapuram", name: "Thiruvananthapuram", region: "Kerala", country: "India", countryCode: "IN", latitude: 8.4855, longitude: 76.9492, timezone: "Asia/Kolkata" },
  { slug: "ujjain", name: "Ujjain", region: "Madhya Pradesh", country: "India", countryCode: "IN", latitude: 23.1824, longitude: 75.7764, timezone: "Asia/Kolkata" },
  { slug: "haridwar", name: "Haridwar", region: "Uttarakhand", country: "India", countryCode: "IN", latitude: 29.9479, longitude: 78.1603, timezone: "Asia/Kolkata" },
  { slug: "dallas", name: "Dallas", region: "Texas", country: "United States", countryCode: "US", latitude: 32.7831, longitude: -96.8067, timezone: "America/Chicago" },
  { slug: "toronto", name: "Toronto", region: "Ontario", country: "Canada", countryCode: "CA", latitude: 43.7064, longitude: -79.3986, timezone: "America/Toronto" },
  { slug: "atlanta", name: "Atlanta", region: "Georgia", country: "United States", countryCode: "US", latitude: 33.749, longitude: -84.388, timezone: "America/New_York" },
  { slug: "san-jose", name: "San Jose", region: "California", country: "United States", countryCode: "US", latitude: 37.3394, longitude: -121.895, timezone: "America/Los_Angeles" },
  { slug: "edison", name: "Edison, New Jersey", region: "New Jersey", country: "United States", countryCode: "US", latitude: 40.5187, longitude: -74.4121, timezone: "America/New_York" },
  { slug: "seattle", name: "Seattle", region: "Washington", country: "United States", countryCode: "US", latitude: 47.6062, longitude: -122.3321, timezone: "America/Los_Angeles" },
  { slug: "chicago", name: "Chicago", region: "Illinois", country: "United States", countryCode: "US", latitude: 41.85, longitude: -87.65, timezone: "America/Chicago" },
  { slug: "austin", name: "Austin", region: "Texas", country: "United States", countryCode: "US", latitude: 30.2672, longitude: -97.7431, timezone: "America/Chicago" },
  { slug: "houston", name: "Houston", region: "Texas", country: "United States", countryCode: "US", latitude: 29.7633, longitude: -95.3633, timezone: "America/Chicago" },
  { slug: "boston", name: "Boston", region: "Massachusetts", country: "United States", countryCode: "US", latitude: 42.3584, longitude: -71.0598, timezone: "America/New_York" },
  { slug: "los-angeles", name: "Los Angeles", region: "California", country: "United States", countryCode: "US", latitude: 34.0522, longitude: -118.2437, timezone: "America/Los_Angeles" },
  { slug: "fremont", name: "Fremont", region: "California", country: "United States", countryCode: "US", latitude: 37.5483, longitude: -121.9886, timezone: "America/Los_Angeles" },
  { slug: "new-york", name: "New York", region: "New York", country: "United States", countryCode: "US", latitude: 40.7143, longitude: -74.006, timezone: "America/New_York" },
  { slug: "london", name: "London", region: "England", country: "United Kingdom", countryCode: "GB", latitude: 51.5085, longitude: -0.1257, timezone: "Europe/London" },
  { slug: "leicester", name: "Leicester", region: "England", country: "United Kingdom", countryCode: "GB", latitude: 52.6386, longitude: -1.1317, timezone: "Europe/London" },
  { slug: "sydney", name: "Sydney", region: "New South Wales", country: "Australia", countryCode: "AU", latitude: -33.8678, longitude: 151.2073, timezone: "Australia/Sydney" },
  { slug: "melbourne", name: "Melbourne", region: "Victoria", country: "Australia", countryCode: "AU", latitude: -37.814, longitude: 144.9633, timezone: "Australia/Melbourne" },
  { slug: "singapore", name: "Singapore", region: "", country: "Singapore", countryCode: "SG", latitude: 1.2897, longitude: 103.8501, timezone: "Asia/Singapore" },
  { slug: "dubai", name: "Dubai", region: "Dubai", country: "United Arab Emirates", countryCode: "AE", latitude: 25.0772, longitude: 55.3093, timezone: "Asia/Dubai" },
];

export function cityBySlug(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}

export const INDIAN_CITIES = CITIES.filter((c) => c.countryCode === "IN");
export const WORLD_CITIES = CITIES.filter((c) => c.countryCode !== "IN");

/** Other cities to link from a city page: same region first, then the largest. */
export function relatedCities(city: City, n = 12): City[] {
  const same = CITIES.filter((c) => c.slug !== city.slug && c.region === city.region);
  const pool = city.countryCode === "IN" ? INDIAN_CITIES : WORLD_CITIES;
  const rest = pool.filter((c) => c.slug !== city.slug && !same.includes(c));
  return [...same, ...rest].slice(0, n);
}
