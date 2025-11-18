'use client'

import { MarketData } from '@/lib/types'
import { Select, SelectItem } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MarketPickerProps {
	markets: MarketData[]
	selectedMarket: string
	onMarketChange: (code: string) => void
	label: string
}

export function MarketPicker ({
	markets,
	selectedMarket,
	onMarketChange,
	label,
}: MarketPickerProps) {
	const market = markets.find(m => m.code === selectedMarket)

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">{label}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<Select
					value={selectedMarket}
					onValueChange={onMarketChange}
					placeholder="Select a market"
				>
					{markets.map(m => (
						<SelectItem key={m.code} value={m.code}>
							{m.country}
						</SelectItem>
					))}
				</Select>

				{market && (
					<div className="space-y-3 text-sm">
						<div className="grid grid-cols-2 gap-2">
							<div>
								<span className="text-muted-foreground">Population:</span>
								<p className="font-medium">
									{market.population.toLocaleString()}
								</p>
							</div>
							<div>
								<span className="text-muted-foreground">GDP/Capita:</span>
								<p className="font-medium">
									${market.gdpPerCapita.toLocaleString()}
								</p>
							</div>
						</div>

						<div>
							<span className="text-muted-foreground">Sports Culture:</span>
							<p className="text-xs mt-1 leading-relaxed">
								{market.sportsCulture}
							</p>
						</div>

						<div>
							<span className="text-muted-foreground">Media Landscape:</span>
							<p className="text-xs mt-1 leading-relaxed">
								{market.mediaLandscape}
							</p>
						</div>

						<div>
							<span className="text-muted-foreground">Regulation:</span>
							<p className="text-xs mt-1 leading-relaxed">
								{market.regulationNotes}
							</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
