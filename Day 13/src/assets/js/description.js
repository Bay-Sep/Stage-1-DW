const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function loadDetail() {
  try {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) throw new Error("Failed");

    const project = await res.json();

    document.getElementById("detailTitle").textContent = project.subject || "-";

    document.getElementById("detailDates").textContent = `${formatDate(
      project.start_date
    )} - ${formatDate(project.end_date)}`;

    document.getElementById("detailTech").textContent = Array.isArray(
      project.technologies
    )
      ? project.technologies.join(", ")
      : "-";

    document.getElementById("detailDescription").textContent =
      project.description || "-";

    document.getElementById("detailImage").src = project.image
      ? `/uploads/${project.image}`
      : "https://placehold.co/600x400?text=No+Image";
  } catch (err) {
    alert("Failed to load project detail");
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

window.addEventListener("DOMContentLoaded", loadDetail);
