import { Container } from "@/components/ui/container";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function Loading() {
  return (
    <Container className="grid gap-5 py-10">
      <LoadingSkeleton className="h-36" />
      <div className="grid gap-4 md:grid-cols-3">
        <LoadingSkeleton className="h-32" />
        <LoadingSkeleton className="h-32" />
        <LoadingSkeleton className="h-32" />
      </div>
    </Container>
  );
}
