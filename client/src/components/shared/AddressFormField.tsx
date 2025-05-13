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
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(address.region);
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(address.province);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(address.city);

  // Fetch regions
  const { data: regions, isLoading: regionsLoading } = useQuery({
    queryKey: ['/api/regions'],
  });

  // Map of region codes to region IDs for API calls
  const [regionIdMap, setRegionIdMap] = useState<Record<string, number>>({});
  // Map of province codes to province IDs for API calls
  const [provinceIdMap, setProvinceIdMap] = useState<Record<string, number>>({});
  // Map of city codes to city IDs for API calls
  const [cityIdMap, setCityIdMap] = useState<Record<string, number>>({});

  // Update region ID map when regions data is loaded
  useEffect(() => {
    if (regions) {
      const newMap: Record<string, number> = {};
      regions.forEach((region: any) => {
        newMap[region.code] = region.id;
      });
      setRegionIdMap(newMap);
    }
  }, [regions]);

  // Get the region ID from the code
  const selectedRegionId = selectedRegion ? regionIdMap[selectedRegion] : undefined;

  // Fetch provinces based on selected region ID
  const { data: provinces, isLoading: provincesLoading } = useQuery({
    queryKey: ['/api/provinces', { regionId: selectedRegionId }],
    enabled: !!selectedRegionId,
  });

  // Update province ID map when provinces data is loaded
  useEffect(() => {
    if (provinces) {
      const newMap: Record<string, number> = {};
      provinces.forEach((province: any) => {
        newMap[province.code] = province.id;
      });
      setProvinceIdMap(newMap);
    }
  }, [provinces]);

  // Get the province ID from the code
  const selectedProvinceId = selectedProvince ? provinceIdMap[selectedProvince] : undefined;

  // Fetch cities based on selected province ID
  const { data: cities, isLoading: citiesLoading } = useQuery({
    queryKey: ['/api/cities', { provinceId: selectedProvinceId }],
    enabled: !!selectedProvinceId,
  });

  // Update city ID map when cities data is loaded
  useEffect(() => {
    if (cities) {
      const newMap: Record<string, number> = {};
      cities.forEach((city: any) => {
        newMap[city.code] = city.id;
      });
      setCityIdMap(newMap);
    }
  }, [cities]);

  // Get the city ID from the code
  const selectedCityId = selectedCity ? cityIdMap[selectedCity] : undefined;

  // Fetch barangays based on selected city ID
  const { data: barangays, isLoading: barangaysLoading } = useQuery({
    queryKey: ['/api/barangays', { cityId: selectedCityId }],
    enabled: !!selectedCityId,
  });

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
                    <SelectItem key={region.id} value={region.code}>
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
                    <SelectItem key={province.id} value={province.code}>
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
                    <SelectItem key={city.id} value={city.code}>
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
                    <SelectItem key={barangay.id} value={barangay.code}>
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
