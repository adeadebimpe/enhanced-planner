import { z } from 'zod'
import { clampScore } from './constants'

/**
 * Shared validation schemas for API responses
 */

export const softScoresSchema = z.object({
	culturalFit: z.number().transform(clampScore),
	regulatoryFriendliness: z.number().transform(clampScore),
	mediaPotential: z.number().transform(clampScore),
	sponsorshipAppetite: z.number().transform(clampScore),
	infrastructureReadiness: z.number().transform(clampScore),
})

export const scenarioImpactSchema = z.object({
	risk: z.number().transform(clampScore),
	upside: z.number().transform(clampScore),
	costIndex: z.number().transform(clampScore),
})

export const marketInsightsSchema = z.object({
	audienceSize: z.number(),
	fitnessRate: z.number(),
	streamingScore: z.number(),
	sponsorshipValue: z.number(),
	regulationScore: z.number(),
})

export const geopoliticalAssessmentSchema = z.object({
	stabilityScore: z.number().transform(clampScore),
	riskLevel: z.enum(['Low', 'Medium', 'High']),
	keyFactors: z.array(z.string()),
	recommendations: z.array(z.string()),
})

export const bestCitiesSchema = z.array(
	z.object({
		name: z.string(),
		latitude: z.number(),
		longitude: z.number(),
		population: z.number(),
		advantages: z.array(z.string()),
	}),
)

export const narrativeSchema = z.object({
	summary: z.string(),
	reasonsToEnter: z.array(z.string()),
	keyRisks: z.array(z.string()),
})

export const executionPlanSchema = z.object({
	week1to2: z.string(),
	week3to4: z.string(),
	week5to6: z.string(),
	week7to8: z.string(),
	week9to12: z.string(),
})

/**
 * Complete market analysis response schema
 */
export const marketAnalysisSchema = z.object({
	softScores: softScoresSchema,
	scenarioImpact: scenarioImpactSchema,
	marketInsights: marketInsightsSchema,
	geopoliticalAssessment: geopoliticalAssessmentSchema,
	bestCities: bestCitiesSchema,
	narrative: narrativeSchema,
})

/**
 * Execution plan response schema
 */
export const executionPlanResponseSchema = z.object({
	executionPlan: executionPlanSchema,
})
