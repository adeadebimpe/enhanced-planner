# Enhanced Games Expansion Planner

A Next.js application that helps compare global markets side-by-side for launching Enhanced Games using AI-powered strategic analysis.

## Features

- **Market Comparison**: Compare two global markets simultaneously
- **AI-Powered Analysis**: OpenAI GPT-4 generates comprehensive market strategies
- **Multiple Scenarios**: Analyze markets under different entry scenarios (Low Regulation, High Capital, Media-First, Athlete-First)
- **Visual Analytics**:
  - Radar charts for soft score comparisons
  - Impact metrics (risk, upside, cost index)
  - Side-by-side strategy recommendations
- **90-Day Execution Plans**: AI-generated tactical plans for market entry

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS, Shadcn UI, Radix UI
- **Charts**: Recharts
- **AI**: OpenAI GPT-4
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key

### Installation

1. Clone the repository or navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
cp .env.local.example .env.local
```

4. Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Running the Application

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Usage

1. **Select Markets**: Choose two markets from the dropdown (Market A and Market B)
2. **Choose Scenario**: Select an entry scenario that aligns with your strategic approach
3. **Generate Strategy**: Click "Generate Strategy" to get AI-powered analysis
4. **Compare Results**: Review the radar charts, impact metrics, and detailed strategic recommendations

## Market Data

The application includes seed data for 10 markets:
- United States
- United Kingdom
- United Arab Emirates
- Singapore
- Australia
- Japan
- Germany
- Brazil
- South Africa
- Saudi Arabia

Each market includes:
- Population and GDP per capita
- Sports culture insights
- Media landscape overview
- Regulatory environment notes

## Scenarios

### Low Regulation
Focus on regulatory arbitrage and quick market entry

### High Capital
Premium positioning with significant infrastructure investment

### Media-First
Prioritize broadcast deals and digital engagement

### Athlete-First
Focus on athlete recruitment and training facilities

## Project Structure

```
enhanced-planner/
├── app/
│   ├── api/strategy/     # OpenAI strategy generation endpoint
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main application page
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # Base UI components
│   ├── market-picker.tsx
│   ├── scenario-toggle.tsx
│   ├── radar-chart.tsx
│   ├── impact-cards.tsx
│   └── strategy-panel.tsx
├── data/
│   └── markets.ts        # Seed market data
├── lib/
│   ├── types.ts          # TypeScript interfaces
│   └── utils.ts          # Utility functions
└── claude.md             # Development guidelines
```

## License

MIT
