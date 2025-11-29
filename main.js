// /js/main.js - UI Interactions & Data Fetching

// 1. Fetch User Data from Worker
async function initDashboard() {
    try {
        const response = await fetch('/me');
        
        if (!response.ok) {
            // If fetching /me fails (401 Unauthorized), the worker middleware
            // should have already redirected us, but if we are here, reload to force it.
            window.location.reload(); 
            return;
        }

        const profile = await response.json();
        updateDashboardUI(profile);

    } catch (error) {
        console.error("Failed to load dashboard data:", error);
    }
}

// 2. Update UI with Data
function updateDashboardUI(profile) {
    const heroName = document.getElementById('hero-name');
    const heroAvatar = document.getElementById('hero-avatar');
    const infoAvatar = document.getElementById('info-avatar');
    const infoName = document.getElementById('info-name');
    const infoEmail = document.getElementById('info-email');

    // Authentik returns fields like: given_name, nickname, name, email
    const displayName = profile.given_name || profile.nickname || profile.name || profile.preferred_username || "User";
    const email = profile.email || "No email";
    const initials = displayName.charAt(0).toUpperCase();

    if (heroName) heroName.textContent = displayName;
    if (heroAvatar) heroAvatar.textContent = initials;
    if (infoName) infoName.textContent = displayName;
    if (infoEmail) infoEmail.textContent = email;
    if (infoAvatar) infoAvatar.textContent = initials;
}

// 3. Tab Switcher
window.switchTab = function(targetId) {
    // Reset Nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active', 'text-indigo-400', 'bg-indigo-500/10');
        link.classList.add('text-zinc-400');
    });

    // Hide Content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

    // Activate
    const activeLink = document.getElementById(`nav-${targetId}`);
    if(activeLink) {
        activeLink.classList.add('active', 'text-indigo-400', 'bg-indigo-500/10');
        activeLink.classList.remove('text-zinc-400');
    }
    
    const targetContent = document.getElementById(`tab-${targetId}`);
    if(targetContent) {
        targetContent.classList.remove('hidden');
    }

    // Mobile Menu
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth < 768 && sidebar) {
        sidebar.classList.add('hidden');
    }
};

// 4. Init
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            sidebar.classList.add('fixed', 'inset-0', 'bg-black', 'z-50', 'w-full', 'pt-20');
        });
    }
});
