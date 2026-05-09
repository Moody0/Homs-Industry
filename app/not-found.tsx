import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <Container className="grid min-h-[55vh] place-items-center py-10">
      <EmptyState
        action={<ButtonLink href="/">العودة للرئيسية</ButtonLink>}
        description="الرابط غير موجود أو لم يعد متاحاً."
        title="لم نجد الصفحة"
      />
    </Container>
  );
}
