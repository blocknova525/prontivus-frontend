import { Stethoscope } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingScreenProps {
  className?: string
}

export function LoadingScreen({ className }: LoadingScreenProps) {
  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-background",
      className
    )}>
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-medical-green flex items-center justify-center mx-auto shadow-lg animate-pulse">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <div className="absolute inset-0 w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-medical-green mx-auto opacity-75 animate-ping"></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">CliniCore</h2>
          <p className="text-sm text-muted-foreground">Cuidado Inteligente</p>
          <div className="w-32 h-1 bg-muted rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-medical-green rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}