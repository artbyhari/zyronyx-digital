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
    // Optimized video player functionality
    initializeVideoPlayers();
    
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
 * Initialize optimized video players
 * This function handles all video player functionality with performance optimizations
 */
function initializeVideoPlayers() {
    // Get all video containers
    const videoContainers = document.querySelectorAll('.video-container');
    
    if (!videoContainers.length) return;
    
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
        
        // Set initial state
        let isPlaying = false;
        let isMuted = false;
        let isFullscreen = false;
        let hideControlsTimeout;
        
        // Lazy load video when container is visible
        const videoObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const videoSrc = video.getAttribute('data-src');
                        if (videoSrc && !video.src) {
                            // Add loading indicator
                            container.classList.add('loading');
                            
                            // Set video source
                            video.src = videoSrc;
                            
                            // Remove loading indicator when video can play
                            video.addEventListener('canplay', () => {
                                container.classList.remove('loading');
                            });
                            
                            // Handle video load error
                            video.addEventListener('error', () => {
                                container.classList.remove('loading');
                                console.error('Video failed to load:', videoSrc);
                            });
                            
                            videoObserver.unobserve(container);
                        }
                    }
                });
            },
            {
                rootMargin: '200px',
                threshold: 0.1
            }
        );
        
        videoObserver.observe(container);
        
        // Play/Pause functionality
        function togglePlay() {
            if (!video.src && video.getAttribute('data-src')) {
                video.src = video.getAttribute('data-src');
            }
            
            if (video.paused) {
                video.play()
                    .then(() => {
                        isPlaying = true;
                        playPauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
                        playButton.style.opacity = '0';
                        showControls();
                    })
                    .catch(error => {
                        console.error('Error playing video:', error);
                    });
            } else {
                video.pause();
                isPlaying = false;
                playPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
                playButton.style.opacity = '1';
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
            
            // Update time display
            if (timeDisplay) {
                const currentMinutes = Math.floor(video.currentTime / 60);
                const currentSeconds = Math.floor(video.currentTime % 60);
                const durationMinutes = Math.floor(video.duration / 60) || 0;
                const durationSeconds = Math.floor(video.duration % 60) || 0;
                
                timeDisplay.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds} / ${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
            }
            
            // Use requestAnimationFrame for smoother updates
            if (isPlaying) {
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
                playPauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
                playButton.style.opacity = '0';
                requestAnimationFrame(updateProgress);
            });
            
            video.addEventListener('pause', () => {
                isPlaying = false;
                playPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
                playButton.style.opacity = '1';
            });
            
            video.addEventListener('timeupdate', () => {
                // Use throttled updates for better performance
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
                playPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
                playButton.style.opacity = '1';
                video.currentTime = 0;
            });
            
            // Show controls when mouse moves over video
            container.addEventListener('mousemove', showControls);
            
            // Hide controls when mouse leaves container
            container.addEventListener('mouseleave', () => {
                if (isPlaying) {
                    clearTimeout(hideControlsTimeout);
                    hideControlsTimeout = setTimeout(() => {
                        videoControls.style.opacity = '0';
                    }, 1000);
                }
            });
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