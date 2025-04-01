const friendList = document.getElementById('friend-list');
const chatHeader = document.querySelector('.chat-header');
const chatMessages = document.querySelector('.chat-messages');
const chatInputForm = document.querySelector('.chat-input-form');
const chatInput = document.querySelector('.chat-input');
const clearChatBtn = document.querySelector('.clear-chat-button');

const userName = "Peter";
let currentFriendName = '';
let currentChatPath = ''; // e.g., "Peter and Drone_AI"

const db = firebase.firestore();

// Friend list(hard cod)
const friends = {
  "uid_alice": "Alice",
  "uid_bob": "Bob",
  "uid_drone": "Drone_AI"
};

function getChatPath(a, b) {
  return [a, b].sort().join(' and ');
}

function loadFriends() {
  friendList.innerHTML = '';
  Object.entries(friends).forEach(([friendId, friendName]) => {
    const li = document.createElement('li');
    li.classList.add('friend-item');
    li.setAttribute('data-id', friendId);
    li.setAttribute('data-name', friendName);
    li.innerHTML = `<strong>${friendName}</strong><br><small>loading...</small>`;
    friendList.appendChild(li);

    const chatPath = getChatPath(userName, friendName);

    db.collection("messages")
      .doc(chatPath)
      .collection("chat")
      .orderBy("timestamp", "desc")
      .limit(1)
      .onSnapshot(snapshot => {
        snapshot.forEach(doc => {
          const msg = doc.data();
          li.innerHTML = `<strong>${friendName}</strong><br><small>${msg.sender}: ${msg.text}</small>`;
        });
      });

    li.onclick = () => {
      currentFriendName = friendName;
      currentChatPath = getChatPath(userName, friendName);

      chatHeader.textContent = `Chating with ${friendName} `;
      chatMessages.innerHTML = '';
      chatInputForm.style.display = 'flex';
      clearChatBtn.style.display = 'block';
      chatInput.placeholder = `Wating for ur input ${userName}?`;

      loadChat(currentChatPath);
    };
  });
}

chatInputForm.onsubmit = (e) => {
  e.preventDefault();
  if (!currentChatPath) return;

  const timestamp = firebase.firestore.FieldValue.serverTimestamp();
  const message = {
    sender: userName,
    text: chatInput.value,
    timestamp
  };

  db.collection("messages")
    .doc(currentChatPath)
    .collection("chat")
    .add(message);

  chatInputForm.reset();
};

function loadChat(path) {
  const chatRef = db.collection("messages").doc(path).collection("chat").orderBy("timestamp");

  chatRef.onSnapshot(snapshot => {
    chatMessages.innerHTML = '';
    snapshot.forEach(doc => {
      const msg = doc.data();
      const time = msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';
      const msgElement = document.createElement('div');
      msgElement.classList.add('message');
      msgElement.innerHTML = `
        <div class="message-sender">${msg.sender}</div>
        <div class="message-text">${msg.text}</div>
        <div class="message-timestamp">${time}</div>
      `;
      chatMessages.appendChild(msgElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  });
}

clearChatBtn.onclick = () => {
  if (!currentChatPath) return;

  const chatRef = db.collection("messages").doc(currentChatPath).collection("chat");
  chatRef.get().then(snapshot => {
    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    return batch.commit();
  });

  chatMessages.innerHTML = '';
};

window.onload = loadFriends;
