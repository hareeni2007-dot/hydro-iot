/**
 * Hydro-IOT - Main Interaction Logic Script
 * Controls animations, simulated telemetry data, form validations, and navigation.
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. Preloader Handler
       ========================================================================== */
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('fade-out');
            }, 600); // Small delay to feel premium
        });
    }

    /* ==========================================================================
       2. Mobile Navigation Toggle & Backdrop Blur
       ========================================================================== */
    const navbar = document.getElementById('navbar');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navbarCollapse = document.getElementById('navbarNav');
    const navLinks = document.querySelectorAll('.nav-link');

    // Close menu when clicking link (mobile)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse.classList.contains('show')) {
                hamburgerBtn.click();
            }
        });
    });

    // Add scrolled class to navbar on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* ==========================================================================
       3. Scrollspy - Active Navigation Highlight
       ========================================================================== */
    const sections = document.querySelectorAll('section, header');
    
    function scrollspy() {
        const scrollPos = window.scrollY + 120; // offset navbar height

        sections.forEach(section => {
            if (section.id) {
                const top = section.offsetTop;
                const height = section.offsetHeight;

                if (scrollPos >= top && scrollPos < top + height) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${section.id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            }
        });
    }
    window.addEventListener('scroll', scrollspy);

    /* ==========================================================================
       4. Scroll-To-Top Button
       ========================================================================== */
    const scrollTopBtn = document.getElementById('scroll-to-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    /* ==========================================================================
       5. Scroll Reveal Animations (Intersection Observer)
       ========================================================================== */
    const revealElements = document.querySelectorAll('.reveal-fade, .reveal-slide-up, .reveal-fade-right');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                // Unobserve once revealed to keep layout smooth
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    /* ==========================================================================
       6. Statistics Counter Animation
       ========================================================================== */
    const counters = document.querySelectorAll('.counter');
    let countersTriggered = false;

    function startCounters() {
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            const duration = 2000; // 2 seconds counting animation
            const stepTime = Math.max(Math.floor(duration / target), 15);
            let current = 0;

            const timer = setInterval(() => {
                current += Math.ceil(target / (duration / stepTime));
                if (current >= target) {
                    counter.innerText = target + (target === 24 ? "/7" : "+");
                    clearInterval(timer);
                } else {
                    counter.innerText = current;
                }
            }, stepTime);
        });
    }

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersTriggered) {
                    countersTriggered = true;
                    startCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statsObserver.observe(statsSection);
    }

    /* ==========================================================================
       7. Interactive Dashboard & Pump Telemetry Simulator
       ========================================================================== */
    
    // Virtual Database / Global state of sensor values
    let telemetry = {
        levelPct: 75,
        maxCapacity: 5000,
        tds: 135,
        temp: 23.5,
        flowRate: 15.4,
        pumpStatus: 'ON' // ON or OFF
    };

    // DOM Elements
    const dashboardLevelRing = document.getElementById('dashboard-level-ring');
    const dashboardLevelText = document.getElementById('dashboard-level-text');
    const dashboardCapacityText = document.getElementById('dashboard-capacity-text');
    const dashboardCapacityBar = document.getElementById('dashboard-capacity-bar');
    const dashboardQualityText = document.getElementById('dashboard-quality-text');
    const qualityStatus = document.getElementById('quality-status');
    const tdsPointer = document.getElementById('tds-pointer');
    const dashboardTempText = document.getElementById('dashboard-temp-text');
    const dashboardFlowText = document.getElementById('dashboard-flow-text');
    const pumpStatusBadge = document.getElementById('pump-status-badge');
    const pumpIconContainer = document.getElementById('pump-icon-container');
    const pumpSpinner = document.getElementById('pump-spinner');
    
    const togglePumpBtn = document.getElementById('toggle-pump-btn');
    const refreshBtn = document.getElementById('refresh-dashboard-btn');
    const syncIcon = document.getElementById('sync-icon');

    // Circular Progress Ring Math
    const radius = 70;
    const circumference = 2 * Math.PI * radius; // ~439.82

    function setLevelRing(percent) {
        const offset = circumference - (percent / 100) * circumference;
        dashboardLevelRing.style.strokeDashoffset = offset;
        dashboardLevelText.innerText = `${Math.round(percent)}%`;
    }

    // Refresh UI elements with active states
    function updateDashboardUI() {
        // Water Level & Capacity
        setLevelRing(telemetry.levelPct);
        const currentLitres = Math.round((telemetry.levelPct / 100) * telemetry.maxCapacity);
        dashboardCapacityText.innerText = `${currentLitres.toLocaleString()} / ${telemetry.maxCapacity.toLocaleString()} L`;
        dashboardCapacityBar.style.width = `${telemetry.levelPct}%`;

        // Water Quality TDS
        dashboardQualityText.innerText = telemetry.tds;
        let tdsPercent = Math.min((telemetry.tds / 400) * 100, 100);
        tdsPointer.style.left = `${tdsPercent}%`;

        if (telemetry.tds <= 150) {
            qualityStatus.innerText = 'Pure';
            qualityStatus.className = 'badge bg-success';
        } else if (telemetry.tds <= 300) {
            qualityStatus.innerText = 'Fair';
            qualityStatus.className = 'badge bg-warning text-dark';
        } else {
            qualityStatus.innerText = 'Hard';
            qualityStatus.className = 'badge bg-danger';
        }

        // Temperature
        dashboardTempText.innerText = telemetry.temp.toFixed(1);

        // Flow rate
        dashboardFlowText.innerText = telemetry.flowRate.toFixed(1);
        const activeBar = document.getElementById('active-flow-bar');
        if (activeBar) {
            activeBar.style.height = `${Math.max(10, Math.min(telemetry.flowRate * 5, 95))}%`;
        }

        // Pump controls
        if (telemetry.pumpStatus === 'ON') {
            pumpStatusBadge.innerHTML = `<i class="fa-solid fa-circle text-success pulse me-1"></i> Active`;
            pumpIconContainer.className = 'pump-icon-wrapper active';
            pumpSpinner.classList.add('spin-animation');
            togglePumpBtn.innerHTML = `<i class="fa-solid fa-power-off me-2"></i> Stop Pump`;
            togglePumpBtn.className = 'btn btn-danger ripple-btn';
        } else {
            pumpStatusBadge.innerHTML = `<i class="fa-solid fa-circle text-danger me-1"></i> Inactive`;
            pumpIconContainer.className = 'pump-icon-wrapper inactive';
            pumpSpinner.classList.remove('spin-animation');
            togglePumpBtn.innerHTML = `<i class="fa-solid fa-power-off me-2"></i> Start Pump`;
            togglePumpBtn.className = 'btn btn-primary ripple-btn';
        }
    }

    // Toggle Pump Trigger
    togglePumpBtn.addEventListener('click', () => {
        if (telemetry.pumpStatus === 'ON') {
            telemetry.pumpStatus = 'OFF';
            telemetry.flowRate = 0.0;
        } else {
            telemetry.pumpStatus = 'ON';
            telemetry.flowRate = 12.0 + Math.random() * 5;
        }
        updateDashboardUI();
    });

    // Real-Time IoT Simulation Clock (runs every 1.5 seconds)
    setInterval(() => {
        if (telemetry.pumpStatus === 'ON') {
            // Fill the tank gradually
            if (telemetry.levelPct < 98) {
                telemetry.levelPct += 0.4;
                // Add minor random fluctuation to flow rate
                telemetry.flowRate = 14.0 + Math.random() * 4;
            } else {
                // Auto shutoff simulated at 98% to prevent overflows
                telemetry.levelPct = 98;
                telemetry.pumpStatus = 'OFF';
                telemetry.flowRate = 0.0;
                console.log("Telemetry Alert: Water Level reached 98%. Autonomous shutoff triggered.");
            }
        } else {
            // Slowly deplete tank to simulate building usage
            if (telemetry.levelPct > 15) {
                telemetry.levelPct -= 0.08;
            }
        }

        // Small temperature shifts
        telemetry.temp += (Math.random() - 0.5) * 0.1;
        // TDS shifts
        telemetry.tds += Math.round((Math.random() - 0.5) * 2);
        if (telemetry.tds < 120) telemetry.tds = 120;
        if (telemetry.tds > 165) telemetry.tds = 165;

        updateDashboardUI();
    }, 1500);

    // Sync button fetches mock telemetry / simulates remote server calls
    refreshBtn.addEventListener('click', () => {
        syncIcon.classList.add('fa-spin');
        refreshBtn.disabled = true;

        // Simulate fetching from MySQL backend API
        fetch('http://localhost:5000/api/sensors')
            .then(res => res.json())
            .then(res => {
                if (res.success && res.data) {
                    const d = res.data;
                    telemetry.levelPct = parseFloat(d.water_level_pct);
                    telemetry.tds = parseInt(d.water_quality_tds, 10);
                    telemetry.temp = parseFloat(d.temperature_c);
                    telemetry.flowRate = parseFloat(d.flow_rate_lpm);
                    telemetry.pumpStatus = d.pump_status;
                }
                setTimeout(() => {
                    syncIcon.classList.remove('fa-spin');
                    refreshBtn.disabled = false;
                    updateDashboardUI();
                }, 800);
            })
            .catch(err => {
                console.warn('Backend database is not running. Simulating remote cloud refresh locally.');
                // Randomize values completely on fallback sync
                telemetry.levelPct = Math.round(40 + Math.random() * 45);
                telemetry.tds = Math.round(130 + Math.random() * 20);
                telemetry.temp = 22 + Math.random() * 4;
                if (telemetry.pumpStatus === 'ON') {
                    telemetry.flowRate = 10 + Math.random() * 8;
                }
                setTimeout(() => {
                    syncIcon.classList.remove('fa-spin');
                    refreshBtn.disabled = false;
                    updateDashboardUI();
                }, 800);
            });
    });

    // Initialize layout drawing
    updateDashboardUI();


    /* ==========================================================================
       8. Contact Form Validator & Submit Handler
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status-alert');

    // Input elements
    const fields = {
        name: { input: document.getElementById('form-name'), error: document.getElementById('name-error') },
        email: { input: document.getElementById('form-email'), error: document.getElementById('email-error') },
        subject: { input: document.getElementById('form-subject'), error: document.getElementById('subject-error') },
        message: { input: document.getElementById('form-message'), error: document.getElementById('message-error') }
    };

    // Inline event validation helpers
    Object.keys(fields).forEach(key => {
        fields[key].input.addEventListener('input', () => {
            validateField(key);
        });
    });

    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function validateField(key) {
        const item = fields[key];
        const val = item.input.value.trim();

        if (val === '') {
            item.input.classList.add('is-invalid');
            item.input.classList.remove('is-valid');
            item.error.style.display = 'block';
            return false;
        }

        if (key === 'email' && !validateEmail(val)) {
            item.input.classList.add('is-invalid');
            item.input.classList.remove('is-valid');
            item.error.innerText = "Please enter a valid email address structure";
            item.error.style.display = 'block';
            return false;
        }

        item.input.classList.remove('is-invalid');
        item.input.classList.add('is-valid');
        item.error.style.display = 'none';
        return true;
    }

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate all fields first
        let isFormValid = true;
        Object.keys(fields).forEach(key => {
            const isValid = validateField(key);
            if (!isValid) isFormValid = false;
        });

        if (!isFormValid) return;

        // Gather form fields payload
        const payload = {
            name: fields.name.input.value.trim(),
            email: fields.email.input.value.trim(),
            subject: fields.subject.input.value.trim(),
            message: fields.message.input.value.trim()
        };

        const submitBtn = document.getElementById('submit-btn');
        const origContent = submitBtn.innerHTML;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-2"></i> Sending...`;
        submitBtn.disabled = true;

        // POST submission to MySQL Backend Service
        fetch('http://localhost:5000/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            submitBtn.innerHTML = origContent;
            submitBtn.disabled = false;
            
            formStatus.className = 'alert alert-success mt-3';
            formStatus.innerText = 'Success! Your message was submitted successfully and saved in our database.';
            formStatus.classList.remove('d-none');
            
            // Reset form
            contactForm.reset();
            Object.keys(fields).forEach(key => {
                fields[key].input.classList.remove('is-valid');
            });
        })
        .catch(err => {
            console.warn('Backend server offline. Simulating local mock form submission.');
            
            // Mock success feedback when mysql/node backend is not active
            setTimeout(() => {
                submitBtn.innerHTML = origContent;
                submitBtn.disabled = false;
                
                formStatus.className = 'alert alert-success mt-3';
                formStatus.innerText = 'Thank you! Your message was submitted successfully (Simulated client mode).';
                formStatus.classList.remove('d-none');
                
                contactForm.reset();
                Object.keys(fields).forEach(key => {
                    fields[key].input.classList.remove('is-valid');
                });
            }, 1000);
        });
    });

});
