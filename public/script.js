const socket = io();//According to ChatGPT: Connect to the server


//According to ChatGPT: Select DOM elements

const messageInput = document.getElementById("message-input");
const messages = document.getElementById("messages");//Chat GPT is very good at naming vars
const form = document.getElementById("form");

const nameForm = document.getElementById("name-form");
const nameInput = document.getElementById("name-input");
const namePrompt = document.getElementById("name-prompt");

const screens = document.getElementsByClassName("screen");//all of the menu screeny things
var screenNum = 0;

const roomForm = document.getElementById("room-form");
const roomContainer = document.getElementById("room-container");
const roomTemplate = document.getElementById("room-template");
const newRoomName = document.getElementById("new-room-heading");
const newRoomDescription = document.getElementById("new-room-description");

var userName;

var roomNum = 0;

function changeScreen(screenId) {
    for(var i = 0; i < screens.length; i ++) {
        screens[i].hidden = i !== screenId;
    }
}
changeScreen(0);

var roomClicked = function(e) {
    console.log("Well, something happened");
    socket.emit("change room", this.id);
}

function addRoom(roomId, roomName, roomDes) {
    console.log("Making room with id of " + roomId);
    var clone = roomTemplate.content.cloneNode(true);
    var thing = clone.querySelector(".room");
    thing.id = roomId;
    if(roomName) {
        clone.querySelector(".room-heading").textContent = roomName + " #" + roomId;
    }
    if(roomDes) {
        clone.querySelector(".room-description").textContent = roomDes;
    }
    thing.addEventListener("click", roomClicked);
    roomContainer.appendChild(clone);
    roomNum ++;
}

nameForm.addEventListener("submit", e => {
    e.preventDefault();
    if(confirm("Are you sure you want your name to be \"" + nameInput.value + "\"?")) {
        userName = nameInput.value;
        changeScreen(1);
    }
});
roomForm.addEventListener("submit", e => {
    e.preventDefault();
    var newRoom = {
        name: newRoomName.value,
        des: newRoomDescription.value
    };
    if(confirm("Are you sure you want to create this form?\n\nName: " + newRoom.name + "\nDescription: " + newRoom.des)) {
        console.log("Trying to create new room :D");
        socket.emit("new room", newRoom);
        addRoom(roomNum, newRoom.name, newRoom.des);
    }
})

//I made this for organization reasons :D
function appendMessage(txt, isYours) {
    const li = document.createElement("li");
    li.textContent = txt;
    li.className = isYours? "yourMessages": "otherMessages";//me doing some css to make them different colors (btw while typing in these names I failed two times and it was embarrasing hehe)
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;//According to ChatGPT: Scroll to bottom
};

//According to ChatGPT: Listen for incoming chat messages
socket.on("chat message", (msg) => {
    appendMessage(msg, false);//yay add a message to the ***cough cough*** unorganized list (whyyyyyy)
});
socket.on("previous messages", (oldMessages) => {
    changeScreen(2);
    console.log("Got some previous messages", oldMessages);
    messages.innerHTML = "";
    for(var i = 0; i < oldMessages.length; i ++) {
        appendMessage(oldMessages[i], false);
    }
});
socket.on("new room", rooms => {
    for(var i = 0; i < rooms.length; i ++) {
        addRoom(roomNum, rooms[i].name, rooms[i].des);
    }
})

//According to ChatGPT: Handle form submission (send message)
form.addEventListener("submit", e => {
    e.preventDefault();//According to ChatGPT: Prevent default form behavior
    const msg = userName + ": " + messageInput.value;//haha msg hahaha haha you know the food stuff
    if(msg.trim() !== "") {//If it's not just spaces (i think)
        socket.emit("chat message", msg);
        //Send the message to yourself :D (added this in because I changed line 20 in server.js to make it not send it to the server and then send it back to you)
        appendMessage("You: " + messageInput.value, true);

        messageInput.value = "";
        //Thankfully, the socket.emit part is correct.
    }
})