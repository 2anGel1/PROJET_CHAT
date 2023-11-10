const Message = require("../lib/prisma.js").message

/* --------------------CRUD----------------------- */

exports.getAll = async (req, res) => {
    try {
        console.log("geting all messages");
        const data = await Message.findMany({
            include: {
                chat: true,
            }
        })
        res.status(200).json({ status: true, data: data })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.getOndeById = async (req, res) => {
    try {
        console.log("geting one message by its id..")
        const data = await Message.findFirst({
            where: {
                id: req.params.message_id
            },
            include: {
                chat: true
            }
        })
        res.status(200).json({ status: true, data: data })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.add = async (req, res) => {
    console.log(req.body);
    try {
        console.log("adding new message..")
        const data = await Message.create({
            data: {
                content: req.body.content,
                chat_id: req.body.chat_id,
            }
        })
        res.status(200).json({ status: true, data: data })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.deleteMessage = async (req, res) => {
    try {
        console.log("deleting message..")
        await Message.delete({
            where: {
                id: req.params.message_id
            }
        })
        res.status(200).json({ status: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/* --------------------OTHER----------------------- */

exports.sendMessage = async (req, res) => {

}