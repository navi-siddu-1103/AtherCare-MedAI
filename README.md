# MediAI: Your Personal AI Health Assistant

MediAI is an intelligent, AI-powered web application designed to provide users with accessible and easy-to-understand health insights. It offers a suite of diagnostic tools, report analysis, and informational features to empower users to take control of their health.

## Key Features

-   **AI Skin Analysis**: Upload an image of a skin condition and receive an AI-powered analysis, including probability of conditions like acne and recommendations.
-   **Blood Report Analysis**: Upload a blood report in PDF format to get an intelligent, summarized breakdown of the results in simple terms.
-   **Find Nearby Hospitals**: Quickly locate hospitals in major Indian cities with details on services and emergency doctor availability.
-   **AI Health Chatbot**: An interactive chatbot to answer general health-related questions and guide users through the app's features.
-   **Secure Authentication**: A complete user authentication system (signup, login, logout) to protect user data.

## Tech Stack

This project is built with a modern, robust, and scalable technology stack:

-   **Frontend**: [Next.js](https://nextjs.org/) (with App Router) & [React](https://react.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/) for a professional and responsive component library.
-   **Generative AI**: [Firebase Genkit](https://firebase.google.com/docs/genkit) for creating and managing AI-powered flows that integrate with Google's Gemini models.
-   **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth) (mocked for local development).

## Getting Started

To get the application running locally on your machine, follow these steps.

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn

### Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a `.env.local` file in the root of the project and add your Firebase and Genkit API keys.
    ```
    # Add your Google AI Studio API Key for Genkit
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

The application should now be running on [http://localhost:3000](http://localhost:3000).

## Available Scripts

-   `npm run dev`: Starts the Next.js application in development mode.
-   `npm run build`: Creates a production-ready build of the application.
-   `npm run start`: Starts the production server.
-   `npm run lint`: Lints the codebase for errors and style issues.
-   `npm run typecheck`: Runs the TypeScript compiler to check for type errors.

## AI Flows with Genkit

The core AI functionality is managed by Genkit flows located in the `src/ai/flows` directory. These server-side functions handle the interaction with the Gemini large language models for tasks like analyzing reports and images.

-   `analyze-blood-report.ts`: Processes a PDF blood report and generates a structured summary.
-   `analyze-skin-condition.ts`: Analyzes a user-uploaded image for skin conditions.
-   `find-hospitals.ts`: Uses a Genkit tool to find mock hospital data for a given city.
-   `chat.ts`: Powers the conversational AI Health Chatbot.
