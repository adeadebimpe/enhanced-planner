import type { MarketData } from './types'
import { markets as seedMarkets } from '@/data/markets'

/**
 * Simple market type from context
 */
export interface SimpleMarket {
	id: string
	name: string
	isCustom?: boolean
}

/**
 * Gets market data with fallback for custom markets
 * @param market The market to get data for
 * @returns MarketData with either seed data or fallback values
 */
export function getMarketDataWithFallback(market: SimpleMarket): MarketData {
	const seedMarket = seedMarkets.find(
		m => m.country.toLowerCase() === market.name.toLowerCase()
	)

	return seedMarket || {
		country: market.name,
		code: market.name.substring(0, 2).toUpperCase(),
		population: 0,
		gdpPerCapita: 0,
		sportsCulture: 'Custom market - analyzing based on available data',
		mediaLandscape: 'Custom market - analyzing based on available data',
		regulationNotes: 'Custom market - analyzing based on available data',
	}
}

/**
 * Normalizes execution plan data by converting arrays to strings
 * @param plan The execution plan object to normalize
 */
export function normalizeExecutionPlan(plan: any): void {
	if (!plan) return

	Object.keys(plan).forEach(key => {
		if (Array.isArray(plan[key])) {
			plan[key] = plan[key].join(' ')
		} else if (typeof plan[key] === 'object' && plan[key] !== null) {
			// If it's an object, convert it to a formatted string
			plan[key] = Object.values(plan[key]).join(' ')
		}
	})
}
