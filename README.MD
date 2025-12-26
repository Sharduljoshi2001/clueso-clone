📹 Clueso.io Clone: AI-Powered Documentation Tool
Assignment Submission for SubSpace, Automating software documentation with intelligent screen recording and AI voiceovers.

📖 Project Overview
This project is a functional clone of Clueso.io, designed to streamline the creation of "How-to" guides. It features a custom Chrome Extension that captures user interactions (DOM clicks) and screen video, and a robust Node.js Backend that processes this data into professional tutorials.

The Core Innovation: Unlike standard screen recorders, this system implements an automated AI Audio Pipeline. It extracts the user's raw commentary, refines the grammar using LLMs, and regenerates a professional, studio-quality AI voiceover—making every guide sound consistent and polished.

🚀 Key Features
🎥 Smart Screen Recorder: A Chrome Extension that captures video stream (MediaStream) and logs DOM interactions (clicks, inputs, navigation) simultaneously.

🧠 The "Free Stack" AI Pipeline: An engineered solution to provide premium AI features at zero cost:

Extraction: FFmpeg separates raw audio.

Transcription: Deepgram Nova-2 (High-speed Speech-to-Text).

Refinement: Google Gemini 1.5 Flash (Polishes grammar and removes filler words like "um/uh").

Voiceover: Google TTS (Generates clean AI audio).

🔗 Automated Merging: The system automatically stitches the new AI audio back into the video using FFmpeg.

☁️ Cloud Storage: Videos are optimized and stored on Cloudinary; metadata is stored in MongoDB.

📊 Interactive Dashboard: A React-based frontend to manage and view generated guides with synchronized step lists.

🏗️ System Architecture
The application follows a modular Service-Oriented Architecture to ensure separation of concerns.

Code snippet

graph TD
    A[Chrome Extension] -->|Uploads .webm + Logs| B(Node.js Server)
    B -->|Extracts Audio| C{Media Service}
    C -->|Raw Audio| D[Deepgram API]
    D -->|Transcript| E[Gemini AI]
    E -->|Refined Script| F[Google TTS]
    F -->|AI Audio| G[FFmpeg Merge]
    G -->|Final Video| H[Cloudinary]
    B -->|Save Metadata| I[MongoDB]
    H -->|Fetch Video| J[React Frontend]
    I -->|Fetch Steps| J
🛠️ Tech Stack
Frontend: React.js, Tailwind CSS, Vite.

Backend: Node.js, Express.js.

Database: MongoDB (Mongoose).

Extension: Manifest V3, Vanilla JS.

AI & Media: FFmpeg, Deepgram SDK, Google Generative AI (Gemini), Google TTS.

⚙️ Setup & Installation
Prerequisites
Node.js (v18+)

MongoDB (Local or Atlas URI)

FFmpeg installed on your system path.

1. Clone the Repository
Bash

git clone https://github.com/yourusername/clueso-clone.git
cd clueso-clone
2. Backend Setup
Bash

cd server
npm install
Create a .env file in the server directory:

Code snippet

PORT=3001
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
DEEPGRAM_API_KEY=your_deepgram_key
GEMINI_API_KEY=your_gemini_key
Start the server:

Bash

npm start
3. Frontend Setup
Bash

cd client
npm install
npm run dev
4. Extension Setup
Open Chrome and navigate to chrome://extensions.

Enable Developer Mode (top right).

Click Load Unpacked.

Select the extension folder from the project root.

🧠 Design Decisions & Trade-offs
1. The "Free AI Stack" (Deepgram + Gemini vs OpenAI)
Decision: Instead of using OpenAI (which requires paid credits and had rate limits during development), I integrated Deepgram for transcription and Gemini 1.5 Flash for text refinement.

Impact: This reduced the processing cost to $0 while actually improving transcription speed (Deepgram is faster than Whisper) and maintaining high logical accuracy with Gemini.

2. FFmpeg on Server
Decision: Video processing happens on the Node.js server rather than the browser.

Reasoning: Browser-based encoding (WebAssembly) is resource-heavy and can crash tabs on low-end devices. Offloading to the server ensures reliability and allows for complex mixing of audio/video streams.

3. Separation of Concerns
Pattern: Logic is split between guideController.js (HTTP handling) and mediaService.js (AI/Processing logic).

Benefit: This makes the codebase testable and allows me to swap out AI providers (e.g., switching from OpenAI to Deepgram) without breaking the controller logic.

⚠️ Known Limitations & Future Improvements
To maintain transparency regarding the current state of the prototype:

Full-Page Navigation Support (SPA vs MPA):

Current State: The recorder works perfectly on Single Page Applications (like React Docs, Gmail) where navigation doesn't reload the DOM.

Limitation: On traditional websites (like Wikipedia) where clicking a link triggers a full page reload, the content.js script is unloaded, causing the recording state to be lost.

Future Fix: Migrate the recording logic to an Offscreen Document managed by the Service Worker (background.js) to persist state across navigations.

Audio Processing Latency:

Current State: There is a 15-20 second delay after stopping recording while the AI pipeline (Transcribe -> Refine -> TTS -> Merge) executes.

Improvement: Implement a WebSocket connection to stream updates to the client, showing a real-time progress bar ("Transcribing...", "Generating Voice...", etc.).

System Audio Capture:

Limitation: Due to browser security constraints, the extension currently captures Microphone input. Capturing internal system audio (tab audio) requires a different tabCapture permission set which was out of scope for this MVP.

🎥 Video Demo
https://drive.google.com/drive/folders/1pB_iYPuYDjmoYy594c1QUHGwoWuoonRB?usp=sharing
 
BY-:
Shardul Full Stack Developer | Product Engineer

Built with ❤️, Code, and a lot of FFmpeg debugging
