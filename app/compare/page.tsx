'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/top-bar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMarkets } from '@/lib/market-context'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { markets as seedMarkets } from '@/data/markets'
import type { StrategyResponse, MarketData } from '@/lib/types'

interface MarketStrategy {
	marketId: string
	strategy: StrategyResponse | null
	isLoading: boolean
	error: string | null
}

export default function ComparePage() {
	const { getAllMarkets } = useMarkets()
	const markets = getAllMarkets()
	const [selectedMarkets, setSelectedMarkets] = useState<string[]>(['us'])
	const [marketStrategies, setMarketStrategies] = useState<MarketStrategy[]>([])

	function toggleMarket(marketId: string) {
		setSelectedMarkets(prev =>
			prev.includes(marketId)
				? prev.filter(id => id !== marketId)
				: prev.length < 3
					? [...prev, marketId]
					: prev
		)
	}

	useEffect(() => {
		async function fetchStrategies() {
			if (selectedMarkets.length === 0) {
				setMarketStrategies([])
				return
			}

			// Initialize loading state for all selected markets
			setMarketStrategies(
				selectedMarkets.map(id => ({
					marketId: id,
					strategy: null,
					isLoading: true,
					error: null,
				}))
			)

			// Fetch strategies for each market
			const fetchPromises = selectedMarkets.map(async marketId => {
				const market = markets.find(m => m.id === marketId)
				if (!market) return null

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

					const response = await fetch('/api/strategy', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							market: marketData,
							scenario: 'Low Regulation',
						}),
					})

					if (!response.ok) {
						throw new Error('Failed to fetch strategy')
					}

					const data = await response.json()
					return {
						marketId,
						strategy: data,
						isLoading: false,
						error: null,
					}
				} catch (err) {
					return {
						marketId,
						strategy: null,
						isLoading: false,
						error: err instanceof Error ? err.message : 'Failed to load',
					}
				}
			})

			const results = await Promise.all(fetchPromises)
			setMarketStrategies(results.filter(r => r !== null) as MarketStrategy[])
		}

		fetchStrategies()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedMarkets])

	const isLoadingAny = marketStrategies.some(m => m.isLoading)

	return (
		<div className="flex min-h-screen bg-background">
			<Sidebar />

			<div className="flex-1 flex flex-col">
				<TopBar
					leftContent={
						<Link href="/">
							<Button variant="ghost" size="sm">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back
							</Button>
						</Link>
					}
				/>

				<main className="flex-1 overflow-y-auto">
					<div className="p-8 max-w-7xl mx-auto space-y-8">
						{/* Header */}
						<div>
							<h1 className="text-4xl font-bold tracking-tight">Compare Markets</h1>
							<p className="text-sm text-muted-foreground mt-1">
								Select up to 3 markets to compare
							</p>
						</div>

						{/* Market Selection */}
						<Card>
							<CardHeader>
								<h3 className="text-sm font-medium">
									Select Markets ({selectedMarkets.length}/3)
								</h3>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
									{markets.map(market => {
										const isSelected = selectedMarkets.includes(market.id)
										return (
											<button
												key={market.id}
												onClick={() => toggleMarket(market.id)}
												disabled={!isSelected && selectedMarkets.length >= 3}
												className={`p-4 border transition-all text-left ${
													isSelected
														? 'bg-primary/10 border-primary text-primary'
														: 'border-border hover:border-primary/50 hover:bg-muted/50'
												} disabled:opacity-50 disabled:cursor-not-allowed`}
											>
												<div className="font-medium text-sm">{market.name}</div>
												{market.isCustom && (
													<span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary mt-1 inline-block">
														Custom
													</span>
												)}
											</button>
										)
									})}
								</div>
							</CardContent>
						</Card>

						{/* Comparison View */}
						{selectedMarkets.length > 0 ? (
							<Card>
								<CardHeader>
									<h3 className="text-sm font-medium">Market Comparison</h3>
								</CardHeader>
								<CardContent>
									{isLoadingAny ? (
										<div className="flex items-center justify-center py-24">
											<div className="space-y-3 text-center">
												<Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
												<p className="text-xs text-muted-foreground font-mono">
													Loading market strategies...
												</p>
											</div>
										</div>
									) : (
										<>
											<div className="overflow-x-auto">
												<table className="w-full">
													<thead>
														<tr className="border-b border-border bg-muted/30">
															<th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
																Metric
															</th>
															{selectedMarkets.map(marketId => {
																const market = markets.find(m => m.id === marketId)
																return (
																	<th key={marketId} className="text-left py-4 px-4 text-sm font-semibold text-foreground">
																		{market?.name}
																	</th>
																)
															})}
														</tr>
													</thead>
													<tbody>
														{/* Basic Info */}
														<tr className="border-b border-border/50 bg-muted/10">
															<td className="py-3 px-4 text-sm font-medium text-foreground" colSpan={selectedMarkets.length + 1}>
																Basic Information
															</td>
														</tr>
														<tr className="border-b border-border/50">
															<td className="py-3 px-4 text-sm text-muted-foreground">Country Code</td>
															{selectedMarkets.map(marketId => {
																const market = markets.find(m => m.id === marketId)
																return (
																	<td key={marketId} className="py-3 px-4 text-sm font-mono">
																		{market?.id.toUpperCase()}
																	</td>
																)
															})}
														</tr>
														<tr className="border-b border-border/50">
															<td className="py-3 px-4 text-sm text-muted-foreground">Type</td>
															{selectedMarkets.map(marketId => {
																const market = markets.find(m => m.id === marketId)
																return (
																	<td key={marketId} className="py-3 px-4 text-sm">
																		{market?.isCustom ? (
																			<span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary">
																				Custom
																			</span>
																		) : (
																			<span className="text-xs px-2 py-1 rounded-md bg-muted text-foreground">
																				Seed
																			</span>
																		)}
																	</td>
																)
															})}
														</tr>
														<tr className="border-b border-border/50">
															<td className="py-3 px-4 text-sm text-muted-foreground">Population</td>
															{selectedMarkets.map(marketId => {
																const seedMarket = seedMarkets.find(
																	m => m.code.toLowerCase() === marketId.toLowerCase()
																)
																return (
																	<td key={marketId} className="py-3 px-4 text-sm font-mono">
																		{seedMarket ? (seedMarket.population / 1000000).toFixed(1) + 'M' : 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr className="border-b border-border/50">
															<td className="py-3 px-4 text-sm text-muted-foreground">GDP per Capita</td>
															{selectedMarkets.map(marketId => {
																const seedMarket = seedMarkets.find(
																	m => m.code.toLowerCase() === marketId.toLowerCase()
																)
																return (
																	<td key={marketId} className="py-3 px-4 text-sm font-mono">
																		{seedMarket ? '$' + seedMarket.gdpPerCapita.toLocaleString() : 'N/A'}
																	</td>
																)
															})}
														</tr>

														{/* Risk Metrics */}
														<tr className="border-b border-border/50 bg-muted/10">
															<td className="py-3 px-4 text-sm font-medium text-foreground" colSpan={selectedMarkets.length + 1}>
																Risk & Opportunity
															</td>
														</tr>
														<tr className="border-b border-border/50">
															<td className="py-3 px-4 text-sm text-muted-foreground">Risk Level</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																return (
																	<td key={marketId} className="py-3 px-4 text-sm font-mono font-semibold">
																		{marketStrategy?.strategy?.scenarioImpact.risk.toFixed(1) || 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr className="border-b border-border/50">
															<td className="py-3 px-4 text-sm text-muted-foreground">Upside Potential</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																return (
																	<td key={marketId} className="py-3 px-4 text-sm font-mono font-semibold">
																		{marketStrategy?.strategy?.scenarioImpact.upside.toFixed(1) || 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr className="border-b border-border/50">
															<td className="py-3 px-4 text-sm text-muted-foreground">Cost Index</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																return (
																	<td key={marketId} className="py-3 px-4 text-sm font-mono font-semibold">
																		{marketStrategy?.strategy?.scenarioImpact.costIndex.toFixed(1) || 'N/A'}
																	</td>
																)
															})}
														</tr>

														{/* Soft Scores */}
														<tr className="border-b border-border/50 bg-muted/10">
															<td className="py-3 px-4 text-sm font-medium text-foreground" colSpan={selectedMarkets.length + 1}>
																Soft Scores
															</td>
														</tr>
														<tr className="border-b border-border/50">
															<td className="py-3 px-4 text-sm text-muted-foreground">Cultural Fit</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																return (
																	<td key={marketId} className="py-3 px-4 text-sm font-mono">
																		{marketStrategy?.strategy?.softScores.culturalFit.toFixed(1) || 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr className="border-b border-border/50">
															<td className="py-3 px-4 text-sm text-muted-foreground">Regulatory Friendliness</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																return (
																	<td key={marketId} className="py-3 px-4 text-sm font-mono">
																		{marketStrategy?.strategy?.softScores.regulatoryFriendliness.toFixed(1) || 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr className="border-b border-border/50">
															<td className="py-3 px-4 text-sm text-muted-foreground">Media Potential</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																return (
																	<td key={marketId} className="py-3 px-4 text-sm font-mono">
																		{marketStrategy?.strategy?.softScores.mediaPotential.toFixed(1) || 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr className="border-b border-border/50">
															<td className="py-3 px-4 text-sm text-muted-foreground">Sponsorship Appetite</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																return (
																	<td key={marketId} className="py-3 px-4 text-sm font-mono">
																		{marketStrategy?.strategy?.softScores.sponsorshipAppetite.toFixed(1) || 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr className="border-b border-border/50">
															<td className="py-3 px-4 text-sm text-muted-foreground">Infrastructure Readiness</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																return (
																	<td key={marketId} className="py-3 px-4 text-sm font-mono">
																		{marketStrategy?.strategy?.softScores.infrastructureReadiness.toFixed(1) || 'N/A'}
																	</td>
																)
															})}
														</tr>

														{/* Market Insights */}
														<tr className="border-b border-border/50 bg-muted/10">
															<td className="py-3 px-4 text-sm font-medium text-foreground" colSpan={selectedMarkets.length + 1}>
																Market Insights
															</td>
														</tr>
														<tr className="border-b border-border/50">
															<td className="py-3 px-4 text-sm text-muted-foreground">Audience Size</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																const audienceSize = marketStrategy?.strategy?.marketInsights?.audienceSize
																return (
																	<td key={marketId} className="py-3 px-4 text-sm font-mono">
																		{audienceSize != null ? audienceSize.toFixed(1) + 'M' : 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr className="border-b border-border/50">
															<td className="py-3 px-4 text-sm text-muted-foreground">Fitness Rate</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																const fitnessRate = marketStrategy?.strategy?.marketInsights?.fitnessRate
																return (
																	<td key={marketId} className="py-3 px-4 text-sm font-mono">
																		{fitnessRate != null ? fitnessRate.toFixed(0) + '%' : 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr className="border-b border-border/50">
															<td className="py-3 px-4 text-sm text-muted-foreground">Streaming Score</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																const streamingScore = marketStrategy?.strategy?.marketInsights?.streamingScore
																return (
																	<td key={marketId} className="py-3 px-4 text-sm font-mono">
																		{streamingScore ?? 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr className="border-b border-border/50">
															<td className="py-3 px-4 text-sm text-muted-foreground">Sponsorship Value</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																const sponsorshipValue = marketStrategy?.strategy?.marketInsights?.sponsorshipValue
																return (
																	<td key={marketId} className="py-3 px-4 text-sm font-mono">
																		{sponsorshipValue ?? 'N/A'}
																	</td>
																)
															})}
														</tr>
														<tr className="border-b border-border/50">
															<td className="py-3 px-4 text-sm text-muted-foreground">Regulation Score</td>
															{selectedMarkets.map(marketId => {
																const marketStrategy = marketStrategies.find(m => m.marketId === marketId)
																const regulationScore = marketStrategy?.strategy?.marketInsights?.regulationScore
																return (
																	<td key={marketId} className="py-3 px-4 text-sm font-mono">
																		{regulationScore ?? 'N/A'}
																	</td>
																)
															})}
														</tr>

														{/* Actions */}
														<tr className="border-b border-border/50 bg-muted/10">
															<td className="py-3 px-4 text-sm font-medium text-foreground" colSpan={selectedMarkets.length + 1}>
																Actions
															</td>
														</tr>
														<tr>
															<td className="py-3 px-4 text-sm text-muted-foreground">View Full Analysis</td>
															{selectedMarkets.map(marketId => (
																<td key={marketId} className="py-3 px-4 text-sm">
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
											<div className="mt-6 p-4 bg-muted/50 rounded-lg">
												<p className="text-xs text-muted-foreground">
													All metrics are calculated using the Low Regulation scenario. Visit individual market pages to explore different scenarios.
												</p>
											</div>
										</>
									)}
								</CardContent>
							</Card>
						) : (
							<Card className="border-dashed">
								<CardContent className="flex flex-col items-center justify-center py-16 text-center">
									<p className="text-sm text-muted-foreground">
										Click on markets above to start comparing
									</p>
								</CardContent>
							</Card>
						)}
					</div>
				</main>
			</div>
		</div>
	)
}
