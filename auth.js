// auth.js - Handles OIDC Authentication for MyAccount

// Using the DASHBOARD Client ID (yope...), NOT the Main Site ID (H4AZ...)
const CLIENT_ID = 'yopePhMvPt1dj65UFbmVkxHIuX7MDeeNBoobKSQy'; 
const AUTH_URL = 'https://accounts.theboiismc.com/application/o/theboiismc/'; 
const origin = window.location.origin;

const settings = {
    authority: AUTH_URL,
    client_id: CLIENT_ID,
    redirect_uri: `${origin}/callback.html`, 
    scope: 'openid profile email offline_access',
    post_logout_redirect_uri: 'https://www.theboiismc.com', 
    response_type: 'code',
    silent_redirect_uri: `${origin}/silent-renew.html`,
    automaticSilentRenew: true,
};

const userManager = new oidc.UserManager(settings);

/**
 * Main Auth Check Function
 */
async function requireAuth() {
    try {
        const user = await userManager.getUser();
        
        if (user && !user.expired) {
            console.log("User authenticated");
            // Call the GLOBAL function from main.js to update the page
            if (typeof window.updateDashboardUI === 'function') {
                window.updateDashboardUI(user);
            } else {
                // Fallback: If UI function isn't ready yet, reveal the page anyway
                console.warn("UI function not found, revealing page anyway.");
                document.body.classList.add('loaded');
            }
        } else {
            console.log("No active session. Redirecting to login...");
            userManager.signinRedirect();
        }
    } catch (error) {
        console.error('Auth Check Failed', error);
        userManager.signinRedirect();
    }
}

// Initialize Auth Check
requireAuth();

// Sign Out Handler
const signOutBtn = document.getElementById('sign-out-btn');
if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
        userManager.signoutRedirect();
    });
}
