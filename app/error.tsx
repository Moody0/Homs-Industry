"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="grid min-h-[55vh] place-items-center py-10">
      <EmptyState
        action={<Button onClick={reset}>حاول مرة أخرى</Button>}
        description="حدث خطأ غير متوقع أثناء تحميل الصفحة."
        title="تعذر تحميل الصفحة"
      />
    </Container>
  );
}
