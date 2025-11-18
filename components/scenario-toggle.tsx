'use client'

import { Scenario } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ScenarioToggleProps {
	selectedScenario: Scenario
	onScenarioChange: (scenario: Scenario) => void
}

const scenarios: Scenario[] = [
	'Low Regulation',
	'High Capital',
	'Media-First',
	'Athlete-First',
]

const scenarioDescriptions: Record<Scenario, string> = {
	'Low Regulation': 'Focus on regulatory arbitrage and quick market entry',
	'High Capital':
		'Premium positioning with significant infrastructure investment',
	'Media-First': 'Prioritize broadcast deals and digital engagement',
	'Athlete-First': 'Focus on athlete recruitment and training facilities',
}

export function ScenarioToggle ({
	selectedScenario,
	onScenarioChange,
}: ScenarioToggleProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Entry Scenario</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
					{scenarios.map(scenario => (
						<Button
							key={scenario}
							variant={selectedScenario === scenario ? 'default' : 'outline'}
							size="sm"
							onClick={() => onScenarioChange(scenario)}
							className={cn(
								'text-xs',
								selectedScenario === scenario && 'shadow-md',
							)}
						>
							{scenario}
						</Button>
					))}
				</div>
				<p className="text-xs text-muted-foreground leading-relaxed">
					{scenarioDescriptions[selectedScenario]}
				</p>
			</CardContent>
		</Card>
	)
}
