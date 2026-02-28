<script>
    (function() {
      // ----- DOM elements -----
      const form = document.getElementById('dataForm');
      const tableBody = document.getElementById('tableBody');
      const emptyState = document.getElementById('emptyState');
      const toast = document.getElementById('toast');
      const toastMessage = document.getElementById('toastMessage');
      const submitBtnText = document.getElementById('submitBtnText');
      const clearFormBtn = document.getElementById('clearForm');
      const totalUsersEl = document.getElementById('totalUsers');
      const averageAgeEl = document.getElementById('averageAge');
      const activeUsersEl = document.getElementById('activeUsers');
      const inactiveUsersEl = document.getElementById('inactiveUsers');

      // modal elements
      const modal = document.getElementById('actionModal');
      const modalIcon = document.getElementById('modalIcon');
      const modalTitle = document.getElementById('modalTitle');
      const modalMessage = document.getElementById('modalMessage');
      const modalConfirm = document.getElementById('modalConfirm');
      const modalCancel = document.getElementById('modalCancel');

      // form status
      const formStatus = document.getElementById('formStatus');

      // theme
      const themeToggle = document.getElementById('themeToggle');
      const html = document.documentElement;
      let isEditing = false, editRowIndex = -1;
      let pendingDeleteRow = null;      // store row for delete confirmation
      let pendingDeleteName = '';

      // ----- helpers -----
      function showFormStatus(msg, type = 'info') {
        formStatus.style.display = 'flex'; formStatus.innerHTML = `<i class="fas fa-${type==='success'?'check-circle':type==='error'?'exclamation-circle':'info-circle'}"></i> ${msg}`;
        formStatus.style.background = type==='success'?'rgba(16,185,129,0.1)':type==='error'?'rgba(239,68,68,0.1)':'rgba(59,130,246,0.1)';
        formStatus.style.color = type==='success'?'var(--secondary)':type==='error'?'var(--danger)':'var(--info)';
        formStatus.style.border = '2px solid currentColor';
        setTimeout(() => { formStatus.style.display = 'none'; }, 4000);
      }
      function showToast(msg, type = 'success') {
        toastMessage.innerText = msg; toast.className = 'toast'; toast.classList.add(`toast-${type}`,'show');
        setTimeout(() => toast.classList.remove('show'), 3500);
      }

      // validation
      function validateName() { const inp=document.getElementById('name'), v=document.getElementById('nameValidation'), val=inp.value.trim(); if(val.length<2) { inp.classList.add('invalid'); inp.classList.remove('valid'); v.innerHTML='<i class="fas fa-times"></i> min 2 chars'; v.className='validation-message invalid'; return false; } else { inp.classList.add('valid'); inp.classList.remove('invalid'); v.innerHTML='<i class="fas fa-check"></i> valid'; v.className='validation-message valid'; return true; } }
      function validateEmail() { const inp=document.getElementById('email'), v=document.getElementById('emailValidation'), val=inp.value.trim(), re=/^[^\s@]+@[^\s@]+\.[^\s@]+$/; if(!re.test(val)) { inp.classList.add('invalid'); inp.classList.remove('valid'); v.innerHTML='<i class="fas fa-times"></i> invalid email'; return false; } else { inp.classList.add('valid'); inp.classList.remove('invalid'); v.innerHTML='<i class="fas fa-check"></i> valid'; return true; } }
      function validateAge() { const inp=document.getElementById('age'), v=document.getElementById('ageValidation'), val=parseInt(inp.value); if(isNaN(val) || val<18 || val>120) { inp.classList.add('invalid'); inp.classList.remove('valid'); v.innerHTML='<i class="fas fa-times"></i> 18-120'; return false; } else { inp.classList.add('valid'); inp.classList.remove('invalid'); v.innerHTML='<i class="fas fa-check"></i> ok'; return true; } }
      function validateLocation() { const inp=document.getElementById('location'), v=document.getElementById('locationValidation'), val=inp.value.trim(); if(val.length<3) { inp.classList.add('invalid'); inp.classList.remove('valid'); v.innerHTML='<i class="fas fa-times"></i> too short'; return false; } else { inp.classList.add('valid'); inp.classList.remove('invalid'); v.innerHTML='<i class="fas fa-check"></i> valid'; return true; } }

      document.getElementById('name').addEventListener('input', validateName);
      document.getElementById('email').addEventListener('input', validateEmail);
      document.getElementById('age').addEventListener('input', validateAge);
      document.getElementById('location').addEventListener('input', validateLocation);

      function getInitials(n) { return n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2); }

      function updateStats() {
        const rows = [...tableBody.children]; const total = rows.length; let totalAge=0, active=0, inactive=0;
        rows.forEach(r=>{ 
          const age = parseInt(r.cells[2]?.textContent) || 0; totalAge+=age; 
          const statusSpan = r.cells[4]?.querySelector('.status-badge');
          statusSpan?.textContent.includes('Active') ? active++ : inactive++;
        });
        totalUsersEl.textContent = total; averageAgeEl.textContent = total ? (totalAge/total).toFixed(1) : '0.0';
        activeUsersEl.textContent = active; inactiveUsersEl.textContent = inactive;
        emptyState.style.display = total ? 'none' : 'block';
      }

      // open modal for delete confirmation
      function showConfirmModal(userName, rowElement) {
        pendingDeleteRow = rowElement; pendingDeleteName = userName;
        modalIcon.innerHTML = '<i class="fas fa-trash-alt" style="color:var(--danger)"></i>';
        modalTitle.textContent = 'Delete user?'; modalMessage.textContent = `"${userName}" will be removed permanently.`;
        modalConfirm.className = 'btn btn-danger modal-btn'; modalConfirm.textContent = 'Delete';
        modalCancel.textContent = 'Cancel';
        modal.classList.add('show');
      }

      // delete row after modal confirm
      function confirmDelete() {
        if (!pendingDeleteRow) return;
        const row = pendingDeleteRow; const userName = pendingDeleteName;
        row.style.transition = 'all 0.2s'; row.style.opacity = '0'; row.style.transform = 'translateX(30px)';
        setTimeout(() => { if (row.parentNode) row.remove(); updateStats(); showToast(`"${userName}" deleted`, 'error'); showFormStatus(`User deleted.`, 'warning'); }, 200);
        pendingDeleteRow = null; modal.classList.remove('show');
      }

      // edit row: populate form
      window.editRow = function(btn) {
        const row = btn.closest('tr'); if (!row) return;
        const name = row.querySelector('.user-name')?.textContent || '';
        const email = row.querySelector('.user-email')?.textContent || '';
        const age = row.cells[2]?.textContent || '18';
        const role = row.cells[3]?.textContent.trim().toLowerCase() || 'user';
        const status = row.cells[4]?.querySelector('.status-badge')?.textContent.trim().toLowerCase().includes('active') ? 'active' : 'inactive';
        const location = 'City, Country'; // dummy, in real app would be stored

        document.getElementById('name').value = name;
        document.getElementById('email').value = email;
        document.getElementById('age').value = age;
        document.getElementById('location').value = location;
        document.getElementById('status').value = status;
        document.getElementById('role').value = role;

        isEditing = true; editRowIndex = [...tableBody.children].indexOf(row);
        submitBtnText.textContent = 'Update User';
        showFormStatus(`Editing "${name}"`, 'warning');
        document.getElementById('name').focus();
      };

      window.deleteRow = function(btn) {
        const row = btn.closest('tr'); if (!row) return;
        const name = row.querySelector('.user-name')?.textContent || 'this user';
        showConfirmModal(name, row);
      };

      // modal buttons
      modalConfirm.addEventListener('click', ()=>{
        if (pendingDeleteRow) confirmDelete();
        else modal.classList.remove('show');
      });
      modalCancel.addEventListener('click', ()=>{ modal.classList.remove('show'); pendingDeleteRow=null; });

      window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });

      // form submit
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        const nameVal = validateName(), emailVal = validateEmail(), ageVal = validateAge(), locVal = validateLocation();
        const status = document.getElementById('status').value, role = document.getElementById('role').value;
        if (!nameVal || !emailVal || !ageVal || !locVal || !status || !role) {
          showFormStatus('Please fill all fields correctly.', 'error'); return;
        }
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const age = document.getElementById('age').value;
        const location = document.getElementById('location').value.trim();
        const isActive = status === 'active';

        if (isEditing && editRowIndex >= 0 && editRowIndex < tableBody.children.length) {
          // update existing row
          const row = tableBody.children[editRowIndex];
          row.innerHTML = generateRowHTML(name, email, age, role, location, status, getInitials(name));
        } else {
          // add new row
          const newRow = document.createElement('tr');
          newRow.innerHTML = generateRowHTML(name, email, age, role, location, status, getInitials(name));
          tableBody.appendChild(newRow);
        }
        form.reset(); isEditing = false; editRowIndex = -1; submitBtnText.textContent = 'Add User';
        document.querySelectorAll('.form-input').forEach(i=>i.classList.remove('valid','invalid'));
        document.querySelectorAll('.validation-message').forEach(m=>m.innerHTML='');
        updateStats(); showToast(isEditing ? 'User updated' : 'User added', 'success');
        showFormStatus(`"${name}" saved.`, 'success');
      });

      function generateRowHTML(name, email, age, role, location, status, initials) {
        const activeClass = status === 'active' ? 'status-active' : 'status-inactive';
        const statusText = status === 'active' ? 'Active' : 'Inactive';
        return `<td data-label="User"><div class="user-cell"><div class="user-avatar">${initials}</div><div class="user-info"><div class="user-name">${name}</div><div class="user-email">${email}</div></div></div></td>
        <td data-label="Email">${email}</td><td data-label="Age">${age}</td><td data-label="Role">${role}</td>
        <td data-label="Status"><span class="status-badge ${activeClass}"><i class="fas fa-circle"></i> ${statusText}</span></td>
        <td data-label="Actions"><div class="action-buttons"><button class="btn btn-edit btn-sm" onclick="editRow(this)"><i class="fas fa-edit"></i> Edit</button><button class="btn btn-danger btn-sm" onclick="deleteRow(this)"><i class="fas fa-trash"></i> Delete</button></div></td>`;
      }

      clearFormBtn.addEventListener('click', ()=>{
        form.reset(); isEditing=false; editRowIndex=-1; submitBtnText.textContent='Add User';
        document.querySelectorAll('.form-input').forEach(i=>i.classList.remove('valid','invalid'));
        document.querySelectorAll('.validation-message').forEach(m=>m.innerHTML='');
        showFormStatus('Form cleared', 'info');
      });

      // theme
      themeToggle.addEventListener('click', ()=>{
        const curr = html.getAttribute('data-theme'); const next = curr === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        themeToggle.innerHTML = next==='dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', next);
      });
      const savedTheme = localStorage.getItem('theme') || 'light';
      html.setAttribute('data-theme', savedTheme); themeToggle.innerHTML = savedTheme==='dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

      updateStats();
      // animate existing rows
      [...tableBody.children].forEach((r,i)=> { r.style.animation = `fadeInUp 0.3s ${i*0.1}s both`; });
    })();
  </script>