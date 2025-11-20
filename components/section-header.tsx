import { cn } from '@/lib/utils'

interface SectionHeaderProps {
	children: React.ReactNode
	className?: string
}

export function SectionHeader({ children, className }: SectionHeaderProps) {
	return (
		<h3
			className={cn(
				'text-xs uppercase tracking-wider text-muted-foreground font-medium',
				className
			)}
		>
			{children}
		</h3>
	)
}
