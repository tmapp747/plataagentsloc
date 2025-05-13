declare module 'leaflet' {
  export interface LeafletMouseEvent {
    latlng: LatLng;
  }
  
  export interface LatLng {
    lat: number;
    lng: number;
  }
  
  export interface LeafletEventHandlerFn {
    (e: any): void;
  }
  
  export class Map {
    setView(center: [number, number], zoom: number): this;
    on(type: string, fn: LeafletEventHandlerFn): this;
    remove(): void;
    fitBounds(bounds: LatLngBounds, options?: any): this;
  }
  
  export class LatLngBounds {
    constructor(southWest: LatLng, northEast: LatLng);
    extend(latlng: LatLng): this;
  }
  
  export function map(element: HTMLElement, options?: any): Map;
  
  export function tileLayer(urlTemplate: string, options?: any): any;
  
  export function marker(latlng: [number, number] | LatLng, options?: any): Marker;
  
  export class Marker {
    setLatLng(latlng: [number, number] | LatLng): this;
    getLatLng(): LatLng;
    addTo(map: Map): this;
    on(type: string, fn: LeafletEventHandlerFn): this;
    bindPopup(content: string | HTMLElement): this;
    remove(): this;
  }
  
  export function latLngBounds(southWest: LatLng, northEast: LatLng): LatLngBounds;
  
  export function icon(options: any): any;
  
  export default {
    map,
    tileLayer,
    marker,
    latLngBounds,
    icon,
    LatLngBounds
  };
}