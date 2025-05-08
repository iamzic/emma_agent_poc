// Configuration
const config = {
    accessCode: 'welcome', // Replace with your desired access code
    agentId: 'ag:98b10d19:20250508:enrollment-agent:9ec27e4c', // Replace with your Mistral Agent ID
};

// DOM Elements
const accessCodeSection = document.getElementById('access-code-section');
const apiKeySection = document.getElementById('api-key-section');
const chatSection = document.getElementById('chat-section');
const accessCodeInput = document.getElementById('access-code');
const apiKeyInput = document.getElementById('api-key');
const submitAccessCodeBtn = document.getElementById('submit-access-code');
const submitApiKeyBtn = document.getElementById('submit-api-key');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Store API key
let userApiKey = '';

// Event Listeners
submitAccessCodeBtn.addEventListener('click', handleAccessCode);
submitApiKeyBtn.addEventListener('click', handleApiKey);
sendButton.addEventListener('click', handleSendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});

// Functions
function handleAccessCode() {
    const enteredCode = accessCodeInput.value.trim();
    if (enteredCode === config.accessCode) {
        accessCodeSection.classList.add('hidden');
        apiKeySection.classList.remove('hidden');
    } else {
        alert('Invalid access code. Please try again.');
    }
}

function handleApiKey() {
    const enteredApiKey = apiKeyInput.value.trim();
    if (enteredApiKey) {
        userApiKey = enteredApiKey;
        apiKeySection.classList.add('hidden');
        chatSection.classList.remove('hidden');
        addMessage('Hi! How can I help you today?', 'agent');
    } else {
        alert('Please enter a valid API key.');
    }
}

async function handleSendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage(message, 'user');
    userInput.value = '';

    try {
        // Show loading state
        const loadingMessage = addMessage('Thinking...', 'agent');
        
        // Make API call to Mistral Agent
        const response = await fetch('https://api.mistral.ai/v1/agents/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + userApiKey
            },
            body: JSON.stringify({
                messages: [{
                    role: 'user',
                    content: message
                }],
                max_tokens: 2000,
                stream: false,
                response_format: {
                    type: "text"
                },
                n: 1,
                parallel_tool_calls: true,
                agent_id: config.agentId
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        
        // Remove loading message
        loadingMessage.remove();
        
        // Add agent's response
        addMessage(data.choices[0].message.content, 'agent');
    } catch (error) {
        console.error('Error:', error);
        addMessage('Sorry, there was an error processing your request. Please try again.', 'agent');
    }
}

function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
} 