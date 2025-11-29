// /js/auth.js for myaccount.theboiismc.com

// 🚨 OIDC Configuration - Specific to My Account
const CLIENT_ID = 'H4AZOCueKeuxtsH8oPsGEqXiYVL3bs3b6DoJ0vC9'; 
const AUTH_URL = 'https://accounts.theboiismc.com/application/o/theboiismc/'; 
const origin = window.location.origin; // https://myaccount.theboiismc.com

const settings = {
    authority: AUTH_URL,
    client_id: CLIENT_ID,
    // Callback is within this subdomain
    redirect_uri: `${origin}/callback.html`, 
    scope: 'openid profile email offline_access',
    // Logout returns to main site or stays here (User preference)
    post_logout_redirect_uri: 'https://www.theboiismc.com', 
    response_type: 'code',
    silent_redirect_uri: `${origin}/silent-renew.html`,
    automaticSilentRenew: true,
};

const userManager = new oidc.UserManager(settings);

// --- Core Auth Functions ---

function signIn() {
    userManager.signinRedirect();
}

function signOut() {
    userManager.signoutRedirect();
}

/**
 * Enforce Authentication
 * If no user is found, redirect to login immediately.
 * This is a "protected app" behavior.
 */
async function requireAuth() {
    try {
        const user = await userManager.getUser();
        if (user && !user.expired) {
            console.log("User authenticated:", user.profile);
            // Call the UI update function from main.js
            if (typeof updateDashboardUI === 'function') {
                updateDashboardUI(user);
            }
        } else {
            console.log("No session. Redirecting to login...");
            // Store current path to redirect back after login if needed (optional)
            // sessionStorage.setItem('redirect_after_login', window.location.pathname);
            signIn();
        }
    } catch (error) {
        console.error("Auth check failed:", error);
        signIn();
    }
}

// Event Listener for Sign Out button in UI
document.addEventListener('DOMContentLoaded', () => {
    const signOutBtn = document.getElementById('sign-out-btn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', signOut);
    }
});

// Start the check
requireAuth();

// Silent Renew Events
userManager.events.addAccessTokenExpired(() => {
    console.warn("Token expired. Attempting silent renew...");
    userManager.signinSilent().catch(err => {
        console.error("Silent renew failed", err);
        signIn(); // Force re-login if silent renew fails
    });
});
