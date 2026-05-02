const schedules = [];
let nextId = 1;

function addMaintenanceSchedule(payload) {
  const { vehicleId, serviceType, dueDate, notes = "" } = payload;

  if (!vehicleId || !serviceType || !dueDate) {
    const error = new Error("vehicleId, serviceType, and dueDate are required");
    error.statusCode = 400;
    throw error;
  }

  const dueTime = Date.parse(dueDate);

  if (Number.isNaN(dueTime)) {
    const error = new Error("dueDate must be a valid date");
    error.statusCode = 400;
    throw error;
  }

  const schedule = {
    id: nextId++,
    vehicleId,
    serviceType,
    dueDate: new Date(dueTime).toISOString(),
    notes,
    status: "scheduled",
    createdAt: new Date().toISOString(),
  };

  schedules.push(schedule);
  return schedule;
}

function listMaintenanceSchedules() {
  return [...schedules].sort((a, b) => Date.parse(a.dueDate) - Date.parse(b.dueDate));
}

module.exports = {
  addMaintenanceSchedule,
  listMaintenanceSchedules,
};
