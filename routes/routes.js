const express = require("express");
const router = express.Router();
// models
const MessageController = require("../controllers/messageController.js");
const UserController = require("../controllers/userController.js");
const ChatController = require("../controllers/chatController.js");


/* --------------------USER ROUTES----------------------- */

// AUTH 
router.get("/auth/logout/:user_id", UserController.logout);
router.post("/auth/signup", UserController.signup);
router.post("/auth/login", UserController.login);

// CRUD
router.delete("/users/:user_id", UserController.deleteUser);
router.put("/users/:user_id", UserController.updateUser);
router.get("/users", UserController.getAll);

/* --------------------CHAT ROUTES----------------------- */
// CRUD
router.get("/chats/:user_id", ChatController.getUserChats);
router.post("/chats/send", ChatController.storeMessage);



// CHAT PAGE
router.get('/chat', (req, res) => {
    res.sendFile(__dirname + "/chats/index.html")
})
router.get('/chat2', (req, res) => {
    res.sendFile(__dirname + "/chats/index2.html")
})
router.get('/login', (req, res) => {
    res.sendFile(__dirname + "/chats/login.html")
})

module.exports = router;