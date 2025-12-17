// ========== Get project ID from URL ==========
const params = new URLSearchParams(window.location.search);
const editId = params.get("id");

// ========== Get form elements ==========
const nameInput = document.getElementById("projectName");
const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");
const descInput = document.getElementById("descriptionText");
const imageInput = document.getElementById("projectImage");
const previewImg = document.getElementById("previewImage");

// ========== Load project data from API ==========
async function loadProject() {
  try {
    const res = await fetch(`/api/projects/${editId}`);
    if (!res.ok) throw new Error("Project not found");
    const project = await res.json();

    // Fill the form fields
    nameInput.value = project.subject || "";
    startInput.value = project.start_date || "";
    endInput.value = project.end_date || "";
    descInput.value = project.description || "";

    // === Preview image ===
    if (project.image) {
      previewImg.src = `/uploads/${project.image}`;
    }

    // Fill checkboxes
    if (Array.isArray(project.technologies)) {
      project.technologies.forEach((tech) => {
        const cb = document.querySelector(
          `input[type="checkbox"][value="${tech}"]`
        );
        if (cb) cb.checked = true;
      });
    }

    return project;
  } catch (err) {
    alert("Project not found or failed to fetch data");
    window.location.href = "/my-project";
  }
}

// ========== Handle form submission ==========
document.getElementById("editForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get selected technologies
  const newTech = [];
  document
    .querySelectorAll("input[type='checkbox']:checked")
    .forEach((cb) => newTech.push(cb.value));

  // Handle image upload
  const formData = new FormData();

  formData.append("subject", nameInput.value);
  formData.append("description", descInput.value);
  formData.append("technologies", JSON.stringify(newTech));

  if (startInput.value) {
    formData.append("start_date", startInput.value);
  }

  if (endInput.value) {
    formData.append("end_date", endInput.value);
  }

  if (imageInput.files.length > 0) {
    formData.append("image", imageInput.files[0]);
  }

  // FETCH PUT multipart
  const res = await fetch(`/api/projects/${editId}`, {
    method: "PUT",
    body: formData,
  });
  if (res.ok) {
    showSaveAlert();
  } else {
    alert("Failed to update project");
  }
});

// ========== Alert function ==========
function showSaveAlert() {
  const alertPlaceholder = document.getElementById("alertPlaceholder");

  alertPlaceholder.innerHTML = `
    <div class="alert alert-info alert-dismissible fade show shadow-sm" role="alert">
      <i class="bi bi-check-circle-fill me-2"></i>
      Your project has been updated successfully!
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;

  // Auto-close after 1 second and redirect
  setTimeout(() => {
    document.querySelector(".alert")?.classList.remove("show");
    setTimeout(() => {
      window.location.href = "/my-project";
    }, 300);
  }, 1000);
}

// ========== Initialize page ==========
let projectData;
window.addEventListener("DOMContentLoaded", async () => {
  projectData = await loadProject();
});
