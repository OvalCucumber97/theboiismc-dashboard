// /js/main.js

let currentUser = {};
let currentEditField = null; // Track what we are editing

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    setupMenus();
});

// 1. Fetch User Data
async function initDashboard() {
    try {
        const response = await fetch('/me');
        if (!response.ok) {
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

// 2. Update UI
function updateDashboardUI(profile) {
    // Header & Menus
    const headerAvatar = document.getElementById('header-avatar');
    const menuAvatarLarge = document.getElementById('menu-avatar-large');
    const menuName = document.getElementById('menu-name');
    const menuEmail = document.getElementById('menu-email');

    // Tab: Personal Info
    const infoAvatarSmall = document.getElementById('info-avatar-small');
    const infoName = document.getElementById('info-name');
    const infoEmail = document.getElementById('info-email');

    // Authentik field mapping
    const displayName = profile.name || profile.given_name || profile.nickname || "User";
    const email = profile.email || "No email";
    const initials = displayName.charAt(0).toUpperCase();

    // Fill Header
    if (headerAvatar) headerAvatar.textContent = initials;
    if (menuAvatarLarge) menuAvatarLarge.textContent = initials;
    if (menuName) menuName.textContent = displayName;
    if (menuEmail) menuEmail.textContent = email;

    // Fill Page Content
    if (infoAvatarSmall) infoAvatarSmall.textContent = initials;
    if (infoName) infoName.textContent = displayName;
    if (infoEmail) infoEmail.textContent = email;
}

// 3. Setup Header Menus (Apps & User)
function setupMenus() {
    const appsBtn = document.getElementById('apps-btn');
    const userBtn = document.getElementById('user-btn');
    const appsMenu = document.getElementById('apps-menu');
    const userMenu = document.getElementById('user-menu');
    
    // Toggle Apps
    appsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.add('hidden');
        appsMenu.classList.toggle('hidden');
    });

    // Toggle User
    userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        appsMenu.classList.add('hidden');
        userMenu.classList.toggle('hidden');
    });

    // Click Outside
    document.addEventListener('click', (e) => {
        if (!appsMenu.contains(e.target) && !appsBtn.contains(e.target)) {
            appsMenu.classList.add('hidden');
        }
        if (!userMenu.contains(e.target) && !userBtn.contains(e.target)) {
            userMenu.classList.add('hidden');
        }
    });

    // Mobile Sidebar
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    
    if(mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            sidebar.classList.remove('-translate-x-full');
            backdrop.classList.remove('hidden');
        });
    }

    if(backdrop) {
        backdrop.addEventListener('click', () => {
            sidebar.classList.add('-translate-x-full');
            backdrop.classList.add('hidden');
        });
    }
}

// 4. Tab Switcher
window.switchTab = function(targetId) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active', 'bg-indigo-500/10', 'text-indigo-400');
        link.classList.add('text-slate-400');
    });

    const content = document.getElementById(`tab-${targetId}`);
    if(content) content.classList.remove('hidden');

    const nav = document.getElementById(`nav-${targetId}`);
    if(nav) {
        nav.classList.add('active', 'bg-indigo-500/10', 'text-indigo-400');
        nav.classList.remove('text-slate-400');
    }

    // Close User Menu if open
    document.getElementById('user-menu').classList.add('hidden');
    
    // Close Mobile Menu if open
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (!sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.add('-translate-x-full');
        backdrop.classList.add('hidden');
    }
};

// 5. Modal Logic
window.openEditModal = function(field) {
    currentEditField = field;
    const modal = document.getElementById('edit-modal');
    const backdrop = document.getElementById('modal-backdrop');
    const content = document.getElementById('modal-content');
    const title = document.getElementById('modal-title');
    const input = document.getElementById('modal-input');
    const errorMsg = document.getElementById('modal-error');

    errorMsg.classList.add('hidden');
    input.value = "";
    
    if (field === 'name') {
        title.textContent = "Change Display Name";
        input.value = currentUser.name || "";
    } else if (field === 'email') {
        title.textContent = "Change Email";
        input.value = currentUser.email || "";
    } else if (field === 'avatar') {
        showToast("Profile pictures are managed by Gravatar", "info");
        return; 
    }

    modal.classList.remove('hidden');
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

// 6. Save Changes Logic
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

        // Optimistic update
        currentUser = { ...currentUser, ...payload }; 
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

// 7. Toast Notification System
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const colors = type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' 
                 : type === 'info' ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                 : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400';
    
    const icon = type === 'error' ? 'error' : type === 'info' ? 'info' : 'check_circle';

    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg transform transition-all duration-300 translate-y-10 opacity-0 ${colors}`;
    toast.innerHTML = `<span class="material-symbols-rounded text-xl">${icon}</span><span class="text-sm font-medium">${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => { toast.classList.remove('translate-y-10', 'opacity-0'); }, 10);
    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
