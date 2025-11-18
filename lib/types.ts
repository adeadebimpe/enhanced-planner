export interface MarketData {
	country: string
	code: string
	population: number
	gdpPerCapita: number
	sportsCulture: string
	mediaLandscape: string
	regulationNotes: string
	customQuestions?: string[]
	region?: string
}

export interface CustomMarket {
	id: string
	name: string
	region?: string
	sportsCulture?: string
	mediaLandscape?: string
	regulationNotes?: string
	customQuestions?: string[]
	createdAt: Date
}

export type Scenario =
	| 'Low Regulation'
	| 'High Capital'
	| 'Media-First'
	| 'Athlete-First'

export interface SoftScores {
	culturalFit: number
	regulatoryFriendliness: number
	mediaPotential: number
	sponsorshipAppetite: number
	infrastructureReadiness: number
}

export interface ScenarioImpact {
	risk: number
	upside: number
	costIndex: number
}

export interface ExecutionPlan {
	week1to2: string
	week3to4: string
	week5to6: string
	week7to8: string
	week9to12: string
}

export interface MarketInsights {
	audienceSize: number // in millions
	fitnessRate: number // percentage 0-100
	streamingScore: number // 0-100
	sponsorshipValue: number // 0-100
	regulationScore: number // 0-100
}

export interface StrategyResponse {
	softScores: SoftScores
	scenarioImpact: ScenarioImpact
	marketInsights: MarketInsights
	narrative: {
		summary: string
		reasonsToEnter: string[]
		keyRisks: string[]
	}
	executionPlan: ExecutionPlan
	customInsights?: {
		question: string
		answer: string
	}[]
}

export interface StrategyRequest {
	market: MarketData
	scenario: Scenario
}
