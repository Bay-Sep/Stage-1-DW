const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

const pool = require("./db");

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.set("view engine", "hbs");
app.set("views", "./src/views");
app.use("/assets", express.static("./src/assets"));

// ===============================
// CRUD API
// ===============================

// READ all projects
app.get("/projects", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.subject,
        p.start_date,
        p.end_date,
        p.description,
        p.image_base64,
        ARRAY_AGG(t.name) AS technologies
      FROM projects p
      LEFT JOIN project_technologies pt ON p.id = pt.project_id
      LEFT JOIN technologies t ON pt.technology_id = t.id
      GROUP BY p.id
      ORDER BY p.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

app.get("/projects/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        p.*,
        ARRAY_AGG(t.name) AS technologies
      FROM projects p
      LEFT JOIN project_technologies pt ON p.id = pt.project_id
      LEFT JOIN technologies t ON pt.technology_id = t.id
      WHERE p.id = $1
      GROUP BY p.id
      `,
      [id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch project" });
  }
});

// CREATE project
app.post("/projects", async (req, res) => {
  const {
    subject,
    start_date,
    end_date,
    description,
    image_base64,
    technologies = [],
  } = req.body;

  try {
    const projectResult = await pool.query(
      `
      INSERT INTO projects (subject, start_date, end_date, description, image_base64)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [subject, start_date, end_date, description, image_base64]
    );

    const projectId = projectResult.rows[0].id;

    for (const techId of technologies) {
      await pool.query(
        `
        INSERT INTO project_technologies (project_id, technology_id)
        VALUES ($1, $2)
        `,
        [projectId, techId]
      );
    }

    res.json({ message: "Project created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create project" });
  }
});

// GET single project by ID
app.get("/projects/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.subject,
        p.start_date,
        p.end_date,
        p.description,
        p.image_base64,
        COALESCE(ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS technologies
      FROM projects p
      LEFT JOIN project_technologies pt ON p.id = pt.project_id
      LEFT JOIN technologies t ON pt.technology_id = t.id
      WHERE p.id = $1
      GROUP BY p.id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch project detail" });
  }
});

// UPDATE project
app.put("/projects/:id", async (req, res) => {
  const { id } = req.params;
  const {
    subject,
    start_date,
    end_date,
    description,
    image_base64,
    technologies = [],
  } = req.body;

  try {
    // 1. Update main project
    await pool.query(
      `
      UPDATE projects
      SET subject=$1, start_date=$2, end_date=$3, description=$4, image_base64=$5
      WHERE id=$6
      `,
      [subject, start_date, end_date, description, image_base64, id]
    );

    // 2. Remove old technologies
    await pool.query("DELETE FROM project_technologies WHERE project_id = $1", [
      id,
    ]);

    // 3. Insert new technologies (by NAME)
    for (const techName of technologies) {
      const techRes = await pool.query(
        "SELECT id FROM technologies WHERE name = $1",
        [techName]
      );

      if (techRes.rows.length > 0) {
        await pool.query(
          `
          INSERT INTO project_technologies (project_id, technology_id)
          VALUES ($1, $2)
          `,
          [id, techRes.rows[0].id]
        );
      }
    }

    res.json({ message: "Project updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update project" });
  }
});

// DELETE project
app.delete("/projects/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM project_technologies WHERE project_id = $1", [
      id,
    ]);
    await pool.query("DELETE FROM projects WHERE id = $1", [id]);

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete project" });
  }
});

// ===============================
// VIEW ROUTES (HBS)
// ===============================
app.get("/home", (req, res) => res.render("index"));
app.get("/my-project", (req, res) => res.render("my-project"));
app.get("/contact", (req, res) => res.render("contact"));
app.get("/description", (req, res) => res.render("description"));
app.get("/edit", (req, res) => res.render("edit"));

// ===============================
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
