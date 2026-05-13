import { Notification } from "../models/notification.js";

export const createNotification = async (NotificationData) => {
    const notification = new Notification(NotificationData);
    return await notification.save();
};

export const notifyUser = async(
    userId,
    message,
    type = "general",
    link = null,
    priority = "low"
) => {
    return await createNotification({
        user: userId,
        message,
        type,
        link,
        priority,
    });
};