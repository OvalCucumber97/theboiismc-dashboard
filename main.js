// /js/main.js

let currentUser = {};
let currentEditField = null;

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    setupMenus();
});

// 1. Fetch User Data (With Safe Error Handling)
async function initDashboard() {
    try {
        const response = await fetch('/me');
        
        // Handle Session Expiry (401)
        if (response.status === 401) {
            console.warn("Session expired. Redirecting...");
            // Redirect to auth to re-establish session
            window.location.href = "https://accounts.theboiismc.com/application/o/authorize/?client_id=yopePhMvPt1dj65UFbmVkxHIuX7MDeeNBoobKSQy&redirect_uri=https://myaccount.theboiismc.com/callback&response_type=code&scope=openid+profile+email";
            return;
        }

        if (!response.ok) throw new Error("API Error");

        currentUser = await response.json();
        updateDashboardUI(currentUser);

    } catch (error) {
        console.error("Failed to load dashboard data:", error);
        // Show friendly error UI
        document.querySelector('main').innerHTML = `
            <div class="flex flex-col items-center justify-center h-64 text-center">
                <span class="material-symbols-rounded text-4xl text-red-400 mb-2">error_outline</span>
                <h2 class="text-xl font-bold text-white">Unable to load profile</h2>
                <p class="text-slate-400 text-sm mt-1 mb-4">We couldn't verify your identity.</p>
                <button onclick="window.location.reload()" class="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition">Retry</button>
            </div>
        `;
    }
}

// 2. Update UI (Replace Skeletons with Data)
function updateDashboardUI(profile) {
    // Header & Menus
    const headerAvatar = document.getElementById('header-avatar');
    const menuAvatarLarge = document.getElementById('menu-avatar-large');
    const menuName = document.getElementById('menu-name');
    const menuEmail = document.getElementById('menu-email');

    // Tab Content
    const infoAvatarSmall = document.getElementById('info-avatar-small');
    const infoName = document.getElementById('info-name');
    const infoEmail = document.getElementById('info-email');

    const displayName = profile.name || profile.given_name || profile.nickname || "User";
    const email = profile.email || "No email";
    const initials = displayName.charAt(0).toUpperCase();

    // Update Text (This automatically removes the skeleton div inside infoName/infoEmail)
    if (headerAvatar) headerAvatar.textContent = initials;
    if (menuAvatarLarge) menuAvatarLarge.textContent = initials;
    if (menuName) menuName.textContent = displayName;
    if (menuEmail) menuEmail.textContent = email;

    if (infoAvatarSmall) infoAvatarSmall.textContent = initials;
    if (infoName) infoName.textContent = displayName;
    if (infoEmail) infoEmail.textContent = email;
}

// 3. Setup Menus & Navigation
function setupMenus() {
    const appsBtn = document.getElementById('apps-btn');
    const userBtn = document.getElementById('user-btn');
    const appsMenu = document.getElementById('apps-menu');
    const userMenu = document.getElementById('user-menu');
    
    // Header Toggles
    appsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.add('hidden');
        appsMenu.classList.toggle('hidden');
    });

    userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        appsMenu.classList.add('hidden');
        userMenu.classList.toggle('hidden');
    });

    // Close on Click Outside
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
    const closeSidebarBtn = document.getElementById('close-sidebar-btn'); // New close button
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    
    const openSidebar = () => {
        sidebar.classList.remove('-translate-x-full');
        backdrop.classList.remove('hidden');
    };
    
    const closeSidebar = () => {
        sidebar.classList.add('-translate-x-full');
        backdrop.classList.add('hidden');
    };

    if(mobileBtn) mobileBtn.addEventListener('click', openSidebar);
    if(closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
    if(backdrop) backdrop.addEventListener('click', closeSidebar);
}

// 4. Tab Switcher (With Smooth Animation)
window.switchTab = function(targetId) {
    // Hide all
    document.querySelectorAll('.tab-content').forEach(c => {
        c.classList.add('hidden');
        c.classList.remove('fade-in'); // Reset animation
    });
    
    // Reset Nav Styles
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active', 'bg-indigo-500/10', 'text-indigo-400');
        link.classList.add('text-slate-400');
    });

    // Show Target
    const content = document.getElementById(`tab-${targetId}`);
    if(content) {
        content.classList.remove('hidden');
        // Trigger Animation
        setTimeout(() => content.classList.add('fade-in'), 10);
    }

    // Highlight Nav
    const nav = document.getElementById(`nav-${targetId}`);
    if(nav) {
        nav.classList.add('active', 'bg-indigo-500/10', 'text-indigo-400');
        nav.classList.remove('text-slate-400');
    }

    // Cleanup Menus
    document.getElementById('user-menu').classList.add('hidden');
    
    // Close Mobile Sidebar if Open
    const sidebar = document.getElementById('sidebar');
    if (!sidebar.classList.contains('-translate-x-full')) {
        const backdrop = document.getElementById('sidebar-backdrop');
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

// 7. Toast Notification
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
        setTimeout(() => toast.remove(), 3000);
    }, 3000);
}
