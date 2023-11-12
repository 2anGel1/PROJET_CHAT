const { chatsOnUsers, message } = require("../lib/prisma.js")

const Message = require("../lib/prisma.js").Message
const Chat = require("../lib/prisma.js").chat
const User = require("../lib/prisma.js").user

const { emitEvent } = require("../lib/websocket")

exports.create = async (req, res) => {
    try {
        const chat = await Chat.create({
            data: {
                user1_id: req.body.user1_id,
                user2_id: req.body.user2_id
            }
        })
        res.status(200).json({ status: true, data: chat })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

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
                messages: true,
            }
        })

        await Promise.all(
            chats.map(async (item) => {
                const receiver = await User.findFirst({
                    where: { id: (author_id == item.user1_id) ? item.user2_id : item.user1_id },
                    select: {
                        firstname: true,
                        lastname: true,
                        status: true,
                        id: true
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

        console.log("storing message...");

        const user1_id = req.body.author
        const textmessage = req.body.message
        const user2_id = req.body.receiver
        const createdAt = req.body.createdAt

        // console.log(textmessage);

        var chat = await Chat.findFirst({
            where: {
                user1_id: user1_id,
                user2_id: user2_id
            }
        })

        if (chat) {
            console.log("chat exists")
        } else {
            console.log("creating chat..")
            chat = await Chat.create({
                data: {
                    user1_id: user1_id,
                    user2_id: user2_id
                }
            })
        }

        const message = await Message.create({
            data: {
                chat_id: chat.id,
                content: textmessage,
                createdAt: createdAt
            }
        })

        // console.log(chat);
        console.log("Stored");
        return {status: true};
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
}