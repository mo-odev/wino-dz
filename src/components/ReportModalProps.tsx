import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface ReportModalProps {
  itemId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ itemId, isOpen, onClose }) => {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [type, setType] = useState("fake");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال سبب البلاغ",
        variant: "destructive",
      });
      return;
    }
    try {
      setLoading(true);
      const user = supabase.auth.user();
      const { error } = await supabase.from("reports").insert([
        {
          item_id: itemId,
          reporter_id: user?.id || null,
          reason: reason.trim(),
          type,
        },
      ]);
      if (error) throw error;

      toast({
        title: "تم الإبلاغ",
        description: "شكراً على الإبلاغ، سيتم مراجعة الإعلان قريباً.",
        variant: "success",
      });

      setReason("");
      setType("fake");
      onClose();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "خطأ",
        description: "تعذر إرسال البلاغ، حاول مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">الإبلاغ عن الإعلان</h2>

        <p className="text-sm text-muted-foreground mb-2">اختر نوع البلاغ:</p>
        <div className="mb-4 space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="fake"
              checked={type === "fake"}
              onChange={() => setType("fake")}
            />
            إعلان مزيف
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="inappropriate"
              checked={type === "inappropriate"}
              onChange={() => setType("inappropriate")}
            />
            محتوى مخالف أو غير لائق
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="other"
              checked={type === "other"}
              onChange={() => setType("other")}
            />
            أخرى
          </label>
        </div>

        <textarea
          className="w-full border rounded p-2 mb-4"
          rows={4}
          placeholder="أدخل تفاصيل البلاغ هنا..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={onClose}
            disabled={loading}
          >
            إلغاء
          </button>
          <button
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "جارٍ الإرسال..." : "إرسال البلاغ"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
