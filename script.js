/**
 * Main JavaScript for Zynoryx Digital
 * Includes preloader handling, video optimization, and site-wide performance enhancements
 */

document.addEventListener("DOMContentLoaded", function() {
    // ===== PRELOADER HANDLING =====
    const preloader = document.getElementById('video-preloader');
    const websiteContent = document.getElementById('website-content');
    const preloaderVideo = document.getElementById('preloader-video');
    
    // Function to hide preloader and show content
    function hidePreloader() {
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
                if (websiteContent) {
                    websiteContent.style.display = 'block';
                }
            }, 500);
        } else {
            // If preloader element doesn't exist, just show content
            if (websiteContent) {
                websiteContent.style.display = 'block';
            }
        }
        
        console.log("Preloader hidden, website content shown");
    }
    
    // Handle preloader video completion
    if (preloaderVideo) {
        preloaderVideo.addEventListener('ended', hidePreloader);
        
        // Fallback in case video doesn't play or load
        preloaderVideo.addEventListener('error', hidePreloader);
        
        // Force hide preloader after 5 seconds regardless of video state
        setTimeout(hidePreloader, 5000);
    } else {
        // If no preloader video, hide preloader immediately
        hidePreloader();
    }
    
    // ===== NAVBAR SCROLL EFFECT =====
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
    
    // ===== VIDEO OPTIMIZATION =====
    // Initialize video players with optimized controls
    initVideoPortfolio();
    
    // ===== ANIMATIONS =====
    // Initialize animations for elements with animate-fadeInUp class
    const animatedElements = document.querySelectorAll('.animate-fadeInUp, .animate-fadeIn');
    const animationObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(() => {
                        entry.target.style.opacity = "1";
                        entry.target.style.transform = "translateY(0)";
                    });
                    animationObserver.unobserve(entry.target);
                }
            });
        },
        {
            rootMargin: "50px",
            threshold: 0.1,
        }
    );
    
    animatedElements.forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        animationObserver.observe(el);
    });
    
    // ===== LAZY LOADING =====
    // Lazy load all images with data-src attribute
    const imgObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute("data-src");
                    
                    if (src) {
                        img.src = src;
                        img.removeAttribute("data-src");
                        imgObserver.unobserve(img);
                    }
                }
            });
        },
        {
            rootMargin: "200px",
            threshold: 0.1,
        }
    );
    
    document.querySelectorAll("img[data-src]").forEach((img) => {
        imgObserver.observe(img);
    });
    
    // ===== PORTFOLIO NAVIGATION =====
    // Handle active state for portfolio navigation
    const portfolioNavLinks = document.querySelectorAll('.portfolio-nav .nav-link');
    if (portfolioNavLinks.length) {
        portfolioNavLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all links
                portfolioNavLinks.forEach(l => l.classList.remove('active'));
                
                // Add active class to clicked link
                this.classList.add('active');
                
                // Scroll to the section
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
});

/**
 * Initialize all video players with optimized controls
 */
function initVideoPortfolio() {
    const videoContainers = document.querySelectorAll('.video-container');
    
    videoContainers.forEach(container => {
        const video = container.querySelector('.portfolio-video');
        const playButton = container.querySelector('.play-button');
        const videoControls = container.querySelector('.video-controls');
        const timeline = container.querySelector('.timeline');
        const progress = container.querySelector('.progress');
        const playPauseBtn = container.querySelector('.play-pause-btn');
        const muteBtn = container.querySelector('.mute-btn');
        const fullscreenBtn = container.querySelector('.fullscreen-btn');
        const timeDisplay = container.querySelector('.time-display');
        
        if (!video) return;
        
        // State variables
        let isPlaying = false;
        let isMuted = false;
        let isFullscreen = false;
        let hideControlsTimeout;
        let isVideoLoaded = false;
        let isDragging = false;
        
        // Play/Pause functionality with instant playback
        function togglePlay() {
            if (!isVideoLoaded) {
                container.classList.add('loading');
                video.load();
                
                video.oncanplaythrough = () => {
                    container.classList.remove('loading');
                    isVideoLoaded = true;
                    video.play()
                        .then(() => {
                            isPlaying = true;
                            if (playPauseBtn) playPauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
                            if (playButton) playButton.style.opacity = '0';
                            showControls();
                        })
                        .catch(e => console.error('Playback error:', e));
                };
                
                video.onerror = () => {
                    container.classList.remove('loading');
                    console.error('Video failed to load');
                };
            } else {
                if (video.paused) {
                    video.play()
                        .then(() => {
                            isPlaying = true;
                            if (playPauseBtn) playPauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
                            if (playButton) playButton.style.opacity = '0';
                            showControls();
                        })
                        .catch(e => console.error('Playback error:', e));
                } else {
                    video.pause();
                    isPlaying = false;
                    if (playPauseBtn) playPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
                    if (playButton) playButton.style.opacity = '1';
                }
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
            if (!timeline || !progress || !video) return;
            
            const percent = (video.currentTime / video.duration) * 100;
            progress.style.width = `${percent}%`;
            
            if (timeDisplay) {
                const currentMinutes = Math.floor(video.currentTime / 60);
                const currentSeconds = Math.floor(video.currentTime % 60);
                const durationMinutes = Math.floor(video.duration / 60) || 0;
                const durationSeconds = Math.floor(video.duration % 60) || 0;
                
                timeDisplay.textContent = 
                    `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds} / ` +
                    `${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
            }
            
            if (isPlaying && !isDragging) {
                requestAnimationFrame(updateProgress);
            }
        }
        
        // Seek functionality
        function seek(e) {
            if (!timeline || !video) return;
            
            const rect = timeline.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            video.currentTime = pos * video.duration;
            updateProgress();
        }
        
        // Toggle mute
        function toggleMute() {
            if (!video || !muteBtn) return;
            
            video.muted = !video.muted;
            isMuted = video.muted;
            
            muteBtn.innerHTML = isMuted ? 
                '<i class="bi bi-volume-mute-fill"></i>' : 
                '<i class="bi bi-volume-up-fill"></i>';
        }
        
        // Toggle fullscreen
        function toggleFullscreen() {
            if (!container || !fullscreenBtn) return;
            
            if (!isFullscreen) {
                if (container.requestFullscreen) {
                    container.requestFullscreen();
                } else if (container.webkitRequestFullscreen) {
                    container.webkitRequestFullscreen();
                } else if (container.msRequestFullscreen) {
                    container.msRequestFullscreen();
                }
                
                fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                
                fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen"></i>';
            }
            
            isFullscreen = !isFullscreen;
        }
        
        // Event listeners
        if (playButton) {
            playButton.addEventListener('click', togglePlay);
        }
        
        if (video) {
            video.addEventListener('click', () => {
                if (isPlaying) {
                    showControls();
                } else {
                    togglePlay();
                }
            });
            
            video.addEventListener('play', () => {
                isPlaying = true;
                if (playPauseBtn) playPauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
                if (playButton) playButton.style.opacity = '0';
                requestAnimationFrame(updateProgress);
            });
            
            video.addEventListener('pause', () => {
                isPlaying = false;
                if (playPauseBtn) playPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
                if (playButton) playButton.style.opacity = '1';
            });
            
            video.addEventListener('timeupdate', () => {
                if (!video.throttleUpdate) {
                    video.throttleUpdate = true;
                    setTimeout(() => {
                        updateProgress();
                        video.throttleUpdate = false;
                    }, 50);
                }
            });
            
            video.addEventListener('ended', () => {
                isPlaying = false;
                if (playPauseBtn) playPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
                if (playButton) playButton.style.opacity = '1';
                video.currentTime = 0;
            });
            
            // Handle timeline dragging
            if (timeline) {
                timeline.addEventListener('mousedown', (e) => {
                    isDragging = true;
                    seek(e);
                });
                
                document.addEventListener('mousemove', (e) => {
                    if (isDragging) {
                        seek(e);
                    }
                });
                
                document.addEventListener('mouseup', () => {
                    isDragging = false;
                });
            }
            
            // Preload video when container is near viewport
            const videoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const videoSrc = video.getAttribute('src') || video.querySelector('source')?.src;
                        if (videoSrc && !isVideoLoaded) {
                            // Start loading the video in the background
                            video.load();
                            videoObserver.unobserve(container);
                        }
                    }
                });
            }, { rootMargin: '300px', threshold: 0.01 });
            
            videoObserver.observe(container);
        }
        
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', togglePlay);
        }
        
        if (muteBtn) {
            muteBtn.addEventListener('click', toggleMute);
        }
        
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', toggleFullscreen);
        }
        
        if (timeline) {
            timeline.addEventListener('click', seek);
        }
        
        // Show controls when mouse moves over container
        container.addEventListener('mousemove', () => {
            showControls();
        });
        
        // Hide controls when mouse leaves container
        container.addEventListener('mouseleave', () => {
            if (isPlaying && videoControls) {
                clearTimeout(hideControlsTimeout);
                hideControlsTimeout = setTimeout(() => {
                    videoControls.style.opacity = '0';
                }, 1000);
            }
        });
        
        // Handle fullscreen change
        document.addEventListener('fullscreenchange', () => {
            isFullscreen = !!document.fullscreenElement;
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = isFullscreen ? 
                    '<i class="bi bi-fullscreen-exit"></i>' : 
                    '<i class="bi bi-fullscreen"></i>';
            }
        });
    });
}

// Initialize when DOM is ready
if (document.readyState !== 'loading') {
    initVideoPortfolio();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        initVideoPortfolio();
    });
}
