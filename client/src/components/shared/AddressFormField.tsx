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
  // State to track selections by code
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(address.region);
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(address.province);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(address.city);

  // State to track IDs for API calls
  const [selectedRegionId, setSelectedRegionId] = useState<number | undefined>();
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | undefined>();
  const [selectedCityId, setSelectedCityId] = useState<number | undefined>();

  // Maps to store relationships between names and IDs
  const [regionNameToIdMap, setRegionNameToIdMap] = useState<Record<string, number>>({});
  const [provinceNameToIdMap, setProvinceNameToIdMap] = useState<Record<string, number>>({});
  const [cityNameToIdMap, setCityNameToIdMap] = useState<Record<string, number>>({});

  // Fetch regions
  const { data: regions, isLoading: regionsLoading } = useQuery({
    queryKey: ['/api/regions'],
  });

  // Build region name to ID mapping when regions data is loaded
  useEffect(() => {
    if (regions && Array.isArray(regions)) {
      const nameToIdMap: Record<string, number> = {};
      regions.forEach((region: any) => {
        nameToIdMap[region.name] = region.id;
      });
      setRegionNameToIdMap(nameToIdMap);
    }
  }, [regions]);

  // Update region selection when value changes externally
  useEffect(() => {
    if (address?.region && address.region !== selectedRegion) {
      setSelectedRegion(address.region);

      // Try to find the region ID from our mapping
      if (regionNameToIdMap[address.region]) {
        setSelectedRegionId(regionNameToIdMap[address.region]);
      }
      // If not in our mapping but regions data is available, look it up
      else if (regions) {
        const region = regions.find((r: any) => r.name === address.region);
        if (region) {
          setSelectedRegionId(region.id);
        }
      }
    }
  }, [address?.region, regions, selectedRegion, regionNameToIdMap]);

  // Fetch provinces based on selected region ID
  const { data: provinces, isLoading: provincesLoading } = useQuery({
    queryKey: ['/api/provinces', selectedRegionId],
    queryFn: async () => {
      if (!selectedRegionId) return [];
      const response = await fetch(`/api/provinces?regionId=${selectedRegionId}`);
      if (!response.ok) throw new Error('Failed to fetch provinces');
      return response.json();
    },
    enabled: !!selectedRegionId,
  });

  // Update province name to ID mapping when provinces data is loaded
  useEffect(() => {
    if (provinces && Array.isArray(provinces)) {
      const nameToIdMap: Record<string, number> = {};
      provinces.forEach((province: any) => {
        nameToIdMap[province.name] = province.id;
      });
      setProvinceNameToIdMap(nameToIdMap);
    }
  }, [provinces]);

    // Update province selection based on external value changes
  useEffect(() => {
    if (address?.province && address.province !== selectedProvince) {
      setSelectedProvince(address.province);
      // If current province is selected, update its ID
    }
  }, [address?.province, provinces, selectedProvince]);

  // Fetch cities based on selected province ID
  const { data: cities, isLoading: citiesLoading } = useQuery({
    queryKey: ['/api/cities', selectedProvinceId],
    queryFn: async () => {
      if (!selectedProvinceId) return [];
      const response = await fetch(`/api/cities?provinceId=${selectedProvinceId}`);
      if (!response.ok) throw new Error('Failed to fetch cities');
      return response.json();
    },
    enabled: !!selectedProvinceId,
  });

  // Update city name to ID mapping when cities data is loaded
  useEffect(() => {
    if (cities && Array.isArray(cities)) {
      const nameToIdMap: Record<string, number> = {};
      cities.forEach((city: any) => {
        nameToIdMap[city.name] = city.id;
      });
      setCityNameToIdMap(nameToIdMap);

      // If current city is selected, update its ID
      if (selectedCity) {
        setSelectedCityId(cityNameToIdMap[selectedCity]);
      }
    }
  }, [cities, selectedCity, cityNameToIdMap]);

  // Update city selection based on external value changes
  useEffect(() => {
    if (address?.city && address.city !== selectedCity) {
      setSelectedCity(address.city);
    }
  }, [address?.city, cities, selectedCity, cityNameToIdMap]);

  // Fetch barangays based on selected city ID
  const { data: barangays, isLoading: barangaysLoading } = useQuery({
    queryKey: ['/api/barangays', selectedCityId],
    queryFn: async () => {
      if (!selectedCityId) return [];
      const response = await fetch(`/api/barangays?cityId=${selectedCityId}`);
      if (!response.ok) throw new Error('Failed to fetch barangays');
      return response.json();
    },
    enabled: !!selectedCityId,
  });

  // Update barangay name to ID mapping when barangays data is loaded
  useEffect(() => {
    if (barangays && Array.isArray(barangays)) {
      const nameToIdMap: Record<string, number> = {};
      barangays.forEach((barangay: any) => {
        nameToIdMap[barangay.name] = barangay.id;
      });
    }
  }, [barangays]);

  // Update barangay selection based on external value changes
  useEffect(() => {
    if (address?.barangay && address.barangay !== selectedCity) {
      setSelectedCity(address.barangay);
    }
  }, [address?.barangay, selectedCity]);

  // Update the address when a selection changes
  const handleAddressChange = (field: keyof Address, value: any) => {
    const updatedAddress = { ...address, [field]: value };

    // Reset dependent fields when parent changes
    if (field === 'region') {
      setSelectedRegion(value);
      updatedAddress.province = undefined;
      updatedAddress.city = undefined;
      updatedAddress.barangay = undefined;
      setSelectedProvince(undefined);
      setSelectedCity(undefined);
    } else if (field === 'province') {
      setSelectedProvince(value);
      updatedAddress.city = undefined;
      updatedAddress.barangay = undefined;
      setSelectedCity(undefined);
    } else if (field === 'city') {
      setSelectedCity(value);
      updatedAddress.barangay = undefined;
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
              value={address.region}
              onValueChange={(value) => handleAddressChange('region', value)}
              required={required}
            >
              <SelectTrigger id="region" className="mt-1">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {regions?.map((region: any) => (
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
              value={address.province}
              onValueChange={(value) => handleAddressChange('province', value)}
              disabled={!selectedRegion}
              required={required}
            >
              <SelectTrigger id="province" className="mt-1">
                <SelectValue placeholder="Select a province" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {provinces?.map((province: any) => (
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
              value={address.city}
              onValueChange={(value) => handleAddressChange('city', value)}
              disabled={!selectedProvince}
              required={required}
            >
              <SelectTrigger id="city" className="mt-1">
                <SelectValue placeholder="Select a city/municipality" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {cities?.map((city: any) => (
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
              value={address.barangay}
              onValueChange={(value) => handleAddressChange('barangay', value)}
              disabled={!selectedCity}
              required={required}
            >
              <SelectTrigger id="barangay" className="mt-1">
                <SelectValue placeholder="Select a barangay" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {barangays?.map((barangay: any) => (
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