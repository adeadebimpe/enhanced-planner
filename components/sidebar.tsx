'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useMarkets } from '@/lib/market-context'
import { AddMarketModal } from '@/components/add-market-modal'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Sidebar () {
	const { getAllMarkets } = useMarkets()
	const [isModalOpen, setIsModalOpen] = useState(false)
	const pathname = usePathname()
	const markets = getAllMarkets()

	return (
		<>
			<div className="w-60 bg-background border-r border-border/50 h-screen sticky top-0 flex flex-col">
				{/* Header */}
				<div className="px-8 py-4 border-b border-border/50">
					<Link href="/" className="block">
						<h1 className="text-sm font-medium tracking-wide">
							Enhanced Games
						</h1>
					</Link>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6 space-y-8">
					{/* Markets Section */}
					<div>
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
											className={`block px-3 py-2.5 rounded-lg text-sm transition-all ${
												isActive
													? 'bg-primary/10 text-primary font-medium'
													: 'hover:bg-accent/50 text-foreground/80 hover:text-foreground'
											}`}
										>
											<div className="flex items-center justify-between">
												<span>{market.name}</span>
												{market.isCustom && (
													<span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
														Custom
													</span>
												)}
											</div>
										</Link>
									)
								})
							)}
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="p-6 border-t border-border/50">
					<Button
						className="w-full"
						size="lg"
						onClick={() => setIsModalOpen(true)}
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Market
					</Button>
				</div>
			</div>

			<AddMarketModal open={isModalOpen} onOpenChange={setIsModalOpen} />
		</>
	)
}
