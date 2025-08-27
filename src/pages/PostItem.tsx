import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  MapPin,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  X,
  Loader2,
  Search,
  CheckCircle2,
} from "lucide-react";
import { useItems } from "@/hooks/useItems";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { algeriaWilayas } from "@/data/algeria-data";
import { supabase } from "@/integrations/supabase/client";

const PostItem = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { createItem } = useItems();
  const initialType = searchParams.get("type") || "lost";

  const [formData, setFormData] = useState({
    status: initialType as "lost" | "found",
    title: "",
    description: "",
    category: "",
    wilaya: "",
    commune: "",
    date_lost_found: "",
    contactMethod: "",
    contact_phone: "",
    contact_email: "",
    contact_facebook: "",
    images: [] as File[],
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const categories = [
    { value: "human", label: "إنسان" },
    { value: "documents", label: "وثائق" },
    { value: "electronics", label: "إلكترونيات" },
    { value: "keys", label: "مفاتيح" },
    { value: "jewelry", label: "مجوهرات" },
    { value: "clothing", label: "ملابس" },
    { value: "bags", label: "حقائب وأمتعة" },
    { value: "vehicles", label: "مركبات" },
    { value: "animals", label: "حيوانات أليفة" },
    { value: "other", label: "أخرى" },
  ];

  const wilayas = algeriaWilayas;

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return null;
      }

      const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "يجب تسجيل الدخول أولاً",
        description: "الرجاء تسجيل الدخول لنشر الإعلان",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // Validation
    if (!formData.title || !formData.description || !formData.category || !formData.wilaya || !formData.commune) {
      toast({
        title: "يرجى ملء جميع الحقول المطلوبة",
        description: "تأكد من ملء العنوان، الوصف، التصنيف، والموقع",
        variant: "destructive",
      });
      return;
    }

    // Contact method validation
    if (!formData.contactMethod) {
      toast({
        title: "يرجى اختيار وسيلة التواصل",
        description: "يجب اختيار وسيلة للتواصل معك",
        variant: "destructive",
      });
      return;
    }

    const contactValue =
      formData.contactMethod === "phone"
        ? formData.contact_phone
        : formData.contactMethod === "email"
        ? formData.contact_email
        : formData.contact_facebook;

    if (!contactValue || contactValue.trim() === "") {
      toast({
        title: "يرجى إدخال معلومات التواصل",
        description: "يجب إدخال معلومات التواصل",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Upload images to storage if any
      let imageUrl = null;
      if (formData.images.length > 0) {
        setUploadingImages(true);
        const uploadedImage = await uploadImageToStorage(formData.images[0]);
        if (uploadedImage) {
          imageUrl = uploadedImage;
        }
        setUploadingImages(false);
      }

      const itemData = {
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        status: formData.status,
        wilaya: formData.wilaya,
        commune: formData.commune,
        date_lost_found: formData.date_lost_found,
        contact_phone: formData.contactMethod === "phone" ? formData.contact_phone : null,
        contact_email: formData.contactMethod === "email" ? formData.contact_email : null,
        contact_facebook: formData.contactMethod === "facebook" ? formData.contact_facebook : null,
        image_url: imageUrl,
        user_id: user.id,
      };

      await createItem(itemData);

      toast({
        title: "تم نشر الإعلان بنجاح",
        description: "سيتم مراجعة إعلانك وسيظهر قريباً",
        variant: "default",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating item:", error);
      toast({
        title: "حدث خطأ",
        description: "فشل في نشر الإعلان، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        images: files,
      }));

      // Create preview URLs
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* خلفية ناعمة حديثة */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_100%_-100px,rgba(16,185,129,0.15),transparent),radial-gradient(1000px_500px_at_0%_-100px,rgba(59,130,246,0.12),transparent)]" />
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* العنوان والوصف */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-sm shadow-sm backdrop-blur">
            <span className={`inline-flex h-2 w-2 rounded-full ${formData.status === "lost" ? "bg-destructive" : "bg-success"}`} />
            {formData.status === "lost" ? "إعلان عن شيء مفقود" : "إعلان عن شيء معثور عليه"}
          </div>

          <h1 className="mt-4 text-3xl md:text-4xl font-bold font-kufi tracking-tight">
            نشر إعلان جديد
          </h1>
          <p className="mt-2 text-muted-foreground">
            {formData.status === "lost"
              ? "أخبرنا عن الشيء المفقود لنساعدك في إيجاده"
              : "أخبرنا عن الشيء الذي وجدته لنساعد في إعادته لصاحبه"}
          </p>
        </div>

        {/* البطاقة الرئيسية */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-xl rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span className="font-kufi">تفاصيل الإعلان</span>

              {/* اختيار النوع: مفقود/معثور عليه */}
              <div className="grid grid-cols-2 gap-2 bg-muted/60 p-1 rounded-full w-[260px]">
                <Button
                  type="button"
                  variant={formData.status === "lost" ? "destructive" : "outline"}
                  onClick={() => setFormData((prev) => ({ ...prev, status: "lost" }))}
                  className={`h-9 rounded-full transition-all ${formData.status === "lost" ? "ring-2 ring-offset-2 ring-destructive/40" : ""}`}
                >
                  <Search className="w-4 h-4 ml-2" />
                  مفقود
                </Button>
                <Button
                  type="button"
                  variant={formData.status === "found" ? "success" : "outline"}
                  onClick={() => setFormData((prev) => ({ ...prev, status: "found" }))}
                  className={`h-9 rounded-full transition-all ${formData.status === "found" ? "ring-2 ring-offset-2 ring-success/40" : ""}`}
                >
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                  معثور عليه
                </Button>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* العنوان + التصنيف */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title" className="text-sm">عنوان الإعلان *</Label>
                  <div className="relative mt-2">
                    <Input
                      id="title"
                      placeholder="مثال: محفظة جلدية سوداء"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      required
                      className="h-12 rounded-2xl pl-4 pr-12"
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">اختر عنوانًا واضحًا ومختصرًا.</p>
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm">التصنيف *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-2xl">
                      <SelectValue placeholder="اختر التصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* الوصف */}
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-sm">الوصف التفصيلي *</Label>
                  <span className="text-xs text-muted-foreground">{formData.description.length}/1000</span>
                </div>
                <div className="relative mt-2">
                  <Textarea
                    id="description"
                    placeholder="قدم وصفًا مفصلًا (اللون، الحجم، العلامات المميزة...)"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    required
                    className="min-h-[140px] rounded-2xl resize-y pr-12"
                  />
                  <MessageSquare className="absolute right-4 top-4 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">معلومات أكثر = فرص أعلى للوصول لصاحبها.</p>
              </div>

              {/* الموقع والتاريخ */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Label htmlFor="wilaya" className="text-sm">الولاية *</Label>
                  <Select
                    value={formData.wilaya}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, wilaya: value }))}
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-2xl pr-12">
                      <SelectValue placeholder="اختر الولاية" />
                    </SelectTrigger>
                    <SelectContent>
                      {wilayas.map((wilaya) => (
                        <SelectItem key={wilaya.code} value={wilaya.name}>
                          {wilaya.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <MapPin className="relative -mt-9 mr-3 h-4 w-4 text-muted-foreground float-right pointer-events-none" />
                </div>

                <div className="md:col-span-1">
                  <Label htmlFor="commune" className="text-sm">البلدية *</Label>
                  <div className="relative mt-2">
                    <Input
                      id="commune"
                      placeholder="اكتب اسم البلدية"
                      value={formData.commune}
                      onChange={(e) => setFormData((prev) => ({ ...prev, commune: e.target.value }))}
                      required
                      className="h-12 rounded-2xl pr-12"
                    />
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="md:col-span-1">
                  <Label htmlFor="date" className="text-sm">
                    {formData.status === "lost" ? "تاريخ الفقدان" : "تاريخ العثور عليه"}
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="date"
                      type="date"
                      value={formData.date_lost_found}
                      onChange={(e) => setFormData((prev) => ({ ...prev, date_lost_found: e.target.value }))}
                      className="h-12 rounded-2xl pr-12"
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* معلومات التواصل */}
              <div className="space-y-3">
                <Label className="text-sm">وسيلة التواصل *</Label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={formData.contactMethod === "phone" ? "default" : "outline"}
                    onClick={() => setFormData((prev) => ({ ...prev, contactMethod: "phone" }))}
                    className={`h-10 rounded-full justify-center ${formData.contactMethod === "phone" ? "ring-2 ring-offset-2" : ""}`}
                  >
                    <Phone className="w-4 h-4 ml-2" />
                    رقم الهاتف
                  </Button>
                  <Button
                    type="button"
                    variant={formData.contactMethod === "email" ? "default" : "outline"}
                    onClick={() => setFormData((prev) => ({ ...prev, contactMethod: "email" }))}
                    className={`h-10 rounded-full justify-center ${formData.contactMethod === "email" ? "ring-2 ring-offset-2" : ""}`}
                  >
                    <Mail className="w-4 h-4 ml-2" />
                    البريد الإلكتروني
                  </Button>
                  <Button
                    type="button"
                    variant={formData.contactMethod === "facebook" ? "default" : "outline"}
                    onClick={() => setFormData((prev) => ({ ...prev, contactMethod: "facebook" }))}
                    className={`h-10 rounded-full justify-center ${formData.contactMethod === "facebook" ? "ring-2 ring-offset-2" : ""}`}
                  >
                    <MessageSquare className="w-4 h-4 ml-2" />
                    فيسبوك
                  </Button>
                </div>

                {formData.contactMethod && (
                  <div className="relative">
                    <Input
                      placeholder={
                        formData.contactMethod === "phone"
                          ? "رقم الهاتف"
                          : formData.contactMethod === "email"
                          ? "البريد الإلكتروني"
                          : "رابط الفيسبوك"
                      }
                      value={
                        formData.contactMethod === "phone"
                          ? formData.contact_phone
                          : formData.contactMethod === "email"
                          ? formData.contact_email
                          : formData.contact_facebook
                      }
                      onChange={(e) => {
                        const field =
                          formData.contactMethod === "phone"
                            ? "contact_phone"
                            : formData.contactMethod === "email"
                            ? "contact_email"
                            : "contact_facebook";
                        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
                      }}
                      required
                      className="h-12 rounded-2xl pr-4"
                    />
                  </div>
                )}
              </div>

              {/* الرفع والمعاينات */}
              <div>
                <Label htmlFor="images" className="text-sm">إضافة صور (اختياري)</Label>
                <div className="mt-2 rounded-2xl border-2 border-dashed border-border/70 bg-muted/40 p-6 text-center hover:border-primary transition-colors">
                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <p className="text-sm text-muted-foreground mb-3">اسحب الصور هنا أو انقر للاختيار</p>
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("images")?.click()}
                    disabled={uploadingImages}
                    className="rounded-full"
                  >
                    {uploadingImages ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري الرفع...
                      </>
                    ) : (
                      "اختيار الصور"
                    )}
                  </Button>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square w-full overflow-hidden rounded-xl border bg-muted/30">
                          <img src={preview} alt={`Preview ${index + 1}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-md opacity-90"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* زر الإرسال */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full h-12 rounded-full text-base tracking-wide shadow-lg hover:shadow-xl transition-all"
                  disabled={loading || uploadingImages}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جارٍ النشر...
                    </>
                  ) : (
                    "نشر الإعلان"
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  بنشرك للإعلان فأنت توافق على شروط الاستخدام وسياسة الخصوصية.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostItem;
