const PriorityQueue = require("./priorityQueue");

const queue = new PriorityQueue();
let nextId = 1;

function createNotification(payload) {
  const { title, message, priority = 0 } = payload;

  if (!title || !message) {
    const error = new Error("title and message are required");
    error.statusCode = 400;
    throw error;
  }

  const notification = {
    id: nextId++,
    title,
    message,
    priority: Number(priority) || 0,
    status: "queued",
    createdAt: new Date().toISOString(),
  };

  queue.enqueue(notification, notification.priority);
  return notification;
}

function listNotifications() {
  return queue.toArray();
}

function deliverNextNotification() {
  const notification = queue.dequeue();

  if (!notification) {
    return null;
  }

  return {
    ...notification,
    status: "delivered",
    deliveredAt: new Date().toISOString(),
  };
}

module.exports = {
  createNotification,
  deliverNextNotification,
  listNotifications,
};
