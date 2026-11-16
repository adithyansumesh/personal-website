document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollProgressBar();
    initScrollObserver();
    init3DCardTilt();
    initMagneticButtons();
    initSmoothAnchors();
    initContactForm();
    loadGitHubProjects();
});

/**
 * Updates desktop floating pill dock, mobile bottom bar, and mobile top section indicator on scroll.
 */
function initNavigation() {
    const sections = document.querySelectorAll('main section[id]');
    const desktopLinks = document.querySelectorAll('#desktop-nav .desktop-nav-link');
    const mobileLinks = document.querySelectorAll('#mobile-bottom-nav .mobile-nav-link');
    const mobileHeaderLabel = document.getElementById('mobile-header-section');

    const desktopActive = ['bg-surface-container-highest', 'text-primary-container', 'border-b-2', 'border-primary-container'];
    const desktopIdle = ['text-on-surface-variant', 'hover:text-on-surface', 'hover:bg-surface-container'];

    const sectionTargetMap = {
        home: 'home',
        about: 'about',
        skills: 'skills',
        projects: 'projects',
        experience: 'experience',
        education: 'education',
        achievements: 'education',
        'resume-cta': 'contact',
        contact: 'contact'
    };

    const labelMap = {
        home: 'Home',
        about: 'About',
        skills: 'Skills',
        projects: 'Projects',
        experience: 'Experience',
        education: 'Education',
        contact: 'Contact'
    };

    const updateActiveNav = () => {
        let current = 'home';
        sections.forEach((section) => {
            if (window.scrollY >= section.offsetTop - 180) {
                current = section.getAttribute('id') || current;
            }
        });

        const navKey = sectionTargetMap[current] || 'home';

        if (mobileHeaderLabel) {
            mobileHeaderLabel.textContent = labelMap[navKey] || 'Home';
        }

        desktopLinks.forEach((link) => {
            const isActive = link.dataset.path === navKey;
            desktopActive.forEach((cls) => link.classList.toggle(cls, isActive));
            desktopIdle.forEach((cls) => link.classList.toggle(cls, !isActive));
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });

        mobileLinks.forEach((link) => {
            const isActive = link.dataset.path === navKey;
            link.classList.toggle('text-primary-container', isActive);
            link.classList.toggle('text-on-surface-variant', !isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
}

/**
 * Tracks scroll progress and updates top indicator bar.
 */
function initScrollProgressBar() {
    const bar = document.getElementById('scroll-progress-bar');
    if (!bar) return;

    const onScroll = () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
        bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/**
 * Observes sections and cards entering viewport with smooth progressive reveal.
 */
let globalScrollObserver = null;
function initScrollObserver() {
    if (typeof IntersectionObserver === 'undefined') {
        document.querySelectorAll('.reveal-section, .reveal-card').forEach((el) => el.classList.add('is-revealed'));
        return;
    }

    globalScrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal-section, .reveal-card').forEach((el) => {
        globalScrollObserver.observe(el);
    });
}

/**
 * 3D Card Tilt with subtle dynamic elevation and perspective on pointer movement.
 */
function init3DCardTilt() {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach((card) => {
        if (card.dataset.tiltInitialized) return;
        card.dataset.tiltInitialized = 'true';

        let rect = null;

        const onMouseEnter = () => {
            rect = card.getBoundingClientRect();
        };

        const onMouseMove = (e) => {
            if (!rect) rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            const rotX = -y * 8;
            const rotY = x * 8;
            card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-4px)`;
        };

        const onMouseLeave = () => {
            rect = null;
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        };

        card.addEventListener('mouseenter', onMouseEnter);
        card.addEventListener('mousemove', onMouseMove, { passive: true });
        card.addEventListener('mouseleave', onMouseLeave);
    });
}

/**
 * Magnetic button hover effect for primary interactive CTA triggers.
 */
function initMagneticButtons() {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const btns = document.querySelectorAll('.magnetic-btn');
    btns.forEach((btn) => {
        if (btn.dataset.magneticInitialized) return;
        btn.dataset.magneticInitialized = 'true';

        let rect = null;

        btn.addEventListener('mouseenter', () => {
            rect = btn.getBoundingClientRect();
        });

        btn.addEventListener('mousemove', (e) => {
            if (!rect) rect = btn.getBoundingClientRect();
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);
            btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
        }, { passive: true });

        btn.addEventListener('mouseleave', () => {
            rect = null;
            btn.style.transform = 'translate(0px, 0px)';
        });
    });
}

/**
 * Smooth anchor scrolling with header offset calculation.
 */
function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#' || href.length <= 1) return;
            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            const offset = window.innerWidth >= 768 ? 80 : 70;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({
                top: Math.max(0, top),
                behavior: 'smooth'
            });
        });
    });
}

/**
 * Displays a terminal-styled toast notification.
 */
let toastTimeoutId = null;
window.showToast = (message, isError = false) => {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    const icon = toast.querySelector('.material-symbols-outlined');
    if (icon) {
        icon.textContent = isError ? 'error' : 'check_circle';
        icon.classList.toggle('text-error', isError);
        icon.classList.toggle('text-primary-container', !isError);
    }

    toast.classList.toggle('toast-error', isError);
    toastMsg.textContent = message;
    toast.classList.add('show');

    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    toastTimeoutId = setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
};

/**
 * Connects #contactForm to the existing Web3Forms endpoint with loading/success/error states.
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const defaultBtnHtml = submitBtn ? submitBtn.innerHTML : '';

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(contactForm);
        const accessKey = formData.get('access_key');

        if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
            window.showToast('Please add your Web3Forms access key in index.html to receive emails!', true);
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-75');
            submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[20px]">sync</span><span class="mt-0.5 leading-none">...</span>';
        }

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.success) {
                window.showToast('Message sent successfully!');
                contactForm.reset();
            } else {
                window.showToast(data.message || 'Something went wrong. Please try again.', true);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            window.showToast('Network error. Please try again.', true);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-75');
                submitBtn.innerHTML = defaultBtnHtml;
            }
        }
    });
}

/**
 * Builds a project card matching Stitch's Terminal Editorial project layout.
 */
function createProjectCard({ indexNumber, title, description, techTags, demoUrl, sourceUrl, imageUrl }) {
    const card = document.createElement('article');
    const staggerIndex = ((indexNumber - 1) % 5) + 1;
    card.className = `tilt-card reveal-card is-revealed bg-surface-container-low border border-[#242424] flex flex-col group hover:border-primary-container transition-all duration-300 stagger-${staggerIndex}`;

    // Visual frame matching Stitch project preview
    const mediaFrame = document.createElement('div');
    mediaFrame.className = 'relative w-full aspect-[16/9] overflow-hidden bg-surface-container-lowest border-b border-[#242424]';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = `${title} preview`;
    img.loading = 'lazy';
    img.className = 'w-full h-full object-cover filter grayscale contrast-125 group-hover:scale-105 transition-transform duration-500';

    const indexBadge = document.createElement('div');
    indexBadge.className = 'absolute top-3 left-3 px-2 py-0.5 bg-surface-container-lowest/90 border border-[#242424] font-label-mono text-label-mono text-primary-container';
    indexBadge.textContent = `[SYS_INDEX: ${String(indexNumber).padStart(2, '0')}]`;

    const techOverlay = document.createElement('div');
    techOverlay.className = 'absolute bottom-3 right-3 flex flex-wrap gap-1';
    techTags.forEach((tag, idx) => {
        const chip = document.createElement('span');
        chip.className = `px-2 py-0.5 bg-surface-container-lowest border border-[#242424] font-label-mono text-[9px] ${idx === techTags.length - 1 ? 'text-primary-container' : 'text-on-surface'}`;
        chip.textContent = tag;
        techOverlay.appendChild(chip);
    });

    mediaFrame.append(img, indexBadge, techOverlay);

    // Card content & actions
    const contentWrap = document.createElement('div');
    contentWrap.className = 'p-space-lg flex-1 flex flex-col justify-between';

    const headerAndDesc = document.createElement('div');

    const titleRow = document.createElement('div');
    titleRow.className = 'flex items-center justify-between gap-2 mb-2';

    const heading = document.createElement('h3');
    heading.className = 'font-headline-md text-headline-md font-bold text-on-surface group-hover:text-primary-container transition-colors';
    heading.textContent = title;

    const arrowLink = document.createElement('a');
    arrowLink.href = demoUrl || sourceUrl;
    arrowLink.target = '_blank';
    arrowLink.rel = 'noopener noreferrer';
    arrowLink.setAttribute('aria-label', `Open ${title}`);
    arrowLink.className = 'magnetic-btn w-8 h-8 shrink-0 rounded-full border border-[#242424] flex items-center justify-center text-on-surface group-hover:border-primary-container group-hover:text-primary-container transition-colors';
    arrowLink.innerHTML = '<span class="material-symbols-outlined text-[18px]">arrow_outward</span>';

    titleRow.append(heading, arrowLink);

    const desc = document.createElement('p');
    desc.className = 'font-body-md text-body-md text-on-surface-variant mb-space-md';
    desc.textContent = description;

    headerAndDesc.append(titleRow, desc);

    const actions = document.createElement('div');
    actions.className = 'flex items-center gap-space-sm pt-space-sm border-t border-[#242424]';

    if (demoUrl) {
        const demoLink = document.createElement('a');
        demoLink.href = demoUrl;
        demoLink.target = '_blank';
        demoLink.rel = 'noopener noreferrer';
        demoLink.className = 'magnetic-btn px-space-md py-1 bg-surface-container border border-[#242424] hover:border-primary-container text-on-surface font-mono-code text-mono-code inline-flex items-center gap-1 transition-colors';
        demoLink.innerHTML = '<span class="material-symbols-outlined text-[14px] text-primary-container">play_arrow</span><span>Live Demo</span>';
        actions.appendChild(demoLink);
    } else {
        const demoBtn = document.createElement('button');
        demoBtn.type = 'button';
        demoBtn.className = 'magnetic-btn px-space-md py-1 bg-surface-container border border-[#242424] hover:border-primary-container text-on-surface font-mono-code text-mono-code inline-flex items-center gap-1 transition-colors cursor-pointer';
        demoBtn.innerHTML = '<span class="material-symbols-outlined text-[14px] text-primary-container">play_arrow</span><span>Live Demo</span>';
        demoBtn.addEventListener('click', () => {
            window.showToast('Live demo not available for this project');
        });
        actions.appendChild(demoBtn);
    }

    const sourceLink = document.createElement('a');
    sourceLink.href = sourceUrl;
    sourceLink.target = '_blank';
    sourceLink.rel = 'noopener noreferrer';
    sourceLink.className = 'magnetic-btn px-space-md py-1 border border-[#242424] hover:border-on-surface text-on-surface-variant font-mono-code text-mono-code inline-flex items-center gap-1 transition-colors';
    sourceLink.innerHTML = '<span class="material-symbols-outlined text-[14px]">code</span><span>Source</span>';
    actions.appendChild(sourceLink);

    contentWrap.append(headerAndDesc, actions);
    card.append(mediaFrame, contentWrap);
    return card;
}

/**
 * Loads MovieMind AI plus live GitHub repositories (excluding forks and InternAI).
 */
async function loadGitHubProjects() {
    const container = document.getElementById('github-projects');
    const countLabel = document.getElementById('projects-count-label');
    if (!container) return;

    const previewImages = [
        'assets/project-1.jpg',
        'assets/project-2.jpg',
        'assets/project-3.jpg',
        'assets/project-4.jpg'
    ];

    const featuredMovieMind = {
        indexNumber: 1,
        title: 'MovieMind AI',
        description: 'Personalized Movie Review System using Artificial Intelligence and Machine Learning techniques.',
        techTags: ['Python', 'Machine Learning'],
        demoUrl: '',
        sourceUrl: 'https://github.com/AshikAjil/movie--mind-ai',
        imageUrl: previewImages[0]
    };

    try {
        const username = 'adithyansumesh';
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
        if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Unexpected GitHub API payload');

        container.innerHTML = '';
        container.appendChild(createProjectCard(featuredMovieMind));

        const repos = data.filter((repo) => !repo.fork && repo.name !== 'InternAI').slice(0, 5);
        repos.forEach((repo, idx) => {
            const formattedTitle = repo.name
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            const card = createProjectCard({
                indexNumber: idx + 2,
                title: formattedTitle,
                description: repo.description || 'View repository on GitHub to learn more.',
                techTags: [repo.language || 'Code'],
                demoUrl: repo.homepage || '',
                sourceUrl: repo.html_url,
                imageUrl: previewImages[(idx + 1) % previewImages.length]
            });

            container.appendChild(card);
        });

        if (countLabel) {
            const total = String(repos.length + 1).padStart(2, '0');
            countLabel.textContent = `// INDEX_COUNT: ${total}_PRODUCED`;
        }

        init3DCardTilt();
        initMagneticButtons();
        if (globalScrollObserver) {
            container.querySelectorAll('.reveal-card').forEach((c) => globalScrollObserver.observe(c));
        }
    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        container.innerHTML = '';
        container.appendChild(createProjectCard(featuredMovieMind));

        if (countLabel) {
            countLabel.textContent = '// INDEX_COUNT: 01_CACHED';
        }

        init3DCardTilt();
        initMagneticButtons();

        const errMsg = document.createElement('p');
        errMsg.className = 'col-span-full text-center font-mono-code text-mono-code text-error';
        errMsg.textContent = 'Failed to load additional repositories from GitHub. Please try again later.';
        container.appendChild(errMsg);
    }
}
