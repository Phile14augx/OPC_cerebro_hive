
import { cn } from "../../utils/cn"
import { Loader2 } from "lucide-react"

export function Spinner({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <Loader2 className={cn("h-4 w-4 animate-spin text-[var(--color-text-muted)]", className)} {...props} />
  )
}
