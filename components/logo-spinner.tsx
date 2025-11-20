'use client'

import { motion } from 'framer-motion'

interface LogoSpinnerProps {
	size?: 'sm' | 'md' | 'lg'
	className?: string
}

export function LogoSpinner({ size = 'md', className = '' }: LogoSpinnerProps) {
	const sizeMap = {
		sm: 24,
		md: 48,
		lg: 96,
	}

	const spinnerSize = sizeMap[size]

	return (
		<div className={`flex items-center justify-center ${className}`}>
			<motion.div
				animate={{
					rotate: 360,
				}}
				transition={{
					duration: 1.5,
					repeat: Infinity,
					ease: 'linear',
				}}
			>
				<svg
					width={spinnerSize}
					height={spinnerSize}
					viewBox="0 0 100 100"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<defs>
						<linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stopColor="#1A04FF" />
							<stop offset="100%" stopColor="#0D02A0" />
						</linearGradient>
					</defs>
					<circle
						cx="50"
						cy="50"
						r="40"
						stroke="url(#logoGradient)"
						strokeWidth="6"
						fill="none"
						strokeLinecap="round"
						strokeDasharray="251.2"
						strokeDashoffset="62.8"
					/>
					<motion.path
						d="M35 50 L45 60 L65 40"
						stroke="url(#logoGradient)"
						strokeWidth="6"
						strokeLinecap="round"
						strokeLinejoin="round"
						initial={{ pathLength: 0, opacity: 0 }}
						animate={{ pathLength: 1, opacity: 1 }}
						transition={{
							duration: 0.8,
							repeat: Infinity,
							repeatDelay: 0.7,
							ease: 'easeInOut',
						}}
					/>
				</svg>
			</motion.div>
		</div>
	)
}
