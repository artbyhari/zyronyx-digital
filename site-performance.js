/**
 * Site-wide Performance Optimizations
 * This script improves overall site performance beyond just video playback
 */
document.addEventListener("DOMContentLoaded", () => {
  // Lazy load all images
  const lazyLoadImages = () => {
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
    
    // Find all images with data-src attribute
    document.querySelectorAll("img[data-src]").forEach((img) => {
      imgObserver.observe(img);
    });
  };
  
  // Optimize animations to reduce layout thrashing
  const optimizeAnimations = () => {
    const animatedElements = document.querySelectorAll(".animate-fadeInUp, .animate-fadeIn");
    
    const animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Use requestAnimationFrame for smoother animations
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
      animationObserver.observe(el);
    });
  };
  
  // Optimize scroll events
  const optimizeScrollEvents = () => {
    let ticking = false;
    
    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Handle navbar background change
          const navbar = document.querySelector(".navbar");
          if (navbar) {
            if (window.scrollY > 50) {
              navbar.classList.add("navbar-scrolled");
            } else {
              navbar.classList.remove("navbar-scrolled");
            }
          }
          
          // Handle active portfolio section highlighting
          const portfolioSections = document.querySelectorAll('section[id^="video-section"], section[id^="logo-section"], section[id^="thumbnail-section"], section[id^="reel-section"], section[id^="business-card-showcase"]');
          const portfolioNavLinks = document.querySelectorAll('.portfolio-nav .nav-link');
          
          if (portfolioSections.length && portfolioNavLinks.length) {
            let current = '';
            
            portfolioSections.forEach(section => {
              const sectionTop = section.offsetTop;
              
              if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
              }
            });
            
            portfolioNavLinks.forEach(link => {
              link.classList.remove('active');
              if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
              }
            });
          }
          
          ticking = false;
        });
        
        ticking = true;
      }
    }, { passive: true });
  };
  
  // Optimize mobile navigation
  const optimizeMobileNav = () => {
    const navbarToggler = document.querySelector(".navbar-toggler");
    const navbarCollapse = document.querySelector(".navbar-collapse");
    
    if (navbarToggler && navbarCollapse) {
      document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.addEventListener('click', () => {
          if (navbarCollapse.classList.contains('show')) {
            navbarToggler.click();
          }
        });
      });
    }
  };
  
  // Preload critical resources
  const preloadCriticalResources = () => {
    // Preload first video poster
    const firstVideoPoster = document.querySelector('.portfolio-video[poster]');
    if (firstVideoPoster) {
      const img = new Image();
      img.src = firstVideoPoster.getAttribute('poster');
    }
    
    // Preload logo images
    const firstLogo = document.querySelector('.logo-container img');
    if (firstLogo) {
      const img = new Image();
      img.src = firstLogo.getAttribute('src');
    }
  };
  
  // Initialize all optimizations
  lazyLoadImages();
  optimizeAnimations();
  optimizeScrollEvents();
  optimizeMobileNav();
  preloadCriticalResources();
  
  console.log("Site-wide performance optimizations applied");
});