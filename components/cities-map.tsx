'use client'

import { useEffect, useState, useRef } from 'react'
import type { City } from '@/lib/types'

interface CitiesMapProps {
	cities: City[]
	countryName: string
}

export function CitiesMap({ cities, countryName }: CitiesMapProps) {
	const [mapLoaded, setMapLoaded] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const mapRef = useRef<any>(null)

	useEffect(() => {
		let isMounted = true

		// Dynamically import Leaflet only on client side
		const loadMap = async () => {
			if (typeof window === 'undefined') return

			try {
				// Add Leaflet CSS dynamically
				if (!document.getElementById('leaflet-css')) {
					const link = document.createElement('link')
					link.id = 'leaflet-css'
					link.rel = 'stylesheet'
					link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
					link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
					link.crossOrigin = ''
					document.head.appendChild(link)
				}

				// Add custom dark mode styles for Leaflet popups
				if (!document.getElementById('leaflet-dark-mode-css')) {
					const style = document.createElement('style')
					style.id = 'leaflet-dark-mode-css'
					style.textContent = `
						.leaflet-popup-content-wrapper {
							background: hsl(var(--card)) !important;
							color: hsl(var(--foreground)) !important;
							border: 1px solid hsl(var(--border)) !important;
							border-radius: 6px !important;
						}
						.leaflet-popup-tip {
							background: hsl(var(--card)) !important;
							border: 1px solid hsl(var(--border)) !important;
						}
						.leaflet-popup-close-button {
							color: hsl(var(--muted-foreground)) !important;
						}
						.leaflet-popup-close-button:hover {
							color: hsl(var(--foreground)) !important;
						}
						.leaflet-container a {
							color: hsl(var(--primary)) !important;
						}
						.custom-marker-icon {
							background: transparent !important;
							border: none !important;
						}
						.custom-marker-icon svg {
							filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
						}
					`
					document.head.appendChild(style)
				}

				// Import Leaflet
				const L = await import('leaflet')

				if (!isMounted) return

				// Create custom primary colored marker icon using SVG
				const createCustomIcon = () => {
					const svgIcon = `
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="45">
							<path fill="hsl(var(--primary))" stroke="#000" stroke-width="1" opacity="0.9"
								d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 18 9 18s9-11.25 9-18c0-4.97-4.03-9-9-9z"/>
							<circle cx="12" cy="9" r="4" fill="#fff" opacity="0.95"/>
						</svg>
					`
					return L.divIcon({
						html: svgIcon,
						className: 'custom-marker-icon',
						iconSize: [30, 45],
						iconAnchor: [15, 45],
						popupAnchor: [0, -45],
					})
				}

				// Store the custom icon
				;(window as any).customMarkerIcon = createCustomIcon()

				setMapLoaded(true)
			} catch (err) {
				console.error('Failed to load Leaflet:', err)
				if (isMounted) {
					setError('Failed to load map. Please refresh the page.')
				}
			}
		}

		loadMap()

		return () => {
			isMounted = false
			// Cleanup map on unmount
			if (mapRef.current) {
				mapRef.current.remove()
				mapRef.current = null
			}
		}
	}, [])

	useEffect(() => {
		if (!mapLoaded || cities.length === 0) return

		let isMounted = true
		let map: any = null

		const initMap = async () => {
			try {
				const L = await import('leaflet')

				if (!isMounted) return

				// Calculate center and bounds
				const lats = cities.map(c => c.latitude)
				const lngs = cities.map(c => c.longitude)
				const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length
				const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length

				// Initialize map
				const mapContainer = document.getElementById('cities-map')
				if (!mapContainer) return

				// Remove existing map if any
				if (mapRef.current) {
					try {
						mapRef.current.off()
						mapRef.current.remove()
					} catch (e) {
						console.warn('Error removing previous map:', e)
					}
					mapRef.current = null
				}

				// Clear container
				mapContainer.innerHTML = ''

				// Create new map
				map = L.map('cities-map', {
					zoomControl: true,
					scrollWheelZoom: true,
				}).setView([centerLat, centerLng], 6)

				if (!isMounted) {
					map.remove()
					return
				}

				mapRef.current = map

				// Add dark mode tile layer from CartoDB
				L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
					attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
					subdomains: 'abcd',
					maxZoom: 20,
				}).addTo(map)

				// Get custom icon
				const customIcon = (window as any).customMarkerIcon

				// Add markers for each city
				cities.forEach((city) => {
					const marker = L.marker([city.latitude, city.longitude], {
						icon: customIcon,
					}).addTo(map)

					const popupContent = `
						<div style="font-family: monospace; min-width: 200px; background: hsl(var(--card)); color: hsl(var(--foreground));">
							<h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: hsl(var(--foreground));">${city.name}</h3>
							<p style="margin: 0 0 4px 0; font-size: 11px; color: hsl(var(--muted-foreground));">
								Population: ${city.population}M
							</p>
							<div style="margin-top: 8px;">
								<p style="margin: 0 0 4px 0; font-size: 10px; font-weight: 600; text-transform: uppercase; color: hsl(var(--muted-foreground));">
									Advantages:
								</p>
								<ul style="margin: 0; padding-left: 16px; font-size: 11px; color: hsl(var(--foreground));">
									${city.advantages.map(adv => `<li style="margin-bottom: 2px;">${adv}</li>`).join('')}
								</ul>
							</div>
						</div>
					`

					marker.bindPopup(popupContent, {
						className: 'custom-popup',
						maxWidth: 300,
					})
				})

				// Fit bounds to show all markers
				const bounds = L.latLngBounds(cities.map(c => [c.latitude, c.longitude]))
				map.fitBounds(bounds, { padding: [50, 50] })
			} catch (err) {
				console.error('Failed to initialize map:', err)
				if (isMounted) {
					setError('Failed to initialize map. Please refresh the page.')
				}
			}
		}

		initMap()

		return () => {
			isMounted = false
			if (map) {
				try {
					map.off()
					map.remove()
				} catch (e) {
					console.warn('Error cleaning up map:', e)
				}
			}
		}
	}, [mapLoaded, cities])

	if (error) {
		return (
			<div className="w-full h-full min-h-[400px] bg-muted/20 flex items-center justify-center">
				<div className="text-center">
					<p className="text-sm text-destructive mb-2">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="text-xs text-muted-foreground hover:text-foreground underline"
					>
						Refresh Page
					</button>
				</div>
			</div>
		)
	}

	if (!mapLoaded) {
		return (
			<div className="w-full h-full min-h-[400px] bg-muted/20 flex items-center justify-center relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse" />
				<div className="relative z-10 flex flex-col items-center space-y-3">
					<div className="relative">
						<div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
						<div className="absolute inset-0 h-8 w-8 rounded-full bg-primary/20 animate-ping" />
					</div>
					<span className="text-xs text-muted-foreground font-mono">Loading map...</span>
				</div>
			</div>
		)
	}

	return (
		<div
			id="cities-map"
			className="w-full h-full min-h-[400px] rounded-sm border border-border"
			style={{ zIndex: 0 }}
		/>
	)
}
