/**
 * Application-wide constants
 */

// OpenAI Configuration
export const OPENAI_TIMEOUT_MS = 60000 // 60 seconds
export const OPENAI_MAX_TOKENS_ANALYSIS = 4096
export const OPENAI_MAX_TOKENS_CHAT = 1000
export const OPENAI_TEMPERATURE = 0.7
export const OPENAI_MODEL = 'gpt-4o'

// Retry Configuration
export const RETRY_ATTEMPTS = 3
export const RETRY_INITIAL_DELAY_MS = 1000

// UI Configuration
export const COUNTRY_SEARCH_LIMIT = 50
export const MAX_MARKETS_COMPARISON = 3

// Score Validation
export const MIN_SCORE = 0
export const MAX_SCORE = 10

/**
 * Clamps a number to the 0-10 score range
 */
export const clampScore = (val: number) =>
	Math.max(MIN_SCORE, Math.min(MAX_SCORE, val))
