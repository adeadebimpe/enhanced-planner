import { Button } from '@/components/ui/button'

interface SuggestedPromptsProps {
	prompts: Array<{ text: string; label: string }>
	onPromptClick: (prompt: string) => void
}

export function SuggestedPrompts({
	prompts,
	onPromptClick,
}: SuggestedPromptsProps) {
	return (
		<div className="space-y-3">
			<div className="text-center text-xs text-muted-foreground font-medium">
				Suggested prompts
			</div>
			<div className="flex flex-wrap gap-2">
				{prompts.map(prompt => (
					<Button
						key={prompt.label}
						variant="outline"
						size="sm"
						onClick={() => onPromptClick(prompt.text)}
						className="h-auto px-3 py-2 text-xs"
					>
						{prompt.label}
					</Button>
				))}
			</div>
		</div>
	)
}
