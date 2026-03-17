/* ============================================
   PROJECTS MODULE
   Manually configurable projects showcase
   ============================================ */

const ProjectsModule = (() => {

    const PROJECTS = [
        {
            name: 'AfricaRP',
            role: 'Developer & Admin',
            description: 'Игровой сервер с кастомными плагинами и уникальным геймплеем.',
            logo: 'assets/africarp.png',
            emoji: '',
            url: 'https://t.me/africarp'
        },
        // ===== ADD MORE PROJECTS BELOW =====
        // {
        //     name: 'Project Name',
        //     role: 'Your Role',
        //     description: 'Short description',
        //     logo: 'https://example.com/logo.png',
        //     emoji: '✨',
        //     url: 'https://project-url.com'
        // },
    ];
    // ===================================

    function init() {
        const grid = document.getElementById('projects-grid');
        if (!grid) return;

        if (PROJECTS.length === 0) {
            grid.innerHTML = `
                <div class="bento-card" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">
                    <p>Проекты скоро появятся...</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = PROJECTS.map(project => createProjectCard(project)).join('');
    }

    function createProjectCard(project) {
        const logoHtml = project.logo
            ? `<img src="${project.logo}" alt="${project.name}" class="project-logo">`
            : `<div class="project-logo-placeholder">${project.emoji || '📁'}</div>`;

        return `
            <div class="bento-card project-card" data-tilt onclick="window.open('${project.url}', '_blank')">
                <div class="project-header">
                    ${logoHtml}
                    <div class="project-title-group">
                        <div class="project-name">${escapeHtml(project.name)}</div>
                        <div class="project-role">${escapeHtml(project.role)}</div>
                    </div>
                </div>
                <p class="project-description">${escapeHtml(project.description)}</p>
                <div class="project-arrow">
                    <i class="fas fa-arrow-right"></i>
                </div>
            </div>
        `;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return { init };
})();