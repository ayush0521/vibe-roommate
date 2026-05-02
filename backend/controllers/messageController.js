const Message = require("../models/Message");

// 📤 SEND MESSAGE
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, text } = req.body;

    if (!receiverId || !text) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text,
    });

    res.status(201).json(message);
  } catch (err) {
    console.error("Send Message Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📥 GET CHAT BETWEEN TWO USERS
exports.getMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    // 🔥 THIS IS THE IMPORTANT PART
    const formatted = messages.map((msg) => ({
      text: msg.text,
      isMine: msg.sender.toString() === currentUserId,
      createdAt: msg.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Get Messages Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};