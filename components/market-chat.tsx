'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Send, MessageSquare } from 'lucide-react'
import type { MarketData, StrategyResponse } from '@/lib/types'

interface MarketChatProps {
	market: MarketData
	strategy?: StrategyResponse
}

interface Message {
	role: 'user' | 'assistant'
	content: string
}

export function MarketChat({ market, strategy }: MarketChatProps) {
	const [messages, setMessages] = useState<Message[]>([])
	const [input, setInput] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()

		if (!input.trim() || isLoading) return

		const userMessage: Message = { role: 'user', content: input }
		setMessages(prev => [...prev, userMessage])
		setInput('')
		setIsLoading(true)

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					question: input,
					marketContext: market,
					strategyContext: strategy,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				throw new Error(errorData.error || 'Failed to get response')
			}

			const data = await response.json()
			const assistantMessage: Message = {
				role: 'assistant',
				content: data.answer,
			}
			setMessages(prev => [...prev, assistantMessage])
		} catch (err) {
			console.error('Chat error:', err)
			const errorMessage: Message = {
				role: 'assistant',
				content:
					err instanceof Error
						? `Error: ${err.message}`
						: 'Failed to get response',
			}
			setMessages(prev => [...prev, errorMessage])
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Card className="bg-card/50 border-border">
			<CardHeader className="pb-4">
				<div className="flex items-center gap-2">
					<MessageSquare className="h-4 w-4 text-primary" />
					<h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
						Ask AI About {market.country}
					</h3>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Messages */}
				<div className="space-y-3 min-h-[200px] max-h-[400px] overflow-y-auto">
					{messages.length === 0 ? (
						<div className="text-center py-8 text-xs text-muted-foreground">
							Ask questions about this market, strategy recommendations, or
							competitive analysis
						</div>
					) : (
						messages.map((message, index) => (
							<div
								key={index}
								className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
							>
								<div
									className={`max-w-[80%] p-3 text-sm leading-relaxed ${
										message.role === 'user'
											? 'bg-primary text-primary-foreground'
											: 'bg-muted text-foreground'
									}`}
								>
									<div className="space-y-2">
										{message.content.split('\n\n').map((paragraph, i) => (
											<p key={i} className="text-sm">
												{paragraph}
											</p>
										))}
									</div>
								</div>
							</div>
						))
					)}
					{isLoading && (
						<div className="flex justify-start">
							<div className="bg-muted p-3 flex items-center gap-2">
								<Loader2 className="h-4 w-4 animate-spin text-primary" />
								<span className="text-xs text-muted-foreground">
									Thinking...
								</span>
							</div>
						</div>
					)}
				</div>

				{/* Input */}
				<form onSubmit={handleSubmit} className="flex gap-2">
					<input
						type="text"
						value={input}
						onChange={e => setInput(e.target.value)}
						placeholder="Ask about market opportunities, risks, or strategy..."
						className="flex-1 bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
						disabled={isLoading}
					/>
					<Button
						type="submit"
						size="sm"
						disabled={!input.trim() || isLoading}
						className="px-3"
					>
						{isLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Send className="h-4 w-4" />
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
