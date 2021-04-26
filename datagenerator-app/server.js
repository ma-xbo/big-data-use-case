const express = require("express");
const path = require("path");
const cors = require("cors");
const serviceRouter = require("./server-routes/service-router");
const ordersRouter = require("./server-routes/orders-router");
const masterdataRouter = require("./server-routes/masterdata-router");

// ------------------------------------------------------------
// Express Server
// ------------------------------------------------------------

const app = express();
const port = 3000;

// Aktivieren von CORS für die React App auf Port 3000
// Die React Build Version läuft über Port 3000 und muss nicht über CORS freigegeben werden
const corsOptions = {
  origin: "http://localhost:3001",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());

// Bereitstellen der statischen Dateien der gebuildeteten React App (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "client/build")));

// Bereitstellen der Router
app.use("/api/service", serviceRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/masterdata", masterdataRouter);

// Behandelt alle Anfragen, die nicht mit den oben genannten übereinstimmen
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

// Starten der App
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
