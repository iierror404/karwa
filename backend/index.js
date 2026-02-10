import dotenv from "dotenv";
import express from "express";
import ConnectToDb from "./config/db.js";
import cors from "cors";
import fileUpload from "express-fileupload";
import http from "http";
import { initSocket } from "./config/socket.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import routesRoute from "./routes/routeRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();
const port = process.env.PORT || 4000;
const app = express();
const host = "0.0.0.0";

const FRONTEND_IP = process.env.FRONTEND_URL
const FRONTEND_PORT = process.env.FRONTEND_PORT

const FRONTEND_URL = FRONTEND_IP + ":" + FRONTEND_PORT;

app.use(
  cors({
    // 1. لازم تحدد رابط الفرونت أند بالضبط (بدون / بالنهاية)
    // إذا جنت تفتحه من المتصفح بـ localhost:3000 أو بالـ IP
    origin: ["http://localhost:3000", FRONTEND_URL],

    // 2. هاي هي أهم وحدة للكوكي 🍪
    credentials: true,

    // 3. السماح بالطرق والـ Headers
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  }),
);

const server = http.createServer(app);
const io = initSocket(server);

app.set("socketio", io);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/routes", routesRoute);

app.use("/api/bookings", bookingRoutes);

app.use("/api/user", userRoutes);

app.use("/api/chat", chatRoutes);

// * Server Init
ConnectToDb();
server.listen(port, host, () => {
  console.log(`🟢 Socket Server is running on: http://localhost:${port}`);
});
