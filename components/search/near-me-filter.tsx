"use client";

import { LocateFixed } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function NearMeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("");

  function locate() {
    if (!navigator.geolocation) {
      setStatus("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    setStatus("جار تحديد الموقع...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("near", "1");
        params.set("sort", "distance");
        params.set("lat", position.coords.latitude.toFixed(6));
        params.set("lng", position.coords.longitude.toFixed(6));
        if (!params.get("maxDistance")) params.set("maxDistance", "25");
        setStatus("");
        router.push(`/search?${params.toString()}`);
      },
      () => setStatus("تعذر الحصول على الموقع"),
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 10000 },
    );
  }

  return (
    <div className="grid gap-1">
      <button
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-800 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
        type="button"
        onClick={locate}
      >
        <LocateFixed aria-hidden className="size-4" />
        قريب مني
      </button>
      {status ? <p className="text-xs font-bold text-slate-500">{status}</p> : null}
    </div>
  );
}
