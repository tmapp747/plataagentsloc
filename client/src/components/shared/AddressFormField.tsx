import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Address } from "@shared/schema";

interface AddressFormFieldProps {
  address?: Partial<Address>;
  onChange: (address: Partial<Address>) => void;
  showLatLong?: boolean;
  required?: boolean;
}

const AddressFormField = ({ 
  address = {}, 
  onChange,
  showLatLong = false,
  required = true,
}: AddressFormFieldProps) => {
  // State to track selected location names and IDs
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(address.region);
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(address.province);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(address.city);
  const [selectedBarangay, setSelectedBarangay] = useState<string | undefined>(address.barangay);
  
  const [selectedRegionId, setSelectedRegionId] = useState<number | undefined>();
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | undefined>();
  const [selectedCityId, setSelectedCityId] = useState<number | undefined>();

  // Fetch regions
  const { data: regions, isLoading: regionsLoading } = useQuery({
    queryKey: ['/api/regions'],
  });

  // Update region selection when external value changes
  useEffect(() => {
    if (address?.region && address.region !== selectedRegion) {
      setSelectedRegion(address.region);
      
      // Find the region ID from the regions data
      if (regions && Array.isArray(regions)) {
        const region = regions.find((r: any) => r.name === address.region);
        if (region) {
          setSelectedRegionId(region.id);
        }
      }
    }
  }, [address?.region, regions, selectedRegion]);

  // Fetch provinces based on selected region ID
  const { data: provinces, isLoading: provincesLoading } = useQuery({
    queryKey: ['/api/provinces', { regionId: selectedRegionId }],
    enabled: !!selectedRegionId,
    queryFn: async ({ queryKey }) => {
      const [_path, params] = queryKey;
      const response = await fetch(`/api/provinces?regionId=${params.regionId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  // Update province selection when external value changes
  useEffect(() => {
    if (address?.province && address.province !== selectedProvince) {
      setSelectedProvince(address.province);
      
      // Find the province ID from the provinces data
      if (provinces && Array.isArray(provinces)) {
        const province = provinces.find((p: any) => p.name === address.province);
        if (province) {
          setSelectedProvinceId(province.id);
        }
      }
    }
  }, [address?.province, provinces, selectedProvince]);

  // Fetch cities based on selected province ID
  const { data: cities, isLoading: citiesLoading } = useQuery({
    queryKey: ['/api/cities', { provinceId: selectedProvinceId }],
    enabled: !!selectedProvinceId,
    queryFn: async ({ queryKey }) => {
      const [_path, params] = queryKey;
      const response = await fetch(`/api/cities?provinceId=${params.provinceId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  // Update city selection when external value changes
  useEffect(() => {
    if (address?.city && address.city !== selectedCity) {
      setSelectedCity(address.city);
      
      // Find the city ID from the cities data
      if (cities && Array.isArray(cities)) {
        const city = cities.find((c: any) => c.name === address.city);
        if (city) {
          setSelectedCityId(city.id);
        }
      }
    }
  }, [address?.city, cities, selectedCity]);

  // Fetch barangays based on selected city ID
  const { data: barangays, isLoading: barangaysLoading } = useQuery({
    queryKey: ['/api/barangays', { cityId: selectedCityId }],
    enabled: !!selectedCityId,
    queryFn: async ({ queryKey }) => {
      const [_path, params] = queryKey;
      const response = await fetch(`/api/barangays?cityId=${params.cityId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  // Update barangay selection when external value changes
  useEffect(() => {
    if (address?.barangay && address.barangay !== selectedBarangay) {
      setSelectedBarangay(address.barangay);
    }
  }, [address?.barangay, selectedBarangay]);

  // Handle changes to address fields
  const handleAddressChange = (field: keyof Address, value: any) => {
    const updatedAddress = { ...address, [field]: value };

    // Reset dependent fields when parent changes
    if (field === 'region') {
      setSelectedRegion(value);
      
      // Find the region ID
      if (regions && Array.isArray(regions)) {
        const region = regions.find((r: any) => r.name === value);
        if (region) {
          setSelectedRegionId(region.id);
        }
      }
      
      // Clear dependent fields
      updatedAddress.province = undefined;
      updatedAddress.city = undefined;
      updatedAddress.barangay = undefined;
      
      setSelectedProvince(undefined);
      setSelectedProvinceId(undefined);
      setSelectedCity(undefined);
      setSelectedCityId(undefined);
      setSelectedBarangay(undefined);
    } 
    else if (field === 'province') {
      setSelectedProvince(value);
      
      // Find the province ID
      if (provinces && Array.isArray(provinces)) {
        const province = provinces.find((p: any) => p.name === value);
        if (province) {
          setSelectedProvinceId(province.id);
        }
      }
      
      // Clear dependent fields
      updatedAddress.city = undefined;
      updatedAddress.barangay = undefined;
      
      setSelectedCity(undefined);
      setSelectedCityId(undefined);
      setSelectedBarangay(undefined);
    } 
    else if (field === 'city') {
      setSelectedCity(value);
      
      // Find the city ID
      if (cities && Array.isArray(cities)) {
        const city = cities.find((c: any) => c.name === value);
        if (city) {
          setSelectedCityId(city.id);
        }
      }
      
      // Clear dependent fields
      updatedAddress.barangay = undefined;
      setSelectedBarangay(undefined);
    }
    else if (field === 'barangay') {
      setSelectedBarangay(value);
    }

    onChange(updatedAddress);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="region">Region {required && '*'}</Label>
          {regionsLoading ? (
            <Skeleton className="h-10 w-full mt-1" />
          ) : (
            <Select
              value={selectedRegion}
              onValueChange={(value) => handleAddressChange('region', value)}
              required={required}
            >
              <SelectTrigger id="region" className="mt-1">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Array.isArray(regions) && regions.map((region: any) => (
                    <SelectItem key={region.id} value={region.name}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>
        <div>
          <Label htmlFor="province">Province {required && '*'}</Label>
          {selectedRegion && provincesLoading ? (
            <Skeleton className="h-10 w-full mt-1" />
          ) : (
            <Select
              value={selectedProvince}
              onValueChange={(value) => handleAddressChange('province', value)}
              disabled={!selectedRegion}
              required={required}
            >
              <SelectTrigger id="province" className="mt-1">
                <SelectValue placeholder="Select a province" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Array.isArray(provinces) && provinces.map((province: any) => (
                    <SelectItem key={province.id} value={province.name}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="city">City/Municipality {required && '*'}</Label>
          {selectedProvince && citiesLoading ? (
            <Skeleton className="h-10 w-full mt-1" />
          ) : (
            <Select
              value={selectedCity}
              onValueChange={(value) => handleAddressChange('city', value)}
              disabled={!selectedProvince}
              required={required}
            >
              <SelectTrigger id="city" className="mt-1">
                <SelectValue placeholder="Select a city/municipality" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Array.isArray(cities) && cities.map((city: any) => (
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>
        <div>
          <Label htmlFor="barangay">Barangay {required && '*'}</Label>
          {selectedCity && barangaysLoading ? (
            <Skeleton className="h-10 w-full mt-1" />
          ) : (
            <Select
              value={selectedBarangay}
              onValueChange={(value) => handleAddressChange('barangay', value)}
              disabled={!selectedCity}
              required={required}
            >
              <SelectTrigger id="barangay" className="mt-1">
                <SelectValue placeholder="Select a barangay" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Array.isArray(barangays) && barangays.map((barangay: any) => (
                    <SelectItem key={barangay.id} value={barangay.name}>
                      {barangay.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="streetAddress">Street Address {required && '*'}</Label>
        <Input
          type="text"
          id="streetAddress"
          value={address.streetAddress || ''}
          onChange={(e) => handleAddressChange('streetAddress', e.target.value)}
          className="mt-1"
          required={required}
        />
      </div>

      <div>
        <Label htmlFor="landmark">Nearest Landmark</Label>
        <Input
          type="text"
          id="landmark"
          value={address.landmark || ''}
          onChange={(e) => handleAddressChange('landmark', e.target.value)}
          className="mt-1"
        />
      </div>

      {showLatLong && (
        <div className="flex space-x-4">
          <div className="flex-1">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              type="text"
              id="latitude"
              value={address.latitude?.toString() || ''}
              onChange={(e) => handleAddressChange('latitude', parseFloat(e.target.value) || undefined)}
              className="mt-1"
              readOnly
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              type="text"
              id="longitude"
              value={address.longitude?.toString() || ''}
              onChange={(e) => handleAddressChange('longitude', parseFloat(e.target.value) || undefined)}
              className="mt-1"
              readOnly
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressFormField;