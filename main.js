// Global State
let currentUser = {};
let currentEditField = null;

// 1. Init
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

async function initDashboard() {
    try {
        const response = await fetch('/me');
        if (!response.ok) {
            // Force re-auth if token expired
            window.location.reload(); 
            return;
        }
        currentUser = await response.json();
        updateUI(currentUser);
    } catch (error) {
        console.error("Load failed", error);
    }
}

function updateUI(user) {
    const name = user.name || user.given_name || user.nickname || "User";
    const email = user.email || "No email";
    const initial = name.charAt(0).toUpperCase();

    // Headers
    document.getElementById('hero-name').textContent = name;
    document.getElementById('hero-avatar').textContent = initial;
    document.getElementById('info-avatar-small').textContent = initial;
    
    // Personal Info Tab
    document.getElementById('info-name').textContent = name;
    document.getElementById('info-email').textContent = email;
}

// 2. Tab Logic
window.switchTab = function(tabName) {
    // Hide all
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(el => {
        el.classList.remove('bg-[#004a77]', 'text-[#c2e7ff]', 'active');
        el.classList.add('text-[#e3e3e3]');
    });

    // Show One
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    
    // Highlight Nav
    const nav = document.getElementById(`nav-${tabName}`);
    nav.classList.remove('text-[#e3e3e3]');
    nav.classList.add('bg-[#004a77]', 'text-[#c2e7ff]', 'active');
};

// 3. Modal & Editing Logic
window.openEditModal = function(field) {
    if(field === 'avatar') {
        // Avatars are hard to upload via simple API, link to full settings
        window.open('https://accounts.theboiismc.com/if/user/#/settings', '_blank');
        return;
    }

    currentEditField = field;
    const modal = document.getElementById('edit-modal');
    const content = document.getElementById('modal-content');
    const title = document.getElementById('modal-title');
    const input = document.getElementById('modal-input');

    modal.classList.remove('hidden');
    // Simple animation delay
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);

    // Setup Fields
    if(field === 'name') {
        title.textContent = "Change Name";
        input.value = currentUser.name || "";
        input.placeholder = "Enter full name";
    } else if (field === 'email') {
        title.textContent = "Change Email";
        input.value = currentUser.email || "";
        input.placeholder = "Enter new email";
    }
    input.focus();
};

window.closeModal = function() {
    const modal = document.getElementById('edit-modal');
    const content = document.getElementById('modal-content');
    
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        currentEditField = null;
    }, 200);
};

window.saveChanges = async function() {
    const input = document.getElementById('modal-input');
    const value = input.value;
    const btn = document.getElementById('save-btn');
    
    if(!value) return;

    // UI Loading State
    btn.textContent = "Saving...";
    btn.disabled = true;

    // Prepare Payload
    const payload = {};
    payload[currentEditField] = value;

    try {
        const res = await fetch('/functions/update', { // Calls our new Worker
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        if(!res.ok) throw new Error("Update failed");

        // Success!
        const updatedData = await res.json();
        // Merge updates locally so we don't need to reload
        currentUser = { ...currentUser, ...updatedData }; 
        updateUI(currentUser);
        closeModal();

    } catch (e) {
        alert("Error saving changes. You may not have permission to edit this field directly.");
    } finally {
        btn.textContent = "Save";
        btn.disabled = false;
    }
};
