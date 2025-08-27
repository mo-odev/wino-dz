import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, AlertCircle } from "lucide-react";

interface EmailChangeDialogProps {
  children: React.ReactNode;
}

const EmailChangeDialog = ({ children }: EmailChangeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailChange = async () => {
    if (!newEmail || !confirmation) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive"
      });
      return;
    }

    if (confirmation !== "وينو") {
      toast({
        title: "خطأ في التأكيد",
        description: "يرجى كتابة اسم المنصة 'وينو' للتأكيد",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;

      toast({
        title: "تم إرسال رابط التأكيد",
        description: "تحقق من بريدك الإلكتروني الجديد لتأكيد التغيير"
      });
      setOpen(false);
      setNewEmail("");
      setConfirmation("");
    } catch (error: any) {
      toast({
        title: "خطأ في تحديث البريد الإلكتروني",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            تغيير البريد الإلكتروني
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
            <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
            <div className="text-sm text-warning-foreground">
              سيتم إرسال رابط تأكيد إلى البريد الجديد. يجب تأكيد التغيير خلال 24 ساعة.
            </div>
          </div>
          
          <div>
            <Label htmlFor="new-email">البريد الإلكتروني الجديد</Label>
            <Input
              id="new-email"
              type="email"
              placeholder="أدخل البريد الإلكتروني الجديد"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="confirmation">للتأكيد، اكتب اسم المنصة: <strong>وينو</strong></Label>
            <Input
              id="confirmation"
              placeholder="اكتب 'وينو' للتأكيد"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="mt-2"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleEmailChange}
              disabled={loading}
              className="flex-1"
              variant="hero"
            >
              {loading ? "جارٍ التحديث..." : "تأكيد التغيير"}
            </Button>
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailChangeDialog;