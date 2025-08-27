import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Save, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import EmailChangeDialog from "@/components/EmailChangeDialog";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    phone: ""
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone: data.phone || ""
        });
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: user.id,
            full_name: profile.full_name,
            phone: profile.phone
          },
          {
            onConflict: 'user_id'
          }
        );

      if (error) throw error;

      toast({
        title: "تم حفظ البيانات بنجاح",
        description: "تم تحديث معلومات الملف الشخصي"
      });
    } catch (error: any) {
      toast({
        title: "خطأ في حفظ البيانات",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p>يجب تسجيل الدخول أولاً</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-kufi text-foreground mb-2">
              البروفايل الشخصي
            </h1>
            <p className="text-lg text-muted-foreground">
              إدارة معلوماتك الشخصية
            </p>
          </div>
          <Link to="/dashboard">
            <Button variant="outline" className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5" />
              لوحة التحكم
            </Button>
          </Link>
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              معلومات الحساب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email */}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <EmailChangeDialog>
                  <Button variant="ghost" size="sm">
                    تغيير
                  </Button>
                </EmailChangeDialog>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={user.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <Label htmlFor="full_name">الاسم الكامل</Label>
              <Input
                id="full_name"
                placeholder="أدخل اسمك الكامل"
                value={profile.full_name}
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                className="mt-2"
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <div className="flex items-center gap-2 mt-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="أدخل رقم هاتفك"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="w-full"
                variant="hero"
              >
                <Save className="w-4 h-4 ml-2" />
                {loading ? "جارٍ الحفظ..." : "حفظ التغييرات"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;