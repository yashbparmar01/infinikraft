'use strict';

(function () {
    // 1. Theme resolution:
    // Check if the user made an explicit choice in the current session
    var savedTheme = null;
    try {
        if (sessionStorage.getItem('theme_explicitly_set') === 'true') {
            savedTheme = sessionStorage.getItem('theme');
        } else {
            // Clean up any stale legacy 'light' stored in localStorage or sessionStorage from previous versions
            if (localStorage.getItem('theme') === 'light') {
                localStorage.removeItem('theme');
            }
            sessionStorage.removeItem('theme');
        }
    } catch (e) {}

    // On fresh open/visit, the website MUST open in dark mode first
    var currentTheme = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';

    // Apply Bootstrap color mode immediately to avoid white/light-mode flash
    document.documentElement.setAttribute('data-bs-theme', currentTheme);

    function initSwitchers() {
        var switchers = document.querySelectorAll('.dark-light-switcher');

        function syncLogos(isDarkMode) {
            // In dark mode use favicon-dark.svg logo only
            var logoImgs = document.querySelectorAll('img[src*="favicon.svg"], img[src*="favicon-dark.svg"]');
            logoImgs.forEach(function (img) {
                var currentSrc = img.getAttribute('src');
                if (isDarkMode) {
                    if (currentSrc.indexOf('favicon.svg') !== -1) {
                        img.setAttribute('src', currentSrc.replace('favicon.svg', 'favicon-dark.svg'));
                    }
                } else {
                    // In light mode, swap header/offcanvas/search logos to favicon.svg
                    // Keep footer logo as favicon-dark.svg if inside a permanently dark footer
                    var inDarkFooter = img.closest('.footer-fixed-bottom, footer.bg-neutral-950, .changeless');
                    if (!inDarkFooter && currentSrc.indexOf('favicon-dark.svg') !== -1) {
                        img.setAttribute('src', currentSrc.replace('favicon-dark.svg', 'favicon.svg'));
                    }
                }
            });

            // Sync browser favicon shortcut icon (preserve favicon-Home.svg on Home page)
            var favicon = document.querySelector('link[rel="shortcut icon"], link[rel="icon"]');
            if (favicon) {
                var iconHref = favicon.getAttribute('href');
                if (iconHref && iconHref.indexOf('favicon-Home') === -1) {
                    if (isDarkMode && iconHref.indexOf('favicon.svg') !== -1) {
                        favicon.setAttribute('href', iconHref.replace('favicon.svg', 'favicon-dark.svg'));
                    } else if (!isDarkMode && iconHref.indexOf('favicon-dark.svg') !== -1) {
                        favicon.setAttribute('href', iconHref.replace('favicon-dark.svg', 'favicon.svg'));
                    }
                }
            }
        }

        function updateSwitcherCheckboxes(isDarkMode) {
            switchers.forEach(function (switcher) {
                var checkbox = switcher.querySelector('#switch');
                if (checkbox) {
                    checkbox.checked = isDarkMode;
                }
            });
            document.documentElement.setAttribute('data-bs-theme', isDarkMode ? 'dark' : 'light');
            syncLogos(isDarkMode);
        }

        var activeTheme = document.documentElement.getAttribute('data-bs-theme') || currentTheme;
        var isDarkMode = activeTheme === 'dark';

        // Initialize checkbox state and logos based on current color mode
        updateSwitcherCheckboxes(isDarkMode);

        // Add event listeners to all switchers
        switchers.forEach(function (switcher) {
            var checkbox = switcher.querySelector('#switch');
            if (checkbox) {
                checkbox.addEventListener('change', function () {
                    var isDark = this.checked;
                    var newTheme = isDark ? 'dark' : 'light';
                    try {
                        sessionStorage.setItem('theme_explicitly_set', 'true');
                        sessionStorage.setItem('theme', newTheme);
                        localStorage.setItem('theme', newTheme);
                    } catch (e) {}

                    document.documentElement.setAttribute('data-bs-theme', newTheme);
                    updateSwitcherCheckboxes(isDark);
                });
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSwitchers);
    } else {
        initSwitchers();
    }
})();

