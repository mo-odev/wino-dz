import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Package, MapPin, Calendar, Phone, LayoutDashboard, Eye } from "lucide-react";
import { Link } from "react-router-dom";

type ItemRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  image_url: string | null;
  wilaya: string;
  commune: string;
  date_lost_found: string;
  contact_phone: string | null;
  contact_facebook: string | null;
  is_active: boolean;
  views_count: number;
  created_at: string;
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

const statusStyles = {
  lost: "bg-red-100 text-red-800",
  found: "bg-green-100 text-green-800"
};

const ItemsTable = () => {
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("items")
        .select(
          "id, user_id, title, description, category, status, image_url, wilaya, commune, date_lost_found, contact_phone, contact_facebook, is_active, views_count, created_at"
        )
        .eq("is_active", true);

      if (error) throw error;

      setItems(data);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "خطأ في تحميل الإعلانات",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-kufi text-gray-800 mb-2">
              قائمة الإعلانات
            </h1>
            <p className="text-lg text-gray-600">
              إدارة الإعلانات الخاصة بالأشياء المفقودة والمعثور عليها
            </p>
          </div>
          <Link to="/dashboard">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <LayoutDashboard className="w-4 h-4" />
              لوحة التحكم
            </Button>
          </Link>
        </div>

        <Card className="shadow-lg rounded-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-2 text-xl font-kufi text-gray-800">
              <Package className="w-5 h-5 text-blue-600" />
              جميع الإعلانات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mr-3 text-gray-600 font-kufi">جارٍ التحميل...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="bg-gray-100 hover:bg-gray-100">
                      <TableHead className="text-right font-bold font-kufi text-gray-700 py-4 px-4 whitespace-nowrap min-w-[180px]">
                        العنوان
                      </TableHead>
                      <TableHead className="text-right font-bold font-kufi text-gray-700 py-4 px-4 whitespace-nowrap">
                        التصنيف
                      </TableHead>
                      <TableHead className="text-right font-bold font-kufi text-gray-700 py-4 px-4 whitespace-nowrap">
                        الحالة
                      </TableHead>
                      <TableHead className="text-right font-bold font-kufi text-gray-700 py-4 px-4 whitespace-nowrap">
                        الموقع
                      </TableHead>
                      <TableHead className="text-right font-bold font-kufi text-gray-700 py-4 px-4 whitespace-nowrap">
                        التاريخ
                      </TableHead>
                      <TableHead className="text-right font-bold font-kufi text-gray-700 py-4 px-4 whitespace-nowrap">
                        رقم الاتصال
                      </TableHead>
                      <TableHead className="text-right font-bold font-kufi text-gray-700 py-4 px-4 whitespace-nowrap">
                        الإجراءات
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length > 0 ? (
                      items.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50 transition-colors even:bg-gray-50/50">
                          <TableCell className="text-right font-kufi text-gray-800 py-4 px-4 max-w-[180px]">
                            <div className="font-medium truncate">{item.title}</div>
                            <div className="text-sm text-gray-500 truncate mt-1">{item.description.slice(0, 50)}...</div>
                          </TableCell>
                          <TableCell className="text-right font-kufi text-gray-800 py-4 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getCategoryArabic(item.category)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-kufi py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[item.status as keyof typeof statusStyles]}`}>
                              {item.status === "lost" ? "مفقود" : "معثور عليه"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-kufi text-gray-800 py-4 px-4">
                            <div className="flex items-center justify-end gap-1">
                              <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <span className="truncate max-w-[120px]">{`${item.wilaya}، ${item.commune}`}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-kufi text-gray-800 py-4 px-4">
                            <div className="flex items-center justify-end gap-1">
                              <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <span>{new Date(item.date_lost_found).toLocaleDateString("ar-DZ")}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-kufi text-gray-800 py-4 px-4">
                            <div className="flex items-center justify-end gap-1">
                              <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <span>{item.contact_phone ?? "—"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-kufi py-4 px-4">
                            <Button
                              size="sm"
                              className="font-kufi bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              عرض
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-gray-500 font-kufi">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-lg">لا يوجد إعلانات</p>
                          <p className="text-sm mt-1">لم يتم إضافة أي إعلانات بعد</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ItemsTable;