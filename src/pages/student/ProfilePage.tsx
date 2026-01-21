import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function getProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile({ ...data, email: user.email });
      }
      setLoading(false);
    }
    getProfile();
  }, []);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  return (
    <DashboardLayout
      userName={profile?.full_name}
      userEmail={profile?.email}
      onLogout={() => navigate("/")}
    >
      <div className="max-w-2xl space-y-8">
        <div>
          <h1 className="font-display text-2xl font-bold">👤 Meu Perfil</h1>
          <p className="text-muted-foreground">Seus dados cadastrais.</p>
        </div>

        <div className="flex items-center gap-6 p-6 border rounded-xl bg-card">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="text-2xl font-bold">
              {profile?.full_name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{profile?.full_name}</h2>
            <p className="text-muted-foreground">{profile?.email}</p>
          </div>
        </div>

        <div className="space-y-4 p-6 border rounded-xl bg-card">
          <h3 className="font-semibold text-lg">Informações Pessoais</h3>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Nome Completo</Label>
              <Input
                value={profile?.full_name || ""}
                disabled
                className="bg-muted/50"
              />
            </div>
            <div className="grid gap-2">
              <Label>E-mail</Label>
              <Input
                value={profile?.email || ""}
                disabled
                className="bg-muted/50"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            * Para alterar seus dados, entre em contato com a secretaria da
            escola.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
