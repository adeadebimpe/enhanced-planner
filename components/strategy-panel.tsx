'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { StrategyResponse, Scenario } from '@/lib/types'
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface StrategyPanelProps {
	marketName: string
	strategy?: StrategyResponse | null
	isLoading?: boolean
	scenarios: Scenario[]
	currentScenario: Scenario
	onScenarioChange: (scenario: Scenario) => void
}

export function StrategyPanel ({
	marketName,
	strategy,
	isLoading,
	scenarios,
	currentScenario,
	onScenarioChange,
}: StrategyPanelProps) {
	return (
		<div className="space-y-4">
			{/* Execution Timeline */}
			<Card className="bg-card/50 border-border">
				<CardHeader className="pb-4">
					<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
							90-Day Execution Timeline
						</h3>
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
							<span className="text-xs text-muted-foreground font-medium">Strategy:</span>
							<div className="flex gap-2 flex-wrap">
								{scenarios.map((s) => (
									<motion.button
										key={s}
										onClick={() => onScenarioChange(s)}
										className={`px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
											currentScenario === s
												? 'bg-primary text-primary-foreground'
												: 'bg-secondary/50 text-foreground/70 hover:bg-secondary/80'
										}`}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
									>
										{s}
									</motion.button>
								))}
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{isLoading ? (
						<div className="space-y-4">
							{[...Array(5)].map((_, i) => (
								<div key={i} className="space-y-2 pl-6">
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-16 w-full" />
								</div>
							))}
						</div>
					) : strategy ? (
						<div className="space-y-4">
							{[
								{ label: 'Week 1-2', content: strategy.executionPlan.week1to2 },
								{ label: 'Week 3-4', content: strategy.executionPlan.week3to4 },
								{ label: 'Week 5-6', content: strategy.executionPlan.week5to6 },
								{ label: 'Week 7-8', content: strategy.executionPlan.week7to8 },
								{ label: 'Week 9-12', content: strategy.executionPlan.week9to12 },
							].map((phase, idx) => (
								<div key={idx} className="relative pl-6 md:pl-8">
									<div className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
									{idx < 4 && (
										<div className="absolute left-[5px] top-6 bottom-0 w-0.5 bg-gradient-to-b from-primary/60 to-primary/20" />
									)}
									<div className="space-y-1.5">
										<p className="text-xs md:text-sm font-mono text-foreground font-medium">
											{phase.label}
										</p>
										<p className="text-xs md:text-sm leading-relaxed text-foreground/80">
											{phase.content}
										</p>
									</div>
								</div>
							))}
						</div>
					) : null}
				</CardContent>
			</Card>
		</div>
	)
}
