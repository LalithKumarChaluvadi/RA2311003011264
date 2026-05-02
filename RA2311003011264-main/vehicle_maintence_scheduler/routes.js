const {
  addMaintenanceSchedule,
  listMaintenanceSchedules,
} = require("./scheduler");

function registerMaintenanceRoutes(router) {
  router.get("/api/maintenance", (req, res) => {
    res.json({ schedules: listMaintenanceSchedules() });
  });

  router.post("/api/maintenance", (req, res) => {
    const schedule = addMaintenanceSchedule(req.body || {});
    res.status(201).json({ schedule });
  });
}

module.exports = registerMaintenanceRoutes;
