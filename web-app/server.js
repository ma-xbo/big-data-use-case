const express = require("express");
const path = require("path");
const cors = require("cors");

const apiRouter = require("./router");
const maindataRouter = require("./server-routes/maindata-router");
const popularRouter = require("./server-routes/popular-router");
const ordersRouter = require("./server-routes/orders-router");

const app = express();
const port = 5000;

// Aktivieren von CORS für die React App auf Port 3000
// Die React Build Version läuft über Port 5000 und muss nicht über CORS freigegeben werden
const corsOptions = {
  origin: "http://localhost:5001",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

// Ermöglichen von JSON POST requests
app.use(express.json());

// Bereitstellen der statischen Dateien der gebuildeteten React App (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "client/build")));

// Bereitstellen der Router
//app.use("/api", apiRouter);
app.use("/api/maindata", maindataRouter);
app.use("/api/popular", popularRouter);
app.use("/api", ordersRouter);

// Behandelt alle Anfragen, die nicht mit den oben genannten übereinstimmen
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

// Starten der App
app.listen(port, () => {
  console.log(`Web app listening at http://localhost:${port}`);
});
