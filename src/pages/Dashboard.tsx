import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditItemDialog from "@/components/EditItemDialog";
import { Plus, Edit, Trash2, CheckCircle2, Eye, Loader2 } from "lucide-react";
import { useUserItems, Item } from "@/hooks/useItems";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const { items, loading, deleteItem } = useUserItems();

  // نسخة محلية من الإعلانات لتحديثها فورًا
  const [localItems, setLocalItems] = useState<Item[]>([]);
  useEffect(() => {
    setLocalItems(items || []);
  }, [items]);

  const getCategoryArabic = (category: string) => {
    const map: Record<string, string> = {
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
    return map[category] || category;
  };

  // فحص إذا كانت الحالة تعني العثور على صاحبها
  const isOwnerFound = (s: unknown) => {
    const st = (s ?? "").toString().trim();
    return (
      st === "found_owner" ||
      st === "owner_found" ||
      st === "closed" ||
      st === "تم العثور على صاحبه" ||
      st === "تم العثور على صاحبها"
    );
  };

  // حساب الإحصائيات
  const computed = useMemo(() => {
    const total = localItems.length;
    const found = localItems.filter(i => (i.status ?? "").toString().trim() === "found").length;
    const lost = localItems.filter(i => (i.status ?? "").toString().trim() === "lost").length;
    const ownerFound = localItems.filter(i => isOwnerFound(i.status)).length;
    return { total, found, lost, ownerFound };
  }, [localItems]);

  const fetchItems = async () => {
  try {
    const res = await fetch("/api/items");
    if (!res.ok) throw new Error("فشل في جلب البيانات");
    const data: Item[] = await res.json();
    // نعرض فقط الإعلانات التي لم يُعثر على صاحبها
    setLocalItems(data.filter(item => !isOwnerFound(item.status)));
  } catch (err) {
    console.error(err);
  }
};

const handleItemSaved = async () => {
  // بعد حفظ الإعلان، نعيد جلب القائمة كاملة
  await fetchItems();
  setEditingItem(null);
};

// عند تحميل الصفحة أول مرة
useEffect(() => {
  fetchItems();
}, []);


  // حذف عنصر
  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      setLocalItems(prev => prev.filter(i => i.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Navbar />
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* العنوان */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-kufi text-gray-800 mb-1">
              لوحة التحكم
            </h1>
            <p className="text-lg text-gray-500">إدارة إعلاناتك ومتابعة التفاعل معها</p>
          </div>
          <Link to="/post-item">
            <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-full px-5 py-2 shadow-md">
              <Plus className="w-5 h-5" />
              إعلان جديد
            </Button>
          </Link>
        </div>

        {/* البطاقات الإحصائية */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي الإعلانات</p>
                <p className="text-2xl font-bold text-gray-800">{computed.total}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">تم إيجاده</p>
                <p className="text-2xl font-bold text-gray-800">{computed.found}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">تم العثور على صاحبها</p>
                <p className="text-2xl font-bold text-gray-800">{computed.ownerFound}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* قائمة الإعلانات */}
        <Card className="shadow-xl border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-gray-800">إعلاناتي</CardTitle>
          </CardHeader>
          <CardContent>
            {localItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">لا توجد إعلانات بعد</p>
                <Link to="/post-item">
                  <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-2">
                    <Plus className="w-4 h-4 ml-2" />
                    نشر إعلان جديد
                  </Button>
                </Link>
              </div>
            ) : (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-white rounded-full p-1 shadow-inner">
                  <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-green-600 data-[state=active]:text-white transition">
                    الكل ({computed.total})
                  </TabsTrigger>
                  <TabsTrigger value="lost" className="rounded-full data-[state=active]:bg-green-600 data-[state=active]:text-white transition">
                    مفقود ({computed.lost})
                  </TabsTrigger>
                  <TabsTrigger value="found" className="rounded-full data-[state=active]:bg-green-600 data-[state=active]:text-white transition">
                    معثور عليه ({computed.found})
                  </TabsTrigger>
                </TabsList>

                {["all", "lost", "found"].map(tab => (
                  <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
                    {localItems
                      .filter(item => tab === "all" || (item.status ?? "").toString().trim() === tab)
                      .map(item => (
                        <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-lg transition">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                                <Badge variant={(item.status ?? "").toString().trim() === "lost" ? "destructive" : "success"}>
                                  {(item.status ?? "").toString().trim() === "lost" ? "مفقود" : "معثور عليه"}
                                </Badge>
                                {isOwnerFound(item.status) && (
                                  <Badge variant="success">تم العثور على صاحبها</Badge>
                                )}
                                <Badge variant={item.is_active ? "success" : "secondary"}>
                                  {item.is_active ? "نشط" : "غير نشط"}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500 mb-3">
                                {getCategoryArabic(item.category)} • {item.wilaya}، {item.commune} •{" "}
                                {item.date_lost_found
                                  ? new Date(item.date_lost_found).toLocaleDateString("ar-DZ")
                                  : "تاريخ غير محدد"}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <Link to={`/item/${item.id}`}>
                                <Button variant="outline" size="icon" className="hover:bg-green-50">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="icon"
                                className="hover:bg-blue-50"
                                onClick={() => setEditingItem(item)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>

        {editingItem && (
          <EditItemDialog
            item={editingItem}
            open={!!editingItem}
            onOpenChange={(open) => !open && setEditingItem(null)}
            onSave={handleItemSaved}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
