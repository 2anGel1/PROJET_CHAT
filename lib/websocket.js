const messageController = require("../controllers/messageController");
const userController = require("../controllers/userController");
const chatController = require("../controllers/chatController");
const { v4: uuidv4 } = require('uuid');
const { json } = require("express");

var users = 0;

function connectedUsers() {
    console.log("number of connected users: " + users);
}

exports.handleSocket = async (io) => {

    io.on('connection', (socket) => {

        /*------------ gestion de la connexion ------------*/
        socket.on('user_connect', async (obj) => {

            const parsedObj = JSON.parse(obj)
            await userController.updateSession(
                {
                    "body": {
                        "user_id": parsedObj.user_id,
                        "action": "ONLINE"
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
        socket.on('user_disconnect', async (obj) => {
            const parsedObj = JSON.parse(obj)
            await userController.updateSession(
                {
                    "body": {
                        "user_id": parsedObj.user_id,
                        "action": "OFFLINE"
                    }
                }
            ).then((res) => {
                io.emit("userDisconnected", {
                    user_id: parsedObj.user_id
                });
                users = users == 0 ? 0 : users - 1;
                console.log("disconnected");
            }).catch((error) => {
                console.error("can't disconnect user");
                console.error("ERROR MESSAGE");
                console.error(error);
            })
            connectedUsers();
        });
        socket.on('disconnect', () => {
            console.log("disconnection from socket");
            users = users == 0 ? 0 : users - 1;
            connectedUsers();
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

        /*------------ gestion du status d'écriture d'un message ------------*/
        socket.on('is_typing', async (obj) => {
            const parsedObj = JSON.parse(obj);

            io.emit('is_typing_' + parsedObj.userId, {
                chat_id: parsedObj.chat_id,
            });
            console.log('is_typing_' + parsedObj.userId);

        })
        socket.on('is_not_typing', async (obj) => {
            const parsedObj = JSON.parse(obj);

            io.emit('is_not_typing_' + parsedObj.userId, {
                chat_id: parsedObj.chat_id,
            });
            console.log('is_not_typing_' + parsedObj.userId);

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

            io.emit("seen_" + parsedObj.other_id, { chat_id: parsedObj.chat_id });
        })
        socket.on('display', async (obj) => {
            console.log("displaying");
            const parsedObj = JSON.parse(obj);

            await messageController.setOtherStatus({
                "body": {
                    "chat_id": parsedObj.chat_id,
                    "user_id": parsedObj.user_id,
                    "status": "DISPLAYED"
                }
            })

            io.emit("display_" + parsedObj.other_id, { chat_id: parsedObj.chat_id });
        })

    })
}