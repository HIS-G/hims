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

const file = fs.readFileSync("./DBE36D85EE856E805997FAD9F0105A8A.txt");

// Routes

const userRoutes = require("./src/routes/userRoute");

// middlewares
app.use(cors());
app.use(express.json());
app.use("/api/v1/users", userRoutes);
//app.use("")

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
