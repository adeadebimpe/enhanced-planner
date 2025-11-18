'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SoftScores } from '@/lib/types'

interface RadarChartComparisonProps {
	marketAName: string
	marketBName: string
	marketAScores?: SoftScores
	marketBScores?: SoftScores
}

interface DataPoint {
	label: string
	marketA: number
	marketB: number
	angle: number
}

export function RadarChartComparison ({
	marketAName,
	marketBName,
	marketAScores,
	marketBScores,
}: RadarChartComparisonProps) {
	if (!marketAScores || !marketBScores) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Soft Scores Comparison</CardTitle>
				</CardHeader>
				<CardContent className="flex items-center justify-center h-80">
					<p className="text-muted-foreground text-sm">
						Select markets and generate strategy to view comparison
					</p>
				</CardContent>
			</Card>
		)
	}

	const data: DataPoint[] = [
		{
			label: 'Cultural Fit',
			marketA: marketAScores.culturalFit,
			marketB: marketBScores.culturalFit,
			angle: 0,
		},
		{
			label: 'Regulatory',
			marketA: marketAScores.regulatoryFriendliness,
			marketB: marketBScores.regulatoryFriendliness,
			angle: 72,
		},
		{
			label: 'Media',
			marketA: marketAScores.mediaPotential,
			marketB: marketBScores.mediaPotential,
			angle: 144,
		},
		{
			label: 'Sponsorship',
			marketA: marketAScores.sponsorshipAppetite,
			marketB: marketBScores.sponsorshipAppetite,
			angle: 216,
		},
		{
			label: 'Infrastructure',
			marketA: marketAScores.infrastructureReadiness,
			marketB: marketBScores.infrastructureReadiness,
			angle: 288,
		},
	]

	const centerX = 200
	const centerY = 200
	const maxRadius = 150
	const scales = [2, 4, 6, 8, 10]

	function polarToCartesian (
		angle: number,
		radius: number,
	): { x: number; y: number } {
		const radians = ((angle - 90) * Math.PI) / 180
		return {
			x: centerX + radius * Math.cos(radians),
			y: centerY + radius * Math.sin(radians),
		}
	}

	function createPolygonPoints (values: number[]): string {
		return values
			.map((value, index) => {
				const radius = (value / 10) * maxRadius
				const angle = (360 / values.length) * index
				const point = polarToCartesian(angle, radius)
				return `${point.x},${point.y}`
			})
			.join(' ')
	}

	const marketAPoints = createPolygonPoints([
		marketAScores.culturalFit,
		marketAScores.regulatoryFriendliness,
		marketAScores.mediaPotential,
		marketAScores.sponsorshipAppetite,
		marketAScores.infrastructureReadiness,
	])

	const marketBPoints = createPolygonPoints([
		marketBScores.culturalFit,
		marketBScores.regulatoryFriendliness,
		marketBScores.mediaPotential,
		marketBScores.sponsorshipAppetite,
		marketBScores.infrastructureReadiness,
	])

	return (
		<Card>
			<CardHeader>
				<CardTitle>Soft Scores Comparison</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col items-center gap-4">
					<svg
						viewBox="0 0 400 400"
						className="w-full max-w-lg"
						style={{ maxHeight: '400px' }}
					>
						{/* Background circles */}
						{scales.map(scale => (
							<circle
								key={scale}
								cx={centerX}
								cy={centerY}
								r={(scale / 10) * maxRadius}
								fill="none"
								stroke="hsl(var(--border))"
								strokeWidth="1"
								opacity="0.3"
							/>
						))}

						{/* Axis lines */}
						{data.map((point, index) => {
							const end = polarToCartesian(point.angle, maxRadius)
							return (
								<line
									key={index}
									x1={centerX}
									y1={centerY}
									x2={end.x}
									y2={end.y}
									stroke="hsl(var(--border))"
									strokeWidth="1"
									opacity="0.3"
								/>
							)
						})}

						{/* Market A polygon */}
						<polygon
							points={marketAPoints}
							fill="hsl(var(--chart-1))"
							fillOpacity="0.3"
							stroke="hsl(var(--chart-1))"
							strokeWidth="2"
						/>

						{/* Market B polygon */}
						<polygon
							points={marketBPoints}
							fill="hsl(var(--chart-2))"
							fillOpacity="0.3"
							stroke="hsl(var(--chart-2))"
							strokeWidth="2"
						/>

						{/* Market A data points */}
						{data.map((point, index) => {
							const radius = (point.marketA / 10) * maxRadius
							const pos = polarToCartesian(point.angle, radius)
							return (
								<circle
									key={`a-${index}`}
									cx={pos.x}
									cy={pos.y}
									r="4"
									fill="hsl(var(--chart-1))"
								/>
							)
						})}

						{/* Market B data points */}
						{data.map((point, index) => {
							const radius = (point.marketB / 10) * maxRadius
							const pos = polarToCartesian(point.angle, radius)
							return (
								<circle
									key={`b-${index}`}
									cx={pos.x}
									cy={pos.y}
									r="4"
									fill="hsl(var(--chart-2))"
								/>
							)
						})}

						{/* Labels */}
						{data.map((point, index) => {
							const labelRadius = maxRadius + 30
							const pos = polarToCartesian(point.angle, labelRadius)
							return (
								<text
									key={`label-${index}`}
									x={pos.x}
									y={pos.y}
									textAnchor="middle"
									dominantBaseline="middle"
									className="text-xs fill-foreground"
									fontSize="12"
								>
									{point.label}
								</text>
							)
						})}
					</svg>

					{/* Legend */}
					<div className="flex gap-6 items-center justify-center text-sm">
						<div className="flex items-center gap-2">
							<div className="w-4 h-4 rounded-sm bg-[hsl(var(--chart-1))]" />
							<span>{marketAName}</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-4 h-4 rounded-sm bg-[hsl(var(--chart-2))]" />
							<span>{marketBName}</span>
						</div>
					</div>

					{/* Score comparison table */}
					<div className="w-full max-w-lg mt-4">
						<div className="grid grid-cols-3 gap-2 text-xs">
							<div className="font-semibold">Metric</div>
							<div className="font-semibold text-center">{marketAName}</div>
							<div className="font-semibold text-center">{marketBName}</div>
							{data.map((point, index) => (
								<>
									<div key={`label-${index}`} className="text-muted-foreground">
										{point.label}
									</div>
									<div key={`a-${index}`} className="text-center font-medium">
										{point.marketA.toFixed(1)}
									</div>
									<div key={`b-${index}`} className="text-center font-medium">
										{point.marketB.toFixed(1)}
									</div>
								</>
							))}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
