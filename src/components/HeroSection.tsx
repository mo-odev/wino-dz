import { Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useStats } from "@/hooks/useStats";

const HeroSection = () => {
  const { stats, loading } = useStats();
  return (
    <section className="relative min-h-[650px] flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary-light rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-accent-light rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-secondary-accent rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold font-kufi text-white mb-6 leading-tight">
            وينو؟
          </h1>
          
          <h2 className="text-xl md:text-2xl font-medium text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            منصة جزائرية لإيجاد الأشياء المفقودة والمعثور عليها
            <br />
            <span className="text-lg opacity-80">ساعد في إيجاد ممتلكاتك أو إعادة أشياء وجدتها للآخرين</span>
          </h2>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 animate-slide-up">
            <Link to="/post?type=lost">
              <Button variant="hero" size="xl" className="w-full sm:w-auto min-w-[200px] group">
                <Search className="w-6 h-6 ml-3 group-hover:scale-110 transition-transform" />
                فقدت شيئًا؟
              </Button>
            </Link>
            
            <Link to="/post?type=found">
              <Button 
                variant="outline" 
                size="xl" 
                className="w-full sm:w-auto min-w-[200px] bg-white/10 border-white/30 text-white hover:bg-white/20 group"
              >
                <Package className="w-6 h-6 ml-3 group-hover:scale-110 transition-transform" />
                وجدت شيئًا؟
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center animate-scale-in">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {loading ? "..." : stats.totalAds.toLocaleString('ar-EG')}+
              </div>
              <div className="text-white/80 text-sm md:text-base">إعلان نشط</div>
            </div>
            <div className="text-center animate-scale-in delay-100">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {loading ? "..." : stats.successStories.toLocaleString('ar-EG')}+
              </div>
              <div className="text-white/80 text-sm md:text-base">شيء تم إيجاده</div>
            </div>
            <div className="text-center animate-scale-in delay-200">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {loading ? "..." : stats.foundOwner.toLocaleString('ar-EG')}+
              </div>
              <div className="text-white/80 text-sm md:text-base">تم العثور على صاحبه</div>
            </div>
            <div className="text-center animate-scale-in delay-300">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {loading ? "..." : stats.activeUsers.toLocaleString('ar-EG')}+
              </div>
              <div className="text-white/80 text-sm md:text-base">مستخدم نشط</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 120V40C240 10 480 20 720 40C960 60 1200 80 1440 60V120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;