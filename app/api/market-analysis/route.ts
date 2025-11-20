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
	return new OpenAI({ apiKey, timeout: 60000 }) // 60 second timeout
}

// Retry helper with exponential backoff
async function withRetry<T> (
	fn: () => Promise<T>,
	retries = 3,
	delay = 1000,
): Promise<T> {
	try {
		return await fn()
	} catch (error) {
		if (retries === 0) throw error
		await new Promise(resolve => setTimeout(resolve, delay))
		return withRetry(fn, retries - 1, delay * 2)
	}
}

// Helper to clamp numbers to 0-10 range
const clampScore = (val: number) => Math.max(0, Math.min(10, val))

const marketAnalysisSchema = z.object({
	softScores: z.object({
		culturalFit: z.number().transform(clampScore),
		regulatoryFriendliness: z.number().transform(clampScore),
		mediaPotential: z.number().transform(clampScore),
		sponsorshipAppetite: z.number().transform(clampScore),
		infrastructureReadiness: z.number().transform(clampScore),
	}),
	scenarioImpact: z.object({
		risk: z.number().transform(clampScore),
		upside: z.number().transform(clampScore),
		costIndex: z.number().transform(clampScore),
	}),
	marketInsights: z.object({
		audienceSize: z.number(),
		fitnessRate: z.number(),
		streamingScore: z.number(),
		sponsorshipValue: z.number(),
		regulationScore: z.number(),
	}),
	geopoliticalAssessment: z.object({
		stabilityScore: z.number().transform(clampScore),
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

		// Retry logic for API call
		const completion = await withRetry(
			async () => {
				const result = await openai.chat.completions.create({
					model: 'gpt-4o',
					messages: [
						{
							role: 'system',
							content: SYSTEM_PROMPT,
						},
						{ role: 'user', content: prompt },
					],
					temperature: 0.7,
					max_tokens: 4096, // Prevent response cutoff
					response_format: { type: 'json_object' },
				})

				const responseContent = result.choices[0]?.message?.content

				if (!responseContent) {
					console.error('OpenAI returned empty response:', {
						choices: result.choices,
						finishReason: result.choices[0]?.finish_reason,
					})
					throw new Error('Empty response from OpenAI')
				}

				return result
			},
			3, // 3 retries
			1000, // Start with 1 second delay
		)

		const responseContent = completion.choices[0]?.message?.content

		if (!responseContent) {
			throw new Error(
				'OpenAI returned an empty response after retries. Please try again.',
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
