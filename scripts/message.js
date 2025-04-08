// Firebase already initialized in HTML
const db = firebase.firestore();

const friendList = document.getElementById('friend-list');
const chatHeader = document.querySelector('.chat-header');
const chatMessages = document.querySelector('.chat-messages');
const chatInputForm = document.querySelector('.chat-input-form');
const chatInput = document.querySelector('.chat-input');
const clearChatBtn = document.querySelector('.clear-chat-button');
const searchInput = document.getElementById('search-input');
const friendRequestBtn = document.getElementById('friend-request-btn');
const viewProfileBtn = document.getElementById('view-profile-btn');

let currentUser = { id: null, name: "Anonymous" };
let currentChatId = '';
let currentFriendId = '';
let selectedFriendUID = null;

firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) return;

  currentUser.id = user.uid;
  const userDoc = await db.collection("users").doc(user.uid).get();
  currentUser.name = userDoc.data()?.name || "Anonymous";

  loadFriends();
  updateFriendRequestBadge();
});

// ========== SEARCH USERS ==========
searchInput.addEventListener("input", async (e) => {
  const query = e.target.value.trim();
  friendList.innerHTML = "";

  if (query.length < 2) return;

  const results = await db.collection("users")
    .where("name", ">=", query)
    .where("name", "<=", query + "\uf8ff")
    .limit(10)
    .get();

  results.forEach(doc => {
    if (doc.id === currentUser.id) return; // skip self
    const user = doc.data();

    const li = document.createElement("li");
    li.className = "friend-item";
    li.innerHTML = `
      <strong>${user.name}</strong><br>
      <small>${user.email}</small><br>
      <button class="send-request-btn">Send Friend Request</button>
    `;

    li.querySelector(".send-request-btn").onclick = async () => {
      await db.collection("users").doc(doc.id).update({
        "requests.incoming": firebase.firestore.FieldValue.arrayUnion(currentUser.id)
      });

      li.querySelector(".send-request-btn").disabled = true;
      li.querySelector(".send-request-btn").innerText = "Sent ✅";
    };

    friendList.appendChild(li);
  });
});

// ========== LOAD FRIENDS ==========
async function loadFriends() {
  friendList.innerHTML = '';
  const doc = await db.collection("users").doc(currentUser.id).get();
  const friends = doc.data()?.friends || [];

  for (const friendId of friends) {
    const friendDoc = await db.collection("users").doc(friendId).get();
    const friendData = friendDoc.data();
    const friendName = friendData.name;

    const li = document.createElement('li');
    li.classList.add('friend-item');
    li.dataset.uid = friendId;
    li.innerHTML = `<strong>${friendName}</strong><br><small>loading...</small>`;
    friendList.appendChild(li);

    const chatId = getChatId(currentUser.id, friendId);
    db.collection("messages").doc(chatId).collection("chat")
      .orderBy("timestamp", "desc")
      .limit(1)
      .onSnapshot(snapshot => {
        snapshot.forEach(doc => {
          const msg = doc.data();
          li.innerHTML = `<strong>${friendName}</strong><br><small>${msg.sender === currentUser.id ? "You" : friendName}: ${msg.text}</small>`;
        });
      });

    li.onclick = () => {
      currentFriendId = friendId;
      currentChatId = getChatId(currentUser.id, friendId);
      chatHeader.textContent = `Chatting with ${friendName}`;
      chatMessages.innerHTML = '';
      chatInputForm.style.display = 'flex';
      clearChatBtn.style.display = 'block';
      chatInput.placeholder = `Type a message to ${friendName}`;
      loadChat(currentChatId);

      document.querySelectorAll('.friend-item').forEach(i => i.classList.remove('selected'));
      li.classList.add('selected');
      selectedFriendUID = friendId;
      viewProfileBtn.style.display = 'inline-block';
    };
  }
}

function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

// ========== LOAD CHAT ==========
function loadChat(chatId) {
  db.collection("messages").doc(chatId).collection("chat")
    .orderBy("timestamp")
    .onSnapshot(snapshot => {
      chatMessages.innerHTML = '';
      snapshot.forEach(doc => {
        const msg = doc.data();
        const time = msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';
        const msgEl = document.createElement('div');
        msgEl.className = "message";
        msgEl.innerHTML = `
          <div class="message-sender">${msg.sender === currentUser.id ? "You" : "Friend"}</div>
          <div class="message-text">${msg.text}</div>
          <div class="message-timestamp">${time}</div>
        `;
        chatMessages.appendChild(msgEl);
      });
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

// ========== SEND CHAT ==========
chatInputForm.onsubmit = async (e) => {
  e.preventDefault();
  if (!currentChatId || !currentFriendId) return;

  const message = {
    sender: currentUser.id,
    text: chatInput.value,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  await db.collection("messages").doc(currentChatId).set({
    participants: [currentUser.id, currentFriendId]
  }, { merge: true });

  await db.collection("messages").doc(currentChatId).collection("chat").add(message);
  chatInputForm.reset();
};

// ========== CLEAR CHAT ==========
clearChatBtn.onclick = () => {
  if (!currentChatId) return;
  db.collection("messages").doc(currentChatId).collection("chat").get().then(snapshot => {
    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    return batch.commit();
  });
  chatMessages.innerHTML = '';
};

// ========== INCOMING REQUESTS ==========
friendRequestBtn.onclick = async () => {
  const doc = await db.collection("users").doc(currentUser.id).get();
  const incoming = doc.data()?.requests?.incoming || [];

  chatHeader.textContent = "Incoming Friend Requests";
  chatMessages.innerHTML = incoming.length ? "" : "<p>No new friend requests.</p>";

  for (const uid of incoming) {
    const userDoc = await db.collection("users").doc(uid).get();
    const data = userDoc.data();

    const div = document.createElement("div");
    div.className = "message";
    div.innerHTML = `
      <strong>${data.name}</strong><br><small>${data.email}</small><br>
      <button class="accept-btn">Accept</button>
      <button class="decline-btn">Decline</button>
    `;

    div.querySelector(".accept-btn").onclick = async () => {
      await db.collection("users").doc(currentUser.id).update({
        friends: firebase.firestore.FieldValue.arrayUnion(uid),
        "requests.incoming": firebase.firestore.FieldValue.arrayRemove(uid)
      });
      await db.collection("users").doc(uid).update({
        friends: firebase.firestore.FieldValue.arrayUnion(currentUser.id)
      });
      div.remove();
      updateFriendRequestBadge();
      loadFriends(); // 🔄 Auto-refresh friend list
    };

    div.querySelector(".decline-btn").onclick = async () => {
      await db.collection("users").doc(currentUser.id).update({
        "requests.incoming": firebase.firestore.FieldValue.arrayRemove(uid)
      });
      div.remove();
      updateFriendRequestBadge();
    };

    chatMessages.appendChild(div);
  }
};

// ========== BADGE UPDATE ==========
async function updateFriendRequestBadge() {
  const doc = await db.collection("users").doc(currentUser.id).get();
  const incoming = doc.data()?.requests?.incoming || [];
  const count = incoming.length;
  friendRequestBtn.textContent = count > 9 ? "New Friends (9+)" : `New Friends${count ? ` (${count})` : ''}`;
}

// ========== VIEW PROFILE ==========
viewProfileBtn.addEventListener('click', () => {
  if (selectedFriendUID) {
    window.location.href = `profile.html?uid=${selectedFriendUID}`;
  }
});
