document.addEventListener("DOMContentLoaded", () => {
    initSpaceBackground(); // Запускаем фон
    
    // Пытаемся загрузить данные
    loadBio();
    renderTechStack();
    loadRepos();
    renderProjects();
    
    // Плеер
    try {
        initMusicPlayer();
    } catch(e) { console.log("Player init failed:", e); }
});

/* --- 0. Space Background Generator --- */
function initSpaceBackground() {
    const canvas = document.getElementById('space-canvas');
    const ctx = canvas.getContext('2d');
    
    let width, height, stars = [];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        createStars();
    }

    function createStars() {
        stars = [];
        const count = Math.floor((width * height) / 3000); // Плотность звезд
        for(let i=0; i<count; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2,
                speed: Math.random() * 0.5 + 0.1,
                opacity: Math.random(),
                dir: Math.random() > 0.5 ? 1 : -1
            });
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Рисуем звезды
        stars.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();

            // Движение
            star.y -= star.speed;
            star.opacity += 0.005 * star.dir;

            // Мерцание
            if(star.opacity > 1 || star.opacity < 0.2) star.dir *= -1;

            // Сброс позиции
            if(star.y < 0) {
                star.y = height;
                star.x = Math.random() * width;
            }
        });

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
}

/* --- 1. BIO Section --- */
async function loadBio() {
    const bioCard = document.getElementById('bio-card');
    
    // Проверка, загрузился ли конфиг
    if (typeof CONFIG === 'undefined') {
        bioCard.innerHTML = `<p style="color:red">Error: config.js is broken!</p>`;
        return;
    }

    try {
        const response = await fetch(`https://api.github.com/users/${CONFIG.githubUsername}`);
        
        if (response.status === 404) {
             throw new Error("User not found");
        }
        if (!response.ok) {
             throw new Error("GitHub API Error");
        }

        const data = await response.json();

        bioCard.innerHTML = `
            <img src="${data.avatar_url}" alt="Ava" class="avatar">
            <div class="bio-name">${data.name || data.login}</div>
            <div class="bio-loc"><i class="fa-solid fa-location-dot"></i> Russia <span class="flag">🇷🇺</span></div>
            <div class="socials">
                <a href="${CONFIG.socials.telegram}" target="_blank"><i class="fa-brands fa-telegram"></i></a>
                <a href="${CONFIG.socials.discord}" target="_blank"><i class="fa-brands fa-discord"></i></a>
                <a href="${data.html_url}" target="_blank"><i class="fa-brands fa-github"></i></a>
            </div>
            <div class="about-text">${CONFIG.aboutMe}</div>
        `;
    } catch (error) {
        console.error(error);
        bioCard.innerHTML = `
            <div style="text-align:center; color: #ff5555;">
                <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem; margin-bottom:10px;"></i>
                <p>GitHub Error: ${error.message}</p>
                <p style="font-size:0.8rem; color:#888;">Check username in config.js</p>
            </div>
        `;
    }
}

/* --- 2. Tech Stack --- */
function renderTechStack() {
    const track = document.getElementById('tech-track');
    const techs = CONFIG.technologies;
    // Дублируем для плавности
    let fillTechs = [...techs, ...techs, ...techs, ...techs]; 

    track.innerHTML = '';
    fillTechs.forEach(tech => {
        let el;
        if(CONFIG.useIcons) {
            // Используем FontAwesome
            el = document.createElement('i');
            el.className = `${tech} tech-icon-font`;
        } else {
            // Используем SVG файлы
            el = document.createElement('img');
            el.src = `assets/technologies/${tech}.svg`;
            el.className = 'tech-icon';
            el.alt = tech;
            el.onerror = () => { el.style.display = 'none'; };
        }
        track.appendChild(el);
    });
}

/* --- 3. Repositories --- */
async function loadRepos() {
    const list = document.getElementById('repos-list');
    try {
        const response = await fetch(`https://api.github.com/users/${CONFIG.githubUsername}/repos?sort=updated&per_page=6`);
        if(!response.ok) throw new Error("Repo fetch failed");
        const repos = await response.json();

        list.innerHTML = '';
        if(repos.length === 0) list.innerHTML = '<p>No public repos found.</p>';

        repos.forEach(repo => {
            const div = document.createElement('a');
            div.href = repo.html_url;
            div.target = "_blank";
            div.className = 'repo-item';
            div.innerHTML = `
                <span class="repo-name">${repo.name}</span>
                <span class="repo-desc">${repo.description || "No description provided."}</span>
                <div class="repo-meta">
                    <span><i class="fa-solid fa-star" style="color:gold"></i> ${repo.stargazers_count}</span>
                    <span><i class="fa-solid fa-code-branch"></i> ${repo.forks_count}</span>
                    <span>${repo.language || 'Code'}</span>
                </div>
            `;
            list.appendChild(div);
        });
    } catch (e) {
        list.innerHTML = `<p style="color:#aaa">Не удалось загрузить репозитории. <br> Проверь подключение или CORS.</p>`;
    }
}

/* --- 4. Projects --- */
function renderProjects() {
    const grid = document.getElementById('projects-grid');
    CONFIG.projects.forEach(proj => {
        const item = document.createElement('a');
        item.href = proj.link;
        item.target = "_blank";
        item.className = 'project-item';
        item.innerHTML = `
            <div class="project-top">
                <img src="${proj.logoUrl}" class="project-img" alt="logo">
                <div>
                    <div style="font-weight:700; font-size:1.1rem">${proj.name}</div>
                    <span class="project-role">${proj.role}</span>
                </div>
            </div>
            <div class="project-desc">${proj.description}</div>
        `;
        grid.appendChild(item);
    });
}

/* --- 5. Music Player --- */
function initMusicPlayer() {
    if (!CONFIG.playlist || CONFIG.playlist.length === 0) return;

    const player = document.getElementById('music-player');
    const audio = new Audio();
    let index = 0;
    let isPlaying = false;
    let ctx, analyser, canvas, canvasCtx;

    // Elements
    const els = {
        play: document.getElementById('play-btn'),
        miniPlay: document.getElementById('mini-play-btn'),
        prev: document.getElementById('prev-btn'),
        next: document.getElementById('next-btn'),
        title: document.getElementById('track-name'),
        artist: document.getElementById('track-artist'),
        toggle: document.getElementById('toggle-player'),
        slider: document.getElementById('seek-slider'),
        time: document.getElementById('current-time'),
        dur: document.getElementById('duration')
    };

    function loadTrack(i) {
        const track = CONFIG.playlist[i];
        if(!track) return;
        audio.src = `songs/${track.filename}`;
        els.title.innerText = track.title;
        els.artist.innerText = track.artist;
        // Сбрасываем слайдер
        els.slider.value = 0;
    }

    function togglePlay() {
        if(!ctx) setupVisualizer();
        
        if (isPlaying) {
            audio.pause();
            updateIcons(false);
        } else {
            audio.play().catch(e => console.log("Autoplay blocked"));
            updateIcons(true);
        }
        isPlaying = !isPlaying;
    }

    function updateIcons(play) {
        const icon = play ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
        els.play.innerHTML = icon;
        els.miniPlay.innerHTML = icon;
    }

    // Слушатели
    els.play.onclick = togglePlay;
    els.miniPlay.onclick = (e) => { e.stopPropagation(); togglePlay(); };
    
    els.next.onclick = () => {
        index = (index + 1) % CONFIG.playlist.length;
        loadTrack(index);
        if(isPlaying) audio.play();
    };
    els.prev.onclick = () => {
        index = (index - 1 + CONFIG.playlist.length) % CONFIG.playlist.length;
        loadTrack(index);
        if(isPlaying) audio.play();
    };

    audio.onended = els.next.onclick;

    // Timeline
    audio.ontimeupdate = () => {
        if(audio.duration) {
            const pct = (audio.currentTime / audio.duration) * 100;
            els.slider.value = pct;
            els.time.innerText = fmtTime(audio.currentTime);
            els.dur.innerText = fmtTime(audio.duration);
        }
    };

    els.slider.oninput = () => {
        const time = (els.slider.value / 100) * audio.duration;
        audio.currentTime = time;
    };

    // Сворачивание/Разворачивание
    player.onclick = () => {
        if(player.classList.contains('collapsed')) {
            player.classList.remove('collapsed');
            els.toggle.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
        }
    };
    
    els.toggle.onclick = (e) => {
        e.stopPropagation();
        player.classList.add('collapsed');
        els.toggle.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
    };

    // Инициализация
    loadTrack(index);

    function fmtTime(s) {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec < 10 ? '0'+sec : sec}`;
    }

    function setupVisualizer() {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        const src = ctx.createMediaElementSource(audio);
        analyser = ctx.createAnalyser();
        src.connect(analyser);
        analyser.connect(ctx.destination);
        analyser.fftSize = 64;
        
        canvas = document.getElementById('visualizer');
        canvasCtx = canvas.getContext('2d');
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function draw() {
            if(player.classList.contains('collapsed')) {
                requestAnimationFrame(draw); return;
            }
            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight, x = 0;
            
            for(let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;
                canvasCtx.fillStyle = `rgb(${barHeight + 100}, 80, 220)`;
                canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        }
        draw();
    }
}