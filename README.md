# Everspan's Dialer

This is a simple web-based phone (softphone) built with React, Node.js, and the Twilio Voice SDK. It allows for making and receiving calls directly in the browser.

## Features

* Make outbound calls
* Hang up active calls
* Mute/unmute active calls
* Modern, responsive UI

## Setup Instructions

### 1. Prerequisites

* Node.js (v16 or later)
* A Twilio account with a purchased phone number and a TwiML App.
* `ngrok` to expose your local server.

### 2. Installation

1.  Clone the repository:
    ```bash
    git clone [your-repo-url]
    cd twilio-caller
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### 3. Configuration

1.  Create a `.env` file in the root of the project by copying the example:
    ```bash
    cp .env.example .env
    ```
2.  Open the `.env` file and fill in your Twilio credentials.

### 4. Running the App

You will need to run **three** separate terminals.

**Terminal 1: Start the Backend Server**
```bash
node server.js

That's a critical question to ask before sharing your code.

Your code is almost clean enough, but you must take one crucial security step first.

🚨 Security Warning: Your .env File
Do NOT push your .env file to GitHub.

This file contains your TWILIO_API_KEY and TWILIO_API_SECRET. If you make these public, anyone can use your Twilio account, spend your money, and make calls on your behalf.

How to Fix This: You need to tell Git to ignore this file. You do this with a file named .gitignore.

In the root of your twilio-caller folder (the same place as server.js), create a file named .gitignore (if it doesn't already exist).

Open it and add these two lines:

# Dependencies
node_modules

# Secrets
.env
This tells Git to never track your node_modules folder or your .env file.

Code Structure & Readability
Your code itself is very clean.

src/App.js: This is a modern, clean React component. It uses hooks (useState, useCallback) correctly, and the logic is easy to follow.

server.js: This is also a clean, well-structured Express server. It's great that it's all in one file for this project size.

The only "unusual" thing (which is perfectly fine) is that you have a React app and a Node.js server in the same folder. For a project this size, it's totally acceptable.

✅ Your To-Do List Before Pushing
Here is a 3-step checklist to make your repository 100% clean and professional.

1. Create/Check Your .gitignore
This is the security step. Make sure this file exists in your project's root and contains at least .env.

2. Create a .env.example File
This is a public file that shows other people (or your future self) what environment variables are needed.

Create a new file named .env.example.

Copy your .env file, but remove all the values after the equals sign.

It should look like this:

Code snippet

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your_api_secret
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxxx
FROM_NUMBER=+1234567890
3. Create a README.md File
This is the "front page" of your GitHub project. It explains what the project is and how to run it.

Create a new file named README.md.

Here is a great template you can use. Just copy and paste this into it:

Markdown

# Everspan's Dialer

This is a simple web-based phone (softphone) built with React, Node.js, and the Twilio Voice SDK. It allows for making and receiving calls directly in the browser.

## Features

* Make outbound calls
* Hang up active calls
* Mute/unmute active calls
* Modern, responsive UI

## Setup Instructions

### 1. Prerequisites

* Node.js (v16 or later)
* A Twilio account with a purchased phone number and a TwiML App.
* `ngrok` to expose your local server.

### 2. Installation

1.  Clone the repository:
    ```bash
    git clone [your-repo-url]
    cd twilio-caller
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### 3. Configuration

1.  Create a `.env` file in the root of the project by copying the example:
    ```bash
    cp .env.example .env
    ```
2.  Open the `.env` file and fill in your Twilio credentials.

### 4. Running the App

You will need to run **three** separate terminals.

**Terminal 1: Start the Backend Server**
```bash
node server.js
This will run the server on http://localhost:3001.

Terminal 2: Start the Frontend App

Bash

npm start
This will open the app in your browser at http://localhost:3000.

Terminal 3: Run ngrok

Bash

ngrok http 3001
ngrok will give you a public URL (like https://xyz.ngrok-free.app). You must copy this URL and paste it into your TwiML App's Voice Request URL field in the Twilio Console (and add /voice at the end).