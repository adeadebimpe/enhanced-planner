import { Info } from 'lucide-react'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface MetricRowProps {
	label: string
	value: string | number
	tooltip: string
	showBorder?: boolean
	className?: string
}

export function MetricRow({
	label,
	value,
	tooltip,
	showBorder = true,
	className,
}: MetricRowProps) {
	return (
		<div
			className={cn(
				'flex justify-between items-center py-3',
				showBorder && 'border-b border-border/50',
				className
			)}
		>
			<div className="flex items-center gap-1.5">
				<span className="text-[12px] text-muted-foreground">{label}</span>
				<Tooltip>
					<TooltipTrigger className="group">
						<Info className="h-3 w-3 text-muted-foreground/50 group-hover:fill-muted-foreground/50 transition-all" />
					</TooltipTrigger>
					<TooltipContent>
						<p className="text-xs">{tooltip}</p>
					</TooltipContent>
				</Tooltip>
			</div>
			<span className="font-mono font-semibold text-[14px] text-foreground">
				{value}
			</span>
		</div>
	)
}
