// /js/main.js

let currentUser = {};

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    setupMenus(); // New function for header menus
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
    }
}

// 2. Update UI
function updateDashboardUI(profile) {
    const headerAvatar = document.getElementById('header-avatar');
    
    // Menu Elements
    const menuAvatarLarge = document.getElementById('menu-avatar-large');
    const menuName = document.getElementById('menu-name');
    const menuEmail = document.getElementById('menu-email');

    // Authentik field mapping
    const displayName = profile.name || profile.given_name || profile.nickname || "User";
    const email = profile.email || "No email";
    const initials = displayName.charAt(0).toUpperCase();

    // Update Header
    if (headerAvatar) headerAvatar.textContent = initials;

    // Update User Menu (Top Right Dropdown)
    if (menuAvatarLarge) menuAvatarLarge.textContent = initials;
    if (menuName) menuName.textContent = displayName;
    if (menuEmail) menuEmail.textContent = email;
}

// 3. Setup Header Menus (Apps & User)
function setupMenus() {
    const appsBtn = document.getElementById('apps-btn');
    const userBtn = document.getElementById('user-btn');
    const appsMenu = document.getElementById('apps-menu');
    const userMenu = document.getElementById('user-menu');
    
    // Toggle Apps Menu
    appsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.add('hidden'); // Close other
        appsMenu.classList.toggle('hidden');
    });

    // Toggle User Menu
    userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        appsMenu.classList.add('hidden'); // Close other
        userMenu.classList.toggle('hidden');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!appsMenu.contains(e.target) && !appsBtn.contains(e.target)) {
            appsMenu.classList.add('hidden');
        }
        if (!userMenu.contains(e.target) && !userBtn.contains(e.target)) {
            userMenu.classList.add('hidden');
        }
    });

    // Mobile Sidebar Logic
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
    // Hide all contents
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    
    // Reset Navs
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active', 'bg-indigo-500/10', 'text-indigo-400');
        link.classList.add('text-slate-400');
    });

    // Show Target
    const content = document.getElementById(`tab-${targetId}`);
    if(content) content.classList.remove('hidden');

    // Highlight Nav
    const nav = document.getElementById(`nav-${targetId}`);
    if(nav) {
        nav.classList.add('active', 'bg-indigo-500/10', 'text-indigo-400');
        nav.classList.remove('text-slate-400');
    }

    // Close User Menu if it was used to navigate
    document.getElementById('user-menu').classList.add('hidden');
};
