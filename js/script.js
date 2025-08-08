// To accesss a global variable
const form = document.getElementById("dataForm");
const tableBody = document.querySelector("#dataTable tbody");
form.addEventListener("submit", function (e) {
  e.preventDefault();
  // Document Object Model (DOM) Element to get form values
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const age = document.getElementById("age").value.trim();
  const address = document.getElementById("address").value.trim();
  if (name && email && age && address) {
    // To create element in DOM
    const row = document.createElement("tr");
    row.innerHTML = `
          <td data-label="Name">${name}</td>
          <td data-label="Email">${email}</td>
          <td data-label="Age">${age}</td>
          <td data-label="Address">${address}</td>
        `;
    tableBody.appendChild(row);
    form.reset(); // Clear the form
  }
});
