document.addEventListener('DOMContentLoaded', () => {
    /* ---------- Smooth Scrolling ---------- */
    document.body.addEventListener('click', e => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        const targetId = link.getAttribute('href').slice(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth' });
        }
    });

    /* ---------- Navbar Shrink & Hide on Scroll ---------- */
    const header = document.querySelector('header');
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const curScroll = window.scrollY;
        // shrink after 80px
        header.classList.toggle('shrink', curScroll > 80);
        // hide on scroll down, show on scroll up
        if (curScroll > lastScroll && curScroll > 80) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }
        lastScroll = curScroll;
    });

    /* ---------- Hamburger Menu Toggle ---------- */
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('nav ul');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            navMenu.classList.toggle('open');
        });
    }

    /* ---------- Reveal on Scroll (IntersectionObserver) ---------- */
    const revealEls = document.querySelectorAll('.reveal');
    let revealIdx = 0;
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                setTimeout(() => {
                    el.classList.add('visible');
                }, revealIdx * 150); // 150ms stagger per element
                revealIdx++;
                revealObserver.unobserve(el);
            }
        });
    }, { threshold: 0.1 });
    revealEls.forEach(el => revealObserver.observe(el));

    /* ---------- Stat Counters ---------- */
    const statEls = document.querySelectorAll('.stat-number');
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    statEls.forEach(el => statObserver.observe(el));

    function animateCount(el) {
        const target = parseInt(el.dataset.target, 10) || 0;
        const duration = 2000;
        const start = performance.now();

        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            el.textContent = Math.floor(progress * target);
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target;
        };
        requestAnimationFrame(step);
    }

    /* ---------- Gallery Lightbox ---------- */
    const gallery = document.getElementById('gallery');
    if (gallery) {
        const galleryImages = Array.from(gallery.querySelectorAll('img'));
        let currentIdx = 0;

        const overlay = document.createElement('div');
        overlay.id = 'lightbox-overlay';
        overlay.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;
            background:rgba(0,0,0,0.9);display:flex;justify-content:center;
            align-items:center;z-index:10000;opacity:0;pointer-events:none;
            transition:opacity .3s;
        `;

        const lightImg = document.createElement('img');
        lightImg.style.maxWidth = '90%';
        lightImg.style.maxHeight = '90%';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            position:absolute;top:20px;right:20px;background:none;
            color:#fff;font-size:2rem;border:none;cursor:pointer;
        `;

        const prevBtn = document.createElement('button');
        prevBtn.textContent = '←';
        prevBtn.style.cssText = `
            position:absolute;left:20px;top:50%;transform:translateY(-50%);
            background:none;color:#fff;font-size:2rem;border:none;cursor:pointer;
        `;

        const nextBtn = document.createElement('button');
        nextBtn.textContent = '→';
        nextBtn.style.cssText = `
            position:absolute;right:20px;top:50%;transform:translateY(-50%);
            background:none;color:#fff;font-size:2rem;border:none;cursor:pointer;
        `;

        overlay.append(lightImg, closeBtn, prevBtn, nextBtn);
        document.body.appendChild(overlay);

        const openLightbox = (idx) => {
            currentIdx = idx;
            lightImg.src = galleryImages[currentIdx].src;
            overlay.style.opacity = '1';
            overlay.style.pointerEvents = 'auto';
        };
        const closeLightbox = () => {
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
        };
        const showPrev = () => {
            currentIdx = (currentIdx - 1 + galleryImages.length) % galleryImages.length;
            lightImg.src = galleryImages[currentIdx].src;
        };
        const showNext = () => {
            currentIdx = (currentIdx + 1) % galleryImages.length;
            lightImg.src = galleryImages[currentIdx].src;
        };

        galleryImages.forEach((img, i) => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => openLightbox(i));
        });

        closeBtn.addEventListener('click', closeLightbox);
        prevBtn.addEventListener('click', showPrev);
        nextBtn.addEventListener('click', showNext);
        overlay.addEventListener('click', e => {
            if (e.target === overlay) closeLightbox();
        });
    }

    /* ---------- Form Validation & Success Message ---------- */
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const inputs = form.querySelectorAll('input, textarea');
            let valid = true;

            inputs.forEach(inp => {
                const isRequired = inp.hasAttribute('required');
                const value = inp.value.trim();

                if (isRequired && !value) {
                    valid = false;
                    inp.classList.add('error');
                } else {
                    inp.classList.remove('error');
                }

                if (inp.type === 'email' && value) {
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailPattern.test(value)) {
                        valid = false;
                        inp.classList.add('error');
                    } else {
                        inp.classList.remove('error');
                    }
                }
            });

            if (valid) {
                const success = document.createElement('div');
                success.className = 'form-success';
                success.textContent = 'Message sent successfully!';
                success.style.cssText = `
                    position:fixed;top:20%;left:50%;transform:translateX(-50%);
                    background:var(--primary);color:#fff;padding:1rem 2rem;
                    border-radius:8px;opacity:0;transition:opacity .5s;z-index:1000;
                `;
                document.body.appendChild(success);
                requestAnimationFrame(() => success.style.opacity = '1');
                setTimeout(() => success.style.opacity = '0', 3000);
                setTimeout(() => success.remove(), 3500);
                form.reset();
            }
        });
    }
});