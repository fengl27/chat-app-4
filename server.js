const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

var rooms = [];
var users = {};

app.use(express.static("public"));

function deleteUser(id) {
	for(var i = 0; i < rooms.length; i ++) {
		var room = rooms[i];
		console.log(room.users);
		if(room.users.includes(users[id])) {
			var id = room.users.indexOf(users[id]);
			room.users.splice(id, 1);
		}
	}
	delete users[id];
}

io.on("connection", (socket) => {
	console.log("new user !!! (A user connected)");
	socket.emit("new room", rooms);
	
	users[socket.id] = {id: socket.id, room: -1};

	socket.on("chat message", (msg) => {
		var room = rooms[users[socket.id].room];
		room.messages.push(msg);
		if(room.messages.length > 50) {
			room.messages.splice(0, 1);
		}
		for(var i = 0; i < room.users.length; i ++) {
			socket.to(room.users[i].id).emit("chat message", msg);
		}
	});

	socket.on("new room", (newRoom) => {
		newRoom.users = [];
		newRoom.messages = [];
		console.log("Create new room with name " + newRoom.name + " and des " + newRoom.des);
		rooms.push(newRoom);
		console.log(newRoom);
		socket.broadcast.emit("new room", [newRoom]);
	});

	socket.on("change room", roomId => {
		if(users[socket.id].room !== -1) {
			var id = rooms[users[socket.id].room].users.indexOf(users[socket.id]);
			rooms[users[socket.id].room].users.splice(id, 1);
		}
		users[socket.id].room = roomId;
		rooms[roomId].users.push(users[socket.id]);
		console.log("Sending some previous messages");
		socket.emit("previous messages", rooms[roomId].messages);
	});

	socket.on("disconnect", () => {
		console.log("A user disconnected");
		deleteUser(socket.id);
		console.log(rooms);
	});

});

server.listen(3000, () => {
	console.log("Server is running on http://localhost:3000 (http://68.184.16.128:3000)");
	console.log("To find the link, use the command curl ifcfg.me and then add an http:// and a :3000.")
	console.log("Press Ctrl. + C to stop server (^C)");
});