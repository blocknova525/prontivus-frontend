import { 
  Calendar, 
  UserPlus, 
  FileText, 
  Stethoscope, 
  DollarSign,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const quickActions = [
  {
    title: "Novo Agendamento",
    description: "Agendar consulta",
    icon: Calendar,
    href: "/agenda/novo",
    variant: "primary" as const
  },
  {
    title: "Cadastrar Paciente",
    description: "Novo paciente",
    icon: UserPlus,
    href: "/pacientes/novo",
    variant: "success" as const
  },
  {
    title: "Atendimento",
    description: "Iniciar consulta",
    icon: Stethoscope,
    href: "/atendimento",
    variant: "primary" as const
  },
  {
    title: "Emitir Receita",
    description: "Nova prescrição",
    icon: FileText,
    href: "/receitas/nova",
    variant: "default" as const
  },
  {
    title: "Faturamento",
    description: "TISS / Particular",
    icon: DollarSign,
    href: "/financeiro/faturamento",
    variant: "warning" as const
  },
  {
    title: "Telemedicina",
    description: "Consulta online",
    icon: Activity,
    href: "/telemedicina",
    variant: "success" as const
  }
]

export function QuickActions() {
  const getButtonVariant = (variant: string) => {
    switch (variant) {
      case "primary":
        return "default"
      case "success":
        return "secondary"
      case "warning":
        return "outline"
      default:
        return "ghost"
    }
  }

  const getButtonClass = (variant: string) => {
    switch (variant) {
      case "primary":
        return "medical-button-primary"
      case "success":
        return "medical-button-success"
      case "warning":
        return "medical-button-warning"
      default:
        return ""
    }
  }

  return (
    <Card className="medical-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.title}
              variant={getButtonVariant(action.variant)}
              className={`${getButtonClass(action.variant)} h-auto p-4 flex flex-col items-center gap-2 text-center`}
              asChild
            >
              <a href={action.href}>
                <action.icon className="w-6 h-6" />
                <div>
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs opacity-80">{action.description}</div>
                </div>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}