const {
  createNotification,
  deliverNextNotification,
  listNotifications,
} = require("./service");

function registerNotificationRoutes(router) {
  router.get("/api/notifications", (req, res) => {
    res.json({ notifications: listNotifications() });
  });

  router.post("/api/notifications", (req, res) => {
    const notification = createNotification(req.body || {});
    res.status(201).json({ notification });
  });

  router.post("/api/notifications/deliver", (req, res) => {
    const notification = deliverNextNotification();

    if (!notification) {
      res.status(404).json({ error: "No notifications in queue" });
      return;
    }

    res.json({ notification });
  });
}

module.exports = registerNotificationRoutes;
