import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { User, Phone, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

type UserRow = {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
};

const UsersTable = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, phone, created_at");

      if (error) throw error;

      setUsers(data);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "خطأ في تحميل المستخدمين",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-kufi text-foreground mb-2">
              قائمة المستخدمين
            </h1>
            <p className="text-lg text-muted-foreground">
              إدارة المستخدمين المسجلين في النظام
            </p>
          </div>
          <Link to="/dashboard">
            <Button variant="outline" className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5" />
              لوحة التحكم
            </Button>
          </Link>
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              جميع المستخدمين
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-6">جارٍ التحميل...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم الكامل</TableHead>
                    <TableHead>رقم الهاتف</TableHead>
                    <TableHead>تاريخ التسجيل</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.full_name ?? "—"}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {user.phone ?? "—"}
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString("ar-DZ")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline">
                            عرض
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        لا يوجد مستخدمون
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UsersTable;