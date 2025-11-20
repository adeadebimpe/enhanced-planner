'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2, X, MessageSquare, ArrowUp } from 'lucide-react'
import type { MarketData, StrategyResponse } from '@/lib/types'
import { useChat, type Message } from '@/lib/chat-context'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SearchInput } from '@/components/search-input'
import { SuggestedPrompts } from '@/components/suggested-prompts'

interface AiSearchBarProps {
	market: MarketData
	strategy?: StrategyResponse
	onOpenPanel: () => void
}

export function AiSearchBar({ market, strategy, onOpenPanel }: AiSearchBarProps) {
	const [input, setInput] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const { addMessage } = useChat()

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()

		if (!input.trim() || isLoading) return

		const userMessage: Message = { role: 'user', content: input }
		addMessage(userMessage)
		setInput('')
		setIsLoading(true)
		onOpenPanel()

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

	return (
		<form onSubmit={handleSubmit} className="relative">
			<div className="relative flex items-center">
				<SearchInput
					value={input}
					onChange={e => setInput(e.target.value)}
					placeholder="Ask AI about markets..."
					className="bg-card/50 border-border h-9 py-2 text-sm focus:ring-1 focus:ring-primary"
					disabled={isLoading}
					onFocus={onOpenPanel}
					containerClassName="w-full"
				/>
				{isLoading && (
					<Loader2 className="absolute right-3 h-4 w-4 animate-spin text-primary" />
				)}
			</div>
		</form>
	)
}

interface AiChatPanelProps {
	market: MarketData
	strategy?: StrategyResponse
	isOpen: boolean
	onClose: () => void
}

export function AiChatPanel({ market, strategy, isOpen, onClose }: AiChatPanelProps) {
	const [input, setInput] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const { messages, addMessage, clearMessages } = useChat()
	const messagesEndRef = useRef<HTMLDivElement>(null)

	// Auto-scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages, isLoading])

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()

		if (!input.trim() || isLoading) return

		const userMessage: Message = { role: 'user', content: input }
		addMessage(userMessage)
		setInput('')
		setIsLoading(true)

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

	function handleClear() {
		clearMessages()
		setInput('')
	}

	function handleExampleClick(question: string) {
		setInput(question)
	}

	if (!isOpen) return null

	return (
		<div className="w-full md:w-96 bg-background border-l border-border/50 flex flex-col h-screen fixed right-0 top-0 z-50">
			{/* Header */}
			<div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border/30 flex-shrink-0">
				<div className="flex items-center gap-2">
					<MessageSquare className="h-4 w-4 text-primary" />
					<span className="text-sm font-medium text-foreground">AI Assistant</span>
				</div>
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleClear}
						className="h-auto py-0 px-2 text-xs font-medium"
					>
						Clear
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="h-8 w-8"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
				{messages.map((message, index) => (
					<div
						key={index}
						className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
					>
						<div
							className={`max-w-[85%] px-4 py-3 leading-relaxed rounded-2xl ${
								message.role === 'user'
									? 'bg-primary text-primary-foreground rounded-br-md text-sm'
									: 'bg-card text-foreground border border-border/50 rounded-bl-md text-xs'
							}`}
						>
							<div className="space-y-2">
								{message.content.split('\n\n').map((paragraph, i) => (
									<p key={i}>
										{paragraph}
									</p>
								))}
							</div>
						</div>
					</div>
				))}
				{isLoading && (
					<div className="flex justify-start">
						<div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
							<Loader2 className="h-4 w-4 animate-spin text-primary" />
							<span className="text-xs text-muted-foreground">
								Thinking...
							</span>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Suggested Prompts */}
			{messages.length === 0 && (
				<div className="px-4 md:px-6 pb-4 flex-shrink-0">
					<SuggestedPrompts
						prompts={[
							{
								text: 'What are the key risks in this market?',
								label: 'What are the key risks?',
							},
							{
								text: 'How does the regulatory environment compare to other markets?',
								label: 'Regulatory comparison',
							},
							{
								text: 'What is the sponsorship potential in this market?',
								label: 'Sponsorship potential',
							},
							{
								text: 'What are the main cultural barriers to entry?',
								label: 'Cultural barriers',
							},
							{
								text: 'How should we approach media partnerships?',
								label: 'Media partnerships',
							},
							{
								text: 'What is the recommended entry strategy?',
								label: 'Entry strategy',
							},
						]}
						onPromptClick={handleExampleClick}
					/>
				</div>
			)}

			{/* Input */}
			<div className="px-4 md:px-6 pb-4 md:pb-6 flex-shrink-0">
				<form onSubmit={handleSubmit} className="relative">
					<Textarea
						value={input}
						onChange={e => setInput(e.target.value)}
						onKeyDown={e => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault()
								handleSubmit(e)
							}
						}}
						placeholder="Ask anything..."
						className="h-36 bg-card/50 border-border/30 rounded pr-12 resize-none"
						disabled={isLoading}
						rows={1}
					/>
					<Button
						type="submit"
						disabled={!input.trim() || isLoading}
						size="icon"
						className="absolute right-2 bottom-4 h-8 w-8"
					>
						<ArrowUp className="h-3.5 w-3.5" />
					</Button>
				</form>
			</div>
		</div>
	)
}
