import { NextRequest, NextResponse } from 'next/server'
import { getOpenAIClient } from '@/lib/openai-client'
import { OPENAI_MODEL, OPENAI_TEMPERATURE, OPENAI_MAX_TOKENS_CHAT } from '@/lib/constants'

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const { question, marketContext, strategyContext } = body

		if (!question) {
			return NextResponse.json(
				{ error: 'Question is required' },
				{ status: 400 },
			)
		}

		// Build context from market and strategy data
		let contextPrompt = 'You are a strategic advisor for the Enhanced Games, a new international sporting competition that allows performance enhancement.\n\n'

		if (marketContext) {
			contextPrompt += `Current Market Analysis:\n`
			contextPrompt += `Country: ${marketContext.country}\n`
			contextPrompt += `Population: ${marketContext.population?.toLocaleString() || 'N/A'}\n`
			contextPrompt += `GDP per Capita: $${marketContext.gdpPerCapita?.toLocaleString() || 'N/A'}\n`
			contextPrompt += `Sports Culture: ${marketContext.sportsCulture || 'N/A'}\n`
			contextPrompt += `Media Landscape: ${marketContext.mediaLandscape || 'N/A'}\n`
			contextPrompt += `Regulation Notes: ${marketContext.regulationNotes || 'N/A'}\n\n`
		}

		if (strategyContext) {
			contextPrompt += `Current Strategy Analysis:\n`
			contextPrompt += `Cultural Fit Score: ${strategyContext.softScores?.culturalFit || 'N/A'}/10\n`
			contextPrompt += `Regulatory Friendliness: ${strategyContext.softScores?.regulatoryFriendliness || 'N/A'}/10\n`
			contextPrompt += `Media Potential: ${strategyContext.softScores?.mediaPotential || 'N/A'}/10\n`
			contextPrompt += `Sponsorship Appetite: ${strategyContext.softScores?.sponsorshipAppetite || 'N/A'}/10\n`
			contextPrompt += `Infrastructure Readiness: ${strategyContext.softScores?.infrastructureReadiness || 'N/A'}/10\n`
			contextPrompt += `Risk Level: ${strategyContext.scenarioImpact?.risk || 'N/A'}/10\n`
			contextPrompt += `Upside Potential: ${strategyContext.scenarioImpact?.upside || 'N/A'}/10\n\n`

			if (strategyContext.narrative?.summary) {
				contextPrompt += `Market Summary: ${strategyContext.narrative.summary}\n\n`
			}
		}

		contextPrompt += `User Question: ${question}\n\n`
		contextPrompt += `Please provide a detailed, actionable answer based on the market data and strategy analysis above. Be specific and reference the data when relevant. Use plain text only - do not use markdown formatting, bullet points with special characters, or formatting symbols. Write in clear paragraphs.`

		const openai = getOpenAIClient()
		const completion = await openai.chat.completions.create({
			model: OPENAI_MODEL,
			messages: [
				{
					role: 'system',
					content:
						'You are a strategic business analyst specializing in sports marketing and international expansion. Provide clear, actionable insights.',
				},
				{ role: 'user', content: contextPrompt },
			],
			temperature: OPENAI_TEMPERATURE,
			max_tokens: OPENAI_MAX_TOKENS_CHAT,
		})

		const answer = completion.choices[0]?.message?.content

		if (!answer) {
			throw new Error('No response from OpenAI')
		}

		return NextResponse.json({ answer })
	} catch (err) {
		console.error('Chat error:', err)
		return NextResponse.json(
			{
				error:
					err instanceof Error ? err.message : 'Failed to process question',
			},
			{ status: 500 },
		)
	}
}
