'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { StrategyResponse } from '@/lib/types'
import { CheckCircle2, AlertTriangle, Calendar, Loader2 } from 'lucide-react'

interface StrategyPanelProps {
	marketName: string
	strategy?: StrategyResponse
	isLoading?: boolean
}

export function StrategyPanel ({
	marketName,
	strategy,
	isLoading,
}: StrategyPanelProps) {
	if (isLoading) {
		return (
			<Card className="bg-card/50 border-border">
				<CardContent className="flex items-center justify-center py-24">
					<div className="space-y-3 text-center">
						<Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
						<p className="text-xs text-muted-foreground font-mono">
							Generating strategy...
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	if (!strategy) {
		return null
	}

	return (
		<div className="space-y-4">
			{/* Opportunities & Risks Grid */}
			<div className="grid gap-4 md:grid-cols-2">
				{/* Reasons to Enter */}
				<Card className="bg-card/50 border-border">
					<CardHeader className="pb-4">
						<h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-2">
							<CheckCircle2 className="h-3.5 w-3.5 text-success" />
							Opportunities
						</h3>
					</CardHeader>
					<CardContent className="space-y-3">
						{strategy.narrative.reasonsToEnter.map((reason, idx) => (
							<div
								key={idx}
								className="flex gap-2.5 text-sm leading-relaxed"
							>
								<span className="text-success mt-1 font-mono text-xs">
									{String(idx + 1).padStart(2, '0')}
								</span>
								<span className="text-foreground/80">{reason}</span>
							</div>
						))}
					</CardContent>
				</Card>

				{/* Key Risks */}
				<Card className="bg-card/50 border-border">
					<CardHeader className="pb-4">
						<h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-2">
							<AlertTriangle className="h-3.5 w-3.5 text-warning" />
							Risk Factors
						</h3>
					</CardHeader>
					<CardContent className="space-y-3">
						{strategy.narrative.keyRisks.map((risk, idx) => (
							<div
								key={idx}
								className="flex gap-2.5 text-sm leading-relaxed"
							>
								<span className="text-warning mt-1 font-mono text-xs">
									{String(idx + 1).padStart(2, '0')}
								</span>
								<span className="text-foreground/80">{risk}</span>
							</div>
						))}
					</CardContent>
				</Card>
			</div>

			{/* Execution Timeline */}
			<Card className="bg-card/50 border-border">
				<CardHeader className="pb-4">
					<h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-2">
						<Calendar className="h-3.5 w-3.5" />
						90-Day Execution Timeline
					</h3>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-4">
						{[
							{ label: 'Week 1-2', content: strategy.executionPlan.week1to2 },
							{ label: 'Week 3-4', content: strategy.executionPlan.week3to4 },
							{ label: 'Week 5-6', content: strategy.executionPlan.week5to6 },
							{ label: 'Week 7-8', content: strategy.executionPlan.week7to8 },
							{ label: 'Week 9-12', content: strategy.executionPlan.week9to12 },
						].map((phase, idx) => (
							<div key={idx} className="relative pl-6">
								<div className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
								{idx < 4 && (
									<div className="absolute left-[5px] top-6 bottom-0 w-0.5 bg-gradient-to-b from-primary/60 to-primary/20" />
								)}
								<div className="space-y-1.5">
									<p className="text-xs font-mono text-primary font-medium">
										{phase.label}
									</p>
									<p className="text-sm leading-relaxed text-foreground/80">
										{phase.content}
									</p>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
