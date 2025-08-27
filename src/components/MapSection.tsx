import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import GoogleMap from "@/components/GoogleMap";
import { mapLocations } from "@/data/algeria-data";

const MapSection = () => {
  const locations = mapLocations;

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-kufi text-foreground mb-4">
            خريطة الإعلانات
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            تصفح الإعلانات حسب الولايات والمناطق
          </p>
        </div>

        {/* Google Map */}
        <GoogleMap locations={locations} />
      </div>
    </section>
  );
};

export default MapSection;