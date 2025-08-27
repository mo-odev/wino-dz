import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export const ImageGallery = ({ images, title }: ImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gradient-subtle flex items-center justify-center rounded-lg">
        <div className="text-center text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <span>لا توجد صورة</span>
        </div>
      </div>
    );
  }

  const getImageUrl = (image: string) => {
    if (!image) return '';
    return image.startsWith('http') 
      ? image 
      : `https://faihlbsxbegfilcxfdry.supabase.co/storage/v1/object/public/images/${image}`;
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-lg">
        <img
          src={getImageUrl(images[currentIndex])}
          alt={`${title} - صورة ${currentIndex + 1}`}
          className="w-full h-96 object-cover"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) {
              fallback.style.display = 'flex';
            }
          }}
        />
        <div className="w-full h-96 bg-gradient-subtle hidden items-center justify-center rounded-lg">
          <div className="text-center text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <span>فشل في تحميل الصورة</span>
          </div>
        </div>

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={prevImage}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={nextImage}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;