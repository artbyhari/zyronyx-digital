/**
 * Main JavaScript for Zynoryx Digital
 * Simplified and fixed video controls
 */

document.addEventListener("DOMContentLoaded", function() {
    // ===== PRELOADER HANDLING =====
    const preloader = document.getElementById('video-preloader');
    const websiteContent = document.getElementById('website-content');
    const preloaderVideo = document.getElementById('preloader-video');
    
    function hidePreloader() {
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
                if (websiteContent) websiteContent.style.display = 'block';
            }, 500);
        } else {
            if (websiteContent) websiteContent.style.display = 'block';
        }
    }
    
    if (preloaderVideo) {
        preloaderVideo.addEventListener('ended', hidePreloader);
        preloaderVideo.addEventListener('error', hidePreloader);
        setTimeout(hidePreloader, 5000);
    } else {
        hidePreloader();
    }
    
    // ===== NAVBAR SCROLL EFFECT =====
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        navbar.classList.toggle('navbar-scrolled', window.scrollY > 50);
    });
    
    // ===== VIDEO CONTROLS - SIMPLIFIED AND FIXED =====
    initVideoControls();
    
    // ===== ANIMATIONS =====
    const animatedElements = document.querySelectorAll('.animate-fadeInUp, .animate-fadeIn');
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                animationObserver.unobserve(entry.target);
            }
        });
    }, { rootMargin: "50px", threshold: 0.1 });
    
    animatedElements.forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        animationObserver.observe(el);
    });
});

/**
 * Initialize video controls with guaranteed working play/pause
 */
function initVideoControls() {
    const videoContainers = document.querySelectorAll('.video-container');
    
    videoContainers.forEach(container => {
        const video = container.querySelector('.portfolio-video');
        const playButton = container.querySelector('.play-button');
        const playPauseBtn = container.querySelector('.play-pause-btn');
        const muteBtn = container.querySelector('.mute-btn');
        const fullscreenBtn = container.querySelector('.fullscreen-btn');
        const progress = container.querySelector('.progress');
        const timeline = container.querySelector('.timeline');
        const timeDisplay = container.querySelector('.time-display');
        const videoControls = container.querySelector('.video-controls');
        
        if (!video) return;
        
        let isPlaying = false;
        let hideControlsTimeout;
        
        // Basic play/pause toggle that definitely works
        function togglePlay() {
            if (video.paused) {
                video.play().then(() => {
                    isPlaying = true;
                    if (playPauseBtn) playPauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
                    if (playButton) playButton.style.opacity = '0';
                }).catch(e => console.error('Play error:', e));
            } else {
                video.pause();
                isPlaying = false;
                if (playPauseBtn) playPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
                if (playButton) playButton.style.opacity = '1';
            }
        }
        
        // Show controls with auto-hide
        function showControls() {
            if (videoControls) {
                videoControls.style.opacity = '1';
                clearTimeout(hideControlsTimeout);
                if (isPlaying) {
                    hideControlsTimeout = setTimeout(() => {
                        videoControls.style.opacity = '0';
                    }, 3000);
                }
            }
        }
        
        // Update progress bar
        function updateProgress() {
            if (!video.duration) return;
            const percent = (video.currentTime / video.duration) * 100;
            if (progress) progress.style.width = `${percent}%`;
            
            if (timeDisplay) {
                const currentTime = formatTime(video.currentTime);
                const duration = formatTime(video.duration);
                timeDisplay.textContent = `${currentTime} / ${duration}`;
            }
        }
        
        // Format time as MM:SS
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            seconds = Math.floor(seconds % 60);
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
        
        // Seek to position when timeline is clicked
        function seek(e) {
            if (!timeline || !video.duration) return;
            const rect = timeline.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            video.currentTime = pos * video.duration;
        }
        
        // Toggle mute
        function toggleMute() {
            if (!muteBtn) return;
            video.muted = !video.muted;
            muteBtn.innerHTML = video.muted ? 
                '<i class="bi bi-volume-mute-fill"></i>' : 
                '<i class="bi bi-volume-up-fill"></i>';
        }
        
        // Toggle fullscreen
        function toggleFullscreen() {
            if (!container) return;
            if (!document.fullscreenElement) {
                container.requestFullscreen().catch(e => console.log(e));
            } else {
                document.exitFullscreen();
            }
        }
        
        // Event listeners
        if (playButton) playButton.addEventListener('click', togglePlay);
        if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
        if (muteBtn) muteBtn.addEventListener('click', toggleMute);
        if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);
        if (timeline) timeline.addEventListener('click', seek);
        
        video.addEventListener('click', togglePlay);
        video.addEventListener('play', () => {
            isPlaying = true;
            if (playPauseBtn) playPauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
            if (playButton) playButton.style.opacity = '0';
            updateProgress();
        });
        
        video.addEventListener('pause', () => {
            isPlaying = false;
            if (playPauseBtn) playPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
            if (playButton) playButton.style.opacity = '1';
        });
        
        video.addEventListener('timeupdate', updateProgress);
        video.addEventListener('ended', () => {
            isPlaying = false;
            if (playPauseBtn) playPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
            if (playButton) playButton.style.opacity = '1';
        });
        
        container.addEventListener('mousemove', showControls);
        container.addEventListener('mouseleave', () => {
            if (isPlaying && videoControls) {
                clearTimeout(hideControlsTimeout);
                hideControlsTimeout = setTimeout(() => {
                    videoControls.style.opacity = '0';
                }, 1000);
            }
        });
        
        document.addEventListener('fullscreenchange', () => {
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = document.fullscreenElement ? 
                    '<i class="bi bi-fullscreen-exit"></i>' : 
                    '<i class="bi bi-fullscreen"></i>';
            }
        });
        
        // Load video when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const src = video.getAttribute('data-src') || video.querySelector('source')?.src;
                    if (src && !video.src) {
                        video.src = src;
                        video.load();
                        observer.unobserve(container);
                    }
                }
            });
        }, { rootMargin: '200px' });
        
        observer.observe(container);
    });
}
