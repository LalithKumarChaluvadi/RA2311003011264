const http = require("http");
const logger = require("./logging_middleware/logger");
const registerNotificationRoutes = require("./notification_app_be/routes");
const registerMaintenanceRoutes = require("./vehicle_maintence_scheduler/routes");

const PORT = Number(process.env.PORT) || 3000;

function createRouter() {
  const routes = [];

  function add(method, path, handler) {
    routes.push({ method, path, handler });
  }

  return {
    get: (path, handler) => add("GET", path, handler),
    post: (path, handler) => add("POST", path, handler),
    find: (method, path) => routes.find((route) => route.method === method && route.path === path),
  };
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;

      if (data.length > 1_000_000) {
        reject(Object.assign(new Error("Request body is too large"), { statusCode: 413 }));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(Object.assign(new Error("Invalid JSON body"), { statusCode: 400 }));
      }
    });

    req.on("error", reject);
  });
}

function createResponse(res) {
  return {
    status(code) {
      res.statusCode = code;
      return this;
    },
    html(markup) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(markup);
    },
    json(payload) {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(payload));
    },
  };
}

function renderHomePage() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Notification and Maintenance Scheduler</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f6f8fb;
      --panel: #ffffff;
      --text: #152033;
      --muted: #627084;
      --line: #d9e1ec;
      --primary: #2563eb;
      --primary-dark: #1d4ed8;
      --success: #15803d;
      --danger: #b91c1c;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.5;
    }

    header {
      background: #172033;
      color: #ffffff;
      padding: 28px 20px;
    }

    header div,
    main {
      max-width: 1080px;
      margin: 0 auto;
    }

    h1,
    h2 {
      margin: 0;
    }

    h1 {
      font-size: 30px;
      font-weight: 700;
    }

    header p {
      max-width: 680px;
      margin: 8px 0 0;
      color: #d8e0ec;
    }

    main {
      display: grid;
      gap: 18px;
      padding: 24px 20px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 18px;
    }

    section {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 18px;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
    }

    section h2 {
      font-size: 20px;
      margin-bottom: 12px;
    }

    label {
      display: block;
      margin-bottom: 10px;
      color: var(--muted);
      font-size: 14px;
      font-weight: 600;
    }

    input,
    textarea {
      width: 100%;
      margin-top: 4px;
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 10px;
      color: var(--text);
      font: inherit;
    }

    textarea {
      min-height: 84px;
      resize: vertical;
    }

    button {
      border: 0;
      border-radius: 6px;
      background: var(--primary);
      color: #ffffff;
      cursor: pointer;
      font: inherit;
      font-weight: 700;
      padding: 10px 14px;
    }

    button:hover {
      background: var(--primary-dark);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 12px;
    }

    .status {
      border-left: 4px solid var(--primary);
      color: var(--muted);
    }

    .message {
      min-height: 24px;
      margin-top: 10px;
      font-weight: 700;
    }

    .ok {
      color: var(--success);
    }

    .error {
      color: var(--danger);
    }

    pre {
      max-height: 280px;
      overflow: auto;
      background: #111827;
      color: #e5e7eb;
      border-radius: 8px;
      padding: 14px;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Notification and Maintenance Scheduler</h1>
      <p>Create priority notifications, deliver the next highest-priority item, and schedule vehicle maintenance from one local dashboard.</p>
    </div>
  </header>

  <main>
    <section class="status">
      <h2>Server Status</h2>
      <p id="health">Checking API...</p>
    </section>

    <div class="grid">
      <section>
        <h2>Add Notification</h2>
        <form id="notificationForm">
          <label>Title
            <input name="title" required placeholder="Service reminder">
          </label>
          <label>Message
            <textarea name="message" required placeholder="Vehicle KA-01-AB-1234 is due for inspection"></textarea>
          </label>
          <label>Priority
            <input name="priority" type="number" value="1" min="0">
          </label>
          <button type="submit">Add Notification</button>
          <div id="notificationMessage" class="message"></div>
        </form>
      </section>

      <section>
        <h2>Add Maintenance</h2>
        <form id="maintenanceForm">
          <label>Vehicle ID
            <input name="vehicleId" required placeholder="KA-01-AB-1234">
          </label>
          <label>Service Type
            <input name="serviceType" required placeholder="Oil change">
          </label>
          <label>Due Date
            <input name="dueDate" type="date" required>
          </label>
          <label>Notes
            <textarea name="notes" placeholder="Use synthetic oil"></textarea>
          </label>
          <button type="submit">Add Schedule</button>
          <div id="maintenanceMessage" class="message"></div>
        </form>
      </section>
    </div>

    <section>
      <h2>Current Data</h2>
      <div class="actions">
        <button type="button" id="refreshButton">Refresh</button>
        <button type="button" id="deliverButton">Deliver Next Notification</button>
      </div>
      <pre id="output">Loading...</pre>
    </section>
  </main>

  <script>
    const output = document.getElementById("output");
    const health = document.getElementById("health");
    const notificationMessage = document.getElementById("notificationMessage");
    const maintenanceMessage = document.getElementById("maintenanceMessage");

    async function api(path, options = {}) {
      const response = await fetch(path, {
        headers: { "Content-Type": "application/json" },
        ...options,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      return data;
    }

    function setMessage(element, text, isError = false) {
      element.textContent = text;
      element.className = "message " + (isError ? "error" : "ok");
    }

    async function refresh() {
      const [notifications, maintenance] = await Promise.all([
        api("/api/notifications"),
        api("/api/maintenance"),
      ]);

      output.textContent = JSON.stringify({ notifications, maintenance }, null, 2);
    }

    async function checkHealth() {
      try {
        const data = await api("/api/health");
        health.textContent = "API status: " + data.status;
      } catch (error) {
        health.textContent = "API unavailable: " + error.message;
      }
    }

    document.getElementById("notificationForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.priority = Number(payload.priority) || 0;

      try {
        await api("/api/notifications", { method: "POST", body: JSON.stringify(payload) });
        setMessage(notificationMessage, "Notification added.");
        form.reset();
        await refresh();
      } catch (error) {
        setMessage(notificationMessage, error.message, true);
      }
    });

    document.getElementById("maintenanceForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const payload = Object.fromEntries(new FormData(form).entries());

      try {
        await api("/api/maintenance", { method: "POST", body: JSON.stringify(payload) });
        setMessage(maintenanceMessage, "Maintenance schedule added.");
        form.reset();
        await refresh();
      } catch (error) {
        setMessage(maintenanceMessage, error.message, true);
      }
    });

    document.getElementById("refreshButton").addEventListener("click", refresh);
    document.getElementById("deliverButton").addEventListener("click", async () => {
      try {
        await api("/api/notifications/deliver", { method: "POST", body: "{}" });
        await refresh();
      } catch (error) {
        output.textContent = error.message;
      }
    });

    checkHealth();
    refresh().catch((error) => {
      output.textContent = error.message;
    });
  </script>
</body>
</html>`;
}

const router = createRouter();

router.get("/", (req, res) => {
  res.html(renderHomePage());
});

router.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

registerNotificationRoutes(router);
registerMaintenanceRoutes(router);

const server = http.createServer(async (req, nodeRes) => {
  const res = createResponse(nodeRes);

  logger(req, nodeRes, async () => {
    try {
      const path = new URL(req.url, `http://${req.headers.host}`).pathname;
      const route = router.find(req.method, path);

      if (!route) {
        res.status(404).json({ error: "Route not found" });
        return;
      }

      req.body = ["POST", "PUT", "PATCH"].includes(req.method) ? await readJsonBody(req) : {};
      route.handler(req, res);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message || "Internal server error" });
    }
  });
});

if (require.main === module) {
  const startServer = (port) => {
    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  };

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && !process.env.PORT) {
      const nextPort = Number(error.port) + 1;
      console.log(`Port ${error.port} is already in use. Trying ${nextPort}...`);
      startServer(nextPort);
      return;
    }

    throw error;
  });

  startServer(PORT);
}

module.exports = server;
