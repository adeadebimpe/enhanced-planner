'use client'

import { Sidebar } from '@/components/sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Zap } from 'lucide-react'

export default function Home () {
	return (
		<div className="flex min-h-screen bg-background">
			<Sidebar />

			<main className="flex-1 overflow-y-auto">
				<div className="p-8 max-w-7xl mx-auto space-y-8">
					{/* Header */}
					<div>
						<h1 className="text-4xl font-bold tracking-tight mb-2">
							Welcome
						</h1>
						<p className="text-muted-foreground">
							Select a market from the sidebar to begin analysis
						</p>
					</div>

					{/* Empty State */}
					<Card className="border-dashed">
						<CardContent className="flex flex-col items-center justify-center h-96 text-center">
							<div className="rounded-full bg-muted p-4 mb-4">
								<Zap className="h-8 w-8 text-muted-foreground" />
							</div>
							<h3 className="text-lg font-semibold mb-2">No market selected</h3>
							<p className="text-sm text-muted-foreground max-w-md">
								Choose a market from the sidebar or add a custom market to
								generate AI-powered expansion strategies
							</p>
						</CardContent>
					</Card>

					{/* Footer */}
					<div className="pt-8 border-t border-border/50 text-center text-xs text-muted-foreground">
						<p>
							Powered by OpenAI GPT-4 • Market data from official sources •
							AI-generated strategic analysis
						</p>
					</div>
				</div>
			</main>
		</div>
	)
}
