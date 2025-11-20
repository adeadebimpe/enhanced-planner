import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { MarketData, Scenario } from '@/lib/types'
import { getExecutionPlanPrompt, SYSTEM_PROMPT } from '@/lib/prompts'
import { getOpenAIClient } from '@/lib/openai-client'
import { executionPlanResponseSchema } from '@/lib/validation-schemas'
import { normalizeExecutionPlan } from '@/lib/market-utils'
import { OPENAI_MODEL, OPENAI_TEMPERATURE } from '@/lib/constants'

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
			model: OPENAI_MODEL,
			messages: [
				{
					role: 'system',
					content: SYSTEM_PROMPT,
				},
				{ role: 'user', content: prompt },
			],
			temperature: OPENAI_TEMPERATURE,
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

		// Normalize execution plan data
		normalizeExecutionPlan(parsedResponse.executionPlan)

		const validatedResponse = executionPlanResponseSchema.parse(parsedResponse)

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
