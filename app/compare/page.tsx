'use client'

import { useState, useEffect, useMemo } from 'react'
import { Sidebar, SidebarProvider, MobileMenuButton } from '@/components/sidebar'
import { TopBar } from '@/components/top-bar'
import { Button } from '@/components/ui/button'
import { useMarkets } from '@/lib/market-context'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { markets as seedMarkets } from '@/data/markets'
import type { StrategyResponse, MarketData } from '@/lib/types'
import { MultiSelect } from '@/components/multi-select'

interface MarketStrategy {
	marketId: string
	strategy: StrategyResponse | null
	isLoading: boolean
	error: string | null
}

// Cache for market analyses
const marketAnalysisCache = new Map<string, StrategyResponse>()

// Helper component for loading cell
function LoadingCell() {
	return (
		<div className="flex items-center justify-center text-xs text-muted-foreground">
			...
		</div>
	)
}

export default function ComparePage() {
	const { getAllMarkets } = useMarkets()
	const markets = getAllMarkets()
	const [selectedMarkets, setSelectedMarkets] = useState<string[]>(['us'])
	const [marketStrategies, setMarketStrategies] = useState<MarketStrategy[]>([])

	// Prepare options for multi-select
	const marketOptions = useMemo(() => {
		return markets.map(market => ({
			value: market.id,
			label: market.name,
		}))
	}, [markets])

	useEffect(() => {
		async function fetchStrategies() {
			if (selectedMarkets.length === 0) {
				setMarketStrategies([])
				return
			}

			// Initialize with cached data or loading state
			const initialStrategies = selectedMarkets.map(id => {
				const cached = marketAnalysisCache.get(id)
				return {
					marketId: id,
					strategy: cached || null,
					isLoading: !cached,
					error: null,
				}
			})
			setMarketStrategies(initialStrategies)

			// Fetch only uncached markets
			const uncachedMarkets = selectedMarkets.filter(id => !marketAnalysisCache.has(id))

			if (uncachedMarkets.length === 0) return

			// Fetch each market independently and update immediately
			uncachedMarkets.forEach(async marketId => {
				const market = markets.find(m => m.id === marketId)
				if (!market) return

				try {
					const seedMarket = seedMarkets.find(
						m => m.country.toLowerCase() === market.name.toLowerCase()
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

					// Fetch market analysis
					const analysisResponse = await fetch('/api/market-analysis', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ market: marketData }),
					})

					if (!analysisResponse.ok) {
						throw new Error('Failed to fetch market analysis')
					}

					const analysisData = await analysisResponse.json()

					// Cache the result
					marketAnalysisCache.set(marketId, analysisData)

					// Update state immediately for this market
					setMarketStrategies(prev =>
						prev.map(m =>
							m.marketId === marketId
								? { ...m, strategy: analysisData, isLoading: false }
								: m
						)
					)
				} catch (err) {
					setMarketStrategies(prev =>
						prev.map(m =>
							m.marketId === marketId
								? {
									...m,
									isLoading: false,
									error: err instanceof Error ? err.message : 'Failed to load',
								}
								: m
						)
					)
				}
			})
		}

		fetchStrategies()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedMarkets])

	return (
		<SidebarProvider>
			<div className="flex min-h-screen bg-background overflow-x-hidden">
				<Sidebar />

				<div className="flex-1 flex flex-col min-w-0">
					<TopBar
						mobileMenuButton={<MobileMenuButton />}
						leftContent={
							<Link href="/">
								<Button variant="ghost" size="sm">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Back
								</Button>
							</Link>
						}
					/>

				<main className="flex-1 overflow-y-auto border-x border-border/50">
					<div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 min-w-0">
						{/* Header */}
						<div>
							<h1 className="text-xl md:text-2xl font-medium tracking-tight">Compare Markets</h1>
							<p className="text-xs md:text-sm text-muted-foreground mt-1">
								Select up to 3 markets to compare
							</p>
						</div>

						{/* Market Selection */}
						<div className="space-y-4">
							<div className="max-w-2xl">
								<MultiSelect
									options={marketOptions}
									selected={selectedMarkets}
									onChange={setSelectedMarkets}
									placeholder="Select markets to compare..."
									maxSelections={3}
								/>
							</div>
						</div>

						{/* Comparison View */}
						{selectedMarkets.length > 0 ? (

								<div className="min-w-0 w-full">
									<div className="overflow-x-auto -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8">
												<table className="w-full min-w-full">
													<thead>
														<tr className="bg-transparent">
															<th className="text-left py-3 md:py-4 px-3 md:px-4 text-[10px] md:text-xs uppercase tracking-wider text-muted-foreground font-medium whitespace-nowrap">
																Metric
															</th>
															{selectedMarkets.map(marketId => {
																const market = markets.find(m => m.id === marketId)
																return (
																	<th key={marketId} className="text-left py-3 md:py-4 px-3 md:px-4 text-[10px] md:text-xs uppercase tracking-wider text-muted-foreground font-medium">
																		<span className="block max-w-[120px] md:max-w-none">{market?.name}</span>
																	</th>
																)
															})}
														</tr>
													</thead>
													<tbody>
														{/* Basic Info */}
														<tr className="bg-secondary/20">
															<td className="py-2 md:py-3 px-3 md:px-4 text-[10px] md:text-xs uppercase tracking-wider font-medium text-foreground" colSpan={selectedMarkets.length + 1}>
																Basic Information
															</td>
														</tr>
														<tr>
															<td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-muted-foreground whitespace-nowrap">Country Code</td>
															{selectedMarkets.map(marketId => {
																const market = markets.find(m => m.id === marketId)
																return (
																	<td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-mono">
																		{market?.id.toUpperCase()}
																	</td>
																)
															})}
														</tr>
														<tr>
															<td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-muted-foreground whitespace-nowrap">Population</td>
															{selectedMarkets.map(marketId => {
																const seedMarket = seedMarkets.find(
																	m => m.code.toLowerCase() === marketId.toLowerCase()
																)
																return (
																	<td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-mono">
																		{seedMarket ? (seedMarket.population / 1000000).toFixed(1) + 'M' : 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr>
															<td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-muted-foreground whitespace-nowrap">GDP per Capita</td>
															{selectedMarkets.map(marketId => {
																const seedMarket = seedMarkets.find(
																	m => m.code.toLowerCase() === marketId.toLowerCase()
																)
																return (
																	<td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-mono">
																		{seedMarket ? '$' + seedMarket.gdpPerCapita.toLocaleString() : 'N/A'}
																	</td>
																)
															})}
														</tr>

														{/* Risk Metrics */}
														<tr className="bg-secondary/20">
															<td className="py-2 md:py-3 px-3 md:px-4 text-[10px] md:text-xs font-medium text-foreground uppercase tracking-wider" colSpan={selectedMarkets.length + 1}>
																Risk & Opportunity
															</td>
														</tr>
														<tr>
															<td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-muted-foreground whitespace-nowrap">Risk Level</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																return (
																	<td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-mono font-semibold">
																		{marketStrategy?.isLoading ? <LoadingCell /> : marketStrategy?.strategy?.scenarioImpact.risk.toFixed(1) || 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr>
															<td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-muted-foreground whitespace-nowrap">Upside Potential</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																return (
																	<td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-mono font-semibold">
																		{marketStrategy?.isLoading ? <LoadingCell /> : marketStrategy?.strategy?.scenarioImpact.upside.toFixed(1) || 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr>
															<td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-muted-foreground whitespace-nowrap">Cost Index</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																return (
																	<td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-mono font-semibold">
																		{marketStrategy?.isLoading ? <LoadingCell /> : marketStrategy?.strategy?.scenarioImpact.costIndex.toFixed(1) || 'N/A'}
																	</td>
																)
															})}
														</tr>

														{/* Soft Scores */}
														<tr className="bg-secondary/20">
															<td className="py-2 md:py-3 px-3 md:px-4 text-[10px] md:text-xs font-medium text-foreground uppercase tracking-wider" colSpan={selectedMarkets.length + 1}>
																Soft Scores
															</td>
														</tr>
														<tr>
															<td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-muted-foreground whitespace-nowrap">Cultural Fit</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																return (
																	<td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-mono">
																		{marketStrategy?.isLoading ? <LoadingCell /> : marketStrategy?.strategy?.softScores.culturalFit.toFixed(1) || 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr>
															<td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-muted-foreground whitespace-nowrap">Regulatory Friendliness</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																return (
																	<td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-mono">
																		{marketStrategy?.isLoading ? <LoadingCell /> : marketStrategy?.strategy?.softScores.regulatoryFriendliness.toFixed(1) || 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr>
															<td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-muted-foreground whitespace-nowrap">Media Potential</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																return (
																	<td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-mono">
																		{marketStrategy?.isLoading ? <LoadingCell /> : marketStrategy?.strategy?.softScores.mediaPotential.toFixed(1) || 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr>
															<td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-muted-foreground whitespace-nowrap">Sponsorship Appetite</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																return (
																	<td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-mono">
																		{marketStrategy?.isLoading ? <LoadingCell /> : marketStrategy?.strategy?.softScores.sponsorshipAppetite.toFixed(1) || 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr>
															<td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-muted-foreground whitespace-nowrap">Infrastructure Readiness</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																return (
																	<td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-mono">
																		{marketStrategy?.isLoading ? <LoadingCell /> : marketStrategy?.strategy?.softScores.infrastructureReadiness.toFixed(1) || 'N/A'}
																	</td>
																)
															})}
														</tr>

														{/* Market Insights */}
														<tr className="bg-secondary/20">
															<td className="py-2 md:py-3 px-3 md:px-4 text-[10px] md:text-xs font-medium text-foreground uppercase tracking-wider" colSpan={selectedMarkets.length + 1}>
																Market Insights
															</td>
														</tr>
														<tr>
															<td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-muted-foreground whitespace-nowrap">Audience Size</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																if (marketStrategy?.isLoading) {
																	return <td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-mono"><LoadingCell /></td>
																}
																const audienceSize = marketStrategy?.strategy?.marketInsights?.audienceSize
																return (
																	<td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-mono">
																		{audienceSize != null ? audienceSize.toFixed(1) + 'M' : 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr>
															<td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-muted-foreground whitespace-nowrap">Fitness Rate</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																if (marketStrategy?.isLoading) {
																	return <td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-mono"><LoadingCell /></td>
																}
																const fitnessRate = marketStrategy?.strategy?.marketInsights?.fitnessRate
																return (
																	<td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-mono">
																		{fitnessRate != null ? fitnessRate.toFixed(0) + '%' : 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr>
															<td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-muted-foreground whitespace-nowrap">Streaming Score</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																if (marketStrategy?.isLoading) {
																	return <td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-mono"><LoadingCell /></td>
																}
																const streamingScore = marketStrategy?.strategy?.marketInsights?.streamingScore
																return (
																	<td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-mono">
																		{streamingScore ?? 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr>
															<td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-muted-foreground whitespace-nowrap">Sponsorship Value</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																if (marketStrategy?.isLoading) {
																	return <td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-mono"><LoadingCell /></td>
																}
																const sponsorshipValue = marketStrategy?.strategy?.marketInsights?.sponsorshipValue
																return (
																	<td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-mono">
																		{sponsorshipValue ?? 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr>
															<td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-muted-foreground whitespace-nowrap">Regulation Score</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																if (marketStrategy?.isLoading) {
																	return <td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-mono"><LoadingCell /></td>
																}
																const regulationScore = marketStrategy?.strategy?.marketInsights?.regulationScore
																return (
																	<td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-mono">
																		{regulationScore ?? 'N/A'}
																	</td>
																)
															})}
														</tr>

														{/* Actions */}
														<tr className="bg-secondary/20">
															<td className="py-2 md:py-3 px-3 md:px-4 text-[10px] md:text-xs font-medium text-foreground uppercase tracking-wider" colSpan={selectedMarkets.length + 1}>
																Actions
															</td>
														</tr>
														<tr>
															<td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-muted-foreground whitespace-nowrap">View Full Analysis</td>
															{selectedMarkets.map(marketId => (
																<td key={marketId} className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm">
																	<Link href={`/${marketId}`}>
																		<Button variant="outline" size="sm">
																			View Details
																		</Button>
																	</Link>
																</td>
															))}
														</tr>
													</tbody>
												</table>
											</div>
								</div>

						) : (
							<div className="border-dashed border border-border bg-card/50 rounded-lg">
								<div className="flex flex-col items-center justify-center py-16 text-center">
									<p className="text-sm text-muted-foreground">
										Click on markets above to start comparing
									</p>
								</div>
							</div>
						)}
					</div>
				</main>
			</div>
		</div>
		</SidebarProvider>
	)
}
