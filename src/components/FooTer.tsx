import { Heart, Link } from "lucide-react";



const FooTer = () => {
    return(
 <footer className="bg-green-50 py-8">
  <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
    
    {/* الشعار والتعريف */}
    <div className="flex flex-col items-center md:items-start gap-3">
     <Link to="/" className="flex items-center space-x-2 space-x-reverse">
                 <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft">
                   <Heart className="w-6 h-6 text-primary-foreground" />
                 </div>
                 <div className="text-xl font-bold font-kufi text-primary">وينو؟</div>
               </Link>
      <p className="text-gray-600 text-sm max-w-xs">
        منصة جزائرية تساعد الناس على إيجاد الأشياء المفقودة عبر التعاون والمشاركة.
      </p>
    </div>

    {/* روابط الموقع */}
    <div>
      <h3 className="text-gray-800 font-semibold mb-3">روابط</h3>
      <ul className="space-y-2 text-gray-600 text-sm">
        <li><a href="#" className="hover:text-green-700 transition">الرئيسية</a></li>
        <li><a href="#" className="hover:text-green-700 transition">تصفح الإعلانات</a></li>
        <li><a href="#" className="hover:text-green-700 transition">نشر إعلان</a></li>
      </ul>
    </div>

    {/* تواصل معنا */}
    <div>
      <h3 className="text-gray-800 font-semibold mb-3">تواصل معنا</h3>
      <ul className="space-y-2 text-gray-600 text-sm">
        <li><a href="#" className="hover:text-green-700 transition">عن المنصة</a></li>
        <li><a href="#" className="hover:text-green-700 transition">الدعم الفني</a></li>
        <li><a href="#" className="hover:text-green-700 transition">الأسئلة الشائعة</a></li>
      </ul>
    </div>
  </div>

  {/* الحقوق */}
  <div className="border-t border-green-200 mt-6 pt-3 text-center text-gray-500 text-xs">
    © 2024 وينو؟ - جميع الحقوق محفوظة
  </div>
</footer>
)
}
export default FooTer