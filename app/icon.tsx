import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
	width: 32,
	height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon () {
	return new ImageResponse(
		(
			<div
				style={{
					background: 'linear-gradient(135deg, #1A04FF 0%, #0D02A0 100%)',
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<svg width="24" height="24" viewBox="0 0 100 100" fill="none">
					<circle cx="50" cy="50" r="40" stroke="white" strokeWidth="6" fill="none" />
					<path d="M35 50 L45 60 L65 40" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</div>
		),
		{
			...size,
		},
	)
}
