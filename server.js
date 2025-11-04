require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();
const twilio = require('twilio');
const { VoiceResponse } = twilio.twiml;
const AccessToken = twilio.jwt.AccessToken;
const { VoiceGrant } = AccessToken;
const path = require('path'); // <-- ADDED: For production build

// --- From config.js ---
const config = {
    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        apiKey: process.env.TWILIO_API_KEY,
        apiSecret: process.env.TWILIO_API_SECRET,
        outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
        incomingAllow: process.env.TWILIO_ALLOW_INCOMING_CALLS === "true",
        callerId: process.env.FROM_NUMBER
    }
};

// --- From token.js (FIXED) ---
// Helper function to create an Access Token
const generateToken = (identity, config) => {
    return new AccessToken(
        config.twilio.accountSid,
        config.twilio.apiKey,
        config.twilio.apiSecret,
        { identity: identity } // <-- CHANGED: Pass identity as options
    );
};

// Function to create a Voice Token
const voiceToken = (identity, config) => {
    let voiceGrant;
    if (typeof config.twilio.outgoingApplicationSid !== "undefined") {
        voiceGrant = new VoiceGrant({
            outgoingApplicationSid: config.twilio.outgoingApplicationSid,
            incomingAllow: config.twilio.incomingAllow
        });
    } else {
        voiceGrant = new VoiceGrant({
            incomingAllow: config.twilio.incomingAllow
        });
    }

    const token = generateToken(identity, config); // <-- CHANGED
    token.addGrant(voiceGrant);
    // token.identity = identity; <-- This line is no longer needed
    return token;
};

// --- From index.js ---
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(pino);

// --- MOVED: Helper function to send a token ---
const sendTokenResponse = (token, res) => {
    res.set("Content-Type", "application/json");
    res.send(
        JSON.stringify({
            token: token.toJwt()
        })
    );
};

// --- API Routes ---
// (These are the same as before)

// This is the route our React app will call
app.get("/voice/token", (req, res) => {
    const identity = 'my-browser-phone';
    const token = voiceToken(identity, config);
    sendTokenResponse(token, res);
});

// This is the route your TwiML App will call
app.post("/voice", (req, res) => {
    const To = req.body.To;
    const response = new VoiceResponse();
    const dial = response.dial({ callerId: config.twilio.callerId });
    dial.number(To);
    res.set("Content-Type", "text/xml");
    res.send(response.toString());
});

// This route is for INCOMING calls
app.post("/voice/incoming", (req, res) => {
    const response = new VoiceResponse();
    const dial = response.dial({ callerId: req.body.From, answerOnBridge: true });
    dial.client("my-browser-phone");
    res.set("Content-Type", "text/xml");
    res.send(response.toString());
});

// --- NEW: Production Build Logic ---
// This code only runs when you deploy to AWS
if (process.env.NODE_ENV === 'production') {
    // Serve the static files from the React app
    app.use(express.static(path.join(__dirname, 'build')));

    // All other GET requests not handled by our API will return the React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });
}

// Start the server
const PORT = process.env.PORT || 3001; // Use port 3001 by default
app.listen(PORT, () =>
    console.log(`Express server is running on port ${PORT}`)
);

