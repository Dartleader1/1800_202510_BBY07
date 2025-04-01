const friendList = document.getElementById('friend-list');
const chatHeader = document.querySelector('.chat-header');
const chatMessages = document.querySelector('.chat-messages');
const chatInputForm = document.querySelector('.chat-input-form');
const chatInput = document.querySelector('.chat-input');
const clearChatBtn = document.querySelector('.clear-chat-button');
const searchInput = document.getElementById('search-input');
const friendRequestBtn = document.getElementById('friend-request-btn');

const db = firebase.firestore();

// 👤 Current user (replace this with Firebase Auth later)
const currentUser = {
  id: 'UV32xlVcaqbL7auugkErLAjTuEk2',  // Replace with logged-in user UID
  name: 'Peter W'
};

let currentChatPath = '';
let currentFriendName = '';

function getChatPath(a, b) {
  return [a, b].sort().join(' and ');
}

async function loadFriends() {
  friendList.innerHTML = '';
  const doc = await db.collection("users").doc(currentUser.id).get();
  const friends = doc.data().friends || [];

  for (const friendId of friends) {
    const friendDoc = await db.collection("users").doc(friendId).get();
    const friendData = friendDoc.data();
    const friendName = friendData.name;

    const li = document.createElement('li');
    li.classList.add('friend-item');
    li.setAttribute('data-id', friendId);
    li.setAttribute('data-name', friendName);
    li.innerHTML = `<strong>${friendName}</strong><br><small>loading...</small>`;
    friendList.appendChild(li);

    const chatPath = getChatPath(currentUser.name, friendName);
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
      currentChatPath = chatPath;
      chatHeader.textContent = `Chatting with ${friendName}`;
      chatMessages.innerHTML = '';
      chatInputForm.style.display = 'flex';
      clearChatBtn.style.display = 'block';
      chatInput.placeholder = `Waiting for your input ${currentUser.name}?`;

      loadChat(currentChatPath);
    };
  }
}

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

chatInputForm.onsubmit = (e) => {
  e.preventDefault();
  if (!currentChatPath) return;

  const timestamp = firebase.firestore.FieldValue.serverTimestamp();
  const message = {
    sender: currentUser.name,
    text: chatInput.value,
    timestamp
  };

  db.collection("messages")
    .doc(currentChatPath)
    .collection("chat")
    .add(message);

  chatInputForm.reset();
};

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

// 🔍 Search user by name
searchInput.addEventListener('input', async (e) => {
  const searchValue = e.target.value.trim();
  if (!searchValue) return;

  const result = await db.collection("users").where("name", "==", searchValue).get();
  if (result.empty) {
    chatHeader.textContent = 'No user found.';
    chatMessages.innerHTML = '';
    return;
  }

  const profile = result.docs[0];
  const data = profile.data();
  const id = profile.id;

  chatHeader.textContent = `${data.name} (${data.country})`;
  chatMessages.innerHTML = `
    <div><strong>Email:</strong> ${data.email}</div>
    <div><strong>Country:</strong> ${data.country}</div>
    <button id="add-friend-btn">Add Friend</button>
  `;

  document.getElementById("add-friend-btn").onclick = async () => {
    await db.collection("users").doc(currentUser.id).update({
      "requests.outgoing": firebase.firestore.FieldValue.arrayUnion(id)
    });
    await db.collection("users").doc(id).update({
      "requests.incoming": firebase.firestore.FieldValue.arrayUnion(currentUser.id)
    });
    alert("Friend request sent!");
    updateFriendRequestBadge();
  };
});

// 🔔 New Friends button with counter
async function updateFriendRequestBadge() {
  const doc = await db.collection("users").doc(currentUser.id).get();
  const incoming = doc.data().requests?.incoming || [];
  const count = incoming.length;
  friendRequestBtn.textContent = count > 10 ? "New Friends (10+)" : `New Friends${count ? ` (${count})` : ''}`;
}

// 🧾 View request list
friendRequestBtn.onclick = async () => {
  const doc = await db.collection("users").doc(currentUser.id).get();
  const incoming = doc.data().requests?.incoming || [];

  chatHeader.textContent = "Incoming Friend Requests";
  chatMessages.innerHTML = "";

  if (!incoming.length) {
    chatMessages.innerHTML = "<p>No new friend requests.</p>";
    return;
  }

  for (const id of incoming) {
    const u = await db.collection("users").doc(id).get();
    const data = u.data();
    const el = document.createElement("div");
    el.classList.add("message");
    el.innerHTML = `<strong>${data.name}</strong><br><small>${data.email}</small>`;
    el.onclick = () => renderFriendRequestProfile(id, data);
    chatMessages.appendChild(el);
  }
};

// 🔍 Profile view for request
function renderFriendRequestProfile(uid, data) {
  chatHeader.textContent = `Friend Request from ${data.name}`;
  chatMessages.innerHTML = `
    <div><strong>Name:</strong> ${data.name}</div>
    <div><strong>Email:</strong> ${data.email}</div>
    <div><strong>Country:</strong> ${data.country}</div>
    <br/>
    <button id="confirm-add">✅ Confirm</button>
    <button id="deny-add">❌ Deny</button>
  `;

  document.getElementById("confirm-add").onclick = () => acceptRequest(uid);
  document.getElementById("deny-add").onclick = () => denyRequest(uid);
}

async function acceptRequest(uid) {
  await db.collection("users").doc(currentUser.id).update({
    friends: firebase.firestore.FieldValue.arrayUnion(uid),
    "requests.incoming": firebase.firestore.FieldValue.arrayRemove(uid)
  });
  await db.collection("users").doc(uid).update({
    friends: firebase.firestore.FieldValue.arrayUnion(currentUser.id),
    "requests.outgoing": firebase.firestore.FieldValue.arrayRemove(currentUser.id)
  });
  loadFriends();
  updateFriendRequestBadge();
  friendRequestBtn.click(); // Refresh list
}

async function denyRequest(uid) {
  await db.collection("users").doc(currentUser.id).update({
    "requests.incoming": firebase.firestore.FieldValue.arrayRemove(uid)
  });
  await db.collection("users").doc(uid).update({
    "requests.outgoing": firebase.firestore.FieldValue.arrayRemove(currentUser.id)
  });
  updateFriendRequestBadge();
  friendRequestBtn.click(); // Refresh list
}

window.onload = () => {
  loadFriends();
  updateFriendRequestBadge();
};
