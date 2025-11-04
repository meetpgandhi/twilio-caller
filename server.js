require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();
const twilio = require('twilio');
const { VoiceResponse } = twilio.twiml;
const AccessToken = twilio.jwt.AccessToken;
const { VoiceGrant } = AccessToken;
const path = require('path');

// --- Config ---
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

// --- Token Functions ---
const generateToken = (identity, config) => {
    return new AccessToken(
        config.twilio.accountSid,
        config.twilio.apiKey,
        config.twilio.apiSecret,
        { identity: identity }
    );
};

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
    const token = generateToken(identity, config);
    token.addGrant(voiceGrant);
    return token;
};

// --- Express App Setup ---
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(pino);

// --- Serve React App (Production) ---
// This serves the static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// --- API Routes ---
const sendTokenResponse = (token, res) => {
    res.set("Content-Type", "application/json");
    res.send(JSON.stringify({ token: token.toJwt() }));
};

app.get("/voice/token", (req, res) => {
    const identity = 'my-browser-phone';
    const token = voiceToken(identity, config);
    sendTokenResponse(token, res);
});

app.post("/voice", (req, res) => {
    const To = req.body.To;
    const response = new VoiceResponse();
    const dial = response.dial({ callerId: config.twilio.callerId });
    dial.number(To);
    res.set("Content-Type", "text/xml");
    res.send(response.toString());
});

app.post("/voice/incoming", (req, res) => {
    const response = new VoiceResponse();
    const dial = response.dial({ callerId: req.body.From, answerOnBridge: true });
    dial.client("my-browser-phone");
    res.set("Content-Type", "text/xml");
    res.send(response.toString());
});

// --- Catch-all route ---
// This sends all other requests to the React app's index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// --- Start Server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
    console.log(`Express server is running on port ${PORT}`)
);

