const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const { connectDB, sequelize } = require("./config/db");
require("./models");

const { appState, setDbConnected } = require("./lib/runtime");
const { seedMemoryAdminIfNeeded } = require("./lib/memoryUserStore");

const authRoutes = require("./routes/authRoutes");
const cityRoutes = require("./routes/cityRoutes");
const activityRoutes = require("./routes/activityRoutes");
const tripRoutes = require("./routes/tripRoutes");
const stopRoutes = require("./routes/stopRoutes");
const stopActivityRoutes = require("./routes/stopActivityRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const checklistRoutes = require("./routes/checklistRoutes");
const tripNoteRoutes = require("./routes/tripNoteRoutes");
const communityRoutes = require("./routes/communityRoutes");
const profileRoutes = require("./routes/profileRoutes");
const savedDestinationRoutes = require("./routes/savedDestinationRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, dbConnected: appState.dbConnected });
});

app.use("/api/auth", authRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/stops", stopRoutes);
app.use("/api/stops", stopActivityRoutes);
app.use("/api", expenseRoutes);
app.use("/api", checklistRoutes);
app.use("/api", tripNoteRoutes);
app.use("/api", communityRoutes);
app.use("/api", profileRoutes);
app.use("/api", savedDestinationRoutes);

app.get("/", (_req, res) => {
  res.send("Traveloop API");
});

app.use((err, _req, res, _next) => {
  if (err.status === 400 && err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON body" });
  }
  const status = err.statusCode || err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: err.message || "Internal server error" });
});

async function start() {
  const connected = await connectDB();
  setDbConnected(connected);

  if (connected) {
    try {
      await sequelize.sync({ alter: true });
      console.log("Sequelize sync (alter) complete");
    } catch (e) {
      console.error("Sequelize sync failed:", e);
      process.exit(1);
    }
  } else {
    await seedMemoryAdminIfNeeded();
    console.info(
      "[auth] In-memory mode; default admin:",
      process.env.ADMIN_EMAIL || "admin@traveloop.com"
    );
  }

  const server = app.listen(PORT, () => {
    console.log(`Traveloop API http://localhost:${PORT}`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`[server] Port ${PORT} in use. Stop other process or set PORT in .env.`);
    } else {
      console.error(err);
    }
    process.exit(1);
  });
}

start();
