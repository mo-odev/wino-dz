import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, Heart, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "تم تسجيل الخروج بنجاح",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الخروج",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const navLinks = [
    { to: "/", label: "الرئيسية" },
    { to: "/dashboard", label: "لوحة التحكم" },
  ];

  return (
    <nav className="bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 space-x-reverse">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="text-xl font-bold font-kufi text-primary">وينو؟</div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10 space-x-reverse">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/search">
                <Search className="w-5 h-5" />
              </Link>
            </Button>
            
            {user ? (
              <>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/profile">
                    <User className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="w-5 h-5" />
                </Button>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/post">نشر إعلان</Link>
                </Button>
              </>
            ) : (
              <Button variant="hero" size="sm" asChild>
                <Link to="/auth">تسجيل الدخول</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-background/95 backdrop-blur-md">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between pb-6 border-b border-border">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Heart className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <span className="text-lg font-bold font-kufi text-primary">وينو؟</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 py-6">
                    <div className="space-y-4">
                      {navLinks.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setIsOpen(false)}
                          className="block text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-6 space-y-4">
                    {user ? (
                      <>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link to="/profile" onClick={() => setIsOpen(false)}>
                            <User className="w-5 h-5 ml-2" />
                            البروفايل الشخصي
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start" 
                          onClick={() => {
                            handleSignOut();
                            setIsOpen(false);
                          }}
                        >
                          <LogOut className="w-5 h-5 ml-2" />
                          تسجيل الخروج
                        </Button>
                        <Button variant="hero" className="w-full" asChild>
                          <Link to="/post" onClick={() => setIsOpen(false)}>
                            نشر إعلان
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <Button variant="hero" className="w-full" asChild>
                        <Link to="/auth" onClick={() => setIsOpen(false)}>
                          تسجيل الدخول
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;