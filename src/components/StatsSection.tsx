import { TrendingUp, Users, MapPin, Clock, Package, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStats } from "@/hooks/useStats";

const StatsSection = () => {
  const { stats, loading } = useStats();

  const statCards = [
    {
      title: "إجمالي الإعلانات",
      value: stats.totalAds,
      icon: Package,
      color: "text-primary"
    },
    {
      title: "الأشياء المفقودة",
      value: stats.totalAds - stats.successStories - stats.foundOwner,
      icon: TrendingUp,
      color: "text-destructive"
    },
    {
      title: "الأشياء الموجودة",
      value: stats.successStories,
      icon: CheckCircle,
      color: "text-success"
    },
    {
      title: "المستخدمين النشطين",
      value: stats.activeUsers,
      icon: Users,
      color: "text-warning"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-indigo-50/40 to-white relative overflow-hidden">
      {/* زخرفة خلفية */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* العنوان */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold font-kufi text-foreground mb-4 relative inline-block">
            إحصائيات المنصة
            <span className="block w-16 h-1 bg-gradient-to-r from-primary to-indigo-400 mx-auto mt-2 rounded-full"></span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            أرقام حقيقية تعكس نشاط وفعالية منصة العثور على المفقودات
          </p>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="relative backdrop-blur-md bg-white/70 border border-white/20 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* أيقونة خلفية شفافة */}
                <div className="absolute top-4 right-4 opacity-10">
                  <Icon className="w-20 h-20" />
                </div>

                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-full bg-gradient-to-br from-white/40 to-white/10 shadow-inner ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className={`text-3xl font-extrabold ${stat.color} drop-shadow-sm`}>
                      {loading ? "..." : stat.value}
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </h3>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* بطاقات إضافية */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Clock className="w-5 h-5" />
                استجابة سريعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                متوسط وقت الاستجابة أقل من 24 ساعة لمعظم الإعلانات
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20 hover:shadow-lg hover:-translate-y-1 transition-all rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                معدل نجاح عالي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {stats.foundOwner > 0 &&
                  `${Math.round((stats.foundOwner / stats.totalAds) * 100)}%`
                } من الحالات تم حلها بنجاح
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20 hover:shadow-lg hover:-translate-y-1 transition-all rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <MapPin className="w-5 h-5" />
                تغطية واسعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                نغطي جميع ولايات الجزائر الـ58 مع شبكة واسعة من المتطوعين
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
