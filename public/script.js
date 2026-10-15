// 1. HTTP API Request Helper
async function request(path, options = {}) {
  const response = await fetch(path, options);
  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

// 2. API Store: The sole source of project records
const store = {
  list: () => request('/api/projects'),
  create: project => request('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  }),
  update: (id, project) => request(`/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  }),
  remove: id => request(`/api/projects/${id}`, {
    method: 'DELETE'
  })
};

// 3. DOM element references
const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const list = document.querySelector('#project-list');
const empty = document.querySelector('#empty-state');
const message = document.querySelector('#message');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const formTitle = document.querySelector('#form-title');

let editingId = null;
let busy = false;

// 4. Status message helper
function tell(text, error = false) {
  if (!message) return;
  message.textContent = text;
  message.style.color = error ? '#dc2626' : '#16a34a';
}

// 5. Reset form to Add mode
function resetForm() {
  editingId = null;
  if (form) form.reset();
  if (saveButton) saveButton.textContent = 'Save Project';
  if (cancelButton) {
    cancelButton.hidden = true;
    cancelButton.style.display = 'none';
  }
  if (formTitle) formTitle.textContent = 'Add Project';
}

// 6. Disable/enable form and mutation controls
function setBusy(value) {
  busy = value;
  if (form) {
    form.querySelectorAll('input, select, button').forEach(el => {
      el.disabled = value;
    });
  }
  if (list) {
    list.querySelectorAll('button').forEach(btn => {
      btn.disabled = value;
    });
  }
}

// 7. Load and render projects from backend API
async function refresh() {
  const rows = await store.list();
  if (list) {
    list.replaceChildren();
  }
  if (empty) {
    empty.style.display = rows.length === 0 ? 'block' : 'none';
  }
  if (list) {
    for (const project of rows) {
      const item = document.createElement('li');

      const textSpan = document.createElement('span');
      // Use textContent to ensure text safety
      textSpan.textContent = `${project.name} — ${project.status}`;

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.textContent = 'Edit';
      editBtn.style.marginLeft = '1rem';
      editBtn.style.padding = '0.35rem 0.75rem';
      editBtn.style.fontSize = '0.875rem';
      editBtn.setAttribute('aria-label', `Edit ${project.name}`);
      editBtn.addEventListener('click', () => {
        if (busy) return;
        editingId = project.id;
        nameInput.value = project.name;
        statusInput.value = project.status;
        if (saveButton) saveButton.textContent = 'Save changes';
        if (cancelButton) {
          cancelButton.hidden = false;
          cancelButton.style.display = 'inline-block';
        }
        if (formTitle) formTitle.textContent = 'Edit Project';
        nameInput.focus();
      });

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = 'Delete';
      removeBtn.style.marginLeft = '0.5rem';
      removeBtn.style.padding = '0.35rem 0.75rem';
      removeBtn.style.fontSize = '0.875rem';
      removeBtn.style.backgroundColor = '#dc2626';
      removeBtn.setAttribute('aria-label', `Delete ${project.name}`);
      removeBtn.addEventListener('click', async () => {
        if (busy || !confirm(`Delete "${project.name}"?`)) return;
        setBusy(true);
        tell('Deleting...');
        try {
          await store.remove(project.id);
          if (editingId === project.id) resetForm();
          await refresh();
          tell('Project deleted.');
        } catch (error) {
          tell(error.message + ' Check that the server is running.', true);
        } finally {
          setBusy(false);
        }
      });

      item.append(textSpan, editBtn, removeBtn);
      list.append(item);
    }
  }
}

// 8. Single form submit listener
if (form) {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;

    const trimmedName = nameInput ? nameInput.value.trim() : '';
    const selectedStatus = statusInput ? statusInput.value : '';

    if (!trimmedName) {
      tell('Enter a project name.', true);
      if (nameInput) nameInput.focus();
      return;
    }

    const payload = { name: trimmedName, status: selectedStatus };
    setBusy(true);
    tell('Saving...');

    try {
      if (editingId === null) {
        await store.create(payload);
      } else {
        await store.update(editingId, payload);
      }
      resetForm();
      await refresh();
      tell('Project saved.');
    } catch (error) {
      // Preserves unsaved form inputs: form.reset() is NOT called
      tell(error.message + ' Check that the server is running.', true);
    } finally {
      // Always re-enables controls on both success and failure
      setBusy(false);
    }
  });
}

// 9. Cancel edit button listener
if (cancelButton) {
  cancelButton.addEventListener('click', () => {
    if (busy) return;
    resetForm();
    tell('');
  });
}

// 10. Initial load from API on startup
if (empty) {
  empty.style.display = 'none'; // Never flash empty state before loading resolves
}
setBusy(true);
tell('Loading projects...');
refresh()
  .then(() => {
    tell('Ready.');
  })
  .catch(error => {
    if (empty) empty.style.display = 'none'; // Error state: do not pretend collection is empty
    tell(error.message + ' Check that the server is running.', true);
  })
  .finally(() => {
    setBusy(false);
  });
