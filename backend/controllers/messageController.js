const Message = require("../models/Message");


// 💬 SEND MESSAGE
exports.sendMessage = async (req, res) => {
  try {

    const senderId = req.user.id;

    const {
      receiverId,
      text
    } = req.body;

    // 🚫 Validation
    if (!receiverId || !text) {
      return res.status(400).json({
        message: "Receiver ID and message text are required"
      });
    }

    // ✅ Create message
    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text
    });

    res.status(201).json({
      message: "Message sent successfully",
      data: newMessage
    });

  } catch (error) {

    console.error("SEND MESSAGE ERROR:", error);

    res.status(500).json({
      message: "Failed to send message",
      error: error.message
    });
  }
};



// 📩 GET CHAT HISTORY
exports.getMessages = async (req, res) => {
  try {

    const currentUserId = req.user.id;

    const otherUserId = req.params.id;

    // ✅ Fetch conversation
    const messages = await Message.find({
      $or: [

        // Current user → other user
        {
          sender: currentUserId,
          receiver: otherUserId
        },

        // Other user → current user
        {
          sender: otherUserId,
          receiver: currentUserId
        }

      ]
    })
      .sort({ createdAt: 1 });

    res.json(messages);

  } catch (error) {

    console.error("GET MESSAGE ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch messages",
      error: error.message
    });
  }
};