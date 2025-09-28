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
        const installBtn = document.getElementById('install-btn');

        // Check if app is already installed
        if (window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches) {
            console.log('App is already installed');
            return;
        }

        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt event fired');
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            deferredPrompt = e;
            
            // Show the install button in the UI
            this.showInstallButton(deferredPrompt);
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.hideInstallButton();
            this.showInstallSuccess();
        });

        // For iOS Safari - show install instructions
        if (this.isIOS() && !window.navigator.standalone) {
            this.showIOSInstallInstructions();
        }

        // For Android browsers that don't support beforeinstallprompt
        if (this.isAndroid() && !deferredPrompt) {
            setTimeout(() => {
                if (!deferredPrompt) {
                    this.showManualInstallButton();
                }
            }, 3000);
        }
    }

    /**
     * Show install button
     * @param {Event} deferredPrompt - The deferred install prompt
     */
    showInstallButton(deferredPrompt) {
        const installBtn = document.getElementById('install-btn');
        
        if (installBtn) {
            installBtn.style.display = 'inline-block';
            installBtn.onclick = async () => {
                try {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log('User response to install prompt:', outcome);
                    
                    if (outcome === 'accepted') {
                        this.showInstallSuccess();
                    }
                    
                    deferredPrompt = null;
                    this.hideInstallButton();
                } catch (error) {
                    console.error('Install prompt error:', error);
                    this.showManualInstallInstructions();
                }
            };
        }

        // Also show floating install button for extra visibility
        this.showFloatingInstallButton(deferredPrompt);
    }

    /**
     * Show floating install button
     * @param {Event} deferredPrompt - The deferred install prompt
     */
    showFloatingInstallButton(deferredPrompt) {
        // Don't show floating button if main button is visible
        const mainInstallBtn = document.getElementById('install-btn');
        if (mainInstallBtn && mainInstallBtn.style.display !== 'none') {
            return;
        }

        const floatingBtn = document.createElement('button');
        floatingBtn.innerHTML = '📱 Install App';
        floatingBtn.className = 'floating-install-btn';
        floatingBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            transition: all 0.3s ease;
            font-size: 14px;
            animation: pulse 2s infinite;
        `;

        // Add CSS animation
        if (!document.getElementById('install-animation-style')) {
            const style = document.createElement('style');
            style.id = 'install-animation-style';
            style.textContent = `
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                .floating-install-btn:hover {
                    transform: translateY(-2px) scale(1.05);
                    box-shadow: 0 8px 20px rgba(76, 175, 80, 0.4);
                }
            `;
            document.head.appendChild(style);
        }

        floatingBtn.addEventListener('click', async () => {
            try {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log('User response to install prompt:', outcome);
                
                if (outcome === 'accepted') {
                    this.showInstallSuccess();
                }
                
                deferredPrompt = null;
                floatingBtn.remove();
            } catch (error) {
                console.error('Install prompt error:', error);
                this.showManualInstallInstructions();
            }
        });

        document.body.appendChild(floatingBtn);
    }

    /**
     * Hide install button
     */
    hideInstallButton() {
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }

        const floatingBtn = document.querySelector('.floating-install-btn');
        if (floatingBtn) {
            floatingBtn.remove();
        }
    }

    /**
     * Show manual install button for browsers without beforeinstallprompt
     */
    showManualInstallButton() {
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.style.display = 'inline-block';
            installBtn.textContent = '📱 Add to Home';
            installBtn.onclick = () => {
                this.showManualInstallInstructions();
            };
        }
    }

    /**
     * Show manual install instructions
     */
    showManualInstallInstructions() {
        const isIOS = this.isIOS();
        const isAndroid = this.isAndroid();
        
        let instructions = '';
        if (isIOS) {
            instructions = `
                <strong>Install on iOS:</strong><br>
                1. Tap the Share button <strong>⎋</strong><br>
                2. Tap "Add to Home Screen"<br>
                3. Tap "Add" to install the app
            `;
        } else if (isAndroid) {
            instructions = `
                <strong>Install on Android:</strong><br>
                1. Tap the menu button (⋮)<br>
                2. Tap "Add to Home screen"<br>
                3. Tap "Add" to install the app
            `;
        } else {
            instructions = `
                <strong>Install this app:</strong><br>
                • Chrome: Click menu → "Install Number System Converter"<br>
                • Firefox: Look for "Add to Home Screen" option<br>
                • Edge: Click menu → "Apps" → "Install this site as an app"
            `;
        }

        this.showModal('Install App', instructions);
    }

    /**
     * Show iOS install instructions
     */
    showIOSInstallInstructions() {
        setTimeout(() => {
            if (!window.navigator.standalone) {
                this.showManualInstallButton();
            }
        }, 5000); // Show after 5 seconds on iOS
    }

    /**
     * Show install success message
     */
    showInstallSuccess() {
        this.showNotification('🎉 App installed successfully! You can now use it from your home screen.', 'success');
    }

    /**
     * Check if device is iOS
     */
    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    /**
     * Check if device is Android
     */
    isAndroid() {
        return /Android/.test(navigator.userAgent);
    }

    /**
     * Show modal with instructions
     */
    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'install-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <h3>${title}</h3>
                <div class="modal-body">${content}</div>
                <button onclick="this.closest('.install-modal').remove()" class="btn btn-primary">Got it!</button>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const style = document.createElement('style');
        style.textContent = `
            .modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                backdrop-filter: blur(4px);
            }
            .modal-content {
                background: white;
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                max-width: 400px;
                margin: 20px;
                position: relative;
                text-align: center;
            }
            .modal-content h3 {
                margin-bottom: 20px;
                color: #333;
            }
            .modal-body {
                margin-bottom: 25px;
                line-height: 1.6;
                color: #666;
            }
            .modal-body strong {
                color: #2196F3;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(modal);
    }

    /**
     * Show notification message
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const backgroundColor = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#FF9800',
            info: '#2196F3'
        }[type] || '#2196F3';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${backgroundColor};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1500;
            font-weight: 600;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
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