'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MultiSelectOption {
	value: string
	label: string
}

interface MultiSelectProps {
	options: MultiSelectOption[]
	selected: string[]
	onChange: (selected: string[]) => void
	placeholder?: string
	maxSelections?: number
	className?: string
}

export function MultiSelect({
	options,
	selected,
	onChange,
	placeholder = 'Select options...',
	maxSelections,
	className,
}: MultiSelectProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const containerRef = useRef<HTMLDivElement>(null)

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const filteredOptions = options.filter(option =>
		option.label.toLowerCase().includes(searchQuery.toLowerCase())
	)

	const toggleOption = (value: string) => {
		if (selected.includes(value)) {
			onChange(selected.filter(v => v !== value))
		} else {
			if (maxSelections && selected.length >= maxSelections) {
				return
			}
			onChange([...selected, value])
		}
	}

	const removeOption = (value: string, e: React.MouseEvent) => {
		e.stopPropagation()
		onChange(selected.filter(v => v !== value))
	}

	const clearAll = (e: React.MouseEvent) => {
		e.stopPropagation()
		onChange([])
	}

	const selectedOptions = options.filter(opt => selected.includes(opt.value))

	return (
		<div ref={containerRef} className={cn('relative w-full', className)}>
			<div
				onClick={() => setIsOpen(!isOpen)}
				className="flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:border-primary/50 transition-colors"
			>
				<div className="flex-1 flex flex-wrap gap-1.5">
					{selectedOptions.length === 0 ? (
						<span className="text-muted-foreground text-xs md:text-sm">{placeholder}</span>
					) : (
						selectedOptions.map(option => (
							<span
								key={option.value}
								className="inline-flex items-center gap-1 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md bg-primary text-primary-foreground text-xs md:text-sm font-medium"
							>
								{option.label}
								<button
									onClick={(e) => removeOption(option.value, e)}
									className="hover:bg-primary/80 rounded-sm transition-colors"
								>
									<X className="h-3 w-3 md:h-3.5 md:w-3.5" />
								</button>
							</span>
						))
					)}
				</div>
				<div className="flex items-center gap-2 ml-2 flex-shrink-0">
					{selectedOptions.length > 0 && (
						<button
							onClick={clearAll}
							className="text-muted-foreground hover:text-foreground text-xs md:text-sm whitespace-nowrap"
						>
							Clear
						</button>
					)}
					<ChevronDown className={cn(
						'h-4 w-4 text-muted-foreground transition-transform',
						isOpen && 'transform rotate-180'
					)} />
				</div>
			</div>

			{isOpen && (
				<div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-md shadow-lg max-h-80 overflow-hidden">
					<div className="p-2 border-b border-border">
						<input
							type="text"
							placeholder="Search..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full px-3 py-2 text-xs md:text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
							onClick={(e) => e.stopPropagation()}
						/>
					</div>
					<div className="max-h-60 overflow-y-auto">
						{filteredOptions.length === 0 ? (
							<div className="px-4 py-8 text-center text-xs md:text-sm text-muted-foreground">
								No results found
							</div>
						) : (
							filteredOptions.map(option => {
								const isSelected = selected.includes(option.value)
								const isDisabled = !isSelected && !!maxSelections && selected.length >= maxSelections

								return (
									<button
										key={option.value}
										onClick={() => !isDisabled && toggleOption(option.value)}
										disabled={isDisabled}
										className={cn(
											'w-full flex items-center justify-between px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm hover:bg-accent transition-colors text-left',
											isSelected && 'bg-accent/50',
											isDisabled && 'opacity-50 cursor-not-allowed'
										)}
									>
										<span>{option.label}</span>
										{isSelected && <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />}
									</button>
								)
							})
						)}
					</div>
					{maxSelections && (
						<div className="px-3 md:px-4 py-2 border-t border-border bg-muted/30">
							<p className="text-[10px] md:text-xs text-muted-foreground">
								{selected.length} / {maxSelections} selected
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
