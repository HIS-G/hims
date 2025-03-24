require("dotenv").config();
const express = require("express");
const https = require("https");
const { default: mongoose } = require("mongoose");
const cors = require("cors");
const fs = require("fs");

const app = express();

const options = {
  key: fs.readFileSync("./private.key"),
  cert: fs.readFileSync("./certificate.crt"),
};

const corsOptions = {
  origin: ["https://hism.hismobiles.com", "http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://127.0.0.1:5173", "http://hism.edspare.com", "https://hism.edspare.com"], // Allow requests only from this domain
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"], // Allow only specific HTTP methods
  maxAge: 3600,
  //allowedHeaders: 'Content-Type,Authorization', // Allow only specific headers
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

// middlewares
app.options("*", cors());
app.use(cors(corsOptions));

app.use(express.json());
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

const server = https.createServer(options, app).listen(process.env.PORT, () => {
  console.log(`Server listening on PORT: ${process.env.PORT}`);
});

const shutdown = () => {
  server.close;
}; 

app.get("/api/v1/server/shutdown", shutdown);

/* app.listen(process.env.PORT, () => {
  console.log(`Server listening on PORT: ${process.env.PORT}`);
}); */
