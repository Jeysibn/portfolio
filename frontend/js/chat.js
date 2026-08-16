// Replace with your actual deployed Azure Function endpoint
const CHAT_API_ENDPOINT = "https://func-jeysibn-portfolio.azurewebsites.net/api/AiChatAssistant";

// Keep the UI provider-neutral so model changes do not require frontend edits.
const CHAT_PLATFORM_LABEL = "AI Assistant • Azure Functions";

// Session storage memory key
const CHAT_STORAGE_KEY = "jeysibn_chat_history";

// Manage conversation history in memory
let chatHistory = JSON.parse(sessionStorage.getItem(CHAT_STORAGE_KEY)) || [];

// Replace any stale model-specific label embedded in the page markup.
const chatPlatformLabel = document.querySelector("#chat-window h3 + p");
if (chatPlatformLabel) {
    chatPlatformLabel.textContent = CHAT_PLATFORM_LABEL;
}

// Toggle chat window open/close
function toggleChatWindow() {
    const chatWindow = document.getElementById("chat-window");
    const openIcon = document.getElementById("chat-icon-open");
    const closeIcon = document.getElementById("chat-icon-close");

    const isHidden = chatWindow.classList.contains("hidden");

    if (isHidden) {
        chatWindow.classList.remove("hidden");
        openIcon.classList.add("hidden");
        closeIcon.classList.remove("hidden");
        renderStoredHistory();
        scrollToBottom();
    } else {
        chatWindow.classList.add("hidden");
        openIcon.classList.remove("hidden");
        closeIcon.classList.add("hidden");
    }
}

// Render existing messages from sessionStorage
function renderStoredHistory() {
    const messagesContainer = document.getElementById("chat-messages");
    
    // Clear dynamic messages (preserve welcome message)
    messagesContainer.innerHTML = `
        <div class="bg-slate-100 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 p-3 rounded-xl max-w-[85%] border border-slate-200/50 dark:border-slate-600/50">
            👋 Hi! I'm Jerome's virtual assistant. Ask me anything about his experience, technical stack, or projects!
        </div>
    `;

    chatHistory.forEach(msg => {
        appendMessageUI(msg.role, msg.content);
    });
}

// Append a message bubble to the chat container
function appendMessageUI(role, text) {
    const messagesContainer = document.getElementById("chat-messages");
    const isUser = role === "user";

    const messageDiv = document.createElement("div");
    messageDiv.className = `p-3 rounded-xl max-w-[85%] leading-relaxed ${
        isUser 
            ? "bg-cyan-600 text-white self-end ml-auto" 
            : "bg-slate-100 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-600/50"
    }`;
    messageDiv.innerText = text;

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

// Show temporary "typing..." indicator
function showTypingIndicator() {
    const messagesContainer = document.getElementById("chat-messages");
    const indicator = document.createElement("div");
    indicator.id = "typing-indicator";
    indicator.className = "bg-slate-100 dark:bg-slate-700/60 text-slate-400 p-3 rounded-xl max-w-[85%] text-xs italic border border-slate-200/50 dark:border-slate-600/50";
    indicator.innerText = "Assistant is thinking...";
    messagesContainer.appendChild(indicator);
    scrollToBottom();
}

// Remove "typing..." indicator
function removeTypingIndicator() {
    const indicator = document.getElementById("typing-indicator");
    if (indicator) indicator.remove();
}

// Handle Form Submission
async function handleChatSubmit(event) {
    event.preventDefault();

    const inputField = document.getElementById("chat-input");
    const sendBtn = document.getElementById("chat-send-btn");
    const userMessage = inputField.value.trim();

    if (!userMessage) return;

    // UI Updates
    appendMessageUI("user", userMessage);
    inputField.value = "";
    inputField.disabled = true;
    sendBtn.disabled = true;

    showTypingIndicator();

    try {
        const response = await fetch(CHAT_API_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: userMessage,
                history: chatHistory
            })
        });

        const data = await response.json();
        removeTypingIndicator();

        if (response.ok && data.reply) {
            appendMessageUI("assistant", data.reply);

            // Update session history
            chatHistory.push({ role: "user", content: userMessage });
            chatHistory.push({ role: "assistant", content: data.reply });
            sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatHistory));
        } else {
            // Unmask the exact backend error to the UI
            const errorMessage = data.error ? `⚠️ ${data.error}` : "⚠️ Sorry, I ran into an issue retrieving an answer. Please try again later.";
            appendMessageUI("assistant", errorMessage);
        }
    } catch (error) {
        removeTypingIndicator();
        appendMessageUI("assistant", "⚠️ Connection error. Please check your network and try again.");
        console.error("Chat Error:", error);
    } finally {
        inputField.disabled = false;
        sendBtn.disabled = false;
        inputField.focus();
    }
}

// Helper: Auto scroll chat to bottom
function scrollToBottom() {
    const messagesContainer = document.getElementById("chat-messages");
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}