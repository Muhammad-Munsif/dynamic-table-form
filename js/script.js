// DOM Elements
const form = document.getElementById("dataForm");
const tableBody = document.getElementById("tableBody");
const emptyState = document.getElementById("emptyState");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const formStatus = document.getElementById("formStatus");
const formStatusText = document.getElementById("formStatusText");
const submitBtnText = document.getElementById("submitBtnText");
const clearFormBtn = document.getElementById("clearForm");

// Stats elements
const totalUsersEl = document.getElementById("totalUsers");
const averageAgeEl = document.getElementById("averageAge");
const activeUsersEl = document.getElementById("activeUsers");
const inactiveUsersEl = document.getElementById("inactiveUsers");

// Theme toggle
const themeToggle = document.getElementById("themeToggle");
const html = document.documentElement;

// Form validation state
let isEditing = false;
let editRowIndex = -1;

// Initialize stats
updateStats();

// Theme toggle functionality
themeToggle.addEventListener("click", () => {
  const currentTheme = html.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", newTheme);

  const icon = themeToggle.querySelector("i");
  if (newTheme === "dark") {
    icon.className = "fas fa-sun";
    localStorage.setItem("theme", "dark");
  } else {
    icon.className = "fas fa-moon";
    localStorage.setItem("theme", "light");
  }
});

// Check for saved theme preference
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  html.setAttribute("data-theme", savedTheme);
  const icon = themeToggle.querySelector("i");
  icon.className = savedTheme === "dark" ? "fas fa-sun" : "fas fa-moon";
}

// Form validation functions
function validateName() {
  const nameInput = document.getElementById("name");
  const validation = document.getElementById("nameValidation");
  const name = nameInput.value.trim();

  if (name.length < 2) {
    nameInput.classList.remove("valid");
    nameInput.classList.add("invalid");
    validation.textContent = "Name must be at least 2 characters";
    validation.className = "validation-message invalid";
    return false;
  }

  nameInput.classList.remove("invalid");
  nameInput.classList.add("valid");
  validation.textContent = "✓ Valid name";
  validation.className = "validation-message valid";
  return true;
}

function validateEmail() {
  const emailInput = document.getElementById("email");
  const validation = document.getElementById("emailValidation");
  const email = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    emailInput.classList.remove("valid");
    emailInput.classList.add("invalid");
    validation.textContent = "Please enter a valid email address";
    validation.className = "validation-message invalid";
    return false;
  }

  emailInput.classList.remove("invalid");
  emailInput.classList.add("valid");
  validation.textContent = "✓ Valid email";
  validation.className = "validation-message valid";
  return true;
}

function validateAge() {
  const ageInput = document.getElementById("age");
  const validation = document.getElementById("ageValidation");
  const age = parseInt(ageInput.value);

  if (isNaN(age) || age < 18 || age > 120) {
    ageInput.classList.remove("valid");
    ageInput.classList.add("invalid");
    validation.textContent = "Age must be between 18 and 120";
    validation.className = "validation-message invalid";
    return false;
  }

  ageInput.classList.remove("invalid");
  ageInput.classList.add("valid");
  validation.textContent = "✓ Valid age";
  validation.className = "validation-message valid";
  return true;
}

function validateLocation() {
  const locationInput = document.getElementById("location");
  const validation = document.getElementById("locationValidation");
  const location = locationInput.value.trim();

  if (location.length < 3) {
    locationInput.classList.remove("valid");
    locationInput.classList.add("invalid");
    validation.textContent = "Please enter a valid location";
    validation.className = "validation-message invalid";
    return false;
  }

  locationInput.classList.remove("invalid");
  locationInput.classList.add("valid");
  validation.textContent = "✓ Valid location";
  validation.className = "validation-message valid";
  return true;
}

// Real-time validation
document.getElementById("name").addEventListener("input", validateName);
document.getElementById("email").addEventListener("input", validateEmail);
document.getElementById("age").addEventListener("input", validateAge);
document.getElementById("location").addEventListener("input", validateLocation);

// Clear form
clearFormBtn.addEventListener("click", () => {
  form.reset();
  isEditing = false;
  editRowIndex = -1;
  submitBtnText.textContent = "Add User";

  // Reset validation states
  document.querySelectorAll(".form-input").forEach(input => {
    input.classList.remove("valid", "invalid");
  });
  document.querySelectorAll(".validation-message").forEach(msg => {
    msg.textContent = "";
  });

  showFormStatus("Form cleared. You can now add a new user.", "info");
  document.getElementById("name").focus();
});

// Form submission
form.addEventListener("submit", function (e) {
  e.preventDefault();

  // Validate all fields
  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isAgeValid = validateAge();
  const isLocationValid = validateLocation();
  const status = document.getElementById("status").value;
  const role = document.getElementById("role").value;

  if (!isNameValid || !isEmailValid || !isAgeValid || !isLocationValid || !status || !role) {
    showFormStatus("Please fill in all fields correctly.", "error");
    return;
  }

  // Get form values
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const age = document.getElementById("age").value;
  const location = document.getElementById("location").value.trim();

  if (isEditing && editRowIndex !== -1) {
    // Update existing row
    updateExistingRow(name, email, age, role, location, status);
  } else {
    // Create new row
    addNewRow(name, email, age, role, location, status);
  }

  // Reset form
  form.reset();
  isEditing = false;
  editRowIndex = -1;
  submitBtnText.textContent = "Add User";

  // Reset validation states
  document.querySelectorAll(".form-input").forEach(input => {
    input.classList.remove("valid", "invalid");
  });
  document.querySelectorAll(".validation-message").forEach(msg => {
    msg.textContent = "";
  });

  document.getElementById("name").focus();
});

function addNewRow(name, email, age, role, location, status) {
  const row = document.createElement("tr");
  const avatarInitials = getInitials(name);
  const isActive = status === "active";

  row.innerHTML = `
        <td data-label="User">
          <div class="user-cell">
            <div class="user-avatar">${avatarInitials}</div>
            <div class="user-info">
              <div class="user-name">${name}</div>
              <div class="user-email">${email}</div>
            </div>
          </div>
        </td>
        <td data-label="Email">${email}</td>
        <td data-label="Age">${age}</td>
        <td data-label="Role">${role}</td>
        <td data-label="Status">
          <span class="status-badge ${isActive ? "status-active" : "status-inactive"}">
            <i class="fas fa-circle"></i>
            ${isActive ? "Active" : "Inactive"}
          </span>
        </td>
        <td data-label="Actions">
          <div class="action-buttons">
            <button class="btn btn-edit btn-sm" onclick="editRow(this)">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteRow(this)">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </td>
      `;

  // Add animation
  row.style.opacity = "0";
  row.style.transform = "translateY(20px)";

  // Add to table
  tableBody.appendChild(row);

  // Animate in
  setTimeout(() => {
    row.style.transition = "all 0.4s ease";
    row.style.opacity = "1";
    row.style.transform = "translateY(0)";
  }, 10);

  // Update stats
  updateStats();

  // Show success message
  showToast(`"${name}" added successfully!`, "success");
  showFormStatus(`User "${name}" has been added to the table.`, "success");
}

function updateExistingRow(name, email, age, role, location, status) {
  const row = tableBody.children[editRowIndex];
  const avatarInitials = getInitials(name);
  const isActive = status === "active";

  row.innerHTML = `
        <td data-label="User">
          <div class="user-cell">
            <div class="user-avatar">${avatarInitials}</div>
            <div class="user-info">
              <div class="user-name">${name}</div>
              <div class="user-email">${email}</div>
            </div>
          </div>
        </td>
        <td data-label="Email">${email}</td>
        <td data-label="Age">${age}</td>
        <td data-label="Role">${role}</td>
        <td data-label="Status">
          <span class="status-badge ${isActive ? "status-active" : "status-inactive"}">
            <i class="fas fa-circle"></i>
            ${isActive ? "Active" : "Inactive"}
          </span>
        </td>
        <td data-label="Actions">
          <div class="action-buttons">
            <button class="btn btn-edit btn-sm" onclick="editRow(this)">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteRow(this)">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </td>
      `;

  // Update stats
  updateStats();

  // Show success message
  showToast(`"${name}" updated successfully!`, "success");
  showFormStatus(`User "${name}" has been updated.`, "success");
}

// Delete row
function deleteRow(button) {
  const row = button.closest("tr");
  const userName = row.querySelector(".user-name").textContent;

  // Show confirmation
  if (!confirm(`Are you sure you want to delete "${userName}"?`)) {
    return;
  }

  // Animate out
  row.style.opacity = "0";
  row.style.transform = "translateX(100px)";
  row.style.transition = "all 0.3s ease";

  setTimeout(() => {
    row.remove();
    updateStats();
    showToast(`"${userName}" deleted successfully!`, "error");
    showFormStatus(`User "${userName}" has been deleted.`, "warning");
  }, 300);
}

// Edit row
function editRow(button) {
  const row = button.closest("tr");
  const name = row.querySelector(".user-name").textContent;
  const email = row.querySelector(".user-email").textContent;
  const age = row.cells[2].textContent;
  const role = row.cells[3].textContent;
  const status = row.cells[4].querySelector(".status-badge").textContent.trim().toLowerCase();
  const location = "City, Country"; // This would come from a data attribute in a real app

  // Populate form
  document.getElementById("name").value = name;
  document.getElementById("email").value = email;
  document.getElementById("age").value = age;
  document.getElementById("location").value = location;
  document.getElementById("status").value = status;
  document.getElementById("role").value = role.toLowerCase();

  // Set editing state
  isEditing = true;
  editRowIndex = Array.from(tableBody.children).indexOf(row);
  submitBtnText.textContent = "Update User";

  // Show message
  showFormStatus(`Editing "${name}". Make changes and click "Update User".`, "warning");
  document.getElementById("name").focus();
}

// Update stats
function updateStats() {
  const rows = tableBody.querySelectorAll("tr");
  const totalUsers = rows.length;

  // Calculate stats
  let totalAge = 0;
  let activeCount = 0;
  let inactiveCount = 0;

  rows.forEach((row) => {
    const age = parseInt(row.cells[2].textContent) || 0;
    totalAge += age;

    const status = row.cells[4].querySelector(".status-badge");
    if (status && status.textContent.includes("Active")) {
      activeCount++;
    } else {
      inactiveCount++;
    }
  });

  // Update UI
  totalUsersEl.textContent = totalUsers;
  averageAgeEl.textContent =
    totalUsers > 0 ? (totalAge / totalUsers).toFixed(1) : "0.0";
  activeUsersEl.textContent = activeCount;
  inactiveUsersEl.textContent = inactiveCount;

  // Show/hide empty state
  emptyState.style.display = totalUsers === 0 ? "block" : "none";
}

// Get initials from name
function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

// Show form status
function showFormStatus(message, type = "info") {
  formStatusText.textContent = message;
  formStatus.className = `form-status ${type} show`;

  // Hide after 5 seconds
  setTimeout(() => {
    formStatus.classList.remove("show");
  }, 5000);
}

// Show toast notification
function showToast(message, type = "success") {
  // Set message and type
  toastMessage.textContent = message;
  toast.className = "toast";
  toast.classList.add(`toast-${type}`);

  // Set icon based on type
  const icon = toast.querySelector("i");
  if (type === "success") {
    icon.className = "fas fa-check-circle";
  } else if (type === "error") {
    icon.className = "fas fa-exclamation-circle";
  } else if (type === "warning") {
    icon.className = "fas fa-exclamation-triangle";
  } else {
    icon.className = "fas fa-info-circle";
  }

  // Show toast
  toast.classList.add("show");

  // Hide after 4 seconds
  setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}

// Initialize animations
document.addEventListener("DOMContentLoaded", () => {
  // Animate initial rows
  const rows = tableBody.querySelectorAll("tr");
  rows.forEach((row, index) => {
    row.style.animationDelay = `${index * 0.1}s`;
    row.classList.add("animate");
  });

  // Show initial form status
  setTimeout(() => {
    showFormStatus("Fill in the form to add a new user. All fields are required.", "info");
  }, 1000);
});
