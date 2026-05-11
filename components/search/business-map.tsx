"use client";

import { useEffect, useRef } from "react";

type MapBusiness = {
  address?: string | null;
  category?: { name: string; slug: string } | null;
  id: string;
  name: string;
  slug: string;
  area: string;
  latitude: number | null;
  longitude: number | null;
  phone?: string | null;
  rating_average?: number | null;
  reviews_count?: number | null;
  subcategory?: { name: string; slug: string } | null;
  distance_km?: number | null;
};

type BusinessMapProps = {
  businesses: MapBusiness[];
  userLocation?: { lat: number; lng: number } | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDistance(value: number | null | undefined) {
  if (value === null || value === undefined) return null;
  return value < 1 ? `${Math.round(value * 1000)} م` : `${value.toFixed(1)} كم`;
}

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
        const distance = formatDistance(business.distance_km);
        marker.bindTooltip(`<span class="business-map-tooltip__text" dir="rtl">${escapeHtml(business.name)}</span>`, {
          className: "business-map-tooltip",
          direction: "top",
          offset: [0, -10],
          opacity: 1,
        });
        marker.bindPopup(`
          <div class="business-map-popup" dir="rtl">
            <strong class="business-map-popup__title">${escapeHtml(business.name)}</strong>
            <span class="business-map-popup__meta">${escapeHtml(business.subcategory?.name ?? business.category?.name ?? "خدمات صناعية")}</span>
            <span class="business-map-popup__line">حمص - ${escapeHtml(business.area)}</span>
            ${business.address ? `<span class="business-map-popup__line">${escapeHtml(business.address)}</span>` : ""}
            <div class="business-map-popup__facts">
              ${business.phone ? `<a href="tel:${escapeHtml(business.phone)}">اتصال: ${escapeHtml(business.phone)}</a>` : ""}
              ${business.rating_average !== undefined && business.rating_average !== null ? `<span>تقييم ${Number(business.rating_average).toFixed(1)} (${Number(business.reviews_count ?? 0)} مراجعة)</span>` : ""}
              ${distance ? `<span>يبعد ${escapeHtml(distance)}</span>` : ""}
            </div>
            <div class="business-map-popup__actions">
              <a href="/businesses/${encodeURIComponent(business.slug)}">عرض التفاصيل</a>
              ${business.phone ? `<a href="tel:${escapeHtml(business.phone)}">اتصال</a>` : ""}
            </div>
          </div>
        `);
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

  return <div className="h-80 overflow-hidden rounded-lg border border-slate-200 bg-slate-100" dir="ltr" ref={ref} />;
}
