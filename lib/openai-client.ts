import OpenAI from 'openai'

/**
 * Creates and returns a configured OpenAI client instance
 * @throws {Error} If OPENAI_API_KEY environment variable is not set
 * @returns {OpenAI} Configured OpenAI client with 60-second timeout
 */
export function getOpenAIClient(): OpenAI {
	const apiKey = process.env.OPENAI_API_KEY
	if (!apiKey) {
		throw new Error('OPENAI_API_KEY environment variable is not set')
	}
	return new OpenAI({ apiKey, timeout: 60000 }) // 60 second timeout
}

/**
 * Retry helper with exponential backoff
 * @param fn Function to retry
 * @param retries Number of retry attempts (default: 3)
 * @param delay Initial delay in milliseconds (default: 1000)
 * @returns Promise resolving to the function result
 */
export async function withRetry<T>(
	fn: () => Promise<T>,
	retries = 3,
	delay = 1000,
): Promise<T> {
	try {
		return await fn()
	} catch (error) {
		if (retries === 0) throw error
		await new Promise(resolve => setTimeout(resolve, delay))
		return withRetry(fn, retries - 1, delay * 2)
	}
}
