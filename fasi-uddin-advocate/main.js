// Main JavaScript for Law Firm Website
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize all components
    initTypewriter();
    initScrollAnimations();
    initStatsCounters();
    initTestimonialSlider();
    initParticleBackground();
    initSmoothScrolling();
    initMobileMenu();
    
    // Typewriter effect for hero section
    function initTypewriter() {
        const typed = new Typed('#typed-text', {
            strings: [
                'Expert Legal Representation',
                'Your Trusted Advocate',
                'Justice Delivered Daily',
                'Professional Legal Services'
            ],
            typeSpeed: 80,
            backSpeed: 50,
            backDelay: 2000,
            startDelay: 500,
            loop: true,
            showCursor: true,
            cursorChar: '|'
        });
    }
    
    // Scroll-triggered animations
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);
        
        // Observe all fade-in elements
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
        
        // Animate service cards with stagger
        const serviceCards = document.querySelectorAll('.card-hover');
        serviceCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = 'all 0.6s ease';
                
                const cardObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            setTimeout(() => {
                                entry.target.style.opacity = '1';
                                entry.target.style.transform = 'translateY(0)';
                            }, index * 200);
                        }
                    });
                }, observerOptions);
                
                cardObserver.observe(card);
            }, 100);
        });
    }
    
    // Animated statistics counters
    function initStatsCounters() {
        const counters = document.querySelectorAll('.stats-counter');
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-target'));
                    const duration = 2000;
                    const increment = target / (duration / 16);
                    let current = 0;
                    
                    const updateCounter = () => {
                        if (current < target) {
                            current += increment;
                            counter.textContent = Math.floor(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target;
                        }
                    };
                    
                    updateCounter();
                    counterObserver.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }
    
    // Testimonial slider
    function initTestimonialSlider() {
        const splide = new Splide('#testimonial-slider', {
            type: 'loop',
            perPage: 1,
            autoplay: true,
            interval: 5000,
            pauseOnHover: true,
            arrows: false,
            pagination: true,
            gap: '2rem',
            breakpoints: {
                768: {
                    perPage: 1,
                }
            }
        });
        
        splide.mount();
    }
    
    // Particle background using p5.js
    function initParticleBackground() {
        let particles = [];
        let particleCount = 50;
        
        const sketch = (p) => {
            p.setup = () => {
                const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
                canvas.parent('particle-container');
                canvas.style('position', 'absolute');
                canvas.style('top', '0');
                canvas.style('left', '0');
                canvas.style('z-index', '1');
                
                // Initialize particles
                for (let i = 0; i < particleCount; i++) {
                    particles.push({
                        x: p.random(p.width),
                        y: p.random(p.height),
                        vx: p.random(-0.5, 0.5),
                        vy: p.random(-0.5, 0.5),
                        size: p.random(1, 3),
                        opacity: p.random(0.1, 0.3)
                    });
                }
            };
            
            p.draw = () => {
                p.clear();
                
                // Update and draw particles
                particles.forEach(particle => {
                    // Update position
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    
                    // Wrap around edges
                    if (particle.x < 0) particle.x = p.width;
                    if (particle.x > p.width) particle.x = 0;
                    if (particle.y < 0) particle.y = p.height;
                    if (particle.y > p.height) particle.y = 0;
                    
                    // Draw particle
                    p.fill(201, 169, 110, particle.opacity * 255);
                    p.noStroke();
                    p.circle(particle.x, particle.y, particle.size);
                });
                
                // Draw connections between nearby particles
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const dist = p.dist(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                        if (dist < 100) {
                            const alpha = p.map(dist, 0, 100, 0.1, 0);
                            p.stroke(201, 169, 110, alpha * 255);
                            p.strokeWeight(1);
                            p.line(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                        }
                    }
                }
            };
            
            p.windowResized = () => {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
            };
        };
        
        new p5(sketch);
    }
    
    // Smooth scrolling for navigation links
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // Mobile menu functionality
    function initMobileMenu() {
        const mobileMenuButton = document.querySelector('.md\\:hidden button');
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'md:hidden fixed top-16 left-0 right-0 bg-navy bg-opacity-95 backdrop-blur-sm z-40 transform -translate-y-full transition-transform duration-300';
        mobileMenu.innerHTML = `
            <div class="px-4 py-6 space-y-4">
                <a href="#home" class="block text-white hover:text-gold transition-colors">Home</a>
                <a href="about.html" class="block text-white hover:text-gold transition-colors">About</a>
                <a href="services.html" class="block text-white hover:text-gold transition-colors">Services</a>
                <a href="contact.html" class="block text-white hover:text-gold transition-colors">Contact</a>
            </div>
        `;
        
        document.body.appendChild(mobileMenu);
        
        let isMenuOpen = false;
        
        mobileMenuButton.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            if (isMenuOpen) {
                mobileMenu.style.transform = 'translateY(0)';
            } else {
                mobileMenu.style.transform = 'translateY(-100%)';
            }
        });
        
        // Close menu when clicking on links
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                isMenuOpen = false;
                mobileMenu.style.transform = 'translateY(-100%)';
            });
        });
    }
    
    // Button click handlers
    document.addEventListener('click', function(e) {
        if (e.target.textContent.includes('Schedule Consultation')) {
            showConsultationModal();
        }
        
        if (e.target.textContent.includes('View Case Results')) {
            window.location.href = 'about.html#results';
        }
        
        if (e.target.textContent.includes('Access Case Analytics')) {
            window.location.href = 'contact.html#analytics';
        }
    });
    
    // Consultation modal
    function showConsultationModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-md w-full p-6 relative">
                <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
                <h3 class="text-2xl font-display font-bold text-navy mb-4">Schedule Consultation</h3>
                <form class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input type="tel" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Legal Matter</label>
                        <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold">
                            <option>Criminal Defense</option>
                            <option>Civil Litigation</option>
                            <option>Family Law</option>
                            <option>Corporate Law</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <button type="submit" class="w-full btn-primary text-navy py-2 px-4 rounded-md font-semibold">
                        Schedule Consultation
                    </button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        modal.querySelector('form').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your consultation request. We will contact you within 24 hours to schedule your appointment.');
            modal.remove();
        });
    }
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('nav');
        if (window.scrollY > 100) {
            navbar.classList.add('nav-blur');
        } else {
            navbar.classList.remove('nav-blur');
        }
    });
    
    // Add loading animation
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        
        // Animate hero elements
        anime({
            targets: '.hero-content > div > *',
            translateY: [50, 0],
            opacity: [0, 1],
            delay: anime.stagger(200),
            duration: 800,
            easing: 'easeOutQuart'
        });
    });
    
    // Performance optimization: Debounce scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Optimized scroll handler
    const optimizedScrollHandler = debounce(function() {
        // Handle scroll-based animations here
    }, 16); // ~60fps
    
    window.addEventListener('scroll', optimizedScrollHandler);
    
    console.log('Law firm website initialized successfully');
});