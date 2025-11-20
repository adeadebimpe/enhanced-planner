import type { MarketData, Scenario } from './types'

/**
 * System prompt for OpenAI API calls
 */
export const SYSTEM_PROMPT = 'You are a strategic business analyst. Return only valid JSON.'

/**
 * Generates the market analysis prompt
 */
export function getMarketAnalysisPrompt (market: MarketData): string {
	return `You are a strategic advisor for the Enhanced Games, a groundbreaking international sporting competition that allows performance enhancement and challenges traditional anti-doping frameworks. This is a real, venture-backed initiative aiming to create a new paradigm in elite sports.

Analyze the following market for strategic expansion:

Country: ${market.country}
Population: ${market.population.toLocaleString()}
GDP per Capita: $${market.gdpPerCapita.toLocaleString()}
Sports Culture: ${market.sportsCulture}
Media Landscape: ${market.mediaLandscape}
Regulation Notes: ${market.regulationNotes}

Provide a data-driven, realistic market analysis in JSON format:

1. softScores (0-10 scale) - Base these on real market conditions:
   - culturalFit: Consider the country's attitudes toward sports science, performance optimization, personal freedom in sports, and existing supplement/enhancement culture. Factor in religious, cultural, and societal values.
   - regulatoryFriendliness: Evaluate actual regulatory frameworks, anti-doping agency influence, pharmaceutical regulations, and the government's stance on sports innovation vs. traditional Olympic values.
   - mediaPotential: Assess the maturity of sports broadcasting, streaming infrastructure, social media penetration, and appetite for controversial/innovative sports content.
   - sponsorshipAppetite: Analyze the corporate culture, sports marketing spend, presence of performance-focused brands (supplements, tech, pharma), and willingness to associate with controversial initiatives.
   - infrastructureReadiness: Evaluate existing world-class sports facilities, hotels, transportation, medical facilities, and event hosting experience.

2. scenarioImpact (0-10 scale) - Be realistic about challenges:
   - risk: Consider regulatory pushback, public perception risks, potential Olympic/traditional sports body retaliation, legal challenges, and athlete safety concerns.
   - upside: Evaluate market size, media rights potential, sponsorship opportunities, athlete attraction, and first-mover advantages in performance-enhanced sports.
   - costIndex: Factor in facility costs, regulatory compliance, marketing spend needed to build awareness, talent acquisition costs, and operational overhead.

3. marketInsights - Provide realistic estimates:
   - audienceSize: Estimated potential audience in millions based on sports viewership, interest in fitness/performance, and openness to enhanced sports
   - fitnessRate: Actual fitness participation rate (0-100) based on real data
   - streamingScore: Digital sports consumption maturity (0-100)
   - sponsorshipValue: Commercial sponsorship market potential (0-100)
   - regulationScore: Regulatory environment favorability (0-100)

4. geopoliticalAssessment - Consider real political dynamics:
   - stabilityScore: Actual political stability considering government changes, protests, economic stability
   - riskLevel: Realistic assessment - 'Low', 'Medium', or 'High'
   - keyFactors: 3-5 specific, real geopolitical factors (e.g., "Recent government crackdown on Western sports organizations", "Strong relationship with IOC may create conflicts")
   - recommendations: 2-3 actionable, specific recommendations for navigating geopolitical risks

5. bestCities - Select actual major cities with real coordinates:
   - Array of 3-5 cities that genuinely have world-class sports infrastructure
   - name: Actual city name (major cities only)
   - latitude: Accurate decimal coordinates
   - longitude: Accurate decimal coordinates
   - population: Real city population in millions
   - advantages: 2-3 specific, factual advantages (e.g., "Home to 3 Olympic-standard stadiums", "Proven host of Formula 1 and international athletics")

6. narrative - Be compelling but realistic:
   - summary: One powerful, honest sentence about the market opportunity that acknowledges both potential and challenges
   - reasonsToEnter: 3-4 specific, evidence-based reasons with concrete examples
   - keyRisks: 3-4 realistic challenges this market poses, don't sugarcoat obstacles

Be honest about challenges and opportunities. This is a controversial, innovative venture - acknowledge resistance from traditional sports bodies, potential public skepticism, and regulatory hurdles while highlighting genuine opportunities.

Return ONLY valid JSON matching this exact structure.`
}

/**
 * Generates the execution plan prompt
 */
export function getExecutionPlanPrompt (
	market: MarketData,
	scenario: Scenario,
): string {
	return `You are a strategic advisor for the Enhanced Games, a groundbreaking international sporting competition that allows performance enhancement. Create a realistic, actionable 90-day market entry execution plan.

Market Context:
Country: ${market.country}
Population: ${market.population.toLocaleString()}
GDP per Capita: $${market.gdpPerCapita.toLocaleString()}
Sports Culture: ${market.sportsCulture}
Media Landscape: ${market.mediaLandscape}
Regulation Notes: ${market.regulationNotes}

Strategic Approach: ${scenario}

Understand the "${scenario}" strategy deeply:

HIGH CAPITAL Strategy:
- Target affluent audiences and premium brand positioning
- Invest heavily in world-class venues, luxury experiences, VIP packages
- Partner with high-end brands (luxury goods, premium automotive, private banking)
- Focus on exclusivity, elite athlete recruitment with top compensation
- Build state-of-the-art training facilities and medical centers
- Price positioning: Premium ticket prices, exclusive memberships
- Marketing: Sophisticated campaigns targeting high-net-worth individuals

MEDIA-FIRST Strategy:
- Prioritize content creation and viral moments over live attendance
- Secure broadcast deals with major networks and streaming platforms
- Create compelling behind-the-scenes content, athlete documentaries
- Build strong social media presence across all platforms
- Partner with content creators, influencers, and sports media personalities
- Focus on digital rights, streaming exclusivity deals
- Marketing: Generate buzz through controversial storylines, dramatic athlete narratives
- Leverage short-form content (TikTok, Instagram Reels, YouTube Shorts)

ATHLETE-FIRST Strategy:
- Make athlete welfare and development the absolute priority
- Offer industry-leading compensation, healthcare, and support systems
- Build cutting-edge training facilities with latest sports science technology
- Provide comprehensive medical oversight and performance optimization
- Create pathways for athletes banned or limited by traditional sports
- Focus on athlete testimonials and personal stories
- Competitive advantage: Position as the athlete-friendly alternative to restrictive Olympic system
- Recruit high-profile athletes willing to challenge traditional doping frameworks

Create a hyper-specific 90-day execution plan in JSON format:

executionPlan: Each phase must include concrete actions, specific stakeholders, and measurable outcomes:

   - week1to2: Initial market entry actions (4-5 sentences minimum)
     * Include specific stakeholder meetings (government officials, sports federations, potential venues)
     * Name actual organizations or types of partners to approach
     * Address regulatory/legal groundwork specific to ${market.country}
     * Align everything with ${scenario} strategic priorities
     * Provide detailed context on initial challenges and approach

   - week3to4: Early implementation milestones (4-5 sentences minimum)
     * Include specific facility assessments, partnership negotiations
     * Address media outreach, preliminary athlete recruitment
     * Reference real market conditions in ${market.country}
     * Show progress building on week 1-2 foundation
     * Detail specific partnerships or agreements in progress

   - week5to6: Mid-term execution and partnerships (4-5 sentences minimum)
     * Detail specific agreements being finalized (venues, sponsors, broadcast)
     * Show concrete progress toward ${scenario} goals
     * Include marketing campaign launches, athlete announcements
     * Address any anticipated resistance or challenges
     * Explain how momentum is building toward launch

   - week7to8: Advanced preparation and scaling (4-5 sentences minimum)
     * Detail operational readiness: staffing, logistics, technology setup
     * Include specific training programs, facility preparations
     * Show ${scenario} strategy being fully executed
     * Reference community engagement, local partnerships
     * Describe team expansion and capability building

   - week9to12: Pre-launch readiness and final preparations (4-5 sentences minimum)
     * Include specific testing events, media previews, soft launches
     * Detail final athlete recruitment push, event scheduling
     * Show complete readiness for market entry
     * Include crisis management and contingency planning
     * Set stage for successful launch aligned with ${scenario}
     * Provide confidence-building details about launch readiness

CRITICAL REQUIREMENTS:
- Be specific with names of types of organizations, facilities, and partnerships relevant to ${market.country}
- Account for the country's regulatory environment, cultural norms, and market conditions
- Every action must clearly support the ${scenario} strategy
- Be realistic about challenges (e.g., if regulations are strict, address lobbying efforts; if media is underdeveloped, focus on digital-first approaches)
- Include concrete metrics and milestones for each phase
- Address potential opposition from traditional sports bodies, government agencies, or public opinion

Return ONLY valid JSON matching this exact structure.`
}
