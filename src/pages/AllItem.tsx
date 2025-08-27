import { useState, useMemo } from "react";
import ItemCard from "../components/ItemCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useItems } from "@/hooks/useItems";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooTer from "@/components/FooTer";

const AllItems = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all');

  // الفلاتر
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedWilaya, setSelectedWilaya] = useState<string>("all");
  const [selectedCommune, setSelectedCommune] = useState<string>("all");

  const { items, loading, error } = useItems();

  const activeItems = items.filter((item) => (item as any).status !== "found_owner");

  const sortedItems = useMemo(() => {
    let filteredItems =
      activeTab === "all"
        ? activeItems
        : activeItems.filter((item) => item.status === activeTab);

    if (selectedWilaya && selectedWilaya !== "all") {
      filteredItems = filteredItems.filter((item) => item.wilaya === selectedWilaya);
    }
    if (selectedCommune && selectedCommune !== "all") {
      filteredItems = filteredItems.filter((item) => item.commune === selectedCommune);
    }
    if (selectedCategory && selectedCategory !== "all") {
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

  if (loading) {
    return (
      <section className="py-16 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto flex justify-center items-center min-h-[400px]">
          <p className="text-muted-foreground">حدث خطأ في تحميل البيانات</p>
        </div>
      </section>
    );
  }

  const lostItems = sortedItems.filter(item => item.status === "lost");
  const foundItems = sortedItems.filter(item => item.status === "found");

  const getCategoryArabic = (category: string) => {
    const categoryMap: Record<string, string> = {
      human: 'إنسان',
      documents: 'وثائق',
      electronics: 'إلكترونيات',
      keys: 'مفاتيح',
      jewelry: 'مجوهرات',
      clothing: 'ملابس',
      bags: 'حقائب وأمتعة',
      vehicles: 'مركبات',
      animals: 'حيوانات أليفة',
      other: 'أخرى'
    };
    return categoryMap[category] || category;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-16 bg-gradient-to-b from-green-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* العنوان */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-kufi text-green-800 mb-4">
              جميع الإعلانات
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              تصفح جميع الإعلانات للأشياء المفقودة والمعثور عليها في الجزائر
            </p>
          </div>

          {/* الفلاتر */}
          <div className="bg-white shadow-xl rounded-3xl p-6 mb-8 flex flex-col gap-6 border border-indigo-100">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-center">
              {/* فلتر الولاية */}
              <select
                value={selectedWilaya}
                onChange={(e) => { setSelectedWilaya(e.target.value); setSelectedCommune("all"); }}
                className="w-full md:w-48 bg-gradient-to-r from-green-50 to-white border border-green-200 rounded-full px-4 py-2 shadow-md focus:ring-2 focus:ring-green-400 transition-all hover:shadow-lg"
              >
                <option value="all">اختر الولاية</option>
                <option value="الجزائر">الجزائر</option>
                <option value="وهران">وهران</option>
                <option value="سطيف">سطيف</option>
              </select>

              {/* فلتر البلدية */}
              <select
                value={selectedCommune}
                onChange={(e) => setSelectedCommune(e.target.value)}
                className="w-full md:w-48 bg-gradient-to-r from-green-50 to-white border border-green-200 rounded-full px-4 py-2 shadow-md focus:ring-2 focus:ring-green-400 transition-all hover:shadow-lg"
              >
                <option value="all">اختر المدينة</option>
                {selectedWilaya === "الجزائر" && <>
                  <option value="باب الزوار">باب الزوار</option>
                  <option value="بئر مراد رايس">بئر مراد رايس</option>
                </>}
                {selectedWilaya === "وهران" && <>
                  <option value="وهران">وهران</option>
                </>}
                {selectedWilaya === "سطيف" && <>
                  <option value="سطيف">سطيف</option>
                </>}
              </select>

              {/* فلتر التصنيف */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-48 bg-gradient-to-r from-green-50 to-white border border-green-200 rounded-full px-4 py-2 shadow-md focus:ring-2 focus:ring-green-400 transition-all hover:shadow-lg"
              >
                <option value="all">اختر التصنيف</option>
                <option value="human">إنسان</option>
                <option value="documents">وثائق</option>
                <option value="electronics">إلكترونيات</option>
              </select>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "all" | "lost" | "found")}
            className="w-full"
          >
            <div className="flex justify-center mb-10">
              <TabsList className="grid w-full max-w-md grid-cols-3 bg-white shadow-lg rounded-full overflow-hidden border border-green-200">
                <TabsTrigger value="all" className="font-medium data-[state=active]:bg-green-500 data-[state=active]:text-white">
                  الكل ({activeItems.length})
                </TabsTrigger>
                <TabsTrigger value="lost" className="font-medium data-[state=active]:bg-red-500 data-[state=active]:text-white">
                  مفقود ({lostItems.length})
                </TabsTrigger>
                <TabsTrigger value="found" className="font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  معثور عليه ({foundItems.length})
                </TabsTrigger>
              </TabsList>
            </div>

            {["all", "lost", "found"].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedItems
                    .filter((item) => tab === "all" || item.status === tab)
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
        </div>
      </section>

      <FooTer />
    </div>
  );
};

export default AllItems;
