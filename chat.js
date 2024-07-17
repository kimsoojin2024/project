let emptyMessageCount = 0;
let blockSend = false;
let messageProcessing = false;

const backendIp = '10.0.136.43'; // 백엔드 서버의 IP 주소로 변경
const backendPort = '8080'; // 백엔드 서버 포트

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("chat-form");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        sendMessage();
    });
});

// 메시지를 서버로 전송
async function sendMessageToServer(messageText) {
    try {
        console.log("Sending message to server:", messageText);

        // 숫자이면 /increment 엔드포인트로 전송
        if (!isNaN(messageText) && messageText.trim() !== "") {
            const payload = { number: parseInt(messageText) };
            console.log("Payload being sent:", payload);

            const response = await axios.post(`http://${backendIp}:${backendPort}/increment`, payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Response received from server:", response.data);
            appendMessage("Bot", `Result: ${response.data.result}`, true);
        } else {
            console.warn('Invalid input: Not a number');
        }

    } catch (error) {
        console.error('Error sending message:', error);
    }

    document.getElementById("messageInput").value = ""; // 메시지 전송 후 입력 창 비우기
}

// sendMessage 함수 정의
function sendMessage() {
    const messageText = document.getElementById("messageInput").value;
    sendMessageToServer(messageText);
}

function appendMessage(sender, text, isHTML = false) {
    const messageWrapper = document.createElement("div");
    messageWrapper.className = "message-wrapper";

    const messageElement = document.createElement("div");
    messageElement.className = "message";
    messageElement.classList.add(sender === "You" ? "sent" : "received");

    // 단일 텍스트 블록으로 메시지 추가
    const paragraphElement = document.createElement("p");
    if (isHTML) {
        paragraphElement.innerHTML = text;  // HTML을 처리합니다.
    } else {
        paragraphElement.textContent = text;
    }
    messageElement.appendChild(paragraphElement);
    messageWrapper.appendChild(messageElement);

    // 피드백 버튼 추가
    if (sender === "Bot") {
        addFeedbackButtons(messageWrapper);
    }

    const messages = document.getElementById("chatbox");
    messages.appendChild(messageWrapper);
    messages.scrollTop = messages.scrollHeight;  // 새 메시지가 추가될 때 스크롤을 맨 아래로
}

function displayWarningMessage() {
    const chatbox = document.getElementById('chatbox');
    const warningMessage = document.createElement('div');
    warningMessage.id = 'warningMessage';
    warningMessage.classList.add('warning');

    const warningText = document.createElement('span');
    warningText.textContent = '5초 후에 다시 질문해주세요.';
    warningMessage.appendChild(warningText);

    chatbox.appendChild(warningMessage);
    warningMessage.scrollIntoView({ behavior: 'smooth' });
}

function removeWarningMessage() {
    const warningMessage = document.getElementById('warningMessage');
    if (warningMessage) {
        warningMessage.remove();
    }
}

// 초기 메시지를 추가하는 함수
function addInitialMessage() {
    const chatbox = document.getElementById('chatbox');
    const initialMessage = document.createElement('div');
    initialMessage.classList.add('message', 'received');
    initialMessage.innerHTML = '안녕하세요! 천재교육 운영에 대해<br>질문해주세요.';
    chatbox.appendChild(initialMessage);
}

// 전송 버튼의 상태를 업데이트하는 함수
function updateSendButtonState() {
    const sendButton = document.querySelector('button[type="submit"]');
    if (blockSend || messageProcessing) {
        sendButton.disabled = true;
    } else {
        sendButton.disabled = false;
    }
}

// 페이지 로드 시 초기 메시지를 추가
window.onload = function() {
    addInitialMessage();

    // Enter 키 이벤트 리스너 추가
    const input = document.getElementById('messageInput');
    input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();  // 기본 Enter 키 동작(줄바꿈) 방지
            sendMessage();
        } else if (event.key === 'Enter' && event.shiftKey) {
            input.value += '\n';  // Shift + Enter 키로 줄바꿈 추가
        }
    });

    updateSendButtonState();
};

// 피드백 버튼 추가 함수
function addFeedbackButtons(messageWrapper) {
    const feedbackContainer = document.createElement('div');
    feedbackContainer.classList.add('feedback');

    const likeButton = document.createElement('i');
    likeButton.classList.add('fas', 'fa-thumbs-up');  // Font Awesome 좋아요 아이콘 클래스
    likeButton.addEventListener('click', () => handleFeedback('like', messageWrapper));

    const dislikeButton = document.createElement('i');
    dislikeButton.classList.add('fa-regular', 'fa-thumbs-down');  // Font Awesome 싫어요 아이콘 클래스
    dislikeButton.addEventListener('click', () => handleFeedback('dislike', messageWrapper));

    feedbackContainer.appendChild(likeButton);
    feedbackContainer.appendChild(dislikeButton);
    messageWrapper.appendChild(feedbackContainer);
}

// 피드백 처리 함수
async function handleFeedback(feedback, messageWrapper) {
    const feedbackValue = feedback === 'like' ? 0 : 1;

    try {
        const response = await axios.post(`http://${backendIp}:${backendPort}/feedback`, {
            feedback: feedbackValue
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log(`Feedback received: ${feedback}, Response:`, response.data);
    } catch (error) {
        console.error('There was a problem with the axios operation:', error);
    }
}
