/* ============================================
   TECH MARQUEE MODULE
   Configurable tech stack with auto-scrolling
   ============================================ */

const TechModule = (() => {

    const TECHNOLOGIES = [
        { icon: 'devicon-html5-plain',       name: 'HTML5' },
        { icon: 'devicon-css3-plain',        name: 'CSS3' },
        { icon: 'devicon-javascript-plain',  name: 'JavaScript' },
        { icon: 'devicon-python-plain',      name: 'Python' },
        { icon: 'devicon-java-plain',        name: 'Java' },
        { icon: 'devicon-nodejs-plain',      name: 'Node.js' },
        { icon: 'devicon-git-plain',         name: 'Git' },
        { icon: 'devicon-docker-plain',      name: 'Docker' },
        { icon: 'devicon-ubuntu-plain',      name: 'Ubuntu' },
        { icon: 'devicon-linux-plain',       name: 'Linux' },
        { icon: 'devicon-nginx-original',    name: 'Nginx' },
        { icon: 'devicon-bash-plain',        name: 'Bash' },
        { icon: 'devicon-vscode-plain',      name: 'VS Code' },
    ];

    function init() {
        const marquee = document.getElementById('tech-marquee');
        if (!marquee) return;

        const html = buildItems() + buildItems();
        marquee.innerHTML = html;

        const totalWidth = TECHNOLOGIES.length * 100;
        const speed = totalWidth / 50;
        marquee.style.animationDuration = `${speed}s`;
    }

    function buildItems() {
        return TECHNOLOGIES.map(tech => `
            <div class="tech-item" title="${tech.name}">
                <i class="${tech.icon}"></i>
                <span>${tech.name}</span>
            </div>
        `).join('');
    }

    return { init };
})();