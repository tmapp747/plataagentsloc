/**
 * Location Service
 * This service provides location data for the Philippines using an external API
 */

import fetch from 'node-fetch';

const PHIL_API_BASE_URL = 'https://psgc.gitlab.io/api';

interface Region {
  id: number;
  code: string;
  name: string;
}

interface Province {
  id: number;
  regionId: number;
  code: string;
  name: string;
}

interface City {
  id: number;
  provinceId: number;
  code: string;
  name: string;
}

interface Barangay {
  id: number;
  cityId: number;
  code: string;
  name: string;
}

class LocationService {
  private regionsCache: Region[] | null = null;
  private provincesCache: Map<string, Province[]> = new Map();
  private citiesCache: Map<string, City[]> = new Map();
  private barangaysCache: Map<string, Barangay[]> = new Map();

  /**
   * Get all regions from the Philippines
   */
  async getAllRegions(): Promise<Region[]> {
    try {
      // Use cache if available
      if (this.regionsCache) {
        return this.regionsCache;
      }

      // Fetch regions from external API
      const response = await fetch(`${PHIL_API_BASE_URL}/regions`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch regions: ${response.status} ${response.statusText}`);
      }
      
      const regionsData = await response.json() as any[];
      
      // Transform data to match our schema
      const regions: Region[] = regionsData.map((region: any, index: number) => ({
        id: index + 1,
        code: region.code,
        name: region.name
      }));
      
      // Cache the results
      this.regionsCache = regions;
      
      return regions;
    } catch (error) {
      console.error('Error fetching regions:', error);
      throw error;
    }
  }
  
  /**
   * Get provinces by region code
   */
  async getProvincesByRegion(regionId: number): Promise<Province[]> {
    try {
      // Get cached regions to find the region code
      const regions = await this.getAllRegions();
      const region = regions.find(r => r.id === regionId);
      
      if (!region) {
        throw new Error(`Region with ID ${regionId} not found`);
      }
      
      // Use cache if available
      if (this.provincesCache.has(region.code)) {
        return this.provincesCache.get(region.code)!;
      }
      
      // Fetch provinces from external API
      const response = await fetch(`${PHIL_API_BASE_URL}/regions/${region.code}/provinces`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch provinces: ${response.status} ${response.statusText}`);
      }
      
      const provincesData = await response.json() as any[];
      
      // Transform data to match our schema
      const provinces: Province[] = provincesData.map((province: any, index: number) => ({
        id: index + 1,
        regionId: regionId,
        code: province.code,
        name: province.name
      }));
      
      // Cache the results
      this.provincesCache.set(region.code, provinces);
      
      return provinces;
    } catch (error) {
      console.error('Error fetching provinces:', error);
      // Return empty array if the error is related to the region API structure
      if ((error as Error).message.includes('not found') || 
          (error as Error).message.includes('Failed to fetch provinces')) {
        return [];
      }
      throw error;
    }
  }
  
  /**
   * Get cities by province code
   */
  async getCitiesByProvince(provinceId: number): Promise<City[]> {
    try {
      // We need to get the province data first to find its code
      // This requires iterating through all regions to find the province
      const regions = await this.getAllRegions();
      let provinceCode = '';
      let province = null;
      
      // Search for the province in all regions
      for (const region of regions) {
        const provinces = await this.getProvincesByRegion(region.id);
        province = provinces.find(p => p.id === provinceId);
        if (province) {
          provinceCode = province.code;
          break;
        }
      }
      
      if (!provinceCode) {
        throw new Error(`Province with ID ${provinceId} not found`);
      }
      
      // Use cache if available
      if (this.citiesCache.has(provinceCode)) {
        return this.citiesCache.get(provinceCode)!;
      }
      
      // Fetch cities from external API
      const response = await fetch(`${PHIL_API_BASE_URL}/provinces/${provinceCode}/cities-municipalities`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cities: ${response.status} ${response.statusText}`);
      }
      
      const citiesData = await response.json() as any[];
      
      // Transform data to match our schema
      const cities: City[] = citiesData.map((city: any, index: number) => ({
        id: index + 1,
        provinceId: provinceId,
        code: city.code,
        name: city.name
      }));
      
      // Cache the results
      this.citiesCache.set(provinceCode, cities);
      
      return cities;
    } catch (error) {
      console.error('Error fetching cities:', error);
      // Return empty array if the error is related to the province API structure
      if ((error as Error).message.includes('not found') || 
          (error as Error).message.includes('Failed to fetch cities')) {
        return [];
      }
      throw error;
    }
  }
  
  /**
   * Get barangays by city code
   */
  async getBarangaysByCity(cityId: number): Promise<Barangay[]> {
    try {
      // We need to get the city data first to find its code
      // This is a multi-level search through regions, provinces, and cities
      const regions = await this.getAllRegions();
      let cityCode = '';
      
      // Search for the city in all regions and provinces
      for (const region of regions) {
        const provinces = await this.getProvincesByRegion(region.id);
        for (const province of provinces) {
          const cities = await this.getCitiesByProvince(province.id);
          const city = cities.find(c => c.id === cityId);
          if (city) {
            cityCode = city.code;
            break;
          }
        }
        if (cityCode) break;
      }
      
      if (!cityCode) {
        throw new Error(`City with ID ${cityId} not found`);
      }
      
      // Use cache if available
      if (this.barangaysCache.has(cityCode)) {
        return this.barangaysCache.get(cityCode)!;
      }
      
      // Fetch barangays from external API
      const response = await fetch(`${PHIL_API_BASE_URL}/cities-municipalities/${cityCode}/barangays`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch barangays: ${response.status} ${response.statusText}`);
      }
      
      const barangaysData = await response.json();
      
      // Transform data to match our schema
      const barangays: Barangay[] = barangaysData.map((barangay: any, index: number) => ({
        id: index + 1,
        cityId: cityId,
        code: barangay.code,
        name: barangay.name
      }));
      
      // Cache the results
      this.barangaysCache.set(cityCode, barangays);
      
      return barangays;
    } catch (error) {
      console.error('Error fetching barangays:', error);
      // Return empty array if the error is related to the city API structure
      if ((error as Error).message.includes('not found') || 
          (error as Error).message.includes('Failed to fetch barangays')) {
        return [];
      }
      throw error;
    }
  }
}

export const locationService = new LocationService();