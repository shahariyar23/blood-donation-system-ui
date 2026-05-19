/**
 * Transforms Nominatim API response to login location format
 */
export interface NominatimResponse {
  place_id?: number;
  licence?: string;
  osm_type?: string;
  osm_id?: number;
  lat: string | number;
  lon: string | number;
  class?: string;
  type?: string;
  place_rank?: number;
  importance?: number;
  addresstype?: string;
  name?: string;
  display_name: string;
  address?: {
    road?: string;
    quarter?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state_district?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
    [key: string]: string | undefined;
  };
  boundingbox?: string[];
}

export interface LoginLocationFormat {
  displayName: string;
  road: string;
  quarter: string;
  suburb: string;
  city: string;
  county: string;
  state_district: string;
  state: string;
  postcode: string;
  country: string;
  country_code: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const transformLocationToLoginFormat = (
  nominatimData: NominatimResponse,
  latitude?: number | null,
  longitude?: number | null
): LoginLocationFormat => {
  const address = nominatimData.address || {};
  const lat = latitude ?? parseFloat(nominatimData.lat as string);
  const lng = longitude ?? parseFloat(nominatimData.lon as string);

  return {
    displayName: nominatimData.display_name || "",
    road: address.road || "",
    quarter: address.quarter || "",
    suburb: address.suburb || "",
    city: address.city || address.town || address.village || "",
    county: address.county || "",
    state_district: address.state_district || "",
    state: address.state || "",
    postcode: address.postcode || "",
    country: address.country || "",
    country_code: (address.country_code || "").toUpperCase(),
    coordinates: {
      lat: isNaN(lat) ? 0 : lat,
      lng: isNaN(lng) ? 0 : lng,
    },
  };
};
