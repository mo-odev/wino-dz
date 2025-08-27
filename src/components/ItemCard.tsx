import { Calendar, MapPin, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface ItemCardProps {
  id: string;
  title: string;
  description: string;
  image?: string;
  type: "lost" | "found" | "found_owner";
  category: string;
  location: string;
  date: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const ItemCard = ({
  id,
  title,
  description,
  image,
  type,
  category,
  location,
  date,
  isFavorite = false,
  onToggleFavorite,
}: ItemCardProps) => {
  const isUrgent = category === "إنسان";

  return (
    <div
      className={`bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.015] ${
        isUrgent ? "ring-2 ring-destructive/60" : ""
      }`}
      dir="rtl"
    >
      {/* Image Section */}
      <div className="relative w-full h-44 overflow-hidden">
        {image && image !== "" ? (
          <img
            src={
              image.startsWith("http")
                ? image
                : `https://faihlbsxbegfilcxfdry.supabase.co/storage/v1/object/public/images/${image}`
            }
            alt={title}
            className="w-full h-full object-contain object-center transition-transform duration-500 hover:scale-105 bg-gray-50"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              const nextElement = target.nextElementSibling as HTMLElement;
              if (nextElement) {
                nextElement.style.display = "flex";
              }
            }}
          />
        ) : null}

        {/* Fallback if no image */}
        <div
          className={`absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-400 ${
            image && image !== "" ? "hidden" : "flex"
          }`}
        >
          <Package className="w-12 h-12 mb-1" />
          <span className="text-xs">لا توجد صورة</span>
        </div>

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {isUrgent && (
            <Badge
              variant="destructive"
              className="bg-red-500 text-white flex items-center gap-1 py-1 px-2 rounded-lg text-[11px] font-semibold"
            >
              <AlertTriangle className="w-4 h-4" />
              عاجل
            </Badge>
          )}
          <Badge
            variant={
              type === "lost" ? "destructive" : type === "found" ? "success" : "secondary"
            }
            className={`py-1 px-2 rounded-lg text-[11px] font-semibold ${
              type === "found" ? "bg-green-500 text-white" : ""
            }`}
          >
            {type === "lost"
              ? "مفقود"
              : type === "found"
              ? "معثور عليه"
              : "تم العثور على صاحبه"}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Category */}
        <Badge
          variant="outline"
          className="mb-2 text-xs font-medium border-green-500 text-green-600"
        >
          {category}
        </Badge>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{title}</h3>

        {/* Description */}
        <p className="text-gray-600 text-xs mb-4 line-clamp-2">{description}</p>

        {/* Meta Info */}
        <div className="flex justify-between text-gray-500 text-xs mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
        </div>

        {/* Actions */}
        <Link to={`/item/${id}`}>
          <Button
            variant="default"
            className="w-full py-2 text-sm font-semibold bg-green-500 hover:bg-green-600 text-white rounded-xl"
          >
            عرض التفاصيل
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ItemCard;
