// Get form and container
const submitAct = document.getElementById("addProjects");
const projectsContainer = document.getElementById("projectsContainer");

// --- Helper: truncate description to 10 words ---
function truncateDescription(text, wordLimit = 10) {
  if (!text) return "";
  const words = text.split(" ");
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(" ") + "…";
}

// Helper Format Date
function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toISOString().split("T")[0];
}

// --- Build Card Function ---
function buildCard({
  id,
  imageSrc = "",
  formprojectName = "",
  formdescriptionText = "",
  formstartDate = "",
  formendDate = "",
  technologies = "",
}) {
  // Column wrapper for Bootstrap grid
  const col = document.createElement("div");
  col.className = "col-md-4 mb-4";

  // Card container
  const card = document.createElement("div");
  card.className = "card h-100 shadow";
  card.style.cursor = "pointer";
  card.style.marginLeft = "20px";
  card.style.marginRight = "20px";

  // Image
  const img = document.createElement("img");
  img.className = "card-img-top border";
  img.style.borderColor = "#d4e1e2";
  img.style.borderWidth = "4px";
  img.style.borderStyle = "solid";
  img.style.objectFit = "cover";
  img.style.maxHeight = "200px";
  img.src = imageSrc
    ? `/uploads/${imageSrc}`
    : "https://placehold.co/300x200?text=No+Image";

  // Card body
  const body = document.createElement("div");
  body.className = "card-body";

  const h5 = document.createElement("h5");
  h5.className = "card-title";
  h5.textContent = formprojectName || "Untitled Project";

  const meta = document.createElement("p");
  meta.className = "card-text text-muted";
  meta.textContent = `${formatDate(formstartDate)} — ${formatDate(
    formendDate
  )} · ${technologies || ""}`;

  const desc = document.createElement("p");
  desc.className = "card-text";
  desc.textContent = truncateDescription(formdescriptionText, 10);

  // Buttons
  const btnGroup = document.createElement("div");
  btnGroup.className = "mt-2 d-flex gap-2";

  const editBtn = document.createElement("button");
  editBtn.className = "btn btn-sm btn-warning";
  editBtn.textContent = "Edit";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-sm btn-danger";
  deleteBtn.textContent = "Delete";

  btnGroup.appendChild(editBtn);
  btnGroup.appendChild(deleteBtn);

  // Assemble card
  body.appendChild(h5);
  body.appendChild(meta);
  body.appendChild(desc);
  body.appendChild(btnGroup);

  card.appendChild(img);
  card.appendChild(body);
  col.appendChild(card);

  projectsContainer.appendChild(col);

  // --- CARD Event Listeners ---
  card.addEventListener("click", () => {
    window.location.href = `/description?id=${id}`;
  });

  // ID For Projects to  deleted
  let pendingDeleteId = null;
  let pendingDeleteCard = null;

  // Delete Button
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    // Simpan ID dan element card yang mau dihapus
    pendingDeleteId = id;
    pendingDeleteCard = col;

    // Tampilkan modal
    const modal = new bootstrap.Modal(
      document.getElementById("confirmDeleteModal")
    );
    modal.show();
  });

  document
    .getElementById("confirmDeleteBtn")
    .addEventListener("click", async () => {
      if (pendingDeleteId !== null) {
        // Delete from database
        await fetch(`/api/projects/${pendingDeleteId}`, {
          method: "DELETE",
        });

        // Delete from view Add Project
        if (pendingDeleteCard) {
          pendingDeleteCard.remove();
        }

        // Reset
        pendingDeleteId = null;
        pendingDeleteCard = null;

        // Close modal
        const modalElement = document.getElementById("confirmDeleteModal");
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();

        // alert Bootstrap
        showBootstrapAlert("Project berhasil dihapus!", "warning");
      }
    });

  // Edit Button
  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    window.location.href = `edit?id=${id}`;
  });
}

// --- Handle Form Submit ---
submitAct.addEventListener("submit", async function (e) {
  e.preventDefault();

  const formprojectName = document.getElementById("projectName").value;
  const formstartDate = document.getElementById("startDate").value;
  const formendDate = document.getElementById("endDate").value;
  const formdescriptionText = document.getElementById("descriptionText").value;
  const formprojectImage = document.getElementById("projectImage");
  const imageUpload = formprojectImage?.files?.[0] || null;

  const technologies = [];
  if (document.getElementById("reactJS")?.checked)
    technologies.push("React.js");
  if (document.getElementById("vueJS")?.checked) technologies.push("Vue.js");
  if (document.getElementById("else")?.checked) technologies.push("Else");
  if (document.getElementById("nodeJS")?.checked) technologies.push("Node.js");
  if (document.getElementById("nextJS")?.checked) technologies.push("Next.js");

  const formData = new FormData();
  formData.append("subject", formprojectName);
  formData.append("startDate", formstartDate);
  formData.append("endDate", formendDate);
  formData.append("description", formdescriptionText);
  formData.append("technologies", JSON.stringify(technologies));

  if (imageUpload) {
    formData.append("image", imageUpload);
  }

  // POST FIRST
  const res = await fetch("/api/projects", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    alert("Failed to save project");
    return;
  }

  const savedProject = await res.json();

  // BUILD CARD FROM DATABASE RESULT
  buildCard({
    id: savedProject.id,
    imageSrc: savedProject.image,
    formprojectName: savedProject.subject,
    formdescriptionText: savedProject.description,
    formstartDate: savedProject.start_date,
    formendDate: savedProject.end_date,
    technologies: Array.isArray(savedProject.technologies)
      ? savedProject.technologies.join(", ")
      : "",
  });

  submitAct.reset();
});

// --- Load Projects from Database on page load ---
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/api/projects");
    const projects = await res.json();

    if (!projects || projects.length === 0) {
      projectsContainer.innerHTML =
        "<p class='text-center text-muted'>No projects yet. Add one above!</p>";
      return;
    }

    projects.forEach((proj) => {
      buildCard({
        id: proj.id,
        imageSrc: proj.image || "",
        formprojectName: proj.subject || "",
        formdescriptionText: proj.description || "",
        formstartDate: proj.start_date || "",
        formendDate: proj.end_date || "",
        technologies: Array.isArray(proj.technologies)
          ? proj.technologies.join(", ")
          : "",
      });
    });
  } catch (err) {
    console.error("Failed to fetch projects from database:", err);
    projectsContainer.innerHTML =
      "<p class='text-center text-danger'>Failed to load projects.</p>";
  }
});
