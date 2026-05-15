# Career.AI

Career.AI is an AI-powered career transition platform that helps users pivot to new roles by generating personalized 12-month roadmaps with ongoing AI assistance.

## Overview

Career.AI addresses the challenge of career transitions by providing structured, actionable plans tailored to individual backgrounds, time availability, and constraints. The platform combines automated plan generation with interactive AI support to make career changes more manageable and achievable.

## Technical Architecture

### Stack

- **Framework**: Next.js 16.2.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: Clerk
- **AI Integration**: Google Gemini AI (@google/genai)
- **State Management**: React hooks with client-side persistence
- **UI Components**: Shadcn/ui with Radix UI primitives

### Project Structure

```
my-app/
├── app/
│   ├── (root)/                 # Main application routes
│   │   └── page.tsx           # Home page with main application logic
│   ├── api/                   # API routes
│   │   ├── chat/              # Chat endpoint for AI assistance
│   │   ├── plan/              # Plan generation endpoint
│   │   └── state/             # State persistence endpoint
│   ├── sign-in/               # Authentication pages
│   │   └── [[...sign-in]]/page.tsx
│   ├── sign-up/               # Registration pages
│   │   └── [[...sign-up]]/page.tsx
│   ├── globals.css            # Global styles
│   └── layout.tsx             # Root layout with providers
├── components/
│   └── shared/                # Shared UI components
│       ├── CareerAIComponent.tsx  # Main branding component
│       ├── Header.tsx           # Application header
│       ├── OnBoarding.tsx       # User profile collection form
│       ├── PlanSection.tsx      # Career plan visualization and interaction
│       ├── ZakChat.tsx          # AI chat interface
│       └── StatusPill.tsx       # Task status indicator
├── lib/
│   ├── types.ts               # TypeScript type definitions
│   └── utils.ts               # Utility functions (cn for class merging)
├── public/                    # Static assets
├── .env                       # Environment variables
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## Core Features

### 1. AI-Powered Plan Generation

The `/api/plan` route uses Google's Gemini AI to generate personalized 12-month career transition plans based on user profiles.

**Process:**
1. User submits profile through onboarding form
2. Profile data is sent to `/api/plan` endpoint
3. Google Gemini AI generates a structured JSON plan with:
   - 12 months, each with:
     - Theme (2-4 word focus area)
     - Summary (1-sentence description)
     - 4 tasks per month (learning, practice, networking, reflection)
4. Plan is stored in client state and synchronized with MongoDB

### 2. Interactive AI Assistant

The `/api/chat` route provides conversational AI assistance through the "Zak" chatbot.

**Features:**
- Context-aware responses using user profile, plan, and chat history
- Fallback mechanisms for API failures
- Real-time messaging with typing indicators
- Ability to ask about plans, next steps, and adaptation strategies

### 3. Plan Interaction & Tracking

Users can interact with their generated plans through:

- **Month Selection**: Focus on specific months in the 12-month plan
- **Task Management**: Mark tasks as todo/in-progress/done
- **Progress Visualization**: Visual indicators for task completion
- **Month Activation**: Automatically start first task when selecting a month

### 4. State Persistence

Application state is synchronized with MongoDB through:

- **/api/state** (GET): Retrieve saved state
- **/api/state** (POST): Save current state
- Automatic synchronization on state changes
- Restoration on application load

## Data Models

### UserProfile
```typescript
{
  name: string;
  currentRole: string;
  yearsExperience: string;
  desiredRole: string;
  timePerWeek: string;
  constraints: string;
  challenges: string;
}
```

### Plan
```typescript
{
  id: string;
  months: MonthPlan[];
}
```

### MonthPlan
```typescript
{
  id: string;
  title: string;
  tasks: Task[];
  index: number;
  theme: string;
  summary: string;
}
```

### Task
```typescript
{
  id: string;
  title: string;
  description: string;
  category: "learning" | "hobby" | "work";
  status: "todo" | "in-progress" | "done";
}
```

### ChatMessage
```typescript
{
  id: string;
  from: "user" | "Zak";
  content: string;
  timestamp: number;
}
```

### AppState
```typescript
{
  stage: "onboarding" | "plan";
  profile: UserProfile | null;
  plan: Plan | null;
  selectedMonthId: string | null;
  chat: ChatMessage[];
}
```

## API Endpoints

### POST /api/plan
Generates a 12-month career transition plan.

**Request Body:** UserProfile object
**Response:** `{ plan: Plan }` or `{ error: string }`

### POST /api/chat
Gets AI response for career advice questions.

**Request Body:**
```typescript
{
  profile: UserProfile | null;
  plan: Plan | null;
  selectedMonthId: string | null;
  messages: Array<{ from: string; content: string }>;
}
```
**Response:** `{ reply: string }` or `{ error: string }`

### GET /api/state
Retrieves saved application state from MongoDB.

**Response:** `{ state: AppState }` or `null`

### POST /api/state
Saves application state to MongoDB.

**Request Body:** `{ state: AppState }`
**Response:** Success status

## Implementation Details

### Authentication
- Uses Clerk for user authentication
- Protected routes redirect unauthenticated users to sign-in
- User ID used for state synchronization

### State Management
- Client-side state using React useState/useEffect
- Automatic synchronization with MongoDB (700ms debounce)
- State restoration on app load
- Cleanup on user logout

### AI Integration
- Google Gemini AI for plan generation and chat
- Model fallback system (tries gemini-3-flash-preview, then gemini-2.5-flash)
- Prompt engineering for structured JSON output
- Error handling with fallback responses

### UI/UX
- Responsive design with Tailwind CSS
- Dark/light theme support
- Loading states and skeletons
- Interactive plan visualization
- Chat interface with message history

## Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB instance (for state persistence)
- Google Gemini API key
- Clerk authentication credentials

### Environment Variables
Create a `.env` file with:
```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# MongoDB Connection
MONGODB_URI=

# Google Gemini AI
GOOGLE_GENAI_API_KEY=
```

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm start
```

## Deployment

The application is optimized for deployment on Vercel:
1. Push to GitHub repository
2. Import project in Vercel dashboard
3. Configure environment variables
4. Deploy

## Future Enhancements

1. **Enhanced Personalization**: More sophisticated AI analysis for better plan customization
2. **Progress Analytics**: Detailed statistics and visualization of career transition progress
3. **Community Features**: Peer support and mentorship connections
4. **Resource Integration**: Direct links to learning materials, courses, and professional networks
5. **Mobile Application**: Native mobile apps for iOS and Android
6. **Integration with HR Systems**: Enterprise version for corporate career development programs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Next.js team for the excellent framework
- Google for Gemini AI capabilities
- Clerk for authentication solutions
- Tailwind CSS for utility-first styling
- Shadcn/ui for beautiful, accessible components