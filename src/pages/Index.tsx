import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Users, Play, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons/Logo";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden px-4 py-16 md:py-24">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="container relative z-10 mx-auto max-w-4xl text-center">
          <Logo
            size="lg"
            iconClassName="bg-primary-foreground/20"
            textClassName="text-primary-foreground"
            className="justify-center mb-8"
          />

          <h1 className="font-display text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            Sua jornada de aprendizado
            <span className="block mt-2 bg-gradient-to-r from-primary-foreground to-primary-foreground/70 bg-clip-text text-transparent">
              começa aqui
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/80 md:text-xl">
            Acesse aulas ao vivo e gravadas, materiais didáticos exclusivos e
            acompanhe seu progresso em uma plataforma moderna e intuitiva.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              variant="hero"
              size="xl"
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto"
            >
              Acessar Plataforma
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Recursos da Plataforma
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para uma experiência de aprendizado completa
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={Play}
              title="Aulas ao Vivo"
              description="Assista aulas em tempo real e interaja com seus professores"
            />
            <FeatureCard
              icon={BookOpen}
              title="Conteúdo Gravado"
              description="Revise aulas quando quiser, no seu próprio ritmo"
            />
            <FeatureCard
              icon={Users}
              title="Turmas Organizadas"
              description="Acesse apenas o conteúdo das suas turmas matriculadas"
            />
            <FeatureCard
              icon={Shield}
              title="Ambiente Seguro"
              description="Seus dados e progresso protegidos com segurança"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted px-4 py-16">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Pronto para começar?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Faça login com suas credenciais fornecidas pela instituição
          </p>
          <Button
            size="lg"
            className="mt-8"
            onClick={() => navigate("/login")}
          >
            Entrar na Plataforma
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8">
        <div className="container mx-auto flex flex-col items-center gap-4 text-center text-sm text-muted-foreground">
          <Logo size="sm" />
          <p>© 2024 EduConnect. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="card-elevated p-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
