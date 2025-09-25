import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
  description?: string
  trend?: "up" | "down" | "stable"
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon, 
  description,
  trend = "stable"
}: StatsCardProps) {
  const changeColorClass = {
    positive: "text-medical-green",
    negative: "text-medical-red",
    neutral: "text-muted-foreground"
  }[changeType]

  const iconColorClass = {
    positive: "text-medical-green bg-medical-green-soft",
    negative: "text-medical-red bg-medical-red-soft",
    neutral: "text-primary bg-primary-soft"
  }[changeType]

  return (
    <Card className="medical-card hover:scale-[1.02] transition-transform">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-foreground">
                {value}
              </h3>
              {change && (
                <span className={cn("text-sm font-medium", changeColorClass)}>
                  {change}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            iconColorClass
          )}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}