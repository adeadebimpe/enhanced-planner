import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import type { MarketData } from '@/lib/types'
import { getMarketAnalysisPrompt, SYSTEM_PROMPT } from '@/lib/prompts'

function getOpenAIClient () {
	const apiKey = process.env.OPENAI_API_KEY
	if (!apiKey) {
		throw new Error('OPENAI_API_KEY environment variable is not set')
	}
	return new OpenAI({ apiKey })
}

const marketAnalysisSchema = z.object({
	softScores: z.object({
		culturalFit: z.number().min(0).max(10),
		regulatoryFriendliness: z.number().min(0).max(10),
		mediaPotential: z.number().min(0).max(10),
		sponsorshipAppetite: z.number().min(0).max(10),
		infrastructureReadiness: z.number().min(0).max(10),
	}),
	scenarioImpact: z.object({
		risk: z.number().min(0).max(10),
		upside: z.number().min(0).max(10),
		costIndex: z.number().min(0).max(10),
	}),
	marketInsights: z.object({
		audienceSize: z.number(),
		fitnessRate: z.number(),
		streamingScore: z.number(),
		sponsorshipValue: z.number(),
		regulationScore: z.number(),
	}),
	geopoliticalAssessment: z.object({
		stabilityScore: z.number().min(0).max(10),
		riskLevel: z.enum(['Low', 'Medium', 'High']),
		keyFactors: z.array(z.string()),
		recommendations: z.array(z.string()),
	}),
	bestCities: z.array(z.object({
		name: z.string(),
		latitude: z.number(),
		longitude: z.number(),
		population: z.number(),
		advantages: z.array(z.string()),
	})),
	narrative: z.object({
		summary: z.string(),
		reasonsToEnter: z.array(z.string()),
		keyRisks: z.array(z.string()),
	}),
})

export async function POST (req: NextRequest) {
	try {
		const body: { market: MarketData } = await req.json()
		const { market } = body

		if (!market) {
			return NextResponse.json(
				{ error: 'Market data is required' },
				{ status: 400 },
			)
		}

		const prompt = getMarketAnalysisPrompt(market)

		const openai = getOpenAIClient()
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o',
			messages: [
				{
					role: 'system',
					content: SYSTEM_PROMPT,
				},
				{ role: 'user', content: prompt },
			],
			temperature: 0.7,
			response_format: { type: 'json_object' },
		})

		const responseContent = completion.choices[0]?.message?.content

		if (!responseContent) {
			console.error('OpenAI returned empty response:', {
				choices: completion.choices,
				finishReason: completion.choices[0]?.finish_reason,
			})
			throw new Error(
				'OpenAI returned an empty response. This is usually temporary - please try again.',
			)
		}

		const parsedResponse = JSON.parse(responseContent)
		const validatedResponse = marketAnalysisSchema.parse(parsedResponse)

		return NextResponse.json(validatedResponse)
	} catch (err) {
		console.error('Market analysis error:', err)

		if (err instanceof z.ZodError) {
			console.error('Validation error:', JSON.stringify(err.errors, null, 2))
			return NextResponse.json(
				{
					error: 'Invalid response format from OpenAI',
					details: err.errors,
				},
				{ status: 500 },
			)
		}

		return NextResponse.json(
			{
				error:
					err instanceof Error ? err.message : 'Failed to generate market analysis',
				details: err instanceof Error ? err.stack : undefined,
			},
			{ status: 500 },
		)
	}
}
