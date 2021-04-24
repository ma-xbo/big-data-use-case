const express = require("express");
const path = require('path');
const apiRouter = require('./router');

const app = express();
const port = 5000;

app.use(express.json());

// Bereitstellen der statischen Dateien der gebuildeteten React App (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "client/build")));

// Bereitstellen der Router
app.use('/api', apiRouter);

// Behandelt alle Anfragen, die nicht mit den oben genannten übereinstimmen
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

// Starten der App
app.listen(port, () => {
  console.log(`Web app listening at http://localhost:${port}`);
});
