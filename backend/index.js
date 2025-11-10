import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import trackerRoutes from "./routes/trackerRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());

process.env.PUPPETEER_SKIP_DOWNLOAD = true;

// ✅ Configure CORS properly for your Vercel frontend
app.use(cors({
  origin: ["https://pratham-kaushik.vercel.app"], // your frontend domain
  methods: ["GET", "POST"],
}));

// Routes
app.use("/api", trackerRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("🛒 E-Commerce Price Tracker Backend Running...");
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
