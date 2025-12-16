const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to register");
    }

    // Alert sukses
    document.getElementById("alertPlaceholder").innerHTML = `
      <div class="alert alert-success">Registration successful! <a href="/login">Login here</a></div>
    `;
    registerForm.reset();
  } catch (err) {
    document.getElementById("alertPlaceholder").innerHTML = `
      <div class="alert alert-danger">${err.message}</div>
    `;
  }
});
