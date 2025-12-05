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
    window.location.href = "description.html";
  });

  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    col.remove();
    let projects = JSON.parse(localStorage.getItem("projects")) || [];
    projects = projects.filter((p) => p.id !== id);
    localStorage.setItem("projects", JSON.stringify(projects));

    if (projects.length === 0) {
      projectsContainer.innerHTML =
        "<p class='text-center text-muted'>No projects yet. Add one above!</p>";
    }
  });

  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("projectName").value = formprojectName;
    document.getElementById("startDate").value = formstartDate;
    document.getElementById("endDate").value = formendDate;
    document.getElementById("descriptionText").value = formdescriptionText;
    // TODO: set checkboxes based on technologies string/array
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

// --- Load Projects from localStorage on page load ---
window.addEventListener("DOMContentLoaded", () => {
  const projects = JSON.parse(localStorage.getItem("projects")) || [];
  if (projects.length === 0) {
    projectsContainer.innerHTML =
      "<p class='text-center text-muted'>No projects yet. Add one above!</p>";
  } else {
    projects.forEach((proj) => {
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
  }
});
