// ===============================
// GLOBAL ELEMENTS
// ===============================
const submitAct = document.getElementById("addProjects");
const projectsContainer = document.getElementById("projectsContainer");

// Global delete state (used by modal)
let pendingDeleteId = null;
let pendingDeleteCard = null;

// ===============================
// HELPER FUNCTIONS
// ===============================

// Truncate description to limited words
function truncateDescription(text, wordLimit = 10) {
  if (!text) return "";
  const words = text.split(" ");
  return words.length <= wordLimit
    ? text
    : words.slice(0, wordLimit).join(" ") + "…";
}

// ===============================
// BUILD PROJECT CARD
// ===============================
function buildCard({
  id,
  imageSrc = "",
  formprojectName = "",
  formdescriptionText = "",
  formstartDate = "",
  formendDate = "",
  technologies = [],
}) {
  const col = document.createElement("div");
  col.className = "col-md-4 mb-4";

  const card = document.createElement("div");
  card.className = "card h-100 shadow";
  card.style.cursor = "pointer";

  const img = document.createElement("img");
  img.className = "card-img-top";
  img.style.objectFit = "cover";
  img.style.maxHeight = "200px";
  img.src = imageSrc || "https://placehold.co/300x200?text=No+Image";

  const body = document.createElement("div");
  body.className = "card-body";

  const title = document.createElement("h5");
  title.className = "card-title";
  title.textContent = formprojectName || "Untitled Project";

  const meta = document.createElement("p");
  meta.className = "card-text text-muted";
  meta.textContent = `${formatDate(formstartDate)} — ${formatDate(
    formendDate
  )} · ${Array.isArray(technologies) ? technologies.join(", ") : technologies}`;

  const desc = document.createElement("p");
  desc.className = "card-text";
  desc.textContent = truncateDescription(formdescriptionText);

  const btnGroup = document.createElement("div");
  btnGroup.className = "d-flex gap-2 mt-2";

  const editBtn = document.createElement("button");
  editBtn.className = "btn btn-sm btn-warning";
  editBtn.textContent = "Edit";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-sm btn-danger";
  deleteBtn.textContent = "Delete";

  btnGroup.append(editBtn, deleteBtn);
  body.append(title, meta, desc, btnGroup);
  card.append(img, body);
  col.append(card);
  projectsContainer.append(col);

  // EVENTS
  card.addEventListener("click", () => {
    window.location.href = `/description?id=${id}`;
  });

  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    window.location.href = `/edit?id=${id}`;
  });

  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    pendingDeleteId = id;
    pendingDeleteCard = col;
    new bootstrap.Modal(document.getElementById("confirmDeleteModal")).show();
  });
}

// ===============================
// DELETE CONFIRM MODAL HANDLER
// ===============================
document
  .getElementById("confirmDeleteBtn")
  .addEventListener("click", async () => {
    if (!pendingDeleteId) return;

    try {
      await fetch(`http://localhost:3000/projects/${pendingDeleteId}`, {
        method: "DELETE",
      });

      // Remove card from UI
      pendingDeleteCard.remove();
      showBootstrapAlert("Project deleted successfully!", "warning");
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete project");
    }

    // Reset state
    pendingDeleteId = null;
    pendingDeleteCard = null;

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("confirmDeleteModal")
    );
    modal.hide();
  });

// ===============================
// FORM SUBMIT (CREATE PROJECT)
// ===============================
submitAct.addEventListener("submit", (e) => {
  e.preventDefault();

  const technologies = [];
  if (reactJS.checked) technologies.push("React");
  if (vueJS.checked) technologies.push("Vue");
  if (nodeJS.checked) technologies.push("Node");
  if (nextJS.checked) technologies.push("Next");

  const imageFile = projectImage.files[0];
  const reader = new FileReader();

  reader.onload = async (e) => {
    const payload = {
      subject: projectName.value,
      start_date: startDate.value,
      end_date: endDate.value,
      description: descriptionText.value,
      image_base64: e.target.result || "",
      technologies,
    };

    try {
      await fetch("http://localhost:3000/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      submitAct.reset();
      fetchProjects();
    } catch (err) {
      console.error("Create project failed", err);
    }
  };

  // Handle image or no image
  if (imageFile) {
    reader.readAsDataURL(imageFile);
  } else {
    reader.onload({ target: { result: "" } });
  }
});

// ===============================
// FETCH & RENDER PROJECTS
// ===============================
window.addEventListener("DOMContentLoaded", fetchProjects);

async function fetchProjects() {
  try {
    projectsContainer.innerHTML =
      "<p class='text-center text-muted'>Loading projects...</p>";

    const res = await fetch("http://localhost:3000/projects");
    const projects = await res.json();

    projectsContainer.innerHTML = "";

    if (projects.length === 0) {
      projectsContainer.innerHTML =
        "<p class='text-center text-muted'>No projects found</p>";
      return;
    }

    projects.forEach((proj) => {
      buildCard({
        id: proj.id,
        imageSrc: proj.image_base64,
        formprojectName: proj.subject,
        formdescriptionText: proj.description,
        formstartDate: proj.start_date,
        formendDate: proj.end_date,
        technologies: proj.technologies?.join(", "),
      });
    });
  } catch (err) {
    console.error("Failed to load projects", err);
  }
}

// ===============================
// HELPER FORMAT DATE
// ===============================

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
