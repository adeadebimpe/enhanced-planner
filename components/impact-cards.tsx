'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ScenarioImpact } from '@/lib/types'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

interface ImpactCardsProps {
	marketAName: string
	marketBName: string
	marketAImpact?: ScenarioImpact
	marketBImpact?: ScenarioImpact
}

function getColorClass (value: number, reverse = false) {
	if (reverse) {
		if (value <= 3) return 'text-green-600'
		if (value <= 6) return 'text-yellow-600'
		return 'text-red-600'
	}
	if (value <= 3) return 'text-red-600'
	if (value <= 6) return 'text-yellow-600'
	return 'text-green-600'
}

export function ImpactCards ({
	marketAName,
	marketBName,
	marketAImpact,
	marketBImpact,
}: ImpactCardsProps) {
	if (!marketAImpact || !marketBImpact) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Impact Comparison</CardTitle>
				</CardHeader>
				<CardContent className="flex items-center justify-center h-48">
					<p className="text-muted-foreground text-sm">
						Generate strategy to view impact metrics
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="grid gap-4 md:grid-cols-3">
			{/* Risk Comparison */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium flex items-center gap-2">
						<TrendingDown className="h-4 w-4" />
						Risk Level
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="space-y-1">
						<div className="flex justify-between items-center">
							<span className="text-xs text-muted-foreground">
								{marketAName}
							</span>
							<span
								className={`text-2xl font-bold ${getColorClass(marketAImpact.risk, true)}`}
							>
								{marketAImpact.risk.toFixed(1)}
							</span>
						</div>
						<div className="h-2 bg-secondary rounded-full overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
								style={{ width: `${(marketAImpact.risk / 10) * 100}%` }}
							/>
						</div>
					</div>
					<div className="space-y-1">
						<div className="flex justify-between items-center">
							<span className="text-xs text-muted-foreground">
								{marketBName}
							</span>
							<span
								className={`text-2xl font-bold ${getColorClass(marketBImpact.risk, true)}`}
							>
								{marketBImpact.risk.toFixed(1)}
							</span>
						</div>
						<div className="h-2 bg-secondary rounded-full overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
								style={{ width: `${(marketBImpact.risk / 10) * 100}%` }}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Upside Comparison */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium flex items-center gap-2">
						<TrendingUp className="h-4 w-4" />
						Upside Potential
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="space-y-1">
						<div className="flex justify-between items-center">
							<span className="text-xs text-muted-foreground">
								{marketAName}
							</span>
							<span
								className={`text-2xl font-bold ${getColorClass(marketAImpact.upside)}`}
							>
								{marketAImpact.upside.toFixed(1)}
							</span>
						</div>
						<div className="h-2 bg-secondary rounded-full overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
								style={{ width: `${(marketAImpact.upside / 10) * 100}%` }}
							/>
						</div>
					</div>
					<div className="space-y-1">
						<div className="flex justify-between items-center">
							<span className="text-xs text-muted-foreground">
								{marketBName}
							</span>
							<span
								className={`text-2xl font-bold ${getColorClass(marketBImpact.upside)}`}
							>
								{marketBImpact.upside.toFixed(1)}
							</span>
						</div>
						<div className="h-2 bg-secondary rounded-full overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
								style={{ width: `${(marketBImpact.upside / 10) * 100}%` }}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Cost Index Comparison */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium flex items-center gap-2">
						<DollarSign className="h-4 w-4" />
						Cost Index
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="space-y-1">
						<div className="flex justify-between items-center">
							<span className="text-xs text-muted-foreground">
								{marketAName}
							</span>
							<span
								className={`text-2xl font-bold ${getColorClass(marketAImpact.costIndex, true)}`}
							>
								{marketAImpact.costIndex.toFixed(1)}
							</span>
						</div>
						<div className="h-2 bg-secondary rounded-full overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
								style={{ width: `${(marketAImpact.costIndex / 10) * 100}%` }}
							/>
						</div>
					</div>
					<div className="space-y-1">
						<div className="flex justify-between items-center">
							<span className="text-xs text-muted-foreground">
								{marketBName}
							</span>
							<span
								className={`text-2xl font-bold ${getColorClass(marketBImpact.costIndex, true)}`}
							>
								{marketBImpact.costIndex.toFixed(1)}
							</span>
						</div>
						<div className="h-2 bg-secondary rounded-full overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
								style={{ width: `${(marketBImpact.costIndex / 10) * 100}%` }}
							/>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
