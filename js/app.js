/* ============================================
   APP MODULE — Main entry point
   Orchestrates all modules
   ============================================ */

(function App() {
    'use strict';

    PreloaderModule.init(() => {
        showContent();
        PlayerModule.startPlayback();
    });

    BackgroundModule.init();

    BioModule.init();
    TechModule.init();
    ReposModule.init();
    ProjectsModule.init();
    PlayerModule.init();
    EasterEggsModule.init();

    function showContent() {
        const main = document.getElementById('main-content');
        if (main) {
            main.classList.remove('hidden');
        }

        setupScrollAnimations();
    }

    function setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.fade-in-up').forEach(el => {
            observer.observe(el);
        });
    }

})();