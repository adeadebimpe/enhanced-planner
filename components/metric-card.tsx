import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Info } from 'lucide-react'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip'

interface MetricCardProps {
	label: string
	value: string | number
	change?: string
	changeType?: 'positive' | 'negative' | 'neutral'
	subtitle?: string
	icon?: ReactNode
	className?: string
	tooltip?: string
}

export function MetricCard ({
	label,
	value,
	change,
	changeType = 'neutral',
	subtitle,
	icon,
	className,
	tooltip,
}: MetricCardProps) {
	return (
		<div
			className={cn(
				'bg-card rounded-lg border border-border p-4 hover:bg-card/80 transition-colors',
				className,
			)}
		>
			<div className="flex items-start justify-between mb-2">
				<div className="flex items-center gap-1.5">
					<span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
						{label}
					</span>
					{tooltip && (
						<Tooltip>
							<TooltipTrigger asChild>
								<button type="button" className="inline-flex">
									<Info className="h-3 w-3 text-muted-foreground/50 cursor-pointer" />
								</button>
							</TooltipTrigger>
							<TooltipContent>
								<p className="text-xs max-w-xs">{tooltip}</p>
							</TooltipContent>
						</Tooltip>
					)}
				</div>
			</div>

			<div className="flex items-end gap-2">
				<span className="text-2xl font-mono font-semibold tracking-tight">
					{value}
				</span>
				{change && (
					<span
						className={cn(
							'text-xs font-medium mb-1',
							changeType === 'positive' && 'text-success',
							changeType === 'negative' && 'text-destructive',
							changeType === 'neutral' && 'text-muted-foreground',
						)}
					>
						{change}
					</span>
				)}
			</div>
		</div>
	)
}
