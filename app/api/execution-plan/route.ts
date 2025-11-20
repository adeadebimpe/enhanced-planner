import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import type { MarketData, Scenario } from '@/lib/types'
import { getExecutionPlanPrompt, SYSTEM_PROMPT } from '@/lib/prompts'

function getOpenAIClient () {
	const apiKey = process.env.OPENAI_API_KEY
	if (!apiKey) {
		throw new Error('OPENAI_API_KEY environment variable is not set')
	}
	return new OpenAI({ apiKey })
}

const executionPlanSchema = z.object({
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
		const body: { market: MarketData; scenario: Scenario } = await req.json()
		const { market, scenario } = body

		if (!market || !scenario) {
			return NextResponse.json(
				{ error: 'Market and scenario are required' },
				{ status: 400 },
			)
		}

		const prompt = getExecutionPlanPrompt(market, scenario)

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

		// Transform execution plan arrays or objects to strings if needed
		if (parsedResponse.executionPlan) {
			const plan = parsedResponse.executionPlan
			Object.keys(plan).forEach(key => {
				if (Array.isArray(plan[key])) {
					plan[key] = plan[key].join(' ')
				} else if (typeof plan[key] === 'object' && plan[key] !== null) {
					// If it's an object, convert it to a formatted string
					plan[key] = Object.values(plan[key]).join(' ')
				}
			})
		}

		const validatedResponse = executionPlanSchema.parse(parsedResponse)

		return NextResponse.json(validatedResponse)
	} catch (err) {
		console.error('Execution plan generation error:', err)

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
					err instanceof Error ? err.message : 'Failed to generate execution plan',
				details: err instanceof Error ? err.stack : undefined,
			},
			{ status: 500 },
		)
	}
}
