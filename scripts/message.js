const db = firebase.firestore();

const friendList = document.getElementById('friend-list');
const chatHeader = document.querySelector('.chat-header');
const chatMessages = document.querySelector('.chat-messages');
const chatInputForm = document.querySelector('.chat-input-form');
const chatInput = document.querySelector('.chat-input');
const clearChatBtn = document.querySelector('.clear-chat-button');
const searchInput = document.getElementById('search-input');
const friendRequestBtn = document.getElementById('friend-request-btn');

let currentUser = {
  id: null,
  name: "Anonymous"
};

let currentChatId = '';
let currentFriendId = '';
let currentFriendName = '';

function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

// MAIN AUTH HANDLER
firebase.auth().onAuthStateChanged((user) => {
  if (!user) return;

  currentUser.id = user.uid;
  console.log("✅ Signed in as:", currentUser.id);

  loadFriends();
  updateFriendRequestBadge();

  // ✅ New Friends Button Handler
  friendRequestBtn.onclick = async () => {
    const doc = await db.collection("users").doc(currentUser.id).get();
    const incoming = doc.data()?.requests?.incoming || [];

    chatHeader.textContent = "Incoming Friend Requests";
    chatMessages.innerHTML = "";

    if (!incoming.length) {
      chatMessages.innerHTML = "<p>No new friend requests.</p>";
      return;
    }

    for (const uid of incoming) {
      const userDoc = await db.collection("users").doc(uid).get();
      const data = userDoc.data();

      const el = document.createElement("div");
      el.classList.add("message");
      el.innerHTML = `<strong>${data.name}</strong><br><small>${data.email}</small>`;
      el.onclick = () => renderFriendRequestProfile(uid, data);
      chatMessages.appendChild(el);
    }
  };
});

// ✅ Renders profile with confirm/deny buttons
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

// ✅ Accepts request
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

// ✅ Denies request
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

// ✅ Load friend list
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
      currentFriendName = friendName;
      currentChatId = getChatId(currentUser.id, friendId);

      chatHeader.textContent = `Chatting with ${friendName}`;
      chatMessages.innerHTML = '';
      chatInputForm.style.display = 'flex';
      clearChatBtn.style.display = 'block';
      chatInput.placeholder = `Type a message to ${friendName}`;

      loadChat(currentChatId);
    };
  }
}

// ✅ Load chat between two users
function loadChat(chatId) {
  const chatRef = db.collection("messages").doc(chatId).collection("chat").orderBy("timestamp");

  chatRef.onSnapshot(snapshot => {
    chatMessages.innerHTML = '';
    snapshot.forEach(doc => {
      const msg = doc.data();
      const time = msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';
      const msgElement = document.createElement('div');
      msgElement.classList.add('message');
      msgElement.innerHTML = `
        <div class="message-sender">${msg.sender === currentUser.id ? 'You' : 'Friend'}</div>
        <div class="message-text">${msg.text}</div>
        <div class="message-timestamp">${time}</div>
      `;
      chatMessages.appendChild(msgElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  });
}

// ✅ Send message
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

// ✅ Clear chat
clearChatBtn.onclick = () => {
  if (!currentChatId) return;
  const chatRef = db.collection("messages").doc(currentChatId).collection("chat");
  chatRef.get().then(snapshot => {
    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    return batch.commit();
  });
  chatMessages.innerHTML = '';
};

// ✅ Search for user
searchInput.addEventListener('input', async (e) => {
  const name = e.target.value.trim();
  if (!name) return;

  const result = await db.collection("users").where("name", "==", name).get();
  if (result.empty) {
    chatHeader.textContent = 'No user found.';
    chatMessages.innerHTML = '';
    return;
  }

  const profileDoc = result.docs[0];
  const data = profileDoc.data();
  const profileId = profileDoc.id;

  chatHeader.textContent = `${data.name} (${data.country})`;
  chatMessages.innerHTML = `
    <div><strong>Email:</strong> ${data.email}</div>
    <div><strong>Country:</strong> ${data.country}</div>
    <button id="add-friend-btn">Add Friend</button>
  `;

  document.getElementById("add-friend-btn").onclick = async () => {
    if (profileId === currentUser.id) {
      alert("You can't add yourself.");
      return;
    }

    const currentUserDoc = await db.collection("users").doc(currentUser.id).get();
    const outgoing = currentUserDoc.data()?.requests?.outgoing || [];
    const friends = currentUserDoc.data()?.friends || [];

    if (outgoing.includes(profileId)) {
      alert("Friend request already sent.");
      return;
    }

    if (friends.includes(profileId)) {
      alert("Already friends.");
      return;
    }

    await db.collection("users").doc(currentUser.id).update({
      "requests.outgoing": firebase.firestore.FieldValue.arrayUnion(profileId)
    });

    await db.collection("users").doc(profileId).update({
      "requests.incoming": firebase.firestore.FieldValue.arrayUnion(currentUser.id)
    });

    alert("Friend request sent!");
    updateFriendRequestBadge();
  };
});

// ✅ Badge update
async function updateFriendRequestBadge() {
  const doc = await db.collection("users").doc(currentUser.id).get();
  const incoming = doc.data()?.requests?.incoming || [];
  const count = incoming.length;
  friendRequestBtn.textContent = count > 10 ? "New Friends (10+)" : `New Friends${count ? ` (${count})` : ''}`;
}
