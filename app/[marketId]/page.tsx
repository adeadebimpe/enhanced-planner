'use client'

import { useState, useEffect } from 'react'
import { markets as seedMarkets } from '@/data/markets'
import type { Scenario, StrategyResponse, MarketData } from '@/lib/types'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/top-bar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StrategyPanel } from '@/components/strategy-panel'
import { MetricCard } from '@/components/metric-card'
import { SingleRadarChart } from '@/components/single-radar-chart'
import { AiSearchBar } from '@/components/ai-search-bar'
import { TrendingUp, TrendingDown, DollarSign, Users, Loader2, Info, ArrowLeftRight } from 'lucide-react'
import {
	Radar,
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	ResponsiveContainer,
	Tooltip as RechartsTooltip,
} from 'recharts'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { useMarkets } from '@/lib/market-context'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const scenarios: Scenario[] = [
	'Low Regulation',
	'High Capital',
	'Media-First',
	'Athlete-First',
]

export default function MarketPage () {
	const params = useParams()
	const marketId = params.marketId as string
	const { getAllMarkets } = useMarkets()
	const [scenario, setScenario] = useState<Scenario>('Low Regulation')
	const [strategy, setStrategy] = useState<StrategyResponse | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const allMarkets = getAllMarkets()
	const market = allMarkets.find(m => m.id === marketId)

	async function generateStrategy () {
		if (!market) return

		setIsLoading(true)
		setError(null)

		try {
			const seedMarket = seedMarkets.find(
				m => m.country.toLowerCase() === market.name.toLowerCase(),
			)

			const marketData: MarketData = seedMarket || {
				country: market.name,
				code: market.name.substring(0, 2).toUpperCase(),
				population: 0,
				gdpPerCapita: 0,
				sportsCulture: 'Custom market - analyzing based on available data',
				mediaLandscape: 'Custom market - analyzing based on available data',
				regulationNotes: 'Custom market - analyzing based on available data',
			}

			const response = await fetch('/api/strategy', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					market: marketData,
					scenario,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				console.error('API Error Response:', errorData)
				throw new Error(
					errorData.error || `Failed to generate strategy for ${market.name}`,
				)
			}

			const data = await response.json()
			setStrategy(data)
		} catch (err) {
			console.error('Error generating strategy:', err)
			setError(
				err instanceof Error ? err.message : 'Failed to generate strategy',
			)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		generateStrategy()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [marketId, scenario])

	if (!market) {
		return (
			<div className="flex min-h-screen bg-background">
				<Sidebar />
				<div className="flex-1 flex flex-col">
					<TopBar />
					<main className="flex-1 flex items-center justify-center">
						<p className="text-muted-foreground">Market not found</p>
					</main>
				</div>
			</div>
		)
	}

	return (
		<div className="flex min-h-screen bg-background">
			<Sidebar />

			<div className="flex-1 flex flex-col">
				{/* Top Bar */}
				<TopBar
					rightContent={
						<>
							<Link href="/compare">
								<Button variant="outline" size="sm">
									<ArrowLeftRight className="h-4 w-4 mr-2" />
									Compare Markets
								</Button>
							</Link>
							<AiSearchBar
								market={{
									country: market.name,
									code: market.name.substring(0, 2).toUpperCase(),
									population: 0,
									gdpPerCapita: 0,
									sportsCulture: 'Custom market - analyzing based on available data',
									mediaLandscape: 'Custom market - analyzing based on available data',
									regulationNotes: 'Custom market - analyzing based on available data',
								}}
								strategy={strategy}
							/>
						</>
					}
				/>

				<main className="flex-1 overflow-y-auto">
					<div className="p-8 max-w-7xl mx-auto space-y-8">
						{/* Market Title */}
						<div>
							<h1 className="text-4xl font-bold tracking-tight">{market.name}</h1>
						</div>

						{/* Scenario Selector */}
						<div className="flex gap-2">
							{scenarios.map(s => (
								<button
									key={s}
									onClick={() => setScenario(s)}
									className={`px-3 py-1.5 text-xs font-medium transition-all ${
										scenario === s
											? 'bg-primary text-primary-foreground'
											: 'bg-secondary/50 text-foreground/70 hover:bg-secondary/80'
									}`}
								>
									{s}
								</button>
							))}
						</div>

					{/* Error */}
					{error && (
						<div className="p-4 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
							{error}
						</div>
					)}

					{/* Loading */}
					{isLoading && (
						<Card className="bg-card/50 border-border">
							<CardContent className="flex items-center justify-center py-24">
								<div className="space-y-3 text-center">
									<Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
									<p className="text-xs text-muted-foreground font-mono">
										Generating strategy for {scenario} scenario...
									</p>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Results */}
					{!isLoading && strategy && (
						<div className="space-y-6">
							{/* Strategic Summary */}
							<p className="text-sm leading-relaxed text-foreground/90">
								{strategy.narrative.summary}
							</p>

							{/* Risk Metrics Grid - Prioritized */}
							<TooltipProvider>
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
								<MetricCard
									label="Risk Level"
									value={strategy.scenarioImpact.risk.toFixed(1)}
									subtitle="Entry risk assessment"
									icon={<TrendingDown className="h-4 w-4" />}
									tooltip="Overall market entry risk considering regulatory barriers, competition, infrastructure challenges, and political stability. Scale: 1 (low risk) to 10 (high risk)."
									changeType={
										strategy.scenarioImpact.risk > 7
											? 'negative'
											: strategy.scenarioImpact.risk < 4
												? 'positive'
												: 'neutral'
									}
								/>
								<MetricCard
									label="Upside Potential"
									value={strategy.scenarioImpact.upside.toFixed(1)}
									subtitle="Growth opportunity"
									icon={<TrendingUp className="h-4 w-4" />}
									tooltip="Expected growth potential and market opportunity size based on demographics, economic growth, sports culture adoption, and media expansion possibilities. Scale: 1 (limited) to 10 (exceptional)."
									changeType={
										strategy.scenarioImpact.upside > 7 ? 'positive' : 'neutral'
									}
								/>
								<MetricCard
									label="Cost Index"
									value={strategy.scenarioImpact.costIndex.toFixed(1)}
									subtitle="Relative market entry cost"
									icon={<DollarSign className="h-4 w-4" />}
									tooltip="Relative cost to enter and establish operations in this market, including setup costs, operational expenses, marketing investments, and regulatory compliance. Scale: 1 (very affordable) to 10 (very expensive)."
								/>
								<MetricCard
									label="Cultural Fit"
									value={strategy.softScores.culturalFit.toFixed(1)}
									subtitle="Market alignment score"
									icon={<Users className="h-4 w-4" />}
									tooltip="How well the Enhanced Games concept aligns with local sports culture, values, attitudes toward performance enhancement, and fan engagement patterns. Scale: 1 (poor fit) to 10 (excellent fit)."
								/>
								</div>
							</TooltipProvider>

							{/* Market Insights & Soft Scores */}
							<div className="grid gap-6 lg:grid-cols-2">
								{/* Market Insights */}
								<Card className="bg-card/50 border-border">
									<CardHeader className="pb-4">
										<h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
											Market Insights
										</h3>
									</CardHeader>
									<CardContent>
										<TooltipProvider>
											<div className="space-y-0">
												<div className="flex justify-between items-center py-3 border-b border-border/50">
													<div className="flex items-center gap-1.5">
														<span className="text-xs text-muted-foreground">Audience Size</span>
														<Tooltip>
															<TooltipTrigger>
																<Info className="h-3 w-3 text-muted-foreground/50" />
															</TooltipTrigger>
															<TooltipContent>
																<p className="text-xs">Estimated total addressable audience based on cultural fit score</p>
															</TooltipContent>
														</Tooltip>
													</div>
													<span className="font-mono font-semibold text-lg text-foreground">
														{(strategy.softScores.culturalFit * 0.58).toFixed(1)}M
													</span>
												</div>

												<div className="flex justify-between items-center py-3 border-b border-border/50">
													<div className="flex items-center gap-1.5">
														<span className="text-xs text-muted-foreground">Fitness</span>
														<Tooltip>
															<TooltipTrigger>
																<Info className="h-3 w-3 text-muted-foreground/50" />
															</TooltipTrigger>
															<TooltipContent>
																<p className="text-xs">Projected fitness and sports participation rate</p>
															</TooltipContent>
														</Tooltip>
													</div>
													<span className="font-mono font-semibold text-lg text-foreground">
														{Math.round(strategy.softScores.culturalFit * 5.5)}%
													</span>
												</div>

												<div className="flex justify-between items-center py-3 border-b border-border/50">
													<div className="flex items-center gap-1.5">
														<span className="text-xs text-muted-foreground">Streaming</span>
														<Tooltip>
															<TooltipTrigger>
																<Info className="h-3 w-3 text-muted-foreground/50" />
															</TooltipTrigger>
															<TooltipContent>
																<p className="text-xs">Media potential score for digital streaming platforms</p>
															</TooltipContent>
														</Tooltip>
													</div>
													<span className="font-mono font-semibold text-lg text-foreground">
														{Math.round(strategy.softScores.mediaPotential * 8.9)}
													</span>
												</div>

												<div className="flex justify-between items-center py-3 border-b border-border/50">
													<div className="flex items-center gap-1.5">
														<span className="text-xs text-muted-foreground">Sponsorship</span>
														<Tooltip>
															<TooltipTrigger>
																<Info className="h-3 w-3 text-muted-foreground/50" />
															</TooltipTrigger>
															<TooltipContent>
																<p className="text-xs">Commercial sponsorship value and brand partnership potential</p>
															</TooltipContent>
														</Tooltip>
													</div>
													<span className="font-mono font-semibold text-lg text-foreground">
														{Math.round(strategy.softScores.sponsorshipAppetite * 8)}
													</span>
												</div>

												<div className="flex justify-between items-center py-3">
													<div className="flex items-center gap-1.5">
														<span className="text-xs text-muted-foreground">Regulation</span>
														<Tooltip>
															<TooltipTrigger>
																<Info className="h-3 w-3 text-muted-foreground/50" />
															</TooltipTrigger>
															<TooltipContent>
																<p className="text-xs">Regulatory environment friendliness score</p>
															</TooltipContent>
														</Tooltip>
													</div>
													<span className="font-mono font-semibold text-lg text-foreground">
														{Math.round(strategy.softScores.regulatoryFriendliness * 7.5)}
													</span>
												</div>
											</div>
										</TooltipProvider>
									</CardContent>
								</Card>

								{/* Soft Scores */}
								<Card className="bg-card/50 border-border">
									<CardHeader className="pb-4">
										<h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
											Soft Scores
										</h3>
									</CardHeader>
									<CardContent>
										{/* Radar Chart */}
										<ResponsiveContainer width="100%" height={350}>
											<RadarChart data={[
												{ metric: 'Cultural Fit', value: strategy.softScores.culturalFit, fullMark: 10 },
												{ metric: 'Regulatory', value: strategy.softScores.regulatoryFriendliness, fullMark: 10 },
												{ metric: 'Media', value: strategy.softScores.mediaPotential, fullMark: 10 },
												{ metric: 'Sponsorship', value: strategy.softScores.sponsorshipAppetite, fullMark: 10 },
												{ metric: 'Infrastructure', value: strategy.softScores.infrastructureReadiness, fullMark: 10 },
											]}>
												<PolarGrid stroke="hsl(var(--border))" opacity={0.3} />
												<PolarAngleAxis
													dataKey="metric"
													tick={{
														fill: 'hsl(var(--foreground))',
														fontSize: 12,
														fontWeight: 500,
													}}
												/>
												<PolarRadiusAxis
													angle={90}
													domain={[0, 10]}
													tick={false}
													axisLine={false}
												/>
												<Radar
													dataKey="value"
													stroke="hsl(var(--primary))"
													fill="hsl(var(--primary))"
													fillOpacity={0.25}
													strokeWidth={2}
													dot={{
														fill: 'hsl(var(--primary))',
														strokeWidth: 0,
														r: 4,
													}}
												/>
												<RechartsTooltip
													contentStyle={{
														backgroundColor: 'hsl(var(--card))',
														border: '1px solid hsl(var(--border))',
														borderRadius: '6px',
														padding: '8px 12px',
														color: 'hsl(var(--foreground))',
													}}
													formatter={(value: number) => [value.toFixed(1), 'Score']}
												/>
											</RadarChart>
										</ResponsiveContainer>
									</CardContent>
								</Card>
							</div>

							{/* Strategy Panel */}
							<StrategyPanel
								marketName={market.name}
								strategy={strategy}
								isLoading={false}
							/>
						</div>
					)}

						{/* Footer */}
						<div className="pt-8 border-t border-border/50 text-center text-xs text-muted-foreground">
							<p>
								Powered by OpenAI GPT-4 • Market data from official sources •
								AI-generated strategic analysis
							</p>
						</div>
					</div>
				</main>
			</div>
		</div>
	)
}
