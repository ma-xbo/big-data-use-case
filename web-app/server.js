const express = require("express");
const app = express();
const port = 3001;

app.use(express.json());

// Bereitstellen der statischen Dateien (HTML, CSS, JS), die für die Darstellung der Webseite genutzt werden
app.use("/", express.static("www"));
app.use("/lib", express.static("node_modules"));

// Starten der App
app.listen(port, () => {
  console.log(`Web app listening at http://localhost:${port}`);
});
