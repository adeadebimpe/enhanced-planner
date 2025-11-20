'use client'

import { useState, useEffect } from 'react'
import { markets as seedMarkets } from '@/data/markets'
import type { Scenario, StrategyResponse, MarketData, MarketAnalysis, ExecutionPlan } from '@/lib/types'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/top-bar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { StrategyPanel } from '@/components/strategy-panel'
import { MetricCard } from '@/components/metric-card'
import { SingleRadarChart } from '@/components/single-radar-chart'
import { AiSearchBar, AiChatPanel } from '@/components/ai-search-bar'
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
import { CitiesMap } from '@/components/cities-map'
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'
import { AnimatedSection } from '@/components/animated-section'
import { motion } from 'framer-motion'

const scenarios: Scenario[] = [
	'High Capital',
	'Media-First',
	'Athlete-First',
]

export default function MarketPage () {
	const params = useParams()
	const marketId = params.marketId as string
	const { getAllMarkets } = useMarkets()
	const [scenario, setScenario] = useState<Scenario>('High Capital')
	const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null)
	const [executionPlan, setExecutionPlan] = useState<ExecutionPlan | null>(null)
	const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false)
	const [isLoadingPlan, setIsLoadingPlan] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [isAiPanelOpen, setIsAiPanelOpen] = useState(false)
	const [isInitialPageLoad, setIsInitialPageLoad] = useState(() => {
		// Check if this is a fresh page load or refresh
		if (typeof window !== 'undefined') {
			return !sessionStorage.getItem('hasVisited')
		}
		return true
	})

	const allMarkets = getAllMarkets()
	const market = allMarkets.find(m => m.id === marketId)

	// Get seed market data for this market
	const seedMarket = market ? seedMarkets.find(
		m => m.country.toLowerCase() === market.name.toLowerCase()
	) : null

	// Use seed market data or create fallback
	const marketData: MarketData | null = market ? (seedMarket || {
		country: market.name,
		code: market.name.substring(0, 2).toUpperCase(),
		population: 0,
		gdpPerCapita: 0,
		sportsCulture: 'Custom market - analyzing based on available data',
		mediaLandscape: 'Custom market - analyzing based on available data',
		regulationNotes: 'Custom market - analyzing based on available data',
	}) : null

	// Combine market analysis and execution plan for backward compatibility
	const strategy: StrategyResponse | null = marketAnalysis && executionPlan
		? { ...marketAnalysis, executionPlan }
		: null

	const isLoading = isLoadingAnalysis || isLoadingPlan

	// Mark session as visited after component mounts
	useEffect(() => {
		if (typeof window !== 'undefined') {
			sessionStorage.setItem('hasVisited', 'true')
		}
	}, [])

	async function generateMarketAnalysis () {
		if (!market || !marketData) return

		setIsLoadingAnalysis(true)
		setError(null)

		try {
			const response = await fetch('/api/market-analysis', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ market: marketData }),
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				console.error('API Error Response:', errorData)
				throw new Error(
					errorData.error || `Failed to generate analysis for ${market.name}`,
				)
			}

			const data = await response.json()
			setMarketAnalysis(data)
			setIsInitialPageLoad(false)
		} catch (err) {
			console.error('Error generating market analysis:', err)
			setError(
				err instanceof Error ? err.message : 'Failed to generate market analysis',
			)
		} finally {
			setIsLoadingAnalysis(false)
		}
	}

	async function generateExecutionPlan (selectedScenario: Scenario) {
		if (!market || !marketData) return

		setIsLoadingPlan(true)
		setError(null)

		try {
			const response = await fetch('/api/execution-plan', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					market: marketData,
					scenario: selectedScenario,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				console.error('API Error Response:', errorData)
				throw new Error(
					errorData.error || `Failed to generate execution plan for ${market.name}`,
				)
			}

			const data = await response.json()
			setExecutionPlan(data.executionPlan)
		} catch (err) {
			console.error('Error generating execution plan:', err)
			setError(
				err instanceof Error ? err.message : 'Failed to generate execution plan',
			)
		} finally {
			setIsLoadingPlan(false)
		}
	}

	// Load market analysis when market changes
	useEffect(() => {
		setMarketAnalysis(null)
		setExecutionPlan(null)
		generateMarketAnalysis()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [marketId])

	// Load execution plan when market analysis is ready (first load)
	useEffect(() => {
		if (marketAnalysis && !executionPlan) {
			generateExecutionPlan(scenario)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [marketAnalysis])

	// Load execution plan when scenario changes (but not on initial load)
	useEffect(() => {
		if (marketAnalysis && executionPlan) {
			generateExecutionPlan(scenario)
		}
		// eslint:disable-next-line react-hooks/exhaustive-deps
	}, [scenario])

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

	// Show simple spinner on initial page load or refresh only
	if (isInitialPageLoad && isLoadingAnalysis && !marketAnalysis) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-2">
					<div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
					<p className="text-sm text-muted-foreground">Loading {market.name}...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="flex min-h-screen bg-background">
			<Sidebar />

			<div className="flex flex-1 overflow-hidden">
				<div className={`flex-1 flex flex-col transition-all duration-300 ${isAiPanelOpen ? 'md:mr-96 mr-0' : ''}`}>
					{/* Top Bar */}
					<TopBar
						leftContent={
							marketData && (
								<AiSearchBar
									market={marketData}
									strategy={strategy || undefined}
									onOpenPanel={() => setIsAiPanelOpen(true)}
								/>
							)
						}
						rightContent={
							<Link href="/compare">
								<Button variant="outline" size="sm">
									<ArrowLeftRight className="h-4 w-4 mr-2" />
									Compare Markets
								</Button>
							</Link>
						}
					/>

					<main className="flex-1 overflow-y-auto border-x border-border/50">
					<div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-4">
						{/* Market Title */}
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<h1 className="text-xl md:text-2xl lg:text-3xl font-medium tracking-tight">{market.name}</h1>
						</motion.div>

					{/* Error */}
					{error && (
						<motion.div
							className="p-4 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm"
							initial={{ opacity: 0, scale: 0.95, y: -10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							transition={{ duration: 0.3 }}
						>
							{error}
						</motion.div>
					)}

					{/* Loading */}
					{isLoadingAnalysis && (
						<div className="space-y-6">
							{/* Summary Skeleton */}
							<Skeleton className="h-6 w-full" />

							{/* Scenario Selector Skeleton */}
							<div className="flex items-center gap-3">
								<Skeleton className="h-4 w-24" />
								<div className="flex gap-2">
									<Skeleton className="h-8 w-28" />
									<Skeleton className="h-8 w-28" />
									<Skeleton className="h-8 w-28" />
									<Skeleton className="h-8 w-28" />
								</div>
							</div>

							{/* Metric Cards Skeleton */}
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
								{[...Array(4)].map((_, i) => (
									<Card key={i} className="bg-card/50 border-border">
										<CardContent className="p-6 space-y-2">
											<Skeleton className="h-4 w-20" />
											<Skeleton className="h-8 w-16" />
											<Skeleton className="h-3 w-32" />
										</CardContent>
									</Card>
								))}
							</div>

							{/* Market Insights & Soft Scores Skeleton */}
							<div className="grid gap-6 lg:grid-cols-2">
								<Card className="bg-card/50 border-border">
									<CardHeader>
										<Skeleton className="h-4 w-32" />
									</CardHeader>
									<CardContent className="space-y-3">
										{[...Array(5)].map((_, i) => (
											<div key={i} className="flex justify-between">
												<Skeleton className="h-4 w-24" />
												<Skeleton className="h-4 w-16" />
											</div>
										))}
									</CardContent>
								</Card>
								<Card className="bg-card/50 border-border">
									<CardHeader>
										<Skeleton className="h-4 w-24" />
									</CardHeader>
									<CardContent>
										<Skeleton className="h-[350px] w-full" />
									</CardContent>
								</Card>
							</div>

							{/* Best Cities Skeleton */}
							<Card className="bg-card/50 border-border">
								<CardHeader>
									<Skeleton className="h-4 w-32" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-[500px] w-full" />
								</CardContent>
							</Card>

							{/* Strategy Panel Skeleton */}
							<Card className="bg-card/50 border-border">
								<CardHeader>
									<Skeleton className="h-4 w-48" />
								</CardHeader>
								<CardContent className="space-y-4">
									{[...Array(5)].map((_, i) => (
										<div key={i} className="space-y-2">
											<Skeleton className="h-4 w-20" />
											<Skeleton className="h-12 w-full" />
										</div>
									))}
								</CardContent>
							</Card>
						</div>
					)}

					{/* Results */}
					{!isLoadingAnalysis && marketAnalysis && (
						<div className="space-y-6">
							{/* Strategic Summary */}
							<AnimatedSection delay={0}>
								<p className="text-xs md:text-sm leading-relaxed text-foreground/90">
									{marketAnalysis.narrative.summary}
								</p>
							</AnimatedSection>

							{/* Risk Metrics Grid - Prioritized */}
							<AnimatedSection delay={0.15}>
							<TooltipProvider>
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
								<MetricCard
									label="Risk Level"
									value={marketAnalysis.scenarioImpact.risk.toFixed(1)}
									tooltip="Overall market entry risk considering regulatory barriers, competition, infrastructure challenges, and political stability. Scale: 1 (low risk) to 10 (high risk)."
									changeType={
										marketAnalysis.scenarioImpact.risk > 7
											? 'negative'
											: marketAnalysis.scenarioImpact.risk < 4
												? 'positive'
												: 'neutral'
									}
								/>
								<MetricCard
									label="Upside Potential"
									value={marketAnalysis.scenarioImpact.upside.toFixed(1)}
									tooltip="Expected growth potential and market opportunity size based on demographics, economic growth, sports culture adoption, and media expansion possibilities. Scale: 1 (limited) to 10 (exceptional)."
									changeType={
										marketAnalysis.scenarioImpact.upside > 7 ? 'positive' : 'neutral'
									}
								/>
								<MetricCard
									label="Cost Index"
									value={marketAnalysis.scenarioImpact.costIndex.toFixed(1)}
									tooltip="Relative cost to enter and establish operations in this market, including setup costs, operational expenses, marketing investments, and regulatory compliance. Scale: 1 (very affordable) to 10 (very expensive)."
								/>
								<MetricCard
									label="Cultural Fit"
									value={marketAnalysis.softScores.culturalFit.toFixed(1)}
									tooltip="How well the Enhanced Games concept aligns with local sports culture, values, attitudes toward performance enhancement, and fan engagement patterns. Scale: 1 (poor fit) to 10 (excellent fit)."
								/>
								</div>
							</TooltipProvider>
							</AnimatedSection>

							{/* Market Insights & Soft Scores */}
							<AnimatedSection delay={0.2}>
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
														<span className="text-[12px] text-muted-foreground">Audience Size</span>
														<Tooltip>
															<TooltipTrigger className="group">
																<Info className="h-3 w-3 text-muted-foreground/50 group-hover:fill-muted-foreground/50 transition-all" />
															</TooltipTrigger>
															<TooltipContent>
																<p className="text-xs">Estimated total addressable audience based on cultural fit score</p>
															</TooltipContent>
														</Tooltip>
													</div>
													<span className="font-mono font-semibold text-[14px] text-foreground">
														{(marketAnalysis.softScores.culturalFit * 0.58).toFixed(1)}M
													</span>
												</div>

												<div className="flex justify-between items-center py-3 border-b border-border/50">
													<div className="flex items-center gap-1.5">
														<span className="text-[12px] text-muted-foreground">Fitness</span>
														<Tooltip>
															<TooltipTrigger className="group">
																<Info className="h-3 w-3 text-muted-foreground/50 group-hover:fill-muted-foreground/50 transition-all" />
															</TooltipTrigger>
															<TooltipContent>
																<p className="text-xs">Projected fitness and sports participation rate</p>
															</TooltipContent>
														</Tooltip>
													</div>
													<span className="font-mono font-semibold text-[14px] text-foreground">
														{Math.round(marketAnalysis.softScores.culturalFit * 5.5)}%
													</span>
												</div>

												<div className="flex justify-between items-center py-3 border-b border-border/50">
													<div className="flex items-center gap-1.5">
														<span className="text-[12px] text-muted-foreground">Streaming</span>
														<Tooltip>
															<TooltipTrigger className="group">
																<Info className="h-3 w-3 text-muted-foreground/50 group-hover:fill-muted-foreground/50 transition-all" />
															</TooltipTrigger>
															<TooltipContent>
																<p className="text-xs">Media potential score for digital streaming platforms</p>
															</TooltipContent>
														</Tooltip>
													</div>
													<span className="font-mono font-semibold text-[14px] text-foreground">
														{Math.round(marketAnalysis.softScores.mediaPotential * 8.9)}
													</span>
												</div>

												<div className="flex justify-between items-center py-3 border-b border-border/50">
													<div className="flex items-center gap-1.5">
														<span className="text-[12px] text-muted-foreground">Sponsorship</span>
														<Tooltip>
															<TooltipTrigger className="group">
																<Info className="h-3 w-3 text-muted-foreground/50 group-hover:fill-muted-foreground/50 transition-all" />
															</TooltipTrigger>
															<TooltipContent>
																<p className="text-xs">Commercial sponsorship value and brand partnership potential</p>
															</TooltipContent>
														</Tooltip>
													</div>
													<span className="font-mono font-semibold text-[14px] text-foreground">
														{Math.round(marketAnalysis.softScores.sponsorshipAppetite * 8)}
													</span>
												</div>

												<div className="flex justify-between items-center py-3">
													<div className="flex items-center gap-1.5">
														<span className="text-[12px] text-muted-foreground">Regulation</span>
														<Tooltip>
															<TooltipTrigger className="group">
																<Info className="h-3 w-3 text-muted-foreground/50 group-hover:fill-muted-foreground/50 transition-all" />
															</TooltipTrigger>
															<TooltipContent>
																<p className="text-xs">Regulatory environment friendliness score</p>
															</TooltipContent>
														</Tooltip>
													</div>
													<span className="font-mono font-semibold text-[14px] text-foreground">
														{Math.round(marketAnalysis.softScores.regulatoryFriendliness * 7.5)}
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
										<ResponsiveContainer width="100%" height={350} className="md:h-[350px] h-[280px]">
											<RadarChart data={[
												{ metric: 'Cultural Fit', value: marketAnalysis.softScores.culturalFit, fullMark: 10 },
												{ metric: 'Regulatory', value: marketAnalysis.softScores.regulatoryFriendliness, fullMark: 10 },
												{ metric: 'Media', value: marketAnalysis.softScores.mediaPotential, fullMark: 10 },
												{ metric: 'Sponsorship', value: marketAnalysis.softScores.sponsorshipAppetite, fullMark: 10 },
												{ metric: 'Infrastructure', value: marketAnalysis.softScores.infrastructureReadiness, fullMark: 10 },
											]}>
												<PolarGrid stroke="hsl(var(--border))" opacity={0.3} />
												<PolarAngleAxis
													dataKey="metric"
													tick={{
														fill: 'hsl(var(--foreground))',
														fontSize: 11,
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
														padding: '6px 10px',
														color: 'hsl(var(--foreground))',
														fontSize: 11,
													}}
													itemStyle={{
														color: 'hsl(var(--foreground))',
														fontSize: 11,
														fontWeight: 500,
													}}
													labelStyle={{
														color: 'hsl(var(--muted-foreground))',
														fontSize: 11,
														marginBottom: 2,
													}}
													formatter={(value: number) => [value.toFixed(1), 'Score']}
												/>
											</RadarChart>
										</ResponsiveContainer>
									</CardContent>
								</Card>
							</div>
							</AnimatedSection>

							{/* Opportunities, Risks, and Geopolitical Assessment */}
							<AnimatedSection delay={0.2}>
							<div className="grid gap-6 lg:grid-cols-3">
								{/* Opportunities */}
								<Card className="bg-card/50 border-border">
									<CardHeader className="pb-4">
										<h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
											Opportunities
										</h3>
									</CardHeader>
									<CardContent>
										<ul className="space-y-2">
											{marketAnalysis.narrative.reasonsToEnter.map((reason, idx) => (
												<li key={idx} className="text-xs md:text-sm text-foreground/80 flex items-start gap-2">
													<CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-success mt-0.5 flex-shrink-0" />
													<span>{reason}</span>
												</li>
											))}
										</ul>
									</CardContent>
								</Card>

								{/* Risk Factors */}
								<Card className="bg-card/50 border-border">
									<CardHeader className="pb-4">
										<h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
											Risk Factors
										</h3>
									</CardHeader>
									<CardContent>
										<ul className="space-y-2">
											{marketAnalysis.narrative.keyRisks.map((risk, idx) => (
												<li key={idx} className="text-xs md:text-sm text-foreground/80 flex items-start gap-2">
													<AlertTriangle className="h-3.5 w-3.5 md:h-4 md:w-4 text-warning mt-0.5 flex-shrink-0" />
													<span>{risk}</span>
												</li>
											))}
										</ul>
									</CardContent>
								</Card>

								{/* Geopolitical Assessment */}
								<Card className="bg-card/50 border-border">
									<CardHeader className="pb-4">
										<h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
											Geopolitical Assessment
										</h3>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="flex items-center justify-between">
											<span className="text-xs text-muted-foreground">Stability Score</span>
											<span className="text-base md:text-lg font-semibold text-foreground">{marketAnalysis.geopoliticalAssessment.stabilityScore.toFixed(1)}/10</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-xs text-muted-foreground">Risk Level</span>
											<span className={`text-xs font-medium px-2 py-1 rounded ${
												marketAnalysis.geopoliticalAssessment.riskLevel === 'Low'
													? 'bg-success/10 text-success'
													: marketAnalysis.geopoliticalAssessment.riskLevel === 'Medium'
													? 'bg-warning/10 text-warning'
													: 'bg-destructive/10 text-destructive'
											}`}>
												{marketAnalysis.geopoliticalAssessment.riskLevel}
											</span>
										</div>
										<div className="pt-2 space-y-2">
											<p className="text-xs text-muted-foreground">Key Factors:</p>
											<ul className="space-y-1">
												{marketAnalysis.geopoliticalAssessment.keyFactors.map((factor, idx) => (
													<li key={idx} className="text-xs text-foreground/70">• {factor}</li>
												))}
											</ul>
										</div>
									</CardContent>
								</Card>
							</div>
							</AnimatedSection>

							{/* Best Cities to Host */}
							<AnimatedSection delay={0.25}>
							<Card className="bg-card/50 border-border">
								<CardHeader className="pb-4">
									<h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
										Best Cities to Host
									</h3>
								</CardHeader>
								<CardContent>
									<div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
										{/* Map */}
										<div className="h-full min-h-[400px]">
											<CitiesMap
												cities={marketAnalysis.bestCities}
												countryName={market.name}
											/>
										</div>

										{/* Cities List */}
										<div className="space-y-4">
											{marketAnalysis.bestCities.map((city, idx) => (
												<div key={idx} className="space-y-2 p-3 md:p-4 rounded-lg bg-secondary/30 border border-border/50">
													<div className="flex items-start justify-between">
														<h4 className="text-xs md:text-sm font-semibold text-white">{city.name}</h4>
														<span className="text-[10px] md:text-xs font-mono text-white">#{idx + 1}</span>
													</div>
													<p className="text-[10px] md:text-xs text-white/70">
														Pop: {(city.population / 1000000).toFixed(1)}M
													</p>
													<ul className="space-y-1">
														{city.advantages.slice(0, 2).map((adv, advIdx) => (
															<li key={advIdx} className="text-[10px] md:text-xs text-white/70 flex items-start gap-1.5">
																<span className="text-white/70 mt-0.5">•</span>
																<span>{adv}</span>
															</li>
														))}
													</ul>
												</div>
											))}
										</div>
									</div>
								</CardContent>
							</Card>
							</AnimatedSection>

							{/* Strategy Panel */}
							<AnimatedSection delay={0.3}>
							<StrategyPanel
								marketName={market.name}
								strategy={strategy || undefined}
								isLoading={isLoadingPlan}
								scenarios={scenarios}
								currentScenario={scenario}
								onScenarioChange={setScenario}
							/>
							</AnimatedSection>
						</div>
					)}

					</div>
				</main>
				</div>

				{/* AI Chat Panel */}
				{marketData && (
					<AiChatPanel
						market={marketData}
						strategy={strategy || undefined}
						isOpen={isAiPanelOpen}
						onClose={() => setIsAiPanelOpen(false)}
					/>
				)}
			</div>
		</div>
	)
}
