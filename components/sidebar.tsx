'use client'

import { useState, createContext, useContext } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, X, Menu } from 'lucide-react'
import { useMarkets } from '@/lib/market-context'
import { AddMarketModal } from '@/components/add-market-modal'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const SidebarContext = createContext<{
	isOpen: boolean
	setIsOpen: (open: boolean) => void
} | null>(null)

export function useSidebarContext() {
	const context = useContext(SidebarContext)
	if (!context) {
		throw new Error('useSidebarContext must be used within SidebarProvider')
	}
	return context
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
	const [isOpen, setIsOpen] = useState(false)
	return (
		<SidebarContext.Provider value={{ isOpen, setIsOpen }}>
			{children}
		</SidebarContext.Provider>
	)
}

export function MobileMenuButton() {
	const { setIsOpen } = useSidebarContext()
	return (
		<button
			onClick={() => setIsOpen(true)}
			className="p-2 rounded-lg hover:bg-accent transition-colors"
			aria-label="Open menu"
		>
			<Menu className="h-5 w-5" />
		</button>
	)
}

export function Sidebar () {
	const { getAllMarkets } = useMarkets()
	const [isModalOpen, setIsModalOpen] = useState(false)
	const { isOpen: isMobileMenuOpen, setIsOpen: setIsMobileMenuOpen } = useSidebarContext()
	const pathname = usePathname()
	const markets = getAllMarkets()

	return (
		<>
			{/* Mobile Overlay */}
			{isMobileMenuOpen && (
				<div
					className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<div className={`
				w-60 bg-background h-screen flex flex-col border-r border-border/50
				${isMobileMenuOpen ? 'fixed left-0 top-0 z-50 shadow-2xl' : 'hidden'}
				lg:fixed lg:left-0 lg:top-0 lg:block
			`}>
				{/* Mobile Close Button */}
				<button
					onClick={() => setIsMobileMenuOpen(false)}
					className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-accent"
				>
					<X className="h-5 w-5" />
				</button>

				{/* Header */}
				<div className="px-6 py-4 flex-shrink-0 space-y-6">
					<Link href="/" className="flex items-center gap-3">
						<img
							src="https://cdn.brandfetch.io/idU0M_KN8U/w/2000/h/2000/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1756346058451"
							alt="Enhanced Games"
							className="h-8 w-auto flex-shrink-0"
						/>
						<div className="flex flex-col">
							<span className="text-xs font-semibold tracking-wide uppercase">Enhanced Games</span>
							<span className="text-[10px] text-muted-foreground">Strategic planner</span>
						</div>
					</Link>

					<Button
						className="w-full"
						size="sm"
						onClick={() => setIsModalOpen(true)}
					>
						<Plus className="h-3.5 w-3.5 mr-2" />
						Add Market
					</Button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto px-6 py-4">
					{/* Markets Section */}
					<div className="space-y-1">
						{markets.length === 0 ? (
							<p className="text-xs text-muted-foreground/60 text-center py-8">
								No markets yet
							</p>
						) : (
							markets.map(market => {
								const isActive = pathname === `/${market.id}`
								return (
									<Link
										key={market.id}
										href={`/${market.id}`}
										onClick={() => setIsMobileMenuOpen(false)}
										className={`block px-3 py-2.5 rounded-lg text-sm transition-all ${
											isActive
												? 'bg-accent/50 text-foreground font-medium shadow-sm'
												: 'hover:bg-accent/50 text-foreground/80 hover:text-foreground'
										}`}
									>
										<span>{market.name}</span>
									</Link>
								)
							})
						)}
					</div>
				</div>
			</div>

			<AddMarketModal open={isModalOpen} onOpenChange={setIsModalOpen} />
		</>
	)
}
