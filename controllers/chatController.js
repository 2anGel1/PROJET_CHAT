const { chatsOnUsers, message } = require("../lib/prisma.js")

const Message = require("../lib/prisma.js").message
const Chat = require("../lib/prisma.js").chat
const User = require("../lib/prisma.js").user

const { emitEvent } = require("../lib/websocket")

exports.getUserChats = async (req, res) => {
    try {
        console.log("getting user chats...")

        const author_id = req.params.user_id

        // console.log(req.params)
        const chats = await Chat.findMany({
            where: {
                OR: [
                    {
                        user1_id: author_id
                    },
                    {
                        user2_id: author_id
                    }
                ]
            },
            include: {
                messages: true
            }
        })
        await Promise.all(
            chats.map(async (item) => {
                const notSeenMessages = await Message.findMany({
                    where: {
                        chat_id: item.id,
                        receiver_id: author_id,
                        OR: [
                            {
                                status: "DISPLAYED"
                            },
                            {
                                status: "SENT"
                            }
                        ]
                    }
                });
                item.notSeen = notSeenMessages.length;

                const receiver = await User.findFirst({
                    where: { id: (author_id == item.user1_id) ? item.user2_id : item.user1_id },
                    select: {
                        firstname: true,
                        lastname: true,
                        status: true,
                        id: true,
                    }
                })
                item.receiverInfo = receiver
            })
        )

        // console.log(chats)
        console.log("Chats")
        res.status(200).json({ status: true, data: chats })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }

}

exports.storeMessage = async (req, res) => {
    try {

        console.log("Storing message...");

        const textmessage = req.body.message
        const createdAt = req.body.createdAt
        const user2_id = req.body.receiver
        const user1_id = req.body.author
        const type = req.body.type

        var chat = await Chat.findFirst({
            where: {
                OR: [
                    {
                        user1_id: user1_id,
                        user2_id: user2_id
                    },
                    {
                        user1_id: user2_id,
                        user2_id: user1_id
                    }
                ]

            }
        })

        if (chat) {
            console.log("Chat exists")
        } else {
            console.log("Creating chat..")
            chat = await Chat.create({
                data: {
                    user1_id: user1_id,
                    user2_id: user2_id
                }
            })
        }

        const u = await User.findFirst({
            where: {
                id: user2_id
            }
        });

        const online = u.status == 'ONLINE';

        await Message.create({
            data: {
                status: online ? "DISPLAYED": "SENT",
                receiver_id: user2_id,
                content: textmessage,
                createdAt: createdAt,
                author_id: user1_id,
                chat_id: chat.id,
                type: type
            }
        })

        // console.log(chat);
        console.log("Stored");
        return { status: true };
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
}