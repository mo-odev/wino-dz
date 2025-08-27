import { useState, useMemo } from "react";
import ItemCard from "./ItemCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useItems } from "@/hooks/useItems";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const RecentItems = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "lost" | "found">("all");

  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { items, loading, error } = useItems();

  const activeItems = items.filter((item) => (item as any).status !== "found_owner");

  const sortedItems = useMemo(() => {
    let filteredItems =
      activeTab === "all"
        ? activeItems
        : activeItems.filter((item) => item.status === activeTab);

    if (selectedWilaya) {
      filteredItems = filteredItems.filter((item) => item.wilaya === selectedWilaya);
    }
    if (selectedCommune) {
      filteredItems = filteredItems.filter((item) => item.commune === selectedCommune);
    }
    if (selectedCategory) {
      filteredItems = filteredItems.filter((item) => item.category === selectedCategory);
    }

    return filteredItems.sort((a, b) => {
      if (a.category === "human" && b.category !== "human") return -1;
      if (a.category !== "human" && b.category === "human") return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [activeItems, activeTab, selectedWilaya, selectedCommune, selectedCategory]);

  const toggleFavorite = (itemId: string) => {
    setFavorites((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
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
      <section className="py-16 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto text-center min-h-[400px] flex items-center justify-center">
          <p className="text-gray-500">حدث خطأ في تحميل البيانات</p>
        </div>
      </section>
    );
  }

const lostItems = activeItems.filter((item) => item.status === "lost");
const foundItems = activeItems.filter((item) => item.status === "found");


  return (
    <section className="py-16 bg-gradient-to-t from-indigo-50 to-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* العنوان */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            آخر الإعلانات
          </h2>
          <p className="text-gray-600">تصفح أحدث الإعلانات المضافة في الجزائر</p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "all" | "lost" | "found")}
          className="w-full"
        >
          {/* الفلاتر + TabsList */}
          <div className="bg-white shadow-xl rounded-3xl p-6 mb-8 flex flex-col gap-6 border border-indigo-100">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-center">
              <select
                value={selectedWilaya}
                onChange={(e) => setSelectedWilaya(e.target.value)}
                className="w-full md:w-48 bg-gradient-to-r from-green-50 to-white border border-green-200 rounded-full px-4 py-2 shadow-md focus:ring-2 focus:ring-green-400 transition-all hover:shadow-lg"
              >
                <option value="">اختر الولاية</option>
                <option value="الجزائر">الجزائر</option>
                <option value="وهران">وهران</option>
                <option value="سطيف">سطيف</option>
              </select>

              <select
                value={selectedCommune}
                onChange={(e) => setSelectedCommune(e.target.value)}
                className="w-full md:w-48 bg-gradient-to-r from-green-50 to-white border border-green-200 rounded-full px-4 py-2 shadow-md focus:ring-2 focus:ring-green-400 transition-all hover:shadow-lg"
              >
                <option value="">اختر المدينة</option>
                <option value="باب الزوار">باب الزوار</option>
                <option value="بئر مراد رايس">بئر مراد رايس</option>
                <option value="وهران">وهران</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-48 bg-gradient-to-r from-green-50 to-white border border-green-200 rounded-full px-4 py-2 shadow-md focus:ring-2 focus:ring-green-400 transition-all hover:shadow-lg"
              >
                <option value="">اختر التصنيف</option>
                <option value="human">إنسان</option>
                <option value="documents">وثائق</option>
                <option value="electronics">إلكترونيات</option>
              </select>
            </div>

            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-white-100 rounded-full shadow-lg overflow-hidden">
              <TabsTrigger
                value="all"
                className="font-medium data-[state=active]:bg-green-500 data-[state=active]:text-white transition-all hover:bg-green-200"
              >
                الكل ({activeItems.length})
              </TabsTrigger>
              <TabsTrigger
                value="lost"
                className="font-medium data-[state=active]:bg-green-500 data-[state=active]:text-white transition-all hover:bg-green-200"
              >
                مفقود ({lostItems.length})
              </TabsTrigger>
              <TabsTrigger
                value="found"
                className="font-medium data-[state=active]:bg-green-500 data-[state=active]:text-white transition-all hover:bg-green-200"
              >
                معثور عليه ({foundItems.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {["all", "lost", "found"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedItems
                  .filter((item) => tab === "all" || item.status === tab)
                  .slice(0, 6)
                  .map((item) => (
                    <ItemCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      description={item.description}
                      image={item.image_url}
                      type={item.status}
                      category={getCategoryArabic(item.category)}
                      location={`${item.wilaya}، ${item.commune}`}
                      date={
                        item.date_lost_found
                          ? new Date(item.date_lost_found).toLocaleDateString("ar", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "تاريخ غير محدد"
                      }
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* زر عرض المزيد */}
        <div className="text-center mt-12">
          <Link to="/AllItem">
            <Button variant="outline" size="lg" className="min-w-[200px] rounded-full shadow-md hover:shadow-lg transition-all">
              عرض الكل
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentItems;
