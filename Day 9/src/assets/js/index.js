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
  img.src = imageSrc || "https://placehold.co/300x200?text=No+Image";

  // Card body
  const body = document.createElement("div");
  body.className = "card-body";

  const h5 = document.createElement("h5");
  h5.className = "card-title";
  h5.textContent = formprojectName || "Untitled Project";

  const meta = document.createElement("p");
  meta.className = "card-text text-muted";
  meta.textContent = `${formstartDate || "-"} — ${formendDate || "-"} · ${
    technologies || ""
  }`;

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

  // --- Event Listeners ---
  card.addEventListener("click", () => {
    localStorage.setItem(
      "selectedProject",
      JSON.stringify({
        id,
        subject: formprojectName,
        startDate: formstartDate,
        endDate: formendDate,
        description: formdescriptionText,
        tech: technologies,
        imageBase64: imageSrc,
      })
    );
    window.location.href = `description?id=${id}`;
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

  document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
    if (pendingDeleteId !== null) {
      // Hapus dari localStorage
      let projects = JSON.parse(localStorage.getItem("projects")) || [];
      projects = projects.filter((p) => p.id !== pendingDeleteId);
      localStorage.setItem("projects", JSON.stringify(projects));

      // Hapus card dari tampilan
      if (pendingDeleteCard) {
        pendingDeleteCard.remove();
      }

      // Reset
      pendingDeleteId = null;
      pendingDeleteCard = null;

      // Tutup modal
      const modalElement = document.getElementById("confirmDeleteModal");
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance.hide();

      // OPTIONAL: alert Bootstrap
      showBootstrapAlert("Project berhasil dihapus!", "warning");
    }
  });

  // Edit Button
  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    localStorage.setItem("editId", id);
    window.location.href = `edit?id=${id}`;
  });
}

// --- Handle Form Submit ---
submitAct.addEventListener("submit", function (e) {
  e.preventDefault();

  const formprojectName = document.getElementById("projectName").value;
  const formstartDate = document.getElementById("startDate").value;
  const formendDate = document.getElementById("endDate").value;
  const formdescriptionText = document.getElementById("descriptionText").value;
  const formprojectImage = document.getElementById("projectImage");

  const imageUpload = formprojectImage?.files?.[0] || null;

  const technologies = [];
  if (document.getElementById("reactJS").checked) technologies.push("React.js");
  if (document.getElementById("vueJS").checked) technologies.push("Vue.js");
  if (document.getElementById("else").checked) technologies.push("Else");
  if (document.getElementById("nodeJS").checked) technologies.push("Node.js");
  if (document.getElementById("nextJS").checked) technologies.push("Next.js");

  const techText = technologies.join(", ");
  const id = Date.now();

  if (imageUpload) {
    const reader = new FileReader();
    reader.onload = function (ev) {
      const base64 = ev.target.result;

      buildCard({
        id,
        imageSrc: base64,
        formprojectName,
        formdescriptionText,
        formstartDate,
        formendDate,
        technologies: techText,
      });

      saveProject({
        id,
        subject: formprojectName,
        startDate: formstartDate,
        endDate: formendDate,
        tech: technologies,
        description: formdescriptionText,
        imageBase64: base64,
      });
    };
    reader.readAsDataURL(imageUpload);
  } else {
    buildCard({
      id,
      imageSrc: "",
      formprojectName,
      formdescriptionText,
      formstartDate,
      formendDate,
      technologies: techText,
    });

    saveProject({
      id,
      subject: formprojectName,
      startDate: formstartDate,
      endDate: formendDate,
      tech: technologies,
      description: formdescriptionText,
      imageBase64: "",
    });
  }

  submitAct.reset();
});

// --- Save Project Helper ---
function saveProject(datas) {
  const projects = JSON.parse(localStorage.getItem("projects")) || [];
  projects.push(datas);
  localStorage.setItem("projects", JSON.stringify(projects));
}

// --- Load Projects from dummyData + localStorage on page load ---
window.addEventListener("DOMContentLoaded", async () => {
  let dummyProjects = [];

  try {
    const res = await fetch("/api/projects");
    dummyProjects = await res.json();
  } catch (err) {
    console.error("Failed to fetch dummy projects:", err);
  }

  const localProjects = JSON.parse(localStorage.getItem("projects")) || [];

  const allProjects = [...dummyProjects, ...localProjects];

  if (allProjects.length === 0) {
    projectsContainer.innerHTML =
      "<p class='text-center text-muted'>No projects yet. Add one above!</p>";
    return;
  }

  allProjects.forEach((proj) => {
    buildCard({
      id: proj.id,
      imageSrc: proj.imageBase64 || "",
      formprojectName: proj.subject || "",
      formdescriptionText: proj.description || "",
      formstartDate: proj.startDate || "",
      formendDate: proj.endDate || "",
      technologies: Array.isArray(proj.tech)
        ? proj.tech.join(", ")
        : proj.tech || "",
    });
  });
});
