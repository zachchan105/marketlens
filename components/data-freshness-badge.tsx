import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertTriangle } from "lucide-react";

interface DataFreshnessBadgeProps {
  fetchedAt: number;
  age: number;
  isStale: boolean;
}

export function DataFreshnessBadge({ fetchedAt, age, isStale }: DataFreshnessBadgeProps) {
  const ageMinutes = Math.floor(age / 60000);
  const ageHours = Math.floor(age / 3600000);
  
  let label: string;
  let variant: "default" | "secondary" | "outline" | "destructive" = "secondary";
  let Icon = Clock;
  
  if (age < 60000) {
    // Less than 1 minute
    label = "Live Data";
    variant = "default";
    Icon = CheckCircle2;
  } else if (ageMinutes < 60) {
    label = `${ageMinutes}m ago`;
    variant = "secondary";
    Icon = Clock;
  } else if (ageHours < 24) {
    label = `${ageHours}h ago`;
    variant = isStale ? "outline" : "secondary";
    Icon = isStale ? AlertTriangle : Clock;
  } else {
    const ageDays = Math.floor(ageHours / 24);
    label = `${ageDays}d ago`;
    variant = "outline";
    Icon = AlertTriangle;
  }
  
  return (
    <Badge variant={variant} className="gap-1.5">
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}

