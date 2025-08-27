import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Calendar,
  Heart,
  Share2,
  Flag,
  Phone,
  Mail,
  MessageSquare,
  User,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useItem } from "@/hooks/useItems";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs, Keyboard } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


interface UserProfile {
  full_name: string | null;
  phone: string | null;
}

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isFavorite, setIsFavorite] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const { item, loading, error } = useItem(id || "");

  // Slider state
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderLoading, setSliderLoading] = useState(true);

  // Swiper refs
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const mainSwiperRef = useRef<SwiperClass | null>(null);

  const [reportOpen, setReportOpen] = useState(false);
const [reportReason, setReportReason] = useState("محتوى مزيف أو مخالف");
const [reportLoading, setReportLoading] = useState(false);
const [reportSuccess, setReportSuccess] = useState(false);;

  useEffect(() => {
    if (item?.user_id) fetchUserProfile(item.user_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  const fetchUserProfile = async (userId: string) => {
    try {
      setProfileLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      toast({
        title: "خطأ",
        description: "تعذر تحميل معلومات المستخدم",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // helper for supabase getPublicUrl with fallbacks
  const toPublicUrl = (path: string) => {
    if (!path) return "";
    if (/^https?:\/\//.test(path)) return path;
    try {
      const res = (supabase.storage.from("images") as any).getPublicUrl(path);
      // v2: res.data?.publicUrl ; v1: res.publicURL
      return (
        (res?.data && (res.data.publicUrl || res.data.publicURL)) ||
        res?.publicURL ||
        res?.publicUrl ||
        ""
      );
    } catch (err) {
      console.error("getPublicUrl error:", err);
      return "";
    }
  };

  // Prepare image URLs when item changes (support both `images` array or `image_url` single/array)
  useEffect(() => {
    const prepare = async () => {
      setSliderLoading(true);
      try {
        const rawList = (item as any)?.images ?? (item as any)?.image_url;
        const list = Array.isArray(rawList)
          ? rawList
          : rawList
          ? [rawList]
          : [];

        const urls = list.map((img: string) => toPublicUrl(img)).filter(Boolean);

        setImageUrls(urls);
        setCurrentIndex(0);

        // reset main swiper to first slide if exists
        if (mainSwiperRef.current && urls.length > 0) {
          try {
            mainSwiperRef.current.slideTo(0);
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        console.error("Error preparing images:", err);
      } finally {
        setSliderLoading(false);
      }
    };

    prepare();
  }, [item]);

  // preload next image for smoother UX
  useEffect(() => {
    if (imageUrls.length <= 1) return;
    const next = (currentIndex + 1) % imageUrls.length;
    const img = new Image();
    img.src = imageUrls[next];
  }, [currentIndex, imageUrls]);

  const nextImage = () => {
    if (imageUrls.length <= 1) return;
    if (mainSwiperRef.current && typeof mainSwiperRef.current.slideNext === "function") {
      mainSwiperRef.current.slideNext();
    } else {
      setCurrentIndex((p) => (p + 1) % imageUrls.length);
    }
  };

  const prevImage = () => {
    if (imageUrls.length <= 1) return;
    if (mainSwiperRef.current && typeof mainSwiperRef.current.slidePrev === "function") {
      mainSwiperRef.current.slidePrev();
    } else {
      setCurrentIndex((p) => (p - 1 + imageUrls.length) % imageUrls.length);
    }
  };

  const goToIndex = (idx: number) => {
    if (mainSwiperRef.current && typeof mainSwiperRef.current.slideTo === "function") {
      mainSwiperRef.current.slideTo(idx);
    } else {
      setCurrentIndex(idx);
    }
  };

  const handleContact = () => {
    if ((item as any)?.contact_phone) window.open(`tel:${(item as any).contact_phone}`);
    else if ((item as any)?.contact_email) window.open(`mailto:${(item as any).contact_email}`);
    else if ((item as any)?.contact_facebook) window.open((item as any).contact_facebook);
  };

  const getCategoryArabic = (category: string) => {
    const categoryMap: Record<string, string> = {
      human: "إنسان",
      documents: "وثائق",
      electronics: "إلكترونيات",
      keys: "مفاتيح",
      jewelry: "مجوهرات",
      clothing: "ملابس",
      bags: "حقائب وأمتعة",
      vehicles: "مركبات",
      animals: "حيوانات أليفة",
      other: "أخرى",
    };
    return categoryMap[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">الإعلان غير موجود</h1>
            <p className="text-muted-foreground mb-6">لم يتم العثور على هذا الإعلان أو قد يكون محذوفاً</p>
            <Button onClick={() => navigate("/")}>العودة للرئيسية</Button>
          </div>
        </div>
      </div>
    );
  }

  const isUrgent = (item as any).category === "human";
  const formattedDate = new Date((item as any).date_lost_found).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
   
  // داخل Component ItemDetails، قبل return
const handleReport = async () => {
  if (!item?.id) return;

  try {
    setReportLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("reports").insert([
      {
        item_id: item.id,
        reporter_id: user?.id || null,
        reason: reportReason,
      },
    ]);

    if (error) throw error;

    setReportSuccess(true);
    toast({
      title: "تم الإبلاغ",
      description: "شكراً على الإبلاغ، سيتم مراجعة الإعلان قريباً.",
      variant: "success",
    });
  } catch (err: any) {
    console.error("Error reporting item:", err);
    toast({
      title: "خطأ",
      description: "تعذر إرسال البلاغ، حاول مرة أخرى.",
      variant: "destructive",
    });
  } finally {
    setReportLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Slider Card */}
            <Card
              className={`shadow-medium overflow-hidden ${
                isUrgent ? "ring-2 ring-destructive/50 border-destructive/50" : ""
              }`}
            >
              <div className="relative bg-black/5">
                {/* Main image area */}
                <div className="relative w-full h-[420px] md:h-[520px] flex items-center justify-center bg-gray-50">
                  {sliderLoading ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                  ) : imageUrls.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                      <MapPin className="w-16 h-16 mx-auto mb-2 opacity-50" />
                      <p>لا توجد صور متاحة</p>
                    </div>
                  ) : (
                    <div className="w-full h-full relative">
                      <Swiper
                        modules={[Navigation, Thumbs, Keyboard]}
                        spaceBetween={10}
                        navigation={false}
                        keyboard={{ enabled: true }}
                        thumbs={{ swiper: thumbsSwiper }}
                        onSwiper={(swiper) => {
                          mainSwiperRef.current = swiper as SwiperClass;
                        }}
                        onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
                        className="w-full h-full"
                      >
                        {imageUrls.map((url, idx) => (
                          <SwiperSlide key={idx} className="w-full h-full flex items-center justify-center">
                            <img
                              src={url}
                              alt={`${(item as any).title} - ${idx + 1}`}
                              className="w-full h-full object-contain max-h-[520px]"
                              loading="lazy"
                            />
                          </SwiperSlide>
                        ))}
                      </Swiper>

                      {/* Left / Right controls (overlay) */}
                      {imageUrls.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            aria-label="السابق"
                            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={nextImage}
                            aria-label="التالي"
                            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Badges & Actions */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
                  {isUrgent && (
                    <Badge variant="destructive" className="bg-destructive text-destructive-foreground">
                      <AlertTriangle className="w-3 h-3 ml-1" />
                      عاجل
                    </Badge>
                  )}
                  <Badge
                    variant={
                      (item as any).status === "lost"
                        ? "destructive"
                        : (item as any).status === "found"
                        ? "success"
                        : "secondary"
                    }
                  >
                    {{
                      lost: "مفقود",
                      found: "معثور عليه",
                      returned: "تم العثور على صاحبه",
                    }[(item as any).status] || "غير معروف"}
                  </Badge>
                </div>

                <div className="absolute top-4 left-4 flex gap-2 z-30">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-white/80 hover:bg-white"
                    onClick={() => setIsFavorite(!isFavorite)}
                    aria-pressed={isFavorite}
                    aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </Button>
                </div>

                {/* Thumbnails */}
                {imageUrls.length > 1 && (
                  <div className="px-4 py-3 border-t bg-white/60">
                    <div className="flex gap-2 overflow-x-auto items-center">
                      <Swiper
                        onSwiper={(swiper) => setThumbsSwiper(swiper as SwiperClass)}
                        spaceBetween={8}
                        slidesPerView={Math.min(6, imageUrls.length)}
                        freeMode={true}
                        watchSlidesProgress={true}
                        modules={[FreeMode, Thumbs]}
                        className="w-full"
                      >
                        {imageUrls.map((url, idx) => (
                          <SwiperSlide key={idx} className="cursor-pointer">
                            <button
                              onClick={() => goToIndex(idx)}
                              className={`flex-shrink-0 rounded overflow-hidden transition-shadow ${
                                idx === currentIndex ? "ring-2 ring-primary" : "border-transparent"
                              }`}
                              aria-label={`عرض الصورة ${idx + 1}`}
                            >
                              <img src={url} alt={`thumb-${idx}`} className="w-20 h-14 object-cover" loading="lazy" />
                            </button>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Item Details */}
            <Card className="shadow-medium">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold font-kufi text-foreground mb-2">{(item as any).title}</h1>
                    <Badge variant="outline" className="mb-4">
                      {getCategoryArabic((item as any).category)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="font-medium">{(item as any).wilaya}، {(item as any).commune}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span>
                      تاريخ {(item as any).status === "lost" ? "الفقدان" : "العثور"}: {formattedDate}
                    </span>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h2 className="text-lg font-semibold mb-3">الوصف التفصيلي</h2>
                  <p className="text-foreground leading-relaxed">{(item as any).description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card className="shadow-medium">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">الموقع على الخريطة</h2>
                <div className="bg-gradient-subtle rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>
                      خريطة تفاعلية - {(item as any).wilaya}، {(item as any).commune}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
        
          <div className="space-y-6">
            {/* Contact Section */}
            <Card className="shadow-medium">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">تواصل مع صاحب الإعلان</h2>
                {((item as any).contact_phone || (item as any).contact_email || (item as any).contact_facebook) && (
                  <Button variant="hero" className="w-full flex items-center gap-2" onClick={handleContact}>
                    {(item as any).contact_phone ? (
                      <>
                        <Phone className="w-5 h-5" />
                        اتصال هاتفي
                      </>
                    ) : (item as any).contact_email ? (
                      <>
                        <Mail className="w-5 h-5" />
                        إرسال بريد إلكتروني
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-5 h-5" />
                        تواصل عبر فيسبوك
                      </>
                    )}
                  </Button>
                )}

                <Separator className="my-4" />

                <div className="text-center">
  <Button
    variant="ghost"
    size="sm"
    className="text-destructive hover:bg-destructive/10"
    onClick={() => {
      setReportOpen(true);
      setReportSuccess(false); // إعادة التعيين عند فتح النافذة
    }}
  >
    <Flag className="w-4 h-4 ml-2" />
    الإبلاغ عن الإعلان
  </Button>

  <Dialog open={reportOpen} onOpenChange={setReportOpen}>
    <DialogContent className="sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle>الإبلاغ عن الإعلان</DialogTitle>
      </DialogHeader>

      {reportSuccess ? (
        <div className="text-center text-green-600 font-semibold py-6">
          ✅ تم الإبلاغ بنجاح
        </div>
      ) : (
        <>
          <div className="space-y-4 mt-2">
            <p>اختر سبب الإبلاغ عن هذا الإعلان:</p>
            <RadioGroup
              value={reportReason}
              onValueChange={setReportReason}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="محتوى مزيف أو مخالف" id="reason1" />
                <label htmlFor="reason1">محتوى مزيف أو مخالف</label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="معلومات خاطئة" id="reason2" />
                <label htmlFor="reason2">معلومات خاطئة</label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="إعلان غير مناسب" id="reason3" />
                <label htmlFor="reason3">إعلان غير مناسب</label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReportOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleReport} disabled={reportLoading}>
              {reportLoading ? "جارٍ الإرسال..." : "إرسال البلاغ"}
            </Button>
          </DialogFooter>
        </>
      )}
    </DialogContent>
  </Dialog>
</div>
              </CardContent>
            </Card>

            {/* Poster Info */}
            <Card className="shadow-medium">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">معلومات صاحب الإعلان</h2>
                {profileLoading ? (
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{userProfile?.full_name || "مستخدم مجهول"}</div>
                        {userProfile?.phone && <div className="text-sm text-muted-foreground">{userProfile.phone}</div>}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">تاريخ النشر:</span>
                        <span className="font-medium">{new Date((item as any).created_at).toLocaleDateString("ar-DZ")}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card className="shadow-medium border-warning/20">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 text-warning">نصائح للأمان</h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• تأكد من صحة المعلومات قبل الاجتماع</li>
                  <li>• اختر مكان عام للقاء</li>
                  <li>• أحضر صديقًا معك إن أمكن</li>
                  <li>• لا تشارك معلومات شخصية حساسة</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
