document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("id");

  if (!projectId) return;

  try {
    const res = await fetch(`http://localhost:3000/projects/${projectId}`);
    const project = await res.json();

    // Title
    document.getElementById("detailTitle").textContent = project.subject;

    // Image
    document.getElementById("detailImage").src =
      project.image_base64 || "https://placehold.co/400x240?text=No+Image";

    // Dates
    document.getElementById("detailDates").textContent = `
      ${formatDate(project.start_date)} — ${formatDate(project.end_date)}
    `;

    // Technologies
    // Technologies (string only)
    const techEl = document.getElementById("detailTech");

    if (
      Array.isArray(project.technologies) &&
      project.technologies.length > 0
    ) {
      techEl.textContent = project.technologies.join(", ");
    } else {
      techEl.textContent = "-";
    }

    // Description
    document.getElementById("detailDescription").textContent =
      project.description;
  } catch (error) {
    console.error("Failed to load project detail", error);
  }
});

// Helper
function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
