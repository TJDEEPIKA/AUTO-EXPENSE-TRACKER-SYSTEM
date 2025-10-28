const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, notificationController.getNotifications);
router.put("/:id/read", authMiddleware, notificationController.markAsRead);
router.post("/broadcast", authMiddleware, async (req, res) => {
  try {
    const { type, message } = req.body;
    if (!type || !message) {
      return res.status(400).json({ message: "Type and message are required" });
    }
    const count = await notificationController.broadcastNotification(type, message);
    res.json({ message: `Broadcast sent to ${count} users` });
  } catch (error) {
    res.status(500).json({ message: "Error broadcasting notification", error });
  }
});

module.exports = router;
