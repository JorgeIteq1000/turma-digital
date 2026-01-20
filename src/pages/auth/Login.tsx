import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons/Logo";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("--- INICIANDO LOGIN ---");

    try {
      // 1. Tenta autenticar
      console.log("1. Tentando signInWithPassword para:", formData.email);
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: formData.email,
          password: formData.password,
        },
      );

      if (authError) {
        console.error("❌ Erro no Auth:", authError);
        // Tratamento de erro comum: Email não confirmado
        if (authError.message.includes("Email not confirmed")) {
          throw new Error("Verifique seu e-mail para confirmar o cadastro.");
        }
        throw new Error(authError.message || "E-mail ou senha incorretos.");
      }

      if (!data.user) {
        throw new Error("Erro desconhecido: Usuário não retornado.");
      }

      console.log("✅ Auth Sucesso! User ID:", data.user.id);

      // 2. Busca a role
      console.log("2. Buscando role na tabela user_roles...");
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (roleError) {
        console.error("❌ Erro ao buscar role:", roleError);
        // Não vamos travar, vamos deixar entrar como student mas avisar no console
      } else {
        console.log("✅ Role encontrada:", roleData);
      }

      const userRole = roleData?.role || "student";
      console.log("3. Role definida para navegação:", userRole);

      toast.success(
        `Bem-vindo, ${userRole === "admin" ? "Administrador" : "Aluno"}!`,
      );

      // 3. Redireciona
      if (userRole === "admin") {
        console.log("🚀 Redirecionando para /admin");
        navigate("/admin");
      } else {
        console.log("🚀 Redirecionando para /dashboard");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("🚨 ERRO FINAL:", error);
      toast.error(error.message || "Falha ao entrar na plataforma.");
    } finally {
      setIsLoading(false);
      console.log("--- FIM DO PROCESSO ---");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <div className="hero-gradient flex flex-col items-center justify-center px-4 py-12 text-center md:py-16">
        <Logo
          size="lg"
          iconClassName="bg-primary-foreground/20"
          textClassName="text-primary-foreground"
        />
        <p className="mt-4 max-w-md text-primary-foreground/80">
          Acesse sua plataforma de aprendizado e aproveite todas as aulas e
          materiais disponíveis para você.
        </p>
      </div>

      {/* Login Form */}
      <div className="flex flex-1 items-start justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-sm">
          <div className="card-elevated p-6 sm:p-8">
            <div className="mb-6 text-center">
              <h1 className="font-display text-2xl font-bold text-foreground">
                Entrar na Plataforma
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Use suas credenciais para acessar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Esqueceu sua senha?{" "}
                <button className="font-medium text-primary hover:underline">
                  Recuperar acesso
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
