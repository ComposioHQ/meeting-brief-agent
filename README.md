# Meeting Brief Agent

Meeting Brief Agent is an AI-powered assistant that helps you prepare for meetings by:
- Fetching your upcoming meetings from Google Calendar
- Researching the people and companies you'll meet using search tools and Apollo
- Generating a detailed meeting brief and saving it to Google Docs

## Features
- **Google Calendar Integration:** Automatically fetches your next meeting and all relevant details.
- **Smart Research:** Uses advanced search and Apollo to gather up-to-date information about meeting participants and companies (excluding the account owner).
- **Google Docs Export:** Generates a well-formatted meeting brief and saves it directly to your Google Docs.
- **Separation of Concerns:** Three-agent architecture for calendar, research, and documentation, each with its own API key handling for security and flexibility.

## Getting Started

### Prerequisites
- Node.js 18+
- A [Composio](https://composio.dev/) API key (for user input)
- A Composio API key set as an environment variable for research agent
- (Optional) Apollo API key for enhanced people search

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd meeting-briefing-agent
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   COMPOSIO_API_KEY=your_composio_api_key_for_research_agent
   APOLLO_API_KEY=your_apollo_api_key   # (if needed)
   ```
4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. **Open the app:**
   Go to [http://localhost:3000](http://localhost:3000) in your browser.

## Usage
1. Enter your Composio API key in the input field.
2. Connect your Google Calendar and Google Docs accounts.
3. Click "Generate Meeting Brief" to get a detailed, researched meeting brief saved to your Google Docs.

## Project Structure
- `app/api/meeting-brief/route.ts` — Main API route orchestrating the three-agent workflow
- `app/components/ConnectionPanel.tsx` — UI for connecting services
- `app/page.tsx` — Main frontend page

## Environment Variables
- `COMPOSIO_API_KEY` — Used by the research agent (set in `.env.local`)
- `APOLLO_API_KEY` — (Optional) Used for Apollo people search

## License
MIT

---

Built with ❤️ using [Composio](https://composio.dev/), AI SDK, and OpenAI.
