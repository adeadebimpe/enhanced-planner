'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { SoftScores } from '@/lib/types'
import {
	Radar,
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	ResponsiveContainer,
} from 'recharts'

interface SingleRadarChartProps {
	softScores: SoftScores
}

interface DataPoint {
	metric: string
	value: number
	fullMark: number
}

export function SingleRadarChart({ softScores }: SingleRadarChartProps) {
	const data: DataPoint[] = [
		{
			metric: 'Cultural Fit',
			value: softScores.culturalFit,
			fullMark: 10,
		},
		{
			metric: 'Regulatory',
			value: softScores.regulatoryFriendliness,
			fullMark: 10,
		},
		{
			metric: 'Media',
			value: softScores.mediaPotential,
			fullMark: 10,
		},
		{
			metric: 'Sponsorship',
			value: softScores.sponsorshipAppetite,
			fullMark: 10,
		},
		{
			metric: 'Infrastructure',
			value: softScores.infrastructureReadiness,
			fullMark: 10,
		},
	]

	return (
		<Card className="bg-card/50 border-border">
			<CardHeader className="pb-4">
				<h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
					Soft Scores Radar
				</h3>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={350} className="md:h-[350px] h-[280px]">
					<RadarChart data={data}>
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
							tick={{
								fill: 'hsl(var(--muted-foreground))',
								fontSize: 9,
							}}
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
					</RadarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	)
}
