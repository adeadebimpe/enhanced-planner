'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, Search, X, MessageSquare } from 'lucide-react'
import type { MarketData, StrategyResponse } from '@/lib/types'
import { useChat, type Message } from '@/lib/chat-context'

interface AiSearchBarProps {
	market: MarketData
	strategy?: StrategyResponse
}

export function AiSearchBar({ market, strategy }: AiSearchBarProps) {
	const [input, setInput] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const { messages, addMessage, clearMessages } = useChat()
	const [isOpen, setIsOpen] = useState(false)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
		return () => setMounted(false)
	}, [])

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()

		if (!input.trim() || isLoading) return

		const userMessage: Message = { role: 'user', content: input }
		addMessage(userMessage)
		setInput('')
		setIsLoading(true)
		setIsOpen(true)

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					question: userMessage.content,
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
			addMessage(assistantMessage)
		} catch (err) {
			console.error('Search error:', err)
			const errorMessage: Message = {
				role: 'assistant',
				content:
					err instanceof Error
						? `Error: ${err.message}`
						: 'Failed to get response',
			}
			addMessage(errorMessage)
		} finally {
			setIsLoading(false)
		}
	}

	function handleClose() {
		setIsOpen(false)
	}

	function handleClear() {
		clearMessages()
		setInput('')
		setIsOpen(false)
	}

	function handleExampleClick(question: string) {
		setInput(question)
	}

	return (
		<>
			{/* Search Bar */}
			<form onSubmit={handleSubmit} className="relative">
				<div className="relative flex items-center">
					<Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
					<input
						type="text"
						value={input}
						onChange={e => setInput(e.target.value)}
						placeholder="Ask AI about markets..."
						className="w-full bg-card/50 border border-border pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
						disabled={isLoading}
						onFocus={() => setIsOpen(true)}
					/>
					{isLoading && (
						<Loader2 className="absolute right-3 h-4 w-4 animate-spin text-primary" />
					)}
				</div>
			</form>

			{/* Chat Dialog - Rendered via Portal */}
			{isOpen && mounted && createPortal(
				<div className="fixed bottom-6 right-6 w-96 h-[500px] bg-card border border-border shadow-2xl z-[9999] flex flex-col">
					{/* Header */}
					<div className="flex items-center justify-between p-4 border-b border-border">
						<div className="flex items-center gap-2">
							<MessageSquare className="h-4 w-4 text-primary" />
							<span className="text-sm font-medium">AI Assistant</span>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={handleClear}
								className="text-muted-foreground hover:text-foreground transition-colors text-xs"
							>
								Clear
							</button>
							<button
								onClick={handleClose}
								className="text-muted-foreground hover:text-foreground transition-colors"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
					</div>

					{/* Messages */}
					<div className="flex-1 overflow-y-auto p-4 space-y-4">
						{messages.length === 0 ? (
							<div className="space-y-4">
								<div className="text-center py-4 text-xs text-muted-foreground">
									Try asking:
								</div>
								<div className="flex flex-wrap gap-2">
									<button
										onClick={() => handleExampleClick('What are the key risks in this market?')}
										className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
									>
										What are the key risks?
									</button>
									<button
										onClick={() => handleExampleClick('How does the regulatory environment compare to other markets?')}
										className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
									>
										Regulatory comparison
									</button>
									<button
										onClick={() => handleExampleClick('What is the sponsorship potential in this market?')}
										className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
									>
										Sponsorship potential
									</button>
									<button
										onClick={() => handleExampleClick('What are the main cultural barriers to entry?')}
										className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
									>
										Cultural barriers
									</button>
									<button
										onClick={() => handleExampleClick('How should we approach media partnerships?')}
										className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
									>
										Media partnerships
									</button>
									<button
										onClick={() => handleExampleClick('What is the recommended entry strategy?')}
										className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
									>
										Entry strategy
									</button>
								</div>
							</div>
						) : (
							messages.map((message, index) => (
								<div
									key={index}
									className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
								>
									<div
										className={`max-w-[85%] p-3 text-sm leading-relaxed ${
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
					<div className="p-4 border-t border-border">
						<form onSubmit={handleSubmit} className="flex gap-2">
							<input
								type="text"
								value={input}
								onChange={e => setInput(e.target.value)}
								placeholder="Ask a follow-up question..."
								className="flex-1 bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
								disabled={isLoading}
							/>
							<button
								type="submit"
								disabled={!input.trim() || isLoading}
								className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Send
							</button>
						</form>
					</div>
				</div>,
				document.body
			)}
		</>
	)
}
