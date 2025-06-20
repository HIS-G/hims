require("dotenv").config();
const express = require("express");
const https = require("https");
const { default: mongoose } = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const { Server } = require("socket.io");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const app = express();

// Security Middleware
app.use(helmet()); // Set security HTTP headers
app.use(mongoSanitize()); // Data sanitization against NoSQL query injection
app.use(xss()); // Data sanitization against XSS
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Rate limiting
const limiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests from this IP, please try again in an hour!",
});
// app.use("/api", limiter);

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware to log errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});
const corsOptions = {
  origin: [
    "https://hism.hismobiles.com",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5173",
    "http://hism.edspare.com",
    "https://hism.edspare.com",
    "http://his-marketplace.s3-website-us-east-1.amazonaws.com/",
  ], // Allow requests only from this domain
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"], // Allow only specific HTTP methods
  maxAge: 3600,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

const file = fs.readFileSync("./DBE36D85EE856E805997FAD9F0105A8A.txt");

// Routes
const authRoutes = require("./src/routes/authRoute");
const userRoutes = require("./src/routes/userRoute");
const customerRoutes = require("./src/routes/customerRoute");
const deviceRoutes = require("./src/routes/deviceRoute");
const schoolRoutes = require("./src/routes/schoolRoute");
const studentRoutes = require("./src/routes/studentRoute");
const roleRoutes = require("./src/routes/roleRoute");
const announcementRoutes = require("./src/routes/announcementRoute");
const ticketRoutes = require("./src/routes/ticketRoute");
const dashboardRoute = require("./src/routes/dashboardRoute");
const careerRoute = require("./src/routes/careerRoute");
const channelRoute = require("./src/routes/channelRoute");
const directMessageRoutes = require("./src/routes/directMessageRoutes");
const uploadRoutes = require("./src/routes/uploadRoute");
const publicationRoute = require("./src/routes/publicityRoute");

// middlewares
app.options("*", cors());
app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/devices", deviceRoutes);
app.use("/api/v1/schools", schoolRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/announcements", announcementRoutes);
app.use("/api/v1/tickets", ticketRoutes);
app.use("/api/v1/dashboard", dashboardRoute);
app.use("/api/v1/careers", careerRoute);
app.use("/api/v1/channels", channelRoute);
app.use("/api/v1/direct-messages", directMessageRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/publications", publicationRoute);

app.get("/", (req, res) => {
  res.send("<h1>Welcome to HIS-Identity Management Systems (HIMS)</h1>");
});

app.get(
  "/.well-known/pki-validation/DBE36D85EE856E805997FAD9F0105A8A.txt",
  (req, res) => {
    res.sendFile(file);
  }
);

// Connect to Database
mongoose
  .connect(process.env.MONGO_URI)
  .then((instance) => {
    console.log("Database connected successfully!");
  })
  .catch((error) => {
    console.log(error);
  });

// Server Configuration
// todo: setup process.env for production
let server;
if (process.env.NODE_ENV === "production") {
  console.log(process.env.NODE_ENV);
  const options = {
    key: fs.readFileSync("./private.key"),
    cert: fs.readFileSync("./certificate.crt"),
  };
  server = https.createServer(options, app).listen(process.env.PORT, () => {
    console.log(`HTTPS Server listening on PORT: ${process.env.PORT}`);
  });
} else {
  server = app.listen(process.env.PORT, () => {
    console.log(`HTTP Server listening on PORT: ${process.env.PORT}`);
  });
  //   console.log(process.env.NODE_ENV)
}

const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

require("./src/utils/socket")(io);

const shutdown = () => {
  server.close;
};

app.get("/api/v1/server/shutdown", shutdown);

/* app.listen(process.env.PORT, () => {
  console.log(`Server listening on PORT: ${process.env.PORT}`);
}); */
