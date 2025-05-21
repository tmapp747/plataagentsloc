import { useQuery } from "@tanstack/react-query";

// Type definitions for validation data
export interface IDType {
  code: string;
  name: string;
  format?: string;
  validationRegex?: string;
}

export interface PackageType {
  code: string;
  name: string;
  monthlyFee: string;
  setupFee: string;
  features: string[];
}

/**
 * Hook to fetch ID types from validation service
 */
export function useIDTypes() {
  return useQuery({
    queryKey: ['/api/id-types'],
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch business types from validation service
 */
export function useBusinessTypes() {
  return useQuery<string[]>({
    queryKey: ['/api/business-types'],
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch business natures from validation service
 */
export function useBusinessNatures() {
  return useQuery<string[]>({
    queryKey: ['/api/business-natures'],
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch years operating options from validation service
 */
export function useYearsOperating() {
  return useQuery<string[]>({
    queryKey: ['/api/years-operating'],
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch daily transactions options from validation service
 */
export function useDailyTransactions() {
  return useQuery<string[]>({
    queryKey: ['/api/daily-transactions'],
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch package types from validation service
 */
export function usePackageTypes() {
  return useQuery<PackageType[]>({
    queryKey: ['/api/package-types'],
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}