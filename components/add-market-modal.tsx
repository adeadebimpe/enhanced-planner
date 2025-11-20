'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { useMarkets } from '@/lib/market-context'
import { markets as seedMarkets } from '@/data/markets'

interface AddMarketModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

// List of world countries for search
const COUNTRIES = [
	...seedMarkets.map(m => m.country),
	'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia',
	'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus',
	'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana',
	'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada',
	'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
	'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark',
	'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
	'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland',
	'France', 'Gabon', 'Gambia', 'Georgia', 'Ghana', 'Greece', 'Grenada', 'Guatemala',
	'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India',
	'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Jordan',
	'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon',
	'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar',
	'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania',
	'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro',
	'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands',
	'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia',
	'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea',
	'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia',
	'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
	'Samoa', 'San Marino', 'Sao Tome and Principe', 'Senegal', 'Serbia', 'Seychelles',
	'Sierra Leone', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Korea',
	'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland',
	'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo',
	'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda',
	'Ukraine', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
	'Yemen', 'Zambia', 'Zimbabwe'
].sort()

export function AddMarketModal ({ open, onOpenChange }: AddMarketModalProps) {
	const router = useRouter()
	const { addCustomMarket, getAllMarkets } = useMarkets()
	const [searchQuery, setSearchQuery] = useState('')
	const existingMarkets = getAllMarkets().map(m => m.name.toLowerCase())

	const filteredCountries = COUNTRIES.filter(
		country =>
			country.toLowerCase().includes(searchQuery.toLowerCase()) &&
			!existingMarkets.includes(country.toLowerCase())
	)

	function handleSelectCountry (country: string) {
		const newMarket = addCustomMarket({ name: country })
		setSearchQuery('')
		onOpenChange(false)
		// Redirect to the newly created market page
		router.push(`/${newMarket.id}`)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent onClose={() => onOpenChange(false)}>
				<DialogHeader>
					<DialogDescription>
						Search for a country to add to your analysis
					</DialogDescription>
				</DialogHeader>

				<div className="p-6 space-y-4">
					{/* Search Input */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<input
							type="text"
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							placeholder="Search countries..."
							className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring"
							autoFocus
						/>
					</div>

					{/* Country List */}
					<div className="max-h-96 overflow-y-auto">
						{filteredCountries.length === 0 ? (
							<div className="p-8 text-center text-sm text-muted-foreground">
								{searchQuery
									? 'No countries found'
									: 'All countries have been added'}
							</div>
						) : (
							<div className="">
								{filteredCountries.slice(0, 50).map(country => (
									<button
										key={country}
										onClick={() => handleSelectCountry(country)}
										className="w-full px-2 py-2.5 text-left text-sm hover:bg-accent transition-colors"
									>
										{country}
									</button>
								))}
								{filteredCountries.length > 50 && (
									<div className="px-4 py-2 text-xs text-muted-foreground text-center">
										Showing first 50 results. Keep typing to narrow down...
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
