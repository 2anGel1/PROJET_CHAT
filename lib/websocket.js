const messageController = require("../controllers/messageController");
const userController = require("../controllers/userController");
const chatController = require("../controllers/chatController");
const { Server } = require("socket.io");

var users = 0


exports.handleSocket = async (io) => {

    io.on('connection', (socket) => {
        users += 1

        // gestion de la connexion
        console.log("connected");
        console.log("users: " + users);

        // gestion de la deconnexion
        socket.on('disconnect', () => {
            users -= 1
            console.log("disconnected");
        })

        // gestion de l'écriture
        socket.on('write', async (receiverId) => {
            // console.log(receiverId);
            io.emit("write-" + receiverId, {})
        })

        // gestion de l'envoie de message
        socket.on('message', async (msg) => {

            const data = JSON.parse(msg);

            console.log("DATA MESSAGE:");

            const createdAt = data.data.createdAt;
            const receiverId = data.receiverId;
            const text = data.data.test;
            const authorId = data.data.author.id;

            await chatController.storeMessage({
                "body": {
                    data
                }
            }).then((res) => {
                if (res.status) {
                    console.log("Sending message...");
                    socket.emit(receiverId, text)
                    console.log("Sent");
                }
            })
                .catch((error) => {
                    console.error(error);
                })

            console.log("Sending message...");
            // io.emit(receiverId, text)
            console.log("Sent");

        })
    })
}