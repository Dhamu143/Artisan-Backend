console.log("server runing");

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminAuthRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const jobRoutes = require("./routes/jobRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const professionRouter = require("./routes/professionrouter");

const app = express();

// ----------- FIXED CORS ------------
app.use(
  cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------- MONGO CONNECTION -------
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
connectDB();

// ----------- ROUTES ----------------
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/professions", professionRouter);

app.get("/", (req, res) => {
  res.send("Backend Running.");
});

// ----------- START SERVER ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
