"use client";

import { useEffect, useRef } from "react";

type MapBusiness = {
  id: string;
  name: string;
  slug: string;
  area: string;
  latitude: number | null;
  longitude: number | null;
  distance_km?: number | null;
};

type BusinessMapProps = {
  businesses: MapBusiness[];
  userLocation?: { lat: number; lng: number } | null;
};

export function BusinessMap({ businesses, userLocation }: BusinessMapProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    async function mountMap() {
      if (!ref.current) return;
      const L = await import("leaflet");
      const points = businesses.filter(
        (business): business is MapBusiness & { latitude: number; longitude: number } =>
          business.latitude !== null && business.longitude !== null,
      );

      if (!points.length && !userLocation) return;

      const center = userLocation ?? { lat: points[0]?.latitude ?? 34.732, lng: points[0]?.longitude ?? 36.713 };
      const map = L.map(ref.current, { scrollWheelZoom: false }).setView([center.lat, center.lng], userLocation ? 13 : 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      const bounds: [number, number][] = [];
      if (userLocation) {
        L.circleMarker([userLocation.lat, userLocation.lng], {
          color: "#f97316",
          fillColor: "#f97316",
          fillOpacity: 0.9,
          radius: 8,
        }).addTo(map).bindPopup("موقعك الحالي");
        bounds.push([userLocation.lat, userLocation.lng]);
      }

      points.forEach((business) => {
        const marker = L.circleMarker([business.latitude, business.longitude], {
          color: "#0f172a",
          fillColor: "#0f172a",
          fillOpacity: 0.85,
          radius: 7,
        }).addTo(map);
        marker.bindPopup(`<a href="/businesses/${business.slug}">${business.name}</a><br>${business.area}`);
        bounds.push([business.latitude, business.longitude]);
      });

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [24, 24] });
      }

      cleanup = () => map.remove();
    }

    void mountMap();
    return () => cleanup?.();
  }, [businesses, userLocation]);

  return <div className="h-80 overflow-hidden rounded-lg border border-slate-200 bg-slate-100" ref={ref} />;
}
