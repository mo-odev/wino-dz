import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ItemCard from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Search as SearchIcon, SlidersHorizontal, Loader2, MapPin, ListFilter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

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

const wilayas = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار", "البليدة", "البويرة",
  "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر", "الجلفة", "جيجل", "سطيف", "سعيدة",
  "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة", "قسنطينة", "المدية", "مستغانم", "المسيلة", "معسكر", "ورقلة",
  "وهران", "البيض", "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", "تيسمسيلت", "الوادي", "خنشلة",
  "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت", "غرداية", "غليزان"
];
const Comune = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار", "البليدة", "البويرة",
  "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر", "الجلفة", "جيجل", "سطيف", "سعيدة",
  "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة", "قسنطينة", "المدية", "مستغانم", "المسيلة", "معسكر", "ورقلة",
  "وهران", "البيض", "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", "تيسمسيلت", "الوادي", "خنشلة",
  "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت", "غرداية", "غليزان"
];
const NoResults = ({ resetFilters, message = "لا توجد نتائج" }) => (
  <div className="text-center py-12 px-4 sm:px-0">
    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
      <SearchIcon className="w-14 h-14 text-blue-400" />
    </div>
    <h3 className="text-xl font-semibold mb-2 text-gray-700">{message}</h3>
    <p className="text-gray-500 mb-6 max-w-xs mx-auto">جرب تغيير معايير البحث أو الفلاتر</p>
    <Button variant="outline" onClick={resetFilters} className="px-6 py-3 border-blue-300 text-blue-500">
      مسح الفلاتر
    </Button>
  </div>
);

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedWilaya, setSelectedWilaya] = useState("all");
  const [selectedComune, setSelectedComune] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      try {
        let query = supabase.from("items").select("*");

        if (debouncedSearch) {
          query = query.or(`title.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`);
        }
        if (selectedCategory !== "all") query = query.eq("category", selectedCategory);
        if (selectedWilaya !== "all") query = query.eq("wilaya", selectedWilaya);
        if (selectedComune !== "all") query = query.eq("Comune", selectedComune);
        if (selectedType !== "all") {
          if (selectedType === "found") query = query.in("status", ["found", "found_owner"]);
          else query = query.eq("status", selectedType);
        }

        const { data, error } = await query.order("date_lost_found", { ascending: false });
        if (error) throw error;
        setItems(data || []);
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, [debouncedSearch, selectedCategory, selectedWilaya,selectedComune, selectedType]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedWilaya("all");
    setSelectedType("all");
  };

  const getCategoryArabic = (value) => categories.find((c) => c.value === value)?.label || value;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* العنوان */}
        <section className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">البحث عن المفقودات</h1>
          <p className="text-lg text-gray-600">استخدم الفلاتر أدناه للعثور على ما تبحث عنه بسهولة</p>
        </section>

        {/* شريط البحث والفلاتر */}
        <section className="bg-white rounded-2xl shadow-lg p-6 mb-12">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="relative flex-1">
              <SearchIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <Input
                placeholder="ابحث في العنوان والوصف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-14 h-14 text-lg rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-center">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-14 min-w-[180px] rounded-xl border border-gray-300 bg-gradient-to-r from-blue-50 to-white">
                  <ListFilter className="ml-2 text-blue-500" />
                  <SelectValue placeholder="التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التصنيفات</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedWilaya} onValueChange={setSelectedWilaya}>
                <SelectTrigger className="h-14 min-w-[180px] rounded-xl border border-gray-300 bg-gradient-to-r from-green-50 to-white">
                  <MapPin className="ml-2 text-green-500" />
                  <SelectValue placeholder="الولاية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الولايات</SelectItem>
                  {wilayas.map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedWilaya} onValueChange={setSelectedComune}>
                <SelectTrigger className="h-14 min-w-[180px] rounded-xl border border-gray-300 bg-gradient-to-r from-green-50 to-white">
                  <MapPin className="ml-2 text-green-500" />
                  <SelectValue placeholder="البلدية " />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع البلديات</SelectItem>
                  {Comune.map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* النتائج */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          </div>
        ) : (
          <Tabs value={selectedType} onValueChange={setSelectedType}>
            <TabsList className="grid grid-cols-3 bg-white rounded-xl shadow-md max-w-md mx-auto mb-8">
              <TabsTrigger value="all">الكل ({items.length})</TabsTrigger>
              <TabsTrigger value="lost">مفقود ({items.filter(i => i.status === "lost").length})</TabsTrigger>
              <TabsTrigger value="found">معثور عليه ({items.filter(i => i.status === "found" || i.status === "found_owner").length})</TabsTrigger>
            </TabsList>

            {['all', 'lost', 'found'].map((tab) => {
              const filtered =
                tab === 'all' ? items :
                tab === 'lost' ? items.filter(i => i.status === 'lost') :
                items.filter(i => i.status === 'found' || i.status === 'found_owner');
              return (
                <TabsContent key={tab} value={tab}>
                  {filtered.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filtered.map(item => (
                        <ItemCard
                          key={item.id}
                          id={item.id}
                          title={item.title}
                          description={item.description}
                          image={item.image_url}
                          type={item.status}
                          category={getCategoryArabic(item.category)}
                          location={`${item.wilaya}، ${item.commune}`}
                          date={item.date_lost_found ? new Date(item.date_lost_found).toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric" }) : "تاريخ غير محدد"}
                        />
                      ))}
                    </div>
                  ) : (
                    <NoResults resetFilters={resetFilters} message={tab === 'lost' ? "لا توجد أشياء مفقودة" : tab === 'found' ? "لا توجد أشياء معثور عليها" : undefined} />
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </main>
    </div>
  );
}
