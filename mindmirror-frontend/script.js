// ==================== CONFIGURATION ====================
// Use environment variable in production, localhost in development
const API_BASE_URL = window.API_BASE_URL !== undefined ? window.API_BASE_URL : 'http://localhost:8000';

// Helper function to build API URL
function apiUrl(path) {
    // If API_BASE_URL is empty, use relative path
    if (!API_BASE_URL || API_BASE_URL === '') {
        return path;
    }
    return `${API_BASE_URL}${path}`;
}

// ==================== THEME TOGGLE ====================
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
});

// ==================== NAVIGATION ====================
document.getElementById('heroChatBtn').addEventListener('click', function() {
    document.getElementById('chat-section').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('heroEmotionBtn').addEventListener('click', function() {
    document.getElementById('emotion-section').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('openChat').addEventListener('click', function() {
    document.getElementById('chat-section').scrollIntoView({ behavior: 'smooth' });
});

// ==================== CHAT WITH BACKEND API ====================
const chatMessages = document.querySelector('.chat-messages');
const chatInput = document.querySelector('.chat-input input');
const sendButton = document.querySelector('.chat-input button');
let typingIndicator = document.querySelector('.typing-indicator');

// Clear demo messages and init
if (chatMessages) {
    chatMessages.innerHTML = '';
    typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatMessages.appendChild(typingIndicator);
    typingIndicator.style.display = 'none';
    
    // Add welcome message
    addMessage("Hello there! I'm MindMirror, your mental wellness companion. How are you feeling today?", false);
}

function addMessage(text, isUser = false) {
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
    messageDiv.textContent = text;
    
    chatMessages.insertBefore(messageDiv, typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.style.display = 'flex';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function hideTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.style.display = 'none';
    }
}

async function sendMessageToBackend(message) {
    showTypingIndicator();
    
    try {
        const response = await fetch(apiUrl('/api/chat'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message, user_id: 'user_1' })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        hideTypingIndicator();
        addMessage(data.response, false);
        
        // Update emotion if detected
        if (data.emotion_detected) {
            updateDetectedEmotion(data.emotion_detected);
        }
    } catch (error) {
        console.error('Chat Error:', error);
        hideTypingIndicator();
        addMessage("I'm having trouble connecting to the server. Please check that the backend is running on http://localhost:8000", false);
    }
}

async function handleSendMessage() {
    const message = chatInput.value.trim();
    if (message !== '' && chatInput) {
        addMessage(message, true);
        chatInput.value = '';
        await sendMessageToBackend(message);
    }
}

if (sendButton) {
    sendButton.addEventListener('click', handleSendMessage);
}

if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
}

function updateDetectedEmotion(emotion) {
    const currentEmotionEl = document.getElementById('currentEmotion');
    if (currentEmotionEl && emotion) {
        currentEmotionEl.textContent = emotion.charAt(0).toUpperCase() + emotion.slice(1);
    }
}

// ==================== EMOTION DETECTION ====================
const videoElement = document.getElementById('videoElement');
const cameraPlaceholder = document.getElementById('cameraPlaceholder');
const videoOverlay = document.querySelector('.video-overlay');
const toggleCameraBtn = document.getElementById('toggleCamera');
const toggleMicrophoneBtn = document.getElementById('toggleMicrophone');
const cameraPermissionStatus = document.getElementById('cameraPermissionStatus');
const microphonePermissionStatus = document.getElementById('microphonePermissionStatus');

let stream = null;
let cameraActive = false;
let microphoneActive = false;
let emotionAnalysisInterval = null;
let sessionStartTime = null;

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: true,
            audio: false
        });
        
        videoElement.srcObject = stream;
        videoElement.style.display = 'block';
        if (cameraPlaceholder) cameraPlaceholder.style.display = 'none';
        if (videoOverlay) videoOverlay.textContent = 'Camera active - Analyzing...';
        cameraActive = true;
        sessionStartTime = Date.now();
        
        if (toggleCameraBtn) {
            toggleCameraBtn.innerHTML = '<i class="fas fa-video-slash"></i> Stop Camera';
            toggleCameraBtn.classList.remove('secondary-control');
            toggleCameraBtn.classList.add('primary-control');
        }
        
        showPermissionStatus(cameraPermissionStatus, 'Camera access granted - Starting emotion analysis', 'permission-granted');
        
        // Start periodic emotion analysis
        startEmotionAnalysis();
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        showPermissionStatus(cameraPermissionStatus, 'Camera access denied: ' + error.message, 'permission-denied');
    }
}

function stopCamera() {
    if (emotionAnalysisInterval) {
        clearInterval(emotionAnalysisInterval);
        emotionAnalysisInterval = null;
    }
    
    if (stream) {
        stream.getTracks().forEach(track => {
            if (track.kind === 'video') {
                track.stop();
            }
        });
        
        if (videoElement) videoElement.style.display = 'none';
        if (cameraPlaceholder) cameraPlaceholder.style.display = 'block';
        if (videoOverlay) videoOverlay.textContent = 'Camera off';
        cameraActive = false;
        sessionStartTime = null;
        
        if (toggleCameraBtn) {
            toggleCameraBtn.innerHTML = '<i class="fas fa-video"></i> Start Camera';
            toggleCameraBtn.classList.remove('primary-control');
            toggleCameraBtn.classList.add('secondary-control');
        }
    }
}

async function startMicrophone() {
    try {
        if (stream) {
            const audioStream = await navigator.mediaDevices.getUserMedia({ 
                audio: true,
                video: false
            });
            
            audioStream.getAudioTracks().forEach(track => {
                stream.addTrack(track);
            });
        } else {
            stream = await navigator.mediaDevices.getUserMedia({ 
                audio: true,
                video: false
            });
        }
        
        microphoneActive = true;
        
        if (toggleMicrophoneBtn) {
            toggleMicrophoneBtn.innerHTML = '<i class="fas fa-microphone-slash"></i> Disable Microphone';
            toggleMicrophoneBtn.classList.remove('secondary-control');
            toggleMicrophoneBtn.classList.add('primary-control');
        }
        
        showPermissionStatus(microphonePermissionStatus, 'Microphone access granted', 'permission-granted');
        
        // Increment voice samples counter on backend
        incrementVoiceSamples();
        
    } catch (error) {
        console.error('Error accessing microphone:', error);
        showPermissionStatus(microphonePermissionStatus, 'Microphone access denied: ' + error.message, 'permission-denied');
    }
}

function stopMicrophone() {
    if (stream) {
        stream.getAudioTracks().forEach(track => {
            track.stop();
        });
        
        microphoneActive = false;
        
        if (toggleMicrophoneBtn) {
            toggleMicrophoneBtn.innerHTML = '<i class="fas fa-microphone"></i> Enable Microphone';
            toggleMicrophoneBtn.classList.remove('primary-control');
            toggleMicrophoneBtn.classList.add('secondary-control');
        }
    }
}

function showPermissionStatus(element, message, className) {
    if (!element) return;
    
    element.textContent = message;
    element.className = 'permission-status ' + className;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

if (toggleCameraBtn) {
    toggleCameraBtn.addEventListener('click', function() {
        if (cameraActive) {
            stopCamera();
        } else {
            startCamera();
        }
    });
}

if (toggleMicrophoneBtn) {
    toggleMicrophoneBtn.addEventListener('click', function() {
        if (microphoneActive) {
            stopMicrophone();
        } else {
            startMicrophone();
        }
    });
}

// ==================== EMOTION ANALYSIS ====================
function startEmotionAnalysis() {
    // Analyze frame every 2 seconds
    emotionAnalysisInterval = setInterval(analyzeCurrentFrame, 2000);
    
    // Update stats display every second
    setInterval(updateSessionStats, 1000);
}

async function analyzeCurrentFrame() {
    if (!videoElement || !cameraActive || videoElement.videoWidth === 0) return;
    
    try {
        // Create canvas to capture frame
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0);
        
        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Send to backend
        const response = await fetch(apiUrl('/api/emotion/analyze_frame'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageData })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.faces_detected > 0 && data.results.length > 0) {
                const emotion = data.results[0].dominant_emotion;
                const confidence = data.results[0].confidence;
                if (videoOverlay) {
                    videoOverlay.textContent = `Detected: ${emotion} (${(confidence * 100).toFixed(0)}%)`;
                }
                updateDetectedEmotion(emotion);
            }
        }
    } catch (error) {
        console.error('Emotion analysis error:', error);
    }
}

async function updateSessionStats() {
    try {
        const response = await fetch(apiUrl('/api/emotion/stats'));
        if (response.ok) {
            const data = await response.json();
            
            // Update duration
            const durationEl = document.getElementById('sessionDuration');
            if (durationEl) {
                const minutes = Math.floor(data.duration_seconds / 60);
                const seconds = data.duration_seconds % 60;
                durationEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            
            // Update frames analyzed
            const framesEl = document.getElementById('framesAnalyzed');
            if (framesEl) {
                framesEl.textContent = data.frames_analyzed;
            }
            
            // Update voice samples
            const voiceEl = document.getElementById('voiceSamples');
            if (voiceEl) {
                voiceEl.textContent = data.voice_samples;
            }
            
            // Update current emotion
            if (data.dominant_emotion) {
                updateDetectedEmotion(data.dominant_emotion);
            }
        }
    } catch (error) {
        // Silently fail - backend might not be running
    }
}

async function incrementVoiceSamples() {
    try {
        await fetch(apiUrl('/api/voice/analyze'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'increment' })
        });
    } catch (error) {
        console.error('Voice sample error:', error);
    }
}

// ==================== MODAL FUNCTIONS ====================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// ==================== SMOOTH SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== HEALTH CHECK ON LOAD ====================
window.addEventListener('load', async () => {
    try {
        const response = await fetch(apiUrl('/api/health'), { 
            method: 'GET',
            mode: 'cors'
        });
        if (response.ok) {
            const data = await response.json();
            console.log('✅ MindMirror Backend Connected:', data);
        }
    } catch (error) {
        console.warn('⚠️ Backend not available. Run: cd mirrormind-backend && pip install -r dependencies.txt && python backend.py');
    }
});
