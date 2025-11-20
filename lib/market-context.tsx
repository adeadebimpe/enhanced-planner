'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { CustomMarket, Scenario } from '@/lib/types'
import { markets as seedMarkets } from '@/data/markets'

interface MarketContextType {
	customMarkets: CustomMarket[]
	addCustomMarket: (market: Omit<CustomMarket, 'id' | 'createdAt'>) => void
	removeCustomMarket: (id: string) => void
	getAllMarkets: () => { id: string; name: string; isCustom: boolean }[]
	getMarketById: (id: string) => CustomMarket | null
	scenario: Scenario
	setScenario: (scenario: Scenario) => void
}

const MarketContext = createContext<MarketContextType | undefined>(undefined)

const STORAGE_KEY = 'enhanced-games-markets'

export function MarketProvider ({ children }: { children: ReactNode }) {
	const [customMarkets, setCustomMarkets] = useState<CustomMarket[]>([])
	const [scenario, setScenario] = useState<Scenario>('High Capital')

	// Load from localStorage on mount
	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored) {
			try {
				const parsed = JSON.parse(stored)
				setCustomMarkets(
					parsed.map((m: CustomMarket) => ({
						...m,
						createdAt: new Date(m.createdAt),
					})),
				)
			} catch (err) {
				console.error('Failed to load markets from storage:', err)
			}
		}
	}, [])

	// Save to localStorage whenever customMarkets changes
	useEffect(() => {
		if (customMarkets.length > 0) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(customMarkets))
		}
	}, [customMarkets])

	function addCustomMarket (market: Omit<CustomMarket, 'id' | 'createdAt'>) {
		const newMarket: CustomMarket = {
			...market,
			id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			createdAt: new Date(),
		}
		setCustomMarkets(prev => [...prev, newMarket])
	}

	function removeCustomMarket (id: string) {
		setCustomMarkets(prev => prev.filter(m => m.id !== id))
	}

	function getAllMarkets () {
		const seed = seedMarkets.map(m => ({
			id: m.code.toLowerCase(),
			name: m.country,
			isCustom: false,
		}))

		const custom = customMarkets.map(m => ({
			id: m.id,
			name: m.name,
			isCustom: true,
		}))

		return [...seed, ...custom]
	}

	function getMarketById (id: string): CustomMarket | null {
		return customMarkets.find(m => m.id === id) || null
	}

	return (
		<MarketContext.Provider
			value={{
				customMarkets,
				addCustomMarket,
				removeCustomMarket,
				getAllMarkets,
				getMarketById,
				scenario,
				setScenario,
			}}
		>
			{children}
		</MarketContext.Provider>
	)
}

export function useMarkets () {
	const context = useContext(MarketContext)
	if (!context) {
		throw new Error('useMarkets must be used within MarketProvider')
	}
	return context
}
