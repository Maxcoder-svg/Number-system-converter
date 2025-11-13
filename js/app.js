/**
 * Main Application File
 * Handles PWA functionality and app initialization
 */

class NumberSystemApp {
    constructor() {
        this.converter = null;
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.startApp());
            } else {
                this.startApp();
            }

            // Register service worker for PWA functionality
            if ('serviceWorker' in navigator) {
                await this.registerServiceWorker();
            }

            // Setup PWA installation
            this.setupPWAInstall();

            // Setup offline detection
            this.setupOfflineDetection();

            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();

        } catch (error) {
            console.error('App initialization failed:', error);
        }
    }

    /**
     * Start the main application
     */
    startApp() {
        try {
            // Initialize the number system converter
            this.converter = new NumberSystemConverter();
            
            // Add additional app-specific features
            this.setupThemeToggle();
            this.setupHelpModal();
            this.addAnalytics();
            
            console.log('Number System Converter App started successfully');
        } catch (error) {
            console.error('Failed to start converter:', error);
            this.showErrorMessage('Failed to start the application. Please refresh the page.');
        }
    }

    /**
     * Register service worker
     */
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered successfully:', registration);
            
            // Handle service worker updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showUpdateAvailable();
                    }
                });
            });
        } catch (error) {
            console.log('Service Worker registration failed:', error);
        }
    }

    /**
     * Setup PWA installation prompt
     */
    setupPWAInstall() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            deferredPrompt = e;
            
            // Show custom install button
            this.showInstallButton(deferredPrompt);
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.hideInstallButton();
        });
    }

    /**
     * Show install button
     * @param {Event} deferredPrompt - The deferred install prompt
     */
    showInstallButton(deferredPrompt) {
        const installBtn = document.createElement('button');
        installBtn.textContent = 'Install App';
        installBtn.className = 'install-btn';
        installBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            transition: all 0.3s ease;
        `;

        installBtn.addEventListener('click', async () => {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('User response to install prompt:', outcome);
            deferredPrompt = null;
            this.hideInstallButton();
        });

        document.body.appendChild(installBtn);
    }

    /**
     * Hide install button
     */
    hideInstallButton() {
        const installBtn = document.querySelector('.install-btn');
        if (installBtn) {
            installBtn.remove();
        }
    }

    /**
     * Setup offline detection
     */
    setupOfflineDetection() {
        const updateOnlineStatus = () => {
            const status = navigator.onLine ? 'online' : 'offline';
            document.body.classList.toggle('offline', !navigator.onLine);
            
            if (!navigator.onLine) {
                this.showOfflineMessage();
            } else {
                this.hideOfflineMessage();
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus();
    }

    /**
     * Show offline message
     */
    showOfflineMessage() {
        let offlineMsg = document.querySelector('.offline-message');
        
        if (!offlineMsg) {
            offlineMsg = document.createElement('div');
            offlineMsg.className = 'offline-message';
            offlineMsg.textContent = 'You are offline. The app will continue to work.';
            offlineMsg.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #FF9800;
                color: white;
                text-align: center;
                padding: 10px;
                z-index: 1001;
                font-weight: 600;
            `;
            document.body.appendChild(offlineMsg);
        }
    }

    /**
     * Hide offline message
     */
    hideOfflineMessage() {
        const offlineMsg = document.querySelector('.offline-message');
        if (offlineMsg) {
            offlineMsg.remove();
        }
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K: Clear all
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (this.converter) {
                    this.converter.clearAll();
                }
            }
            
            // Ctrl/Cmd + C: Copy results (when not in input field)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !e.target.matches('input')) {
                e.preventDefault();
                if (this.converter) {
                    this.converter.copyResults();
                }
            }
            
            // Escape: Clear all
            if (e.key === 'Escape') {
                if (this.converter) {
                    this.converter.clearAll();
                }
            }
        });
    }

    /**
     * Setup theme toggle (for future enhancement)
     */
    setupThemeToggle() {
        // This could be extended to add dark/light theme toggle
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.classList.add(savedTheme);
        }
    }

    /**
     * Setup help modal (for future enhancement)
     */
    setupHelpModal() {
        // Could add help modal with keyboard shortcuts and usage instructions
        console.log('Help modal setup complete');
    }

    /**
     * Add simple analytics tracking
     */
    addAnalytics() {
        // Track page load
        this.trackEvent('app_start');
        
        // Track conversion usage (could be extended)
        if (this.converter) {
            const originalHandleInput = this.converter.handleInput.bind(this.converter);
            this.converter.handleInput = (sourceType, value) => {
                if (value.trim()) {
                    this.trackEvent('conversion', { from: sourceType });
                }
                return originalHandleInput(sourceType, value);
            };
        }
    }

    /**
     * Track events (simplified analytics)
     * @param {string} eventName - Event name
     * @param {Object} data - Event data
     */
    trackEvent(eventName, data = {}) {
        // Simple client-side tracking
        const event = {
            name: eventName,
            timestamp: new Date().toISOString(),
            data: data,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.log('Analytics event:', event);
        
        // Could integrate with analytics services like Google Analytics
        // gtag('event', eventName, data);
    }

    /**
     * Show update available notification
     */
    showUpdateAvailable() {
        const updateNotification = document.createElement('div');
        updateNotification.className = 'update-notification';
        updateNotification.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: #2196F3;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 1000;
                max-width: 300px;
            ">
                <strong>Update Available!</strong><br>
                A new version is ready.
                <br><br>
                <button onclick="window.location.reload()" style="
                    background: white;
                    color: #2196F3;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                    margin-right: 10px;
                ">Update Now</button>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: transparent;
                    color: white;
                    border: 1px solid white;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                ">Later</button>
            </div>
        `;
        document.body.appendChild(updateNotification);
    }

    /**
     * Show error message
     * @param {string} message - Error message to show
     */
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #f44336;
            color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1002;
            max-width: 400px;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <strong>Error</strong><br>
            ${message}
            <br><br>
            <button onclick="this.parentElement.remove(); window.location.reload();" style="
                background: white;
                color: #f44336;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 600;
            ">Reload Page</button>
        `;
        document.body.appendChild(errorDiv);
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Could send to error tracking service
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

// Initialize the app
const app = new NumberSystemApp();