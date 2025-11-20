import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import type { StrategyRequest, StrategyResponse } from '@/lib/types'

function getOpenAIClient () {
	const apiKey = process.env.OPENAI_API_KEY
	if (!apiKey) {
		throw new Error('OPENAI_API_KEY environment variable is not set')
	}
	return new OpenAI({ apiKey })
}

const strategySchema = z.object({
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
	executionPlan: z.object({
		week1to2: z.string(),
		week3to4: z.string(),
		week5to6: z.string(),
		week7to8: z.string(),
		week9to12: z.string(),
	}),
})

export async function POST (req: NextRequest) {
	try {
		const body: StrategyRequest = await req.json()
		const { market, scenario } = body

		if (!market || !scenario) {
			return NextResponse.json(
				{ error: 'Market and scenario are required' },
				{ status: 400 },
			)
		}

		const prompt = `You are a strategic advisor for the Enhanced Games, a new international sporting competition that allows performance enhancement. Analyze the following market for expansion:

Country: ${market.country}
Population: ${market.population.toLocaleString()}
GDP per Capita: $${market.gdpPerCapita.toLocaleString()}
Sports Culture: ${market.sportsCulture}
Media Landscape: ${market.mediaLandscape}
Regulation Notes: ${market.regulationNotes}

Scenario: ${scenario}

Provide a comprehensive market entry strategy in JSON format with:
1. softScores (0-10 scale):
   - culturalFit: How well the Enhanced Games concept aligns with local culture
   - regulatoryFriendliness: Likelihood of favorable regulatory treatment
   - mediaPotential: Potential for media coverage and engagement
   - sponsorshipAppetite: Corporate sponsorship opportunity
   - infrastructureReadiness: Existing sports infrastructure quality

2. scenarioImpact (0-10 scale):
   - risk: Overall market entry risk level
   - upside: Potential upside/opportunity
   - costIndex: Relative cost of market entry

3. geopoliticalAssessment:
   - stabilityScore: Political stability score (0-10 scale)
   - riskLevel: Either 'Low', 'Medium', or 'High'
   - keyFactors: 3-5 key geopolitical factors affecting the market (array of strings)
   - recommendations: 2-3 recommendations for managing geopolitical risks (array of strings)

4. bestCities: Array of 3-5 best cities to host events with:
   - name: City name
   - latitude: City latitude (decimal degrees)
   - longitude: City longitude (decimal degrees)
   - population: City population (number in millions)
   - advantages: 2-3 key advantages of this city (array of strings)

5. narrative:
   - summary: One compelling sentence on this market opportunity
   - reasonsToEnter: 3-4 bullet points on why to enter this market
   - keyRisks: 3-4 bullet points on key risks and challenges

6. executionPlan: A 90-day execution plan broken into:
   - week1to2: Initial actions
   - week3to4: Follow-up activities
   - week5to6: Mid-term milestones
   - week7to8: Advanced preparation
   - week9to12: Launch preparation

Consider the "${scenario}" scenario specifically:
- Low Regulation: Focus on regulatory arbitrage and quick entry
- High Capital: Emphasize premium positioning and infrastructure investment
- Media-First: Prioritize broadcast deals and digital engagement
- Athlete-First: Focus on athlete recruitment and training facilities

Return ONLY valid JSON matching this exact structure.`

		const openai = getOpenAIClient()
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o',
			messages: [
				{
					role: 'system',
					content:
						'You are a strategic business analyst. Return only valid JSON.',
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

		// Transform execution plan arrays to strings if needed
		if (parsedResponse.executionPlan) {
			const plan = parsedResponse.executionPlan
			Object.keys(plan).forEach(key => {
				if (Array.isArray(plan[key])) {
					plan[key] = plan[key].join(' ')
				}
			})
		}

		const validatedResponse = strategySchema.parse(parsedResponse)

		return NextResponse.json(validatedResponse as StrategyResponse)
	} catch (err) {
		console.error('Strategy generation error:', err)

		// More detailed error logging
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
					err instanceof Error ? err.message : 'Failed to generate strategy',
				details: err instanceof Error ? err.stack : undefined,
			},
			{ status: 500 },
		)
	}
}
