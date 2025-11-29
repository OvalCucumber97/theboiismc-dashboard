// /js/main.js - Handles UI interactions and updates

// --- GLOBAL UI FUNCTION ---
// Attached to window so auth.js can find it easily
window.updateDashboardUI = function(user) {
    if (!user) return;
    const profile = user.profile;
    
    // 1. Get Elements
    const heroName = document.getElementById('hero-name');
    const heroAvatar = document.getElementById('hero-avatar');
    const infoAvatar = document.getElementById('info-avatar');
    const infoName = document.getElementById('info-name');
    const infoEmail = document.getElementById('info-email');

    // 2. Format Data
    const displayName = profile.given_name || profile.nickname || profile.name || profile.email.split('@')[0];
    const email = profile.email || 'No email';
    const initials = displayName.charAt(0).toUpperCase();

    // 3. Update Text
    if (heroName) heroName.textContent = displayName;
    if (heroAvatar) heroAvatar.textContent = initials;
    if (infoName) infoName.textContent = displayName;
    if (infoEmail) infoEmail.textContent = email;
    if (infoAvatar) infoAvatar.textContent = initials;
    
    // 4. CRITICAL: HIDE LOADING SCREEN
    // This adds the 'loaded' class which triggers the CSS opacity fade
    document.body.classList.add('loaded');
};

// --- TAB SWITCHING ---
window.switchTab = function(targetId) {
    // Reset Nav Links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        link.classList.add('text-zinc-400');
        link.classList.remove('text-indigo-400', 'bg-indigo-500/10');
    });

    // Hide all content sections
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

    // Activate Highlight
    const activeLink = document.getElementById(`nav-${targetId}`);
    if(activeLink) {
        activeLink.classList.add('active');
        activeLink.classList.remove('text-zinc-400');
    }
    
    // Show Content
    const targetContent = document.getElementById(`tab-${targetId}`);
    if(targetContent) {
        targetContent.classList.remove('hidden');
    }

    // Close Mobile Menu
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth < 768 && sidebar) {
        sidebar.classList.add('hidden');
    }
};

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            sidebar.classList.add('fixed', 'inset-0', 'bg-black', 'z-50', 'w-full', 'pt-20');
        });
    }
});
