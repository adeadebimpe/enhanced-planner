import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { MarketProvider } from '@/lib/market-context'
import { ChatProvider } from '@/lib/chat-context'

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
			<body className={`${inter.variable} ${jetbrainsMono.variable} font-sans overflow-x-hidden`} suppressHydrationWarning>
				<ChatProvider>
					<MarketProvider>{children}</MarketProvider>
				</ChatProvider>
			</body>
		</html>
	)
}
