"use client";

import { LocateFixed, MapPin } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Coordinates = {
  latitude: number;
  longitude: number;
};

const homsCenter: Coordinates = {
  latitude: 34.7324,
  longitude: 36.7137,
};

export function LocationPicker() {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<unknown>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [message, setMessage] = useState("اضغط على الخريطة لتحديد موقع المحل.");

  const setPickedLocation = useCallback((latitude: number, longitude: number) => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current as import("leaflet").Map | null;

    if (!L || !map) return;

    const next = {
      latitude: Number(latitude.toFixed(7)),
      longitude: Number(longitude.toFixed(7)),
    };
    setCoordinates(next);
    setMessage("تم تحديد موقع المحل.");

    if (markerRef.current) {
      (markerRef.current as import("leaflet").CircleMarker).setLatLng([next.latitude, next.longitude]);
    } else {
      markerRef.current = L.circleMarker([next.latitude, next.longitude], {
        color: "#f97316",
        fillColor: "#f97316",
        fillOpacity: 0.9,
        radius: 9,
        weight: 3,
      }).addTo(map);
    }

    map.setView([next.latitude, next.longitude], Math.max(map.getZoom(), 15));
  }, []);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    async function mountMap() {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = await import("leaflet");
      if (cancelled || !mapRef.current || mapInstanceRef.current) return;

      leafletRef.current = L;
      const container = mapRef.current as HTMLDivElement & { _leaflet_id?: number };
      if (container._leaflet_id) {
        container.replaceChildren();
        delete container._leaflet_id;
      }

      const map = L.map(container, { scrollWheelZoom: false }).setView([homsCenter.latitude, homsCenter.longitude], 13);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      map.on("click", (event) => {
        setPickedLocation(event.latlng.lat, event.latlng.lng);
      });

      cleanup = () => {
        map.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      };
    }

    void mountMap();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [setPickedLocation]);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMessage("المتصفح لا يدعم تحديد الموقع.");
      return;
    }

    setMessage("جار تحديد موقعك...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPickedLocation(position.coords.latitude, position.coords.longitude);
      },
      () => setMessage("تعذر الحصول على موقعك. يمكنك الضغط على الخريطة يدوياً."),
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 10000 },
    );
  }

  return (
    <div className="grid gap-3">
      <input name="latitude" type="hidden" value={coordinates?.latitude ?? ""} />
      <input name="longitude" type="hidden" value={coordinates?.longitude ?? ""} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-800">موقع المحل على الخريطة</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{message}</p>
        </div>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-800 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
          type="button"
          onClick={useCurrentLocation}
        >
          <LocateFixed aria-hidden className="size-4" />
          استخدم موقعي الحالي
        </button>
      </div>

      <div className="h-72 overflow-hidden rounded-lg border border-slate-200 bg-slate-100" ref={mapRef} />

      {coordinates ? (
        <p className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
          <MapPin aria-hidden className="size-4" />
          {coordinates.latitude}, {coordinates.longitude}
        </p>
      ) : null}
    </div>
  );
}
