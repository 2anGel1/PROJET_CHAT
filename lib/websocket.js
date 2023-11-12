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

            console.log("DATA MESSAGE TO SEND");
            console.log(data);

            const createdAt = data.data.createdAt;
            const authorId = data.data.author.id;
            const receiverId = data.receiverId;
            const messageId = data.data.id;
            const text = data.data.text;

            await chatController.storeMessage({
                "body": {
                    "receiver": receiverId,
                    "createdAt": createdAt,
                    "author": authorId,
                    "message": text
                }
            }).then((res) => {
                if (res.status) {
                    console.log("Sending message...");
                    io.broadcast.emit(authorId, {
                        type: 'Message',
                        data: {
                            author: { id: authorId },
                            createdAt: createdAt,
                            id: messageId,
                            text: text
                        },
                        receiverId: receiverId
                    })
                    console.log("Sent");
                }
            })
                .catch((error) => {
                    console.log("Cannot send message...");
                    console.log("ERROR MESSAGE");
                    console.error(error);
                })

        })
    })
}