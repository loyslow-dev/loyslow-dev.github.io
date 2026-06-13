document.addEventListener('DOMContentLoaded', () => {
    const titleText = '@loyslow';
    let titleIndex = 0;
    let isTypingTitle = true;

    function animateTitle() {
        document.title = titleIndex === 0 ? '\u200E' : titleText.substring(0, titleIndex);
        
        if (isTypingTitle) {
            titleIndex++;
            if (titleIndex > titleText.length) {
                isTypingTitle = false;
                setTimeout(animateTitle, 2000);
                return;
            }
        } else {
            titleIndex--;
            if (titleIndex === 0) {
                isTypingTitle = true;
                setTimeout(animateTitle, 1000);
                return;
            }
        }
        setTimeout(animateTitle, isTypingTitle ? 250 : 100);
    }
    animateTitle();

    const entryScreen = document.getElementById('entry-screen');
    const mainContent = document.getElementById('main-content');
    const bgVideo = document.getElementById('bg-video');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeIcon = document.getElementById('volume-icon');
    const avatarImg = document.getElementById('avatar');
    const usernameEl = document.getElementById('username');
    const glassCard = document.querySelector('.glass-card');
    const descEl = document.getElementById('desc');
    const discordLink = document.getElementById('discord-link');
    const toast = document.getElementById('toast');
    const timeDisplay = document.getElementById('time-display');

    const GITHUB_USERNAME = 'loyslow-dev';
    const DISCORD_TAG = 'loyslow';
    const descText = descEl.textContent;
    descEl.textContent = '';

    bgVideo.volume = volumeSlider.value;

    volumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        bgVideo.volume = val;
        
        if (val === 0) {
            volumeIcon.className = 'bx bx-volume-mute';
        } else {
            volumeIcon.className = 'bx bx-volume-full';
        }
    });

    function typeWriter(text, i) {
        if (i < text.length) {
            descEl.textContent += text.charAt(i);
            setTimeout(() => typeWriter(text, i + 1), 60);
        }
    }

    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ru-RU', {
            timeZone: 'Europe/Moscow',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        if (timeDisplay) timeDisplay.textContent = timeString;
    }
    
    setInterval(updateClock, 1000);
    updateClock();

    fetch(`https://api.github.com/users/${GITHUB_USERNAME}`)
        .then(res => res.json())
        .then(data => {
            if (data.avatar_url) {
                avatarImg.src = data.avatar_url;
            }
            if (data.login) {
                usernameEl.textContent = data.login.replace('-dev', '');
            }
        })
        .catch(err => console.error('GitHub fetch failed:', err));

    entryScreen.addEventListener('click', () => {
        entryScreen.style.opacity = '0';
        entryScreen.style.pointerEvents = 'none';
        entryScreen.style.visibility = 'hidden';
        
        mainContent.classList.add('visible');
        
        bgVideo.play().catch(e => console.error("Video playback failed:", e));
        
        setTimeout(() => typeWriter(descText, 0), 500);
    }, { once: true });

    document.addEventListener('mousemove', (e) => {
        if (mainContent.classList.contains('visible')) {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 30;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 30;
            glassCard.style.transform = `perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        }
    });

    discordLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(DISCORD_TAG).then(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2000);
        });
    });
});