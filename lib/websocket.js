const messageController = require("../controllers/messageController");
const userController = require("../controllers/userController");
const chatController = require("../controllers/chatController");
const { v4: uuidv4 } = require('uuid');

var users = 0;

function connectedUsers() {
    console.log("number of connected users: " + users);
}

exports.handleSocket = async (io) => {

    io.on('connection', (socket) => {

        /*------------ gestion de la connexion ------------*/
        socket.on('info', async (obj) => {

            const parsedObj = JSON.parse(obj)
            await userController.openSession(
                {
                    "body": {
                        "user_id": parsedObj.user_id
                    }
                }
            ).then((res) => {

                console.log("connected");
                users += 1;

            }).catch((error) => {
                console.error("can't connect user");
                console.error("ERROR MESSAGE");
                console.error(error);
            })
            connectedUsers();

        })

        /*------------ gestion de la deconnexion ------------*/
        socket.on('disconnect', () => {
            users = users == 0 ? 0 : users - 1;
            console.log("disconnected");
            connectedUsers();
        })

        /*------------ gestion du status d'écriture d'un message ------------*/
        socket.on('write', async (receiverId) => {
            // console.log(receiverId);
            io.emit("write-" + receiverId, {})
        })

        /*------------ gestion de l'envoie d'un message ------------*/
        socket.on('message', async (msg) => {

            const data = JSON.parse(msg);

            const createdAt = data.data.createdAt;
            const messageId = data.fromWeb ? uuidv4() : data.data.id;
            const authorId = data.data.author.id;
            const receiverId = data.receiverId;
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
                    io.emit(receiverId, {
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

        /*------------ gestion des etats des messages ------------*/
        socket.on('seen', async (obj) => {
            const parsedObj = JSON.parse(obj);

            await messageController.setOtherStatus({
                "body": {
                    "chat_id": parsedObj.chat_id,
                    "user_id": parsedObj.user_id,
                    "status": "SEEN"
                }
            })
        })
        socket.on('display', async (obj) => {
            const parsedObj = JSON.parse(obj);

            await messageController.setOtherStatus({
                "body": {
                    "chat_id": parsedObj.chat_id,
                    "user_id": parsedObj.user_id,
                    "status": "DISPLAYED"
                }
            })
        })

    })
}