import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flag, User, Calendar, AlertTriangle, Eye } from "lucide-react";

type Report = {
  id: string;
  item_id: string;
  reporter_id: string | null;
  reason: string;
  status?: string;
  created_at: string;
  // Relations will be fetched separately
  item_title?: string;
  item_status?: string;
  reporter_name?: string;
};

const ReportsTable = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // First, let's just try to get the basic reports data
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (reportsError) {
        console.error("Reports error:", reportsError);
        throw reportsError;
      }

      console.log("Raw reports data:", reportsData);

      if (reportsData && reportsData.length > 0) {
        // Get item details for each report
        const enrichedReports = await Promise.all(
          reportsData.map(async (report: any) => {
            let itemDetails = null;
            let reporterDetails = null;

            try {
              // Get item details
              const { data: itemData } = await supabase
                .from('items')
                .select('title, status')
                .eq('id', report.item_id)
                .single();
              itemDetails = itemData;
            } catch (err) {
              console.log("Could not fetch item details for", report.item_id);
            }

            try {
              // Get reporter details
              if (report.reporter_id) {
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('full_name')
                  .eq('user_id', report.reporter_id)
                  .single();
                reporterDetails = profileData;
              }
            } catch (err) {
              console.log("Could not fetch reporter details for", report.reporter_id);
            }

            return {
              ...report,
              item_title: itemDetails?.title,
              item_status: itemDetails?.status,
              reporter_name: reporterDetails?.full_name
            };
          })
        );

        setReports(enrichedReports);
      } else {
        setReports([]);
      }

    } catch (error: any) {
      console.error("Error fetching reports:", error);
      toast({
        title: "خطأ في تحميل البلاغات",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "destructive" | "secondary" | "outline" }> = {
      pending: { label: "قيد المراجعة", variant: "default" },
      resolved: { label: "تم الحل", variant: "secondary" },
      dismissed: { label: "مرفوض", variant: "outline" }
    };
    
    const statusInfo = statusMap[status || 'pending'] || { label: status || 'قيد المراجعة', variant: "default" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("ar-DZ");
    } catch {
      return 'تاريخ غير صحيح';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-kufi text-foreground mb-2">
          البلاغات المُرسلة
        </h1>
        <p className="text-lg text-muted-foreground">
          {reports.length} {reports.length === 1 ? 'بلاغ' : 'بلاغات'} موجود
        </p>
      </div>
      
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5" />
            جميع البلاغات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-6">جارٍ التحميل...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الإعلان المُبلغ عنه</TableHead>
                  <TableHead>سبب البلاغ</TableHead>
                  <TableHead>المُبلغ</TableHead>
                  <TableHead>حالة البلاغ</TableHead>
                  <TableHead>تاريخ البلاغ</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <Flag className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-lg font-medium">لا توجد بلاغات</p>
                        <p className="text-sm mt-1 text-muted-foreground">لم يتم إرسال أي بلاغات بعد</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {report.item_status === 'lost' && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                          {report.item_title || "إعلان محذوف"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                          {report.reason}
                        </span>
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {report.reporter_name || "مستخدم مجهول"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(report.status)}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {formatDate(report.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          مراجعة
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsTable;