const express = require("express");
const pool = require("./db");
const bcrypt = require("bcrypt");
const session = require("express-session");
const authMiddleware = require("./auth");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "auth-for-project",
    resave: false,
    saveUninitialized: false,
  })
);
app.use((req, res, next) => {
  res.locals.isLogin = !!req.session.user;
  res.locals.user = req.session.user || null;
  next();
});

app.set("view engine", "hbs");
app.set("views", "./src/views");
app.use("", express.static("./src/assets"));

// ROUTE REGISTER
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // --- Basic validation ---
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // --- Check email already exists ---
    const checkUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (checkUser.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // --- Hash password ---
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- Insert user ---
    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ROUTE LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // find user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // === SET SESSION ===
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    // SAVE LOGIN STATE
    req.session.userId = user.id;
    req.session.userName = user.name;

    // login success
    res.json({
      success: true,
      message: "Login success",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ROUTE LOGOUT
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/home");
  });
});

// CREATE (add project)
app.post("/api/projects", authMiddleware, async (req, res) => {
  const { subject, startDate, endDate, tech, description, imageBase64 } =
    req.body;

  const result = await pool.query(
    `INSERT INTO projects 
     (subject, start_date, end_date, technologies, description, image_base64)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [subject, startDate, endDate, tech, description, imageBase64]
  );

  res.json(result.rows[0]);
});

// READ
app.get("/api/projects", authMiddleware, async (req, res) => {
  const result = await pool.query("SELECT * FROM projects ORDER BY id DESC");
  res.json(result.rows);
});

// READ BY ID
app.get("/api/projects/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projects WHERE id = $1", [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE
app.put("/api/projects/:id", authMiddleware, async (req, res) => {
  try {
    const {
      subject,
      start_date,
      end_date,
      description,
      technologies,
      image_base64,
    } = req.body;

    await pool.query(
      `
      UPDATE projects
      SET subject = $1,
          start_date = $2,
          end_date = $3,
          description = $4,
          technologies = $5,
          image_base64 = $6
      WHERE id = $7
      `,
      [
        subject,
        start_date,
        end_date,
        description,
        technologies,
        image_base64,
        req.params.id,
      ]
    );

    res.json({ message: "Project updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update project" });
  }
});

// DELETE
app.delete("/api/projects/:id", authMiddleware, async (req, res) => {
  await pool.query("DELETE FROM projects WHERE id=$1", [req.params.id]);
  res.json({ success: true });
});

// ROUTING
app.get("/home", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/my-project", authMiddleware, (req, res) => {
  res.render("my-project");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/description", (req, res) => {
  res.render("description");
});

app.get("/edit", authMiddleware, (req, res) => {
  res.render("edit");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
