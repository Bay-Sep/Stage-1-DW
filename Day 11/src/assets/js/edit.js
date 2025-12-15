// ===============================
// GET PROJECT ID FROM URL
// ===============================
const params = new URLSearchParams(window.location.search);
const projectId = params.get("id");

if (!projectId) {
  alert("Invalid project ID");
  window.location.href = "/my-project";
}

// ===============================
// FORM ELEMENTS
// ===============================
const form = document.getElementById("editForm");
const projectNameInput = document.getElementById("projectName");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const descriptionInput = document.getElementById("descriptionText");
const imageInput = document.getElementById("projectImage");
const previewImage = document.getElementById("previewImage");

// ===============================
// LOAD PROJECT DATA
// ===============================
async function loadProject() {
  try {
    const res = await fetch(`http://localhost:3000/projects/${projectId}`);
    if (!res.ok) throw new Error("Project not found");

    const project = await res.json();

    // Fill basic fields
    projectNameInput.value = project.subject || "";
    startDateInput.value = project.start_date || "";
    endDateInput.value = project.end_date || "";
    descriptionInput.value = project.description || "";
    previewImage.src = project.image_base64 || "";

    // Check technologies by NAME
    if (Array.isArray(project.technologies)) {
      project.technologies.forEach((techName) => {
        const checkbox = document.querySelector(
          `input[type="checkbox"][value="${techName}"]`
        );
        if (checkbox) checkbox.checked = true;
      });
    }
  } catch (error) {
    console.error(error);
    alert("Failed to load project");
    window.location.href = "/my-project";
  }
}

// ===============================
// HANDLE FORM SUBMIT (UPDATE)
// ===============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Collect selected technologies (NAME)
  const technologies = [];
  document
    .querySelectorAll('input[type="checkbox"]:checked')
    .forEach((cb) => technologies.push(cb.value));

  // Handle image upload
  if (imageInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      await updateProject(ev.target.result, technologies);
      showSuccessAlert();
    };
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    await updateProject(previewImage.src, technologies);
    showSuccessAlert();
  }
});

// ===============================
// SEND PUT REQUEST TO BACKEND
// ===============================
async function updateProject(imageBase64, technologies) {
  const payload = {
    subject: projectNameInput.value,
    start_date: startDateInput.value,
    end_date: endDateInput.value,
    description: descriptionInput.value,
    image_base64: imageBase64 || "",
    technologies, // ARRAY OF TECHNOLOGY NAME
  };

  try {
    const res = await fetch(`http://localhost:3000/projects/${projectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Update failed");
  } catch (error) {
    console.error(error);
    alert("Failed to update project");
  }
}

// ===============================
// SUCCESS ALERT + REDIRECT
// ===============================
function showSuccessAlert() {
  const alertPlaceholder = document.getElementById("alertPlaceholder");

  alertPlaceholder.innerHTML = `
    <div class="alert alert-success alert-dismissible fade show shadow-sm" role="alert">
      <strong>Success!</strong> Project updated successfully.
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;

  setTimeout(() => {
    window.location.href = "/my-project";
  }, 1200);
}

// ===============================
// INIT
// ===============================
loadProject();
