const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to login");
    }

    window.location.href = "/home";
  } catch (err) {
    document.getElementById("alertPlaceholder").innerHTML = `
      <div class="alert alert-danger">${err.message}</div>
    `;
  }
});
