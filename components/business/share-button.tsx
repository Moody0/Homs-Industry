"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ShareButtonProps = {
  className?: string;
  inline?: boolean;
  title: string;
  wrapperClassName?: string;
};

export function ShareButton({ className, inline, title, wrapperClassName }: ShareButtonProps) {
  const [message, setMessage] = useState("");

  async function handleShare() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        setMessage("تمت المشاركة");
      } else {
        await navigator.clipboard.writeText(url);
        setMessage("تم نسخ الرابط");
      }
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") {
        setMessage("تعذر نسخ الرابط");
      }
    }

    window.setTimeout(() => setMessage(""), 2200);
  }

  const button = (
    <button
      className={cn("inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/20 px-4 text-sm font-black text-white transition hover:bg-white/10", className)}
      onClick={handleShare}
      type="button"
    >
      {message ? <Check aria-hidden className="size-4" /> : <Share2 aria-hidden className="size-4" />}
      مشاركة
    </button>
  );

  if (inline) return button;

  return (
    <div className={cn("grid gap-2", wrapperClassName)}>
      {button}
      {message ? <span className="text-xs font-bold text-white/75">{message}</span> : null}
    </div>
  );
}
