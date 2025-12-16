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
    if (project.image_base64) {
      previewImg.src = project.image_base64;
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
  let base64 = previewImg.src || "";
  if (imageInput.files.length > 0) {
    base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(imageInput.files[0]);
    });
  }

  // Prepare payload
  const payload = {
    subject: nameInput.value,
    start_date: startInput.value || null,
    end_date: endInput.value || null,
    description: descInput.value,
    technologies: newTech,
    image_base64: base64,
  };

  // Send PUT request to update project
  try {
    const res = await fetch(`/api/projects/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to update project");

    showSaveAlert();
  } catch (err) {
    alert("Failed to save project changes: " + err.message);
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
