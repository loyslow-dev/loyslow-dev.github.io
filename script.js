document.addEventListener("DOMContentLoaded", () => {
    // 1. Запускаем фон
    initSpaceBackground();
    
    // 2. ЗАГРУЖАЕМ ДАННЫЕ (сразу, не ждем клика)
    loadBio();
    renderTechStack();
    loadRepos();
    renderProjects();

    // 3. Инициализируем логику входа
    initOverlayAndLogic();
});

/* --- Логика Оверлея и Входа --- */
function initOverlayAndLogic() {
    const overlay = document.getElementById('overlay');
    const container = document.querySelector('.container');
    
    // Инициализируем плеер (чтобы был готов играть)
    const playerControls = initMusicPlayerControls(); 

    // Обработка клика "Войти"
    overlay.addEventListener('click', () => {
        // А. Скрываем оверлей
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none'; // Чтобы больше не кликалось

        // Б. Показываем контент (добавляем класс из CSS)
        container.classList.add('visible');

        // В. Удаляем оверлей из DOM через секунду
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 800);

        // Г. Запускаем музыку
        if (playerControls) {
            playerControls.play();
        }
    });
}

/* --- Функции загрузки данных --- */

async function loadBio() {
    if(typeof CONFIG === 'undefined') return;
    const bioCard = document.getElementById('bio-card');
    try {
        const response = await fetch(`https://api.github.com/users/${CONFIG.githubUsername}`);
        if(!response.ok) throw new Error("GitHub Error");
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
    } catch (e) { 
        bioCard.innerHTML = `<p style="color:red">Error loading Bio from GitHub.<br>Check console.</p>`; 
        console.error(e);
    }
}

function renderTechStack() {
    const track = document.getElementById('tech-track');
    // Утраиваем массив для длинной бесконечной ленты
    const techs = [...CONFIG.technologies, ...CONFIG.technologies, ...CONFIG.technologies]; 
    track.innerHTML = '';
    
    techs.forEach(tech => {
        let el;
        if(CONFIG.useIcons) {
            el = document.createElement('i'); 
            el.className = `${tech} tech-icon-font`;
        } else {
            el = document.createElement('img'); 
            el.src = `assets/technologies/${tech}.svg`; 
            el.className = 'tech-icon';
            el.onerror = () => { el.style.display = 'none'; };
        }
        track.appendChild(el);
    });
}

async function loadRepos() {
    const list = document.getElementById('repos-list');
    try {
        const res = await fetch(`https://api.github.com/users/${CONFIG.githubUsername}/repos?sort=updated&per_page=6`);
        if (!res.ok) throw new Error();
        const repos = await res.json();
        list.innerHTML = '';
        repos.forEach(repo => {
            const a = document.createElement('a'); 
            a.href = repo.html_url; 
            a.target = "_blank"; 
            a.className = 'repo-item';
            a.innerHTML = `
                <span class="repo-name">${repo.name}</span>
                <span class="repo-desc">${repo.description || 'No description'}</span>
            `;
            list.appendChild(a);
        });
    } catch(e) { 
        list.innerHTML = '<p>Error loading repos</p>'; 
    }
}

function renderProjects() {
    const grid = document.getElementById('projects-grid');
    CONFIG.projects.forEach(proj => {
        const a = document.createElement('a'); 
        a.href = proj.link; 
        a.target = "_blank"; 
        a.className = 'project-item';
        a.innerHTML = `
            <div class="project-top">
                <img src="${proj.logoUrl}" class="project-img">
                <div>
                    <div style="font-weight:700">${proj.name}</div>
                    <span class="project-role">${proj.role}</span>
                </div>
            </div>
            <div class="project-desc">${proj.description}</div>
        `;
        grid.appendChild(a);
    });
}

/* --- Музыкальный плеер --- */
function initMusicPlayerControls() {
    if (!CONFIG.playlist || CONFIG.playlist.length === 0) {
        const wrapper = document.querySelector('.player-wrapper');
        if(wrapper) wrapper.style.display = 'none';
        return null;
    }

    const audio = new Audio();
    audio.volume = 0.5;
    let index = 0;
    let isPlaying = false;
    let ctx, analyser, canvas, canvasCtx;

    // UI Elements
    const els = {
        player: document.getElementById('music-player'),
        expandBtn: document.getElementById('expand-btn'),
        play: document.getElementById('play-btn'),
        miniPlay: document.getElementById('mini-play-btn'),
        prev: document.getElementById('prev-btn'),
        next: document.getElementById('next-btn'),
        title: document.getElementById('track-name'),
        artist: document.getElementById('track-artist'),
        slider: document.getElementById('seek-slider'),
        time: document.getElementById('current-time'),
        dur: document.getElementById('duration')
    };

    function loadTrack(i) {
        const track = CONFIG.playlist[i];
        audio.src = `songs/${track.filename}`;
        els.title.innerText = track.title;
        els.artist.innerText = track.artist;
        els.slider.value = 0;
    }

    function togglePlay() {
        if (!ctx) setupVisualizer();
        
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            updateIcons(false);
        } else {
            audio.play().catch(e => console.log("Audio blocked:", e));
            isPlaying = true;
            updateIcons(true);
        }
    }

    function updateIcons(play) {
        const icon = play ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
        els.play.innerHTML = icon;
        els.miniPlay.innerHTML = icon;
    }

    // Events
    els.play.onclick = togglePlay;
    els.miniPlay.onclick = (e) => { e.stopPropagation(); togglePlay(); };
    els.next.onclick = () => { index = (index + 1) % CONFIG.playlist.length; loadTrack(index); if(isPlaying) audio.play(); };
    els.prev.onclick = () => { index = (index - 1 + CONFIG.playlist.length) % CONFIG.playlist.length; loadTrack(index); if(isPlaying) audio.play(); };
    audio.onended = els.next.onclick;

    audio.ontimeupdate = () => {
        if (audio.duration) {
            const pct = (audio.currentTime / audio.duration) * 100;
            els.slider.value = pct;
            els.time.innerText = fmtTime(audio.currentTime);
            els.dur.innerText = fmtTime(audio.duration);
        }
    };
    els.slider.oninput = () => { audio.currentTime = (els.slider.value / 100) * audio.duration; };

    // Свернуть/Развернуть
    els.expandBtn.onclick = () => {
        const isCollapsed = els.player.classList.contains('collapsed');
        if (isCollapsed) {
            els.player.classList.remove('collapsed');
            els.expandBtn.classList.add('active');
            els.expandBtn.classList.remove('hidden');
            els.expandBtn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
        } else {
            els.player.classList.add('collapsed');
            els.expandBtn.classList.remove('active');
            els.expandBtn.classList.add('hidden');
        }
    };

    // Визуализатор
    function setupVisualizer() {
        if (ctx) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            ctx = new AudioContext();
            const src = ctx.createMediaElementSource(audio);
            analyser = ctx.createAnalyser();
            src.connect(analyser);
            analyser.connect(ctx.destination);
            
            analyser.fftSize = 128;
            canvas = document.getElementById('visualizer');
            canvasCtx = canvas.getContext('2d');
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            function draw() {
                requestAnimationFrame(draw);
                if (els.player.classList.contains('collapsed')) return;

                analyser.getByteFrequencyData(dataArray);
                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
                const width = canvas.width;
                const height = canvas.height;
                const barWidth = (width / bufferLength) * 2; 
                
                const gradient = canvasCtx.createLinearGradient(0, height, 0, 0);
                gradient.addColorStop(0, '#9d4edd');
                gradient.addColorStop(1, '#e0aaff');
                canvasCtx.fillStyle = gradient;

                for (let i = 0; i < bufferLength; i++) {
                    const barHeight = (dataArray[i] / 255) * height;
                    const x1 = (width / 2) - (i * barWidth);
                    const x2 = (width / 2) + (i * barWidth);
                    canvasCtx.fillRect(x1, height - barHeight, barWidth - 1, barHeight);
                    canvasCtx.fillRect(x2, height - barHeight, barWidth - 1, barHeight);
                }
            }
            draw();
        } catch(e) { console.error("Visualizer error:", e); }
    }

    loadTrack(index);

    return { play: () => togglePlay() };
}

/* --- Helpers & Background --- */
function fmtTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0'+sec : sec}`;
}

function initSpaceBackground() {
    const canvas = document.getElementById('space-canvas');
    const ctx = canvas.getContext('2d');
    let width, height, stars = [];
    function resize() { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; createStars(); }
    function createStars() {
        stars = [];
        for(let i=0; i< (width*height)/3000; i++) {
            stars.push({ x: Math.random()*width, y: Math.random()*height, size: Math.random()*2, speed: Math.random()*0.5+0.1, opacity: Math.random(), dir: Math.random()>0.5?1:-1 });
        }
    }
    function animate() {
        ctx.clearRect(0, 0, width, height);
        stars.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI*2); ctx.fill();
            star.y -= star.speed; star.opacity += 0.005 * star.dir;
            if(star.opacity > 1 || star.opacity < 0.2) star.dir *= -1;
            if(star.y < 0) { star.y = height; star.x = Math.random() * width; }
        });
        requestAnimationFrame(animate);
    }
    window.addEventListener('resize', resize); resize(); animate();
}