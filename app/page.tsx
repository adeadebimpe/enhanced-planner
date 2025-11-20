import { redirect } from 'next/navigation'
import { markets } from '@/data/markets'

export default function Home () {
	// Redirect to first market
	if (markets.length > 0) {
		redirect(`/${markets[0].code.toLowerCase()}`)
	}

	// This should never be reached if there are seed markets
	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="flex flex-col items-center gap-2">
				<h1 className="text-2xl font-semibold mb-4">Welcome to Enhanced Games Planner</h1>
				<p className="text-muted-foreground">Please add a market to get started</p>
			</div>
		</div>
	)
}
