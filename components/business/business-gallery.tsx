import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type BusinessGalleryImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
};

export function BusinessGallery({ images, fallbackAlt }: { images: BusinessGalleryImage[]; fallbackAlt: string }) {
  if (images.length === 0) return null;

  return (
    <Card>
      <CardHeader><h2 className="text-xl font-black">معرض الصور</h2></CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <div className="relative h-44 overflow-hidden rounded-lg bg-slate-100" key={image.id}>
            <Image alt={image.alt_text ?? fallbackAlt} className="object-cover" fill sizes="(max-width: 768px) 100vw, 33vw" src={image.image_url} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
