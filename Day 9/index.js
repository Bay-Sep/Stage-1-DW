const express = require("express");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dummy database
let dummyData = [
  {
    id: 1,
    subject: "Portfolio Website",
    startDate: "2025-01-01",
    endDate: "2025-02-01",
    tech: ["React.js", "Node.js"],
    description: "Website portfolio lengkap dengan fitur projek.",
    imageBase64: "",
  },
  {
    id: 2,
    subject: "POS System",
    startDate: "2025-03-01",
    endDate: "2025-03-20",
    tech: ["Vue.js"],
    description: "Aplikasi POS sederhana untuk kafe.",
    imageBase64: "",
  },
];

app.get("/api/projects", (req, res) => {
  res.json(dummyData);
});

app.set("view engine", "hbs");
app.set("views", "./src/views");

app.use("/assets", express.static("./src/assets"));

app.get("/home", (req, res) => {
  res.render("index");
});

app.get("/my-project", (req, res) => {
  res.render("my-project");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/description", (req, res) => {
  res.render("description");
});

app.get("/edit", (req, res) => {
  res.render("edit");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
