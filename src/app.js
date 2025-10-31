import express from "express";
import cors from "cors";


const app = express();
//middleware configs
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//cors config
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));

//import routes
import healthCheckRouter  from "./routes/healthCheck.routes.js";

app.use("/api/v1/healthcheck", healthCheckRouter);



app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
