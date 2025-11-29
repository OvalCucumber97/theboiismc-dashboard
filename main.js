// /js/main.js for myaccount.theboiismc.com

// DOM Elements
const heroName = document.getElementById('hero-name');
const heroAvatar = document.getElementById('hero-avatar');
const infoAvatar = document.getElementById('info-avatar');
const infoName = document.getElementById('info-name');
const infoEmail = document.getElementById('info-email');
const infoUsername = document.getElementById('info-username');

// Sidebar Tabs Logic
const tabs = document.querySelectorAll('[data-tab]');
const contents = document.querySelectorAll('.tab-content');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.getElementById('sidebar');

/**
 * Updates the Dashboard UI with user data
 * @param {object} user - The OIDC user object
 */
function updateDashboardUI(user) {
    if (!user) return; // auth.js handles redirection if no user

    const profile = user.profile;
    
    // Determine Display Name
    const displayName = profile.given_name || profile.name || profile.preferred_username || 'User';
    const email = profile.email || 'No email';
    const username = profile.preferred_username || profile.sub;
    
    // Determine Initials
    const initials = displayName.charAt(0).toUpperCase();

    // 1. Update Hero Section
    if (heroName) heroName.textContent = displayName;
    if (heroAvatar) heroAvatar.textContent = initials;

    // 2. Update Personal Info Section
    if (infoName) infoName.textContent = displayName;
    if (infoEmail) infoEmail.textContent = email;
    if (infoUsername) infoUsername.textContent = username;
    if (infoAvatar) infoAvatar.textContent = initials;
}


// Tab Switching Logic
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active', 'bg-gray-800', 'text-white'));
        tabs.forEach(t => t.classList.add('text-gray-300'));
        
        // Hide all content
        contents.forEach(c => c.classList.add('hidden'));

        // Activate clicked tab
        tab.classList.add('active', 'text-white');
        tab.classList.remove('text-gray-300');
        
        // Show target content
        const targetId = tab.getAttribute('data-tab');
        document.getElementById(`tab-${targetId}`).classList.remove('hidden');

        // Close mobile menu if open
        if (window.innerWidth < 768) {
             sidebar.classList.add('hidden');
        }
    });
});

// Mobile Menu Toggle
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        sidebar.classList.add('fixed', 'inset-0', 'bg-gray-900', 'z-50', 'w-full');
        // Simple fix to ensure it covers screen on mobile
    });
}
