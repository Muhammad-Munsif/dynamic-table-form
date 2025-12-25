// DOM Elements
const form = document.getElementById("dataForm");
const tableBody = document.getElementById("tableBody");
const emptyState = document.getElementById("emptyState");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

// Stats elements
const totalUsersEl = document.getElementById("totalUsers");
const averageAgeEl = document.getElementById("averageAge");
const activeUsersEl = document.getElementById("activeUsers");
const inactiveUsersEl = document.getElementById("inactiveUsers");

// Theme toggle
const themeToggle = document.getElementById("themeToggle");

// Initialize stats
updateStats();

// Theme toggle functionality
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const icon = themeToggle.querySelector("i");
  if (document.body.classList.contains("dark-mode")) {
    icon.className = "fas fa-sun";
    document.documentElement.style.setProperty("--light", "#1e293b");
    document.documentElement.style.setProperty("--dark", "#f8fafc");
    document.documentElement.style.setProperty("--dark-light", "#cbd5e1");
    document.documentElement.style.setProperty("--gray-light", "#334155");
  } else {
    icon.className = "fas fa-moon";
    document.documentElement.style.setProperty("--light", "#f8fafc");
    document.documentElement.style.setProperty("--dark", "#1e293b");
    document.documentElement.style.setProperty("--dark-light", "#334155");
    document.documentElement.style.setProperty("--gray-light", "#e2e8f0");
  }
});

// Form submission
form.addEventListener("submit", function (e) {
  e.preventDefault();

  // Get form values
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const age = document.getElementById("age").value.trim();
  const address = document.getElementById("address").value.trim();

  // Validation
  if (!name || !email || !age || !address) {
    showToast("Please fill in all fields", "error");
    return;
  }

  if (!validateEmail(email)) {
    showToast("Please enter a valid email address", "error");
    return;
  }

  if (age < 1 || age > 120) {
    showToast("Age must be between 1 and 120", "error");
    return;
  }

  // Create new row
  const row = document.createElement("tr");
  const avatarInitials = getInitials(name);
  const isActive = Math.random() > 0.3; // 70% chance of active

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
          <td data-label="Status">
            <span class="status-badge ${
              isActive ? "status-active" : "status-inactive"
            }">
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

  // Reset form
  form.reset();
  document.getElementById("name").focus();
});

// Delete row
function deleteRow(button) {
  const row = button.closest("tr");
  const userName = row.querySelector(".user-name").textContent;

  // Animate out
  row.style.opacity = "0";
  row.style.transform = "translateX(100px)";
  row.style.transition = "all 0.3s ease";

  setTimeout(() => {
    row.remove();
    updateStats();
    showToast(`"${userName}" deleted successfully!`, "error");
  }, 300);
}

// Edit row
function editRow(button) {
  const row = button.closest("tr");
  const name = row.querySelector(".user-name").textContent;
  const email = row.querySelector(".user-email").textContent;
  const age = row.cells[2].textContent;

  // Populate form
  document.getElementById("name").value = name;
  document.getElementById("email").value = email;
  document.getElementById("age").value = age;
  document.getElementById("address").value = row.cells[1].textContent;

  // Change button text
  const submitBtn = form.querySelector("button[type='submit']");
  submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Record';

  // Store reference to row for update
  submitBtn.dataset.editRow = Array.from(tableBody.children).indexOf(row);

  // Show message
  showToast(`Editing "${name}"`, "warning");
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

    const status = row.querySelector(".status-badge");
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

// Email validation
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
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
  } else {
    icon.className = "fas fa-info-circle";
  }

  // Show toast
  toast.classList.add("show");

  // Hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Initialize animations
document.addEventListener("DOMContentLoaded", () => {
  // Animate initial rows
  const rows = tableBody.querySelectorAll("tr");
  rows.forEach((row, index) => {
    row.style.animationDelay = `${index * 0.1}s`;
    row.classList.add("animate");
  });
});
