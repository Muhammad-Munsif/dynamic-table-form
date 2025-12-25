
      // DOM Elements
      const form = document.getElementById("dataForm");
      const tableBody = document.querySelector("#dataTable tbody");
      const totalUsersEl = document.getElementById("totalUsers");
      const averageAgeEl = document.getElementById("averageAge");
      const emptyState = document.getElementById("emptyState");

      // Update stats function
      function updateStats() {
        const rows = tableBody.querySelectorAll("tr");
        const totalUsers = rows.length;
        totalUsersEl.textContent = totalUsers;
        
        // Calculate average age
        let totalAge = 0;
        rows.forEach(row => {
          const ageCell = row.cells[2];
          totalAge += parseInt(ageCell.textContent) || 0;
        });
        
        const averageAge = totalUsers > 0 ? (totalAge / totalUsers).toFixed(1) : 0;
        averageAgeEl.textContent = averageAge;
        
        // Show/hide empty state
        if (totalUsers === 0) {
          emptyState.style.display = "block";
          tableBody.style.display = "none";
        } else {
          emptyState.style.display = "none";
          tableBody.style.display = "";
        }
      }

      // Form submission handler
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const age = document.getElementById("age").value.trim();
        const address = document.getElementById("address").value.trim();
        
        // Validation
        if (!name || !email || !age || !address) {
          alert("Please fill in all fields");
          return;
        }
        
        if (!validateEmail(email)) {
          alert("Please enter a valid email address");
          return;
        }
        
        if (age < 1 || age > 120) {
          alert("Please enter a valid age (1-120)");
          return;
        }
        
        // Create new row
        const row = document.createElement("tr");
        row.className = "fade-in";
        row.innerHTML = `
          <td data-label="Name">${name}</td>
          <td data-label="Email">${email}</td>
          <td data-label="Age">${age}</td>
          <td data-label="Address">${address}</td>
          <td data-label="Actions" class="action-cell">
            <button class="btn btn-delete" onclick="deleteRow(this)">
              <i class="fas fa-trash"></i> Delete
            </button>
          </td>
        `;
        
        // Add row to table
        tableBody.appendChild(row);
        
        // Update stats
        updateStats();
        
        // Reset form
        form.reset();
        document.getElementById("name").focus();
        
        // Show success message
        showToast(`User "${name}" added successfully!`);
      });

      // Delete row function
      function deleteRow(button) {
        const row = button.closest("tr");
        const userName = row.cells[0].textContent;
        
        // Add fade out animation
        row.style.opacity = "0";
        row.style.transform = "translateX(100px)";
        row.style.transition = "all 0.3s ease";
        
        // Remove after animation
        setTimeout(() => {
          row.remove();
          updateStats();
          showToast(`User "${userName}" deleted successfully!`, "danger");
        }, 300);
      }

      // Email validation function
      function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      }

      // Toast notification function
      function showToast(message, type = "success") {
        // Remove existing toast
        const existingToast = document.querySelector(".toast");
        if (existingToast) existingToast.remove();
        
        // Create new toast
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        toast.innerHTML = `
          <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
          <span>${message}</span>
        `;
        
        // Style the toast
        toast.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: ${type === "success" ? "linear-gradient(to right, #2ecc71, #27ae60)" : "linear-gradient(to right, #e74c3c, #c0392b)"};
          color: white;
          padding: 15px 20px;
          border-radius: 8px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1000;
          animation: slideIn 0.3s ease forwards;
        `;
        
        // Add animation
        const style = document.createElement("style");
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
        
        // Add to DOM
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
          toast.style.animation = "slideOut 0.3s ease forwards";
          setTimeout(() => toast.remove(), 300);
        }, 3000);
      }

      // Initialize stats on page load
      document.addEventListener("DOMContentLoaded", function() {
        updateStats();
        
        // Add animation to existing rows
        const rows = tableBody.querySelectorAll("tr");
        rows.forEach((row, index) => {
          row.style.animationDelay = `${index * 0.1}s`;
        });
      });
    