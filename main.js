// /js/main.js - Handles UI interactions and updates

// --- DOM ELEMENTS ---
const heroName = document.getElementById('hero-name');
const heroAvatar = document.getElementById('hero-avatar');
const infoAvatar = document.getElementById('info-avatar');
const infoName = document.getElementById('info-name');
const infoEmail = document.getElementById('info-email');
const sidebar = document.getElementById('sidebar');
const appBody = document.getElementById('app-body');

/**
 * Updates the dashboard with user data and REVEALS the page.
 * Called by auth.js after login is confirmed.
 */
function updateDashboardUI(user) {
    if (!user) return;
    const profile = user.profile;
    
    // Determine the best display name
    const displayName = profile.given_name || profile.nickname || profile.name || profile.email.split('@')[0];
    const email = profile.email || 'No email';
    const initials = displayName.charAt(0).toUpperCase();

    // Update all text fields
    if (heroName) heroName.textContent = displayName;
    if (heroAvatar) heroAvatar.textContent = initials;
    if (infoName) infoName.textContent = displayName;
    if (infoEmail) infoEmail.textContent = email;
    if (infoAvatar) infoAvatar.textContent = initials;
    
    // CRITICAL: Remove the security cloak to show the page
    if (appBody) {
        appBody.classList.add('cloak-revealed');
    }
}

/**
 * Handles Tab Switching (Home -> Personal Info -> Security)
 */
function switchTab(targetId) {
    // 1. Reset all navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        link.classList.add('text-zinc-400');
        link.classList.remove('text-indigo-400', 'bg-indigo-500/10');
    });

    // 2. Hide all content sections
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

    // 3. Highlight the clicked link
    const activeLink = document.getElementById(`nav-${targetId}`);
    if(activeLink) {
        activeLink.classList.add('active');
        activeLink.classList.remove('text-zinc-400');
    }
    
    // 4. Show the target content
    const targetContent = document.getElementById(`tab-${targetId}`);
    if(targetContent) {
        targetContent.classList.remove('hidden');
    }

    // 5. Close Mobile Menu if it's open
    if (window.innerWidth < 768 && sidebar) {
        sidebar.classList.add('hidden');
    }
}

// Make switchTab global so HTML onclick="" works
window.switchTab = switchTab;

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            // Add fullscreen styling for mobile menu
            sidebar.classList.add('fixed', 'inset-0', 'bg-black', 'z-50', 'w-full', 'pt-20');
        });
    }
});
