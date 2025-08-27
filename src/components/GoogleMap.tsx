import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

interface MapLocation {
  id: number;
  name: string;
  count: number;
  lat: number;
  lng: number;
  wilayaCode: string;
}

interface GoogleMapProps {
  locations: MapLocation[];
  center?: { lat: number; lng: number };
  zoom?: number;
  showApiKeyInput?: boolean;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ 
  locations, 
  center = { lat: 28.0339, lng: 1.6596 }, // Algeria center
  zoom = 6,
  showApiKeyInput = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');

  const initializeMap = async (key: string) => {
    if (!mapRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const loader = new Loader({
        apiKey: key,
        version: "weekly",
        libraries: ["places"]
      });

      await loader.load();

      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Add markers for each location
      locations.forEach((location) => {
        const marker = new window.google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map,
          title: location.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#0ea5e9',
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        // Create info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-family: Arial, sans-serif; direction: rtl;">
              <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">${location.name}</h3>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">${location.count} إعلان نشط</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });

      setIsLoaded(true);
    } catch (err) {
      setError('فشل في تحميل الخريطة. تأكد من صحة مفتاح API');
      console.error('Map loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMap = () => {
    if (apiKey.trim()) {
      initializeMap(apiKey.trim());
    }
  };

  if (showApiKeyInput && !isLoaded) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-right">خريطة الإعلانات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-2">
              أدخل مفتاح Google Maps API الخاص بك لعرض الخريطة التفاعلية
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              يمكنك الحصول على المفتاح من <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a>
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="أدخل مفتاح Google Maps API"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="text-right"
              dir="ltr"
            />
            <Button 
              onClick={handleLoadMap} 
              disabled={!apiKey.trim() || loading}
              className="min-w-[100px]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تحميل الخريطة'}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-destructive text-right">{error}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-[500px] rounded-lg border shadow-medium"
          style={{ minHeight: '500px' }}
        />
        
        {loading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">جاري تحميل الخريطة...</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary mb-1">{locations.length}</div>
            <div className="text-sm text-muted-foreground">موقع نشط</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success mb-1">
              {locations.reduce((sum, loc) => sum + loc.count, 0)}
            </div>
            <div className="text-sm text-muted-foreground">إعلان نشط</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning mb-1">
              {Math.max(...locations.map(loc => loc.count))}
            </div>
            <div className="text-sm text-muted-foreground">أعلى منطقة</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent mb-1">24/7</div>
            <div className="text-sm text-muted-foreground">خدمة مستمرة</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GoogleMap;