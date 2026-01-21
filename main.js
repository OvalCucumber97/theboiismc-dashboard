// /js/dashmain.js

let currentUser = {};
// 1. Setup the "Walkie-Talkie" channel
const authChannel = new BroadcastChannel('theboiismc_auth_channel');

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    setupMenus();

    // Listen for logout events from Maps or other apps
    authChannel.onmessage = (event) => {
        if (event.data === 'logout_success') {
            console.log("Logout detected from another tab");
            window.location.reload();
        }
    };
});

async function initDashboard() {
    try {
        const response = await fetch('/me');
        
        if (response.status === 401) {
            // Guest State
            return;
        }

        if (!response.ok) throw new Error("API Error");

        currentUser = await response.json();
        updateDashboardUI(currentUser);

        // 2. Announce Login to Maps/Drive/etc.
        // If Maps is open in a background tab, it will hear this and auto-login.
        authChannel.postMessage('login_success');

    } catch (error) {
        console.error("Failed to load dashboard data:", error);
        document.querySelector('main').innerHTML = `
            <div class="flex flex-col items-center justify-center h-64 text-center">
                <span class="material-symbols-rounded text-4xl text-red-400 mb-2">error_outline</span>
                <h2 class="text-xl font-bold text-white">Unable to load profile</h2>
                <button onclick="window.location.reload()" class="px-5 py-2 bg-indigo-600 text-white rounded-lg mt-4">Retry</button>
            </div>
        `;
    }
}

function updateDashboardUI(profile) {
    const headerAvatar = document.getElementById('header-avatar');
    const menuAvatarLarge = document.getElementById('menu-avatar-large');
    const menuName = document.getElementById('menu-name');
    const menuEmail = document.getElementById('menu-email');
    const infoAvatarSmall = document.getElementById('info-avatar-small');
    const infoName = document.getElementById('info-name');
    const infoEmail = document.getElementById('info-email');

    const displayName = profile.name || profile.given_name || profile.nickname || "User";
    const email = profile.email || "No email";
    const initials = displayName.charAt(0).toUpperCase();

    if (headerAvatar) headerAvatar.textContent = initials;
    if (menuAvatarLarge) menuAvatarLarge.textContent = initials;
    if (menuName) menuName.textContent = displayName;
    if (menuEmail) menuEmail.textContent = email;
    if (infoAvatarSmall) infoAvatarSmall.textContent = initials;
    if (infoName) infoName.textContent = displayName;
    if (infoEmail) infoEmail.textContent = email;
}

function setupMenus() {
    const appsBtn = document.getElementById('apps-btn');
    const userBtn = document.getElementById('user-btn');
    const appsMenu = document.getElementById('apps-menu');
    const userMenu = document.getElementById('user-menu');
    
    appsBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu?.classList.add('hidden');
        appsMenu?.classList.toggle('hidden');
    });

    userBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        appsMenu?.classList.add('hidden');
        userMenu?.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (appsMenu && !appsMenu.contains(e.target) && !appsBtn.contains(e.target)) appsMenu.classList.add('hidden');
        if (userMenu && !userMenu.contains(e.target) && !userBtn.contains(e.target)) userMenu.classList.add('hidden');
    });

    // Mobile Sidebar
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    
    if(mobileBtn) mobileBtn.addEventListener('click', () => { sidebar.classList.remove('-translate-x-full'); backdrop.classList.remove('hidden'); });
    if(closeSidebarBtn) closeSidebarBtn.addEventListener('click', () => { sidebar.classList.add('-translate-x-full'); backdrop.classList.add('hidden'); });
    if(backdrop) backdrop.addEventListener('click', () => { sidebar.classList.add('-translate-x-full'); backdrop.classList.add('hidden'); });
}

window.switchTab = function(targetId) {
    document.querySelectorAll('.tab-content').forEach(c => { c.classList.add('hidden'); c.classList.remove('fade-in'); });
    document.querySelectorAll('.nav-link').forEach(link => { link.classList.remove('active', 'bg-indigo-500/10', 'text-indigo-400'); link.classList.add('text-slate-400'); });

    const content = document.getElementById(`tab-${targetId}`);
    if(content) { content.classList.remove('hidden'); setTimeout(() => content.classList.add('fade-in'), 10); }

    const nav = document.getElementById(`nav-${targetId}`);
    if(nav) { nav.classList.add('active', 'bg-indigo-500/10', 'text-indigo-400'); nav.classList.remove('text-slate-400'); }
    
    document.getElementById('user-menu')?.classList.add('hidden');
};

window.openEditModal = function(field) {
    currentEditField = field;
    const modal = document.getElementById('edit-modal');
    const input = document.getElementById('modal-input');
    const errorMsg = document.getElementById('modal-error');
    if(!modal) return;

    errorMsg.classList.add('hidden');
    input.value = "";
    
    if (field === 'name') input.value = currentUser.name || "";
    else if (field === 'email') input.value = currentUser.email || "";
    else if (field === 'avatar') return; 

    modal.classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('modal-backdrop').classList.remove('opacity-0');
        document.getElementById('modal-content').classList.remove('opacity-0', 'scale-95');
        document.getElementById('modal-content').classList.add('opacity-100', 'scale-100');
    }, 10);
};

window.closeModal = function() {
    const modal = document.getElementById('edit-modal');
    document.getElementById('modal-backdrop').classList.add('opacity-0');
    document.getElementById('modal-content').classList.remove('opacity-100', 'scale-100');
    document.getElementById('modal-content').classList.add('opacity-0', 'scale-95');
    setTimeout(() => { modal.classList.add('hidden'); currentEditField = null; }, 200);
};

window.saveChanges = async function() {
    const input = document.getElementById('modal-input');
    const btn = document.getElementById('save-btn');
    
    if (!input.value) return;

    btn.textContent = "Saving...";
    btn.disabled = true;

    try {
        const payload = {};
        if (currentEditField === 'name') payload.name = input.value;
        if (currentEditField === 'email') payload.email = input.value;

        const res = await fetch('/update', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Update failed");

        currentUser = { ...currentUser, ...payload }; 
        updateDashboardUI(currentUser);
        closeModal();
    } catch (err) {
        console.error(err);
    } finally {
        btn.textContent = "Save Changes";
        btn.disabled = false;
    }
};
