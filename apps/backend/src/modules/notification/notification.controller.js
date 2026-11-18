import * as notificationService from "./notification.service.js";

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isRead, page, limit } = req.query;

    const data = await notificationService.getUserNotifications(userId, {
      isRead: isRead === "true" ? true : isRead === "false" ? false : undefined,
      page,
      limit,
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const data = await notificationService.markAsRead(notificationId, userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await notificationService.markAllAsRead(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

