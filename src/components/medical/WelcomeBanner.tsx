import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Stethoscope, Calendar, Users, TrendingUp } from "lucide-react"
import medicalHero from "@/assets/medical-hero.jpg"

export function WelcomeBanner() {
  return (
    <Card className="medical-card overflow-hidden relative mb-6">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10 bg-[url('/api/placeholder/1200/400')]"
      />
      <CardContent className="relative p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-medical-green flex items-center justify-center shadow-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Bem-vindo ao CliniCore
                </h1>
                <p className="text-muted-foreground">
                  Sistema médico completo para sua clínica
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-foreground">2.847 pacientes ativos</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-medical-green" />
                <span className="text-foreground">24 consultas hoje</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-medical-amber" />
                <span className="text-foreground">87% taxa de ocupação</span>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <Button className="medical-button-primary">
              <Calendar className="w-4 h-4 mr-2" />
              Nova Consulta
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}