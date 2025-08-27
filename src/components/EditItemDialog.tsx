import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Item, useItems } from "@/hooks/useItems";
import { Loader2 } from "lucide-react";

type ItemStatus = "lost" | "found" | "found_owner";

interface EditItemDialogProps {
  item: Item;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditItemDialog = ({ item, open, onOpenChange }: EditItemDialogProps) => {
  const [status, setStatus] = useState<ItemStatus>(item.status as ItemStatus);
  const [loading, setLoading] = useState(false);
  const { updateItem } = useItems();

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateItem(item.id, { status: status as any });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تعديل الإعلان</DialogTitle>
          <DialogDescription>
            تحديث حالة الإعلان "{item.title}"
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">حالة الإعلان</label>
            <Select value={status} onValueChange={(value: string) => setStatus(value as ItemStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lost">مفقود</SelectItem>
                <SelectItem value="found">معثور عليه</SelectItem>
                <SelectItem value="found_owner">تم العثور على صاحبه</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
            حفظ التغييرات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;