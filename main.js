// /js/main.js

let currentUser = {};
let currentEditField = null;

// 1. Initialization
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    setupMobileMenu();
});

// 2. Fetch User Data
async function initDashboard() {
    try {
        const response = await fetch('/me');
        if (!response.ok) {
            // If session invalid, let middleware handle redirect, or reload
            if(response.status === 401) window.location.reload();
            return;
        }

        currentUser = await response.json();
        updateDashboardUI(currentUser);

    } catch (error) {
        console.error("Failed to load dashboard data:", error);
        showToast("Failed to load profile", "error");
    }
}

// 3. UI Updates
function updateDashboardUI(profile) {
    const heroName = document.getElementById('hero-name');
    const heroAvatar = document.getElementById('hero-avatar');
    const infoAvatarSmall = document.getElementById('info-avatar-small');
    const infoName = document.getElementById('info-name');
    const infoEmail = document.getElementById('info-email');

    // Authentik field mapping
    const displayName = profile.name || profile.given_name || profile.nickname || profile.preferred_username || "User";
    const email = profile.email || "No email";
    const initials = displayName.charAt(0).toUpperCase();

    if (heroName) heroName.textContent = displayName;
    if (heroAvatar) heroAvatar.textContent = initials;
    if (infoAvatarSmall) infoAvatarSmall.textContent = initials;
    if (infoName) infoName.textContent = displayName;
    if (infoEmail) infoEmail.textContent = email;
}

// 4. Navigation & Tabs
window.switchTab = function(targetId) {
    // 1. Reset Nav Links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('bg-brand-500/10', 'text-brand-400', 'active'); // Active styles
        link.classList.add('text-zinc-400'); // Inactive styles
    });

    // 2. Hide Content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

    // 3. Activate Tab
    const activeLink = document.getElementById(`nav-${targetId}`);
    if(activeLink) {
        activeLink.classList.remove('text-zinc-400');
        activeLink.classList.add('bg-brand-500/10', 'text-brand-400', 'active');
    }
    
    const targetContent = document.getElementById(`tab-${targetId}`);
    if(targetContent) {
        targetContent.classList.remove('hidden');
    }

    // 4. Close Mobile Menu if open
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth < 768 && sidebar.classList.contains('translate-x-0')) {
        toggleMobileMenu();
    }
};

// 5. Mobile Menu Logic
function setupMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-menu-btn');
    if(btn) btn.addEventListener('click', toggleMobileMenu);
    if(closeBtn) closeBtn.addEventListener('click', toggleMobileMenu);
}

function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    // Toggle the translate class
    sidebar.classList.toggle('-translate-x-full');
    sidebar.classList.toggle('translate-x-0');
}

// 6. Modal Logic
window.openEditModal = function(field) {
    currentEditField = field;
    const modal = document.getElementById('edit-modal');
    const backdrop = document.getElementById('modal-backdrop');
    const content = document.getElementById('modal-content');
    const title = document.getElementById('modal-title');
    const input = document.getElementById('modal-input');
    const errorMsg = document.getElementById('modal-error');

    // Reset UI
    errorMsg.classList.add('hidden');
    input.value = "";
    
    // Set Content based on field
    if (field === 'name') {
        title.textContent = "Change Display Name";
        input.value = currentUser.name || "";
        input.placeholder = "e.g. John Doe";
    } else if (field === 'email') {
        title.textContent = "Change Email";
        input.value = currentUser.email || "";
        input.placeholder = "you@example.com";
    } else if (field === 'avatar') {
        showToast("Profile pictures are managed by Gravatar", "info");
        return; // Early exit, or implement avatar upload logic here
    }

    // Show Modal with Animation
    modal.classList.remove('hidden');
    // Small delay to allow display:block to apply before opacity transition
    setTimeout(() => {
        backdrop.classList.remove('opacity-0');
        content.classList.remove('opacity-0', 'scale-95');
        content.classList.add('opacity-100', 'scale-100');
    }, 10);
};

window.closeModal = function() {
    const modal = document.getElementById('edit-modal');
    const backdrop = document.getElementById('modal-backdrop');
    const content = document.getElementById('modal-content');

    backdrop.classList.add('opacity-0');
    content.classList.remove('opacity-100', 'scale-100');
    content.classList.add('opacity-0', 'scale-95');

    setTimeout(() => {
        modal.classList.add('hidden');
        currentEditField = null;
    }, 200);
};

// 7. Save Changes Logic (Connects to update.js)
window.saveChanges = async function() {
    const input = document.getElementById('modal-input');
    const btn = document.getElementById('save-btn');
    const errorMsg = document.getElementById('modal-error');
    const newVal = input.value;

    if (!newVal) {
        errorMsg.textContent = "Field cannot be empty";
        errorMsg.classList.remove('hidden');
        return;
    }

    // UI Loading State
    const originalBtnText = btn.textContent;
    btn.textContent = "Saving...";
    btn.disabled = true;

    try {
        const payload = {};
        if (currentEditField === 'name') payload.name = newVal;
        if (currentEditField === 'email') payload.email = newVal;

        const res = await fetch('/update', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Update failed");

        // Success
        currentUser = { ...currentUser, ...payload }; // Optimistic update
        updateDashboardUI(currentUser);
        closeModal();
        showToast("Profile updated successfully", "success");

    } catch (err) {
        console.error(err);
        errorMsg.textContent = "Failed to update. Please try again.";
        errorMsg.classList.remove('hidden');
    } finally {
        btn.textContent = originalBtnText;
        btn.disabled = false;
    }
};

// 8. Toast Notification System (The "Trusted" polish)
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    const colors = type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' 
                 : type === 'info' ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                 : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400';
    
    const icon = type === 'error' ? 'error' : type === 'info' ? 'info' : 'check_circle';

    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg transform transition-all duration-300 translate-y-10 opacity-0 ${colors}`;
    toast.innerHTML = `
        <span class="material-symbols-rounded text-xl">${icon}</span>
        <span class="text-sm font-medium">${message}</span>
    `;

    container.appendChild(toast);

    // Animate In
    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);

    // Animate Out & Remove
    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
