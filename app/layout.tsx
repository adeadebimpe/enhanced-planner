import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { MarketProvider } from '@/lib/market-context'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const jetbrainsMono = JetBrains_Mono({
	subsets: ['latin'],
	variable: '--font-mono'
})

export const metadata: Metadata = {
	title: 'Enhanced Games Expansion Planner',
	description: 'Compare global markets for Enhanced Games expansion',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en" className="dark" suppressHydrationWarning>
			<body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`} suppressHydrationWarning>
				<MarketProvider>{children}</MarketProvider>
			</body>
		</html>
	)
}
