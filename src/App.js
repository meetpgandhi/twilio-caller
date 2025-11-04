import React, { useState, useCallback } from 'react';
import { Device } from '@twilio/voice-sdk';
import './App.css'; // This will import our new styles

// Simple inline SVG for the header icon
const HeaderIcon = () => (
    <svg
        className="header-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);


function App() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [device, setDevice] = useState(null);
    const [call, setCall] = useState(null);
    const [status, setStatus] = useState('Offline');
    const [onCallNumber, setOnCallNumber] = useState('');
    const [isMuted, setIsMuted] = useState(false); // --- NEW: Mute state ---

    // --- This logic is unchanged ---
    const setupDevice = useCallback(async () => {
        console.log('--- 1. setupDevice function called (user clicked) ---');
        setStatus('Loading...');

        try {
            const response = await fetch('/voice/token');
            const data = await response.json();
            console.log('--- 3. Got JSON data ---');

            const audioContext = new AudioContext();
            await audioContext.resume();
            console.log('--- 3.5. AudioContext created and resumed ---');

            const twilioDevice = new Device(data.token, {
                logLevel: 1,
                audioContext: audioContext
            });

            console.log('--- 4. Twilio Device object created ---');

            twilioDevice.on('ready', () => {
                console.log('--- 5. [EVENT] Device is READY ---');
                setStatus('Ready');
                setDevice(twilioDevice);
            });

            twilioDevice.on('error', (error) => {
                console.error('--- 6. [EVENT] Device ERROR ---', error.message);
                setStatus('Error: ' + error.message);
                setDevice(null);
            });

            twilioDevice.on('incoming', (connection) => {
                console.log(`Incoming call from ${connection.parameters.From}`);
                setStatus(`Incoming call from ${connection.parameters.From}`);
            });

            console.log('--- 7. Registering device... ---');
            await twilioDevice.register();
            console.log('--- 8. Device registration complete ---');

            if (twilioDevice.state === 'registered') {
                console.log('--- 8.5. Manually setting state to Ready ---');
                setStatus('Ready');
                setDevice(twilioDevice);
            }

        } catch (error) {
            console.error('--- 9. [CATCH BLOCK] Error setting up device ---', error);
            setStatus('Error: ' + error.message);
        }
    }, []);

    const handleCall = async () => {
        if (!device) return;

        console.log('Calling:', phoneNumber);
        setStatus('Dialing');
        setOnCallNumber(phoneNumber);

        try {
            const newCall = await device.connect({ params: { To: phoneNumber } });
            console.log('--- 10. Call object created ---', newCall);
            setCall(newCall);

            newCall.on('ringing', (hasEarlyMedia) => {
                console.log('--- 11. [EVENT] Call is RINGING ---');
                setStatus('Ringing');
            });

            newCall.on('accept', () => {
                console.log('--- 12. [EVENT] Call was ACCEPTED ---');
                setStatus('On Call');
            });

            newCall.on('disconnect', () => {
                console.log('--- 13. [EVENT] Call DISCONNECTED ---');
                setStatus('Ready');
                setCall(null);
                setOnCallNumber('');
                setIsMuted(false); // --- NEW: Reset mute on disconnect ---
            });

            // --- NEW: Listen for mute changes ---
            newCall.on('mute', (isMuted) => {
                console.log(`--- 14. [EVENT] Mute status changed: ${isMuted} ---`);
                setIsMuted(isMuted);
            });

        } catch (error) {
            console.error('Error making call:', error);
            setStatus('Ready'); // Reset on error
            setOnCallNumber('');
        }
    };

    const handleHangup = () => {
        if (call) {
            console.log('--- Hanging up call ---');
            call.disconnect();
        }
    };

    // --- NEW: Mute toggle function ---
    const handleMuteToggle = () => {
        if (call) {
            const newMuteState = !isMuted;
            console.log(`--- Toggling mute to: ${newMuteState} ---`);
            call.mute(newMuteState);
            setIsMuted(newMuteState); // Instantly update UI
        }
    };


    // --- Renders the UI (Updated) ---
    const renderContent = () => {
        if (status === 'Offline') {
            return (
                <button onClick={setupDevice} className="btn-primary">
                    Connect Phone
                </button>
            );
        }

        if (status === 'Loading...') {
            return <div className="loading-text">Connecting...</div>;
        }

        if (status === 'On Call' || status === 'Ringing' || status === 'Dialing') {
            return (
                <>
                    <div className="on-call-status">
                        {status}...
                    </div>
                    <div className="on-call-number">
                        {onCallNumber}
                    </div>
                    {/* --- NEW: Button container --- */}
                    <div className="call-controls">
                        <button
                            onClick={handleMuteToggle}
                            className={`btn-mute ${isMuted ? 'muted' : ''}`}
                        >
                            {isMuted ? 'Unmute' : 'Mute'}
                        </button>
                        <button onClick={handleHangup} className="btn-hangup">
                            Hang Up
                        </button>
                    </div>
                </>
            );
        }

        if (status === 'Ready') {
            return (
                <>
                    <label htmlFor="phone-number">Enter Phone Number:</label>
                    <input
                        id="phone-number"
                        type="text"
                        placeholder="+1 234 567 890"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <button onClick={handleCall} disabled={!device} className="btn-primary">
                        Call
                    </button>
                </>
            );
        }

        // Default case for 'Error: ...'
        return (
            <>
                <p className="error-text">{status}</p>
                <button onClick={setupDevice} className="btn-retry">Retry Connect</button>
            </>
        );
    };

    return (
        <div className="App">

            <header className="app-header">
                <HeaderIcon />
                <h1>Everspan's Dialer</h1>
            </header>

            <div className="dialer-card">
                <div className="status">Status: {status}</div>
                <div className="dialer-content">
                    {renderContent()}
                </div>
            </div>

        </div>
    );
}

export default App;

