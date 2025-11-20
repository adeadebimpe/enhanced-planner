import * as React from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface SearchInputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
	containerClassName?: string
}

export function SearchInput({
	className,
	containerClassName,
	...props
}: SearchInputProps) {
	return (
		<div className={cn('relative', containerClassName)}>
			<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
			<Input
				type="text"
				className={cn('pl-10', className)}
				{...props}
			/>
		</div>
	)
}
