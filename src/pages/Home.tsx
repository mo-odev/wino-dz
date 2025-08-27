import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import RecentItems from "@/components/RecentItems";
import StatsSection from "@/components/StatsSection";
import MapSection from "@/components/MapSection";
import { Button } from "@/components/ui/button";
import { Heart, Users, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import FooTer from "@/components/FooTer";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <RecentItems />
       <StatsSection />
      
      
     {/* Features Section */}
<section className="py-16 bg-gradient-to-b from-indigo-50 to-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* العنوان والوصف */}
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold font-kufi text-foreground mb-4">
        لماذا وينو؟
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        منصة موثوقة وآمنة لمساعدة المواطنين في إيجاد ممتلكاتهم المفقودة
      </p>
    </div>

    {/* المزايا */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 place-items-center">
      {/* عنصر 1 */}
      <div className="flex flex-col items-center text-center group p-6 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300">
        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-indigo-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-2">مجتمع متساند</h3>
        <p className="text-muted-foreground text-sm">
          مجتمع من الأشخاص الطيبين يساعدون بعضهم البعض
        </p>
      </div>

      {/* عنصر 2 */}
      <div className="flex flex-col items-center text-center group p-6 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300">
        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-indigo-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-2">آمن وموثوق</h3>
        <p className="text-muted-foreground text-sm">
          نظام آمن لحماية بياناتك ومعلوماتك الشخصية
        </p>
      </div>

      {/* عنصر 3 */}
      <div className="flex flex-col items-center text-center group p-6 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300">
        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-indigo-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-2">سريع وفعال</h3>
        <p className="text-muted-foreground text-sm">
          نشر الإعلانات والبحث بسرعة وسهولة
        </p>
      </div>

      {/* عنصر 4 */}
      <div className="flex flex-col items-center text-center group p-6 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300">
        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-indigo-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-2">تغطية شاملة</h3>
        <p className="text-muted-foreground text-sm">
          جميع الولايات الجزائرية في منصة واحدة
        </p>
      </div>
    </div>
  </div>
</section>



      {/* CTA Section */}
<section className="py-20 bg-gradient-to-b from-green-50 to-white">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 className="text-3xl md:text-4xl font-bold font-kufi text-foreground mb-6">
      ابدأ الآن في البحث أو المساعدة
    </h2>
    <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
      انضم إلى آلاف الجزائريين الذين يساعدون بعضهم البعض في إيجاد الأشياء المفقودة
    </p>

    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link to="/post">
        <Button
          size="lg"
          className="px-8 py-4 rounded-full bg-gradient-to-r from-green-500 to-indigo-500 text-white text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          نشر إعلان جديد
        </Button>
      </Link>

      <Link to="/search">
        <Button
          size="lg"
          variant="outline"
          className="px-8 py-4 rounded-full border-2 border-indigo-300 text-lg text-indigo-700 hover:bg-green-50 hover:text-indigo-900 hover:scale-105 transition-all duration-300"
        >
          تصفح الإعلانات
        </Button>
      </Link>
    </div>
  </div>
</section>


    <FooTer />



    </div>
  );
};

export default Home;