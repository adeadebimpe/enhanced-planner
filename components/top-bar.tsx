'use client'

import { Search } from 'lucide-react'

interface TopBarProps {
	searchPlaceholder?: string
	onSearch?: (query: string) => void
	leftContent?: React.ReactNode
	rightContent?: React.ReactNode
}

export function TopBar({
	searchPlaceholder = 'Search...',
	onSearch,
	leftContent,
	rightContent,
}: TopBarProps) {
	return (
		<div className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex h-14 items-center justify-between px-2">
				<div className="flex items-center gap-4">
					{leftContent}
				</div>
				<div className="flex items-center gap-4">
					{onSearch && (
						<div className="relative">
							<Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
							<input
								type="text"
								placeholder={searchPlaceholder}
								onChange={e => onSearch(e.target.value)}
								className="h-9 w-64 bg-card/50 border border-border pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
							/>
						</div>
					)}
					{rightContent}
				</div>
			</div>
		</div>
	)
}
