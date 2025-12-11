const submitAct = document.getElementById("addProjects");

submitAct.addEventListener("submit", function (e) {
  const formprojectName = document.getElementById("projectName").value;
  const formstartDate = document.getElementById("startDate").value;
  const formendDate = document.getElementById("endDate").value;
  const formdescriptionText = document.getElementById("descriptionText").value;
  const formprojectImage = document.getElementById("projectImage").files[0];

  const technologies = [];
  if (document.getElementById("reactJS").checked) technologies.push("React.js");
  if (document.getElementById("vueJS").checked) technologies.push("Vue.js");
  if (document.getElementById("else").checked) technologies.push("Else");
  if (document.getElementById("nodeJS").checked) technologies.push("Node.js");
  if (document.getElementById("nextJS").checked) technologies.push("Next.js");

  const text1 = `Project Name: ${formprojectName}`;
  const text2 = `Description: ${formdescriptionText}`;

  document.getElementById("projectNameAdded").innerHTML = text1;
  document.getElementById("descriptionTextAdded").innerHTML = text2;
  e.preventDefault();

  console.table([
    { label: "Project Name", value: formprojectName },
    { label: "Start Date", value: formstartDate },
    { label: "End Date", value: formendDate },
    { label: "Description", value: formdescriptionText },
    { label: "File", value: formprojectImage },
    { label: "Technologies", value: technologies.join(", ") },
  ]);
});
