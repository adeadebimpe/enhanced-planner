import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { MarketData } from '@/lib/types'
import { getMarketAnalysisPrompt, SYSTEM_PROMPT } from '@/lib/prompts'
import { getOpenAIClient, withRetry } from '@/lib/openai-client'
import { marketAnalysisSchema } from '@/lib/validation-schemas'
import {
	OPENAI_MODEL,
	OPENAI_TEMPERATURE,
	OPENAI_MAX_TOKENS_ANALYSIS,
	RETRY_ATTEMPTS,
	RETRY_INITIAL_DELAY_MS,
} from '@/lib/constants'

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
					model: OPENAI_MODEL,
					messages: [
						{
							role: 'system',
							content: SYSTEM_PROMPT,
						},
						{ role: 'user', content: prompt },
					],
					temperature: OPENAI_TEMPERATURE,
					max_tokens: OPENAI_MAX_TOKENS_ANALYSIS,
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
			RETRY_ATTEMPTS,
			RETRY_INITIAL_DELAY_MS,
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
