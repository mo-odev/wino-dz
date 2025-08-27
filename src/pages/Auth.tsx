import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  // مراقبة حالة المصادقة
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) await redirectUser(session.user);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) await redirectUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // إعادة التوجيه حسب صلاحية المستخدم
  const redirectUser = async (user: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("خطأ عند جلب profile:", error);
        return;
      }

      // إذا لم يوجد ملف profile، أنشئه تلقائيًا مع is_admin = false
      if (!profile) {
        await supabase.from("profiles").insert({
          user_id: user.id,
          full_name: fullName || "",
          phone: phone || "",
          is_admin: false
        });
        navigate("/"); // توجيه المستخدم العادي
        return;
      }

      // توجيه حسب صلاحية المستخدم
      if (profile?.is_admin === true) {
        navigate("/DashboardAdmin");
      } else {
        navigate("/");
      }

    } catch (err) {
      console.error("خطأ أثناء إعادة التوجيه:", err);
    }
  };

  // تسجيل حساب جديد
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl, data: { full_name: fullName, phone } }
      });

      if (error) throw error;

      toast({ title: "تم إنشاء الحساب بنجاح!", description: "تحقق من بريدك الإلكتروني لتأكيد حسابك." });

      if (data?.user) {
        await supabase.from("profiles").insert({
          user_id: data.user.id,
          full_name: fullName,
          phone,
          is_admin: false
        });
        await redirectUser(data.user);
      }
    } catch (error: any) {
      toast({ title: "خطأ في إنشاء الحساب", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // تسجيل الدخول
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      toast({ title: "مرحباً بك!", description: "تم تسجيل الدخول بنجاح." });

      if (data?.user) {
        await redirectUser(data.user);
      }

    } catch (error: any) {
      toast({ title: "خطأ في تسجيل الدخول", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 space-x-reverse">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft">
              <Heart className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold font-kufi text-primary">وينو؟</span>
          </Link>
        </div>

        <Card className="bg-card/95 backdrop-blur-md border-border shadow-soft">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isLogin ? "أدخل بياناتك للوصول إلى حسابك" : "املأ البيانات التالية لإنشاء حساب جديد"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground">الاسم الكامل</Label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="أدخل اسمك الكامل"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pr-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">رقم الهاتف (اختياري)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="أدخل رقم هاتفك"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 pl-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" variant="hero" disabled={loading}>
                {loading ? "جاري التحميل..." : (isLogin ? "تسجيل الدخول" : "إنشاء الحساب")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:text-primary/80 font-medium mr-2 transition-colors"
                >
                  {isLogin ? "إنشاء حساب جديد" : "تسجيل الدخول"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
