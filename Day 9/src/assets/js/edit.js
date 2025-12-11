// Ambil ID project yang mau diedit
const editId = parseInt(localStorage.getItem("editId"));

// Ambil semua project
let projects = JSON.parse(localStorage.getItem("projects")) || [];

// Cari project
let project = projects.find((p) => p.id === editId);

if (!project) {
  alert("Project not found");
  window.location.href = "/my-project";
}

// Ambil elemen
const nameInput = document.getElementById("projectName");
const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");
const descInput = document.getElementById("descriptionText");
const imageInput = document.getElementById("projectImage");
const previewImg = document.getElementById("previewImage");

// LOAD DATA
nameInput.value = project.subject;
startInput.value = project.startDate;
endInput.value = project.endDate;
descInput.value = project.description;
previewImg.src = project.imageBase64 || "";

if (Array.isArray(project.tech)) {
  project.tech.forEach((t) => {
    const cb = document.querySelector(`input[value="${t}"]`);
    if (cb) cb.checked = true;
  });
}

let newTech = [];

// ========== FIXED SUBMIT EVENT ONLY ONCE ==========
document.getElementById("editForm").addEventListener("submit", (e) => {
  e.preventDefault();

  // Ambil teknologi
  newTech = [];
  document
    .querySelectorAll("input[type='checkbox']:checked")
    .forEach((cb) => newTech.push(cb.value));

  // Cek gambar baru
  if (imageInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function (ev) {
      saveEdit(ev.target.result);
      showSaveAlert();
    };
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    saveEdit(project.imageBase64);
    showSaveAlert();
  }
});

// ========== saveEdit TANPA REDIRECT ==========
function saveEdit(imageBase64) {
  project.subject = nameInput.value;
  project.startDate = startInput.value;
  project.endDate = endInput.value;
  project.description = descInput.value;
  project.tech = newTech;
  project.imageBase64 = imageBase64;

  const index = projects.findIndex((p) => p.id === editId);
  projects[index] = project;

  localStorage.setItem("projects", JSON.stringify(projects));
}

// ========== ALERT MUNCUL + REDIRECT ==========
function showSaveAlert() {
  const alertPlaceholder = document.getElementById("alertPlaceholder");

  alertPlaceholder.innerHTML = `
    <div class="alert alert-info alert-dismissible fade show shadow-sm" role="alert">
      <i class="bi bi-check-circle-fill me-2"></i>
      Your project has been updated successfully!
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;

  // Auto-close setelah 1.5 detik lalu pindah halaman
  setTimeout(() => {
    document.querySelector(".alert")?.classList.remove("show");

    setTimeout(() => {
      window.location.href = "/my-project";
    }, 300);
  }, 1000);
}
