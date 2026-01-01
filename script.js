/*=============== SHOW MENU (Mobile Menu) ===============*/
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navLinks = document.querySelectorAll('.nav__link'),
      chatbotContainer = document.getElementById('chatbot');

/* Show and hide menu */
if(navToggle){
    navToggle.addEventListener('click', () =>{
        const nav = document.querySelector('.nav');
        nav.classList.toggle('show-menu');
        const isMenuOpen = nav.classList.contains('show-menu');

        if (chatbotContainer) {
            chatbotContainer.classList.toggle('chatbot--menu-hidden', isMenuOpen);
        }

        // Actualizar la sección activa cuando se abre el menú
        if (isMenuOpen) {
            setTimeout(() => {
                scrollActive();
            }, 100);
        }
    });
}

/* Hide menu on link click (Mobile) */
function linkAction(){
    const nav = document.querySelector('.nav');
    if (nav.classList.contains('show-menu')) {
        nav.classList.remove('show-menu');
        if (chatbotContainer) {
            chatbotContainer.classList.remove('chatbot--menu-hidden');
        }
    }
}
navLinks.forEach(n => n.addEventListener('click', linkAction));


/*=============== THEME CHANGE (Light/Dark) ===============*/
const themeToggleDesktop = document.getElementById('desktop-theme-toggle');
const themeToggleSidebar = document.getElementById('theme-toggle');
const darkTheme = 'dark-theme';
const iconTheme = 'bx-sun'; // Icon for dark mode (sun)

// Previously selected theme
const selectedTheme = localStorage.getItem('selected-theme');
const selectedIcon = localStorage.getItem('selected-icon');

// Get current theme
const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light';
const getCurrentIcon = () => themeToggleDesktop.classList.contains(iconTheme) ? 'bx-moon' : 'bx-sun';

// Theme initialization
if (selectedTheme) {
  document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme);
  const iconClass = selectedIcon === 'bx-moon' ? 'bx-moon' : 'bx-sun';
  themeToggleDesktop.classList.add(iconClass);
  themeToggleSidebar.classList.add(iconClass);
} else {
    // Default to dark-theme if no preference is saved
    document.body.classList.add(darkTheme);
    themeToggleDesktop.classList.add(iconTheme);
    themeToggleSidebar.classList.add(iconTheme);
}

// Toggle function
function toggleTheme() {
    // 1. Toggle body class
    document.body.classList.toggle(darkTheme);
    
    // 2. Toggle both icons
    themeToggleDesktop.classList.toggle(iconTheme);
    themeToggleSidebar.classList.toggle(iconTheme);
    
    // 3. Save to localStorage
    localStorage.setItem('selected-theme', getCurrentTheme());
    localStorage.setItem('selected-icon', getCurrentIcon());
}

// Event listeners for both buttons
themeToggleDesktop.addEventListener('click', toggleTheme);
themeToggleSidebar.addEventListener('click', toggleTheme);


/*=============== ACTIVE SECTION ON SCROLL ===============*/
const sections = document.querySelectorAll('section[id]');

function scrollActive(){
    const scrollY = window.pageYOffset;
    const isMobile = window.innerWidth <= 720;
    // Adjust position for sidebar/sticky header in mobile
    const offset = isMobile ? 56 : 120; // 56px for mobile (3.5rem), 120px for desktop

    sections.forEach(current =>{
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - offset;
        const sectionId = current.getAttribute('id');

        const navLink = document.querySelector('.nav__list a[href*=' + sectionId + ']');
        
        if (navLink) { // Check if the element exists before trying to access its classList
            if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight){
                navLink.classList.add('active-link');
            }else{
                navLink.classList.remove('active-link');
            }
        }
    });
}
window.addEventListener('scroll', scrollActive);
// Llamar también al cargar la página para establecer la sección activa inicial
scrollActive();

/*=============== CONTACT SECTION AOS (Disable on Mobile) ===============*/
const CONTACT_AOS_BREAKPOINT = 720;
let isAosInitialized = false;
const contactSection = document.getElementById('contact');
let updateContactAos = null;

if (contactSection) {
    const contactAosElements = Array.from(contactSection.querySelectorAll('[data-aos]'));
    let isContactInMobileView = null;

    contactAosElements.forEach(element => {
        const originalAos = element.getAttribute('data-aos');
        if (originalAos) {
            element.dataset.contactAosOriginal = originalAos;
        }
        const originalDelay = element.getAttribute('data-aos-delay');
        if (originalDelay) {
            element.dataset.contactAosDelay = originalDelay;
        }
        const originalDuration = element.getAttribute('data-aos-duration');
        if (originalDuration) {
            element.dataset.contactAosDuration = originalDuration;
        }
        const originalOffset = element.getAttribute('data-aos-offset');
        if (originalOffset) {
            element.dataset.contactAosOffset = originalOffset;
        }
    });

    updateContactAos = (force = false) => {
        const isMobile = window.innerWidth <= CONTACT_AOS_BREAKPOINT;
        if (!force && isMobile === isContactInMobileView) return;
        isContactInMobileView = isMobile;

        contactAosElements.forEach(element => {
            if (isMobile) {
                element.removeAttribute('data-aos');
                element.removeAttribute('data-aos-delay');
                element.removeAttribute('data-aos-duration');
                element.removeAttribute('data-aos-offset');
            } else {
                if (element.dataset.contactAosOriginal) {
                    element.setAttribute('data-aos', element.dataset.contactAosOriginal);
                }
                if (element.dataset.contactAosDelay) {
                    element.setAttribute('data-aos-delay', element.dataset.contactAosDelay);
                } else {
                    element.removeAttribute('data-aos-delay');
                }
                if (element.dataset.contactAosDuration) {
                    element.setAttribute('data-aos-duration', element.dataset.contactAosDuration);
                } else {
                    element.removeAttribute('data-aos-duration');
                }
                if (element.dataset.contactAosOffset) {
                    element.setAttribute('data-aos-offset', element.dataset.contactAosOffset);
                } else {
                    element.removeAttribute('data-aos-offset');
                }
            }
        });

        if (window.AOS && isAosInitialized) {
            if (typeof window.AOS.refreshHard === 'function') {
                window.AOS.refreshHard();
            } else if (typeof window.AOS.refresh === 'function') {
                window.AOS.refresh();
            }
        }
    };

    window.addEventListener('resize', () => updateContactAos());
}

/*=============== INITIALIZE AOS ANIMATIONS ===============*/
AOS.init({
    duration: 1000,
    easing: 'ease-in-out',
    once: true,
    mirror: false
});
isAosInitialized = true;
if (typeof updateContactAos === 'function') {
    updateContactAos();
    updateContactAos(true);
}

/*=============== LANGUAGE DETECTION ===============*/
const detectLanguage = () => {
    // Intentar obtener el idioma del navegador
    const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    
    // Verificar si el idioma es español (es, es-ES, es-MX, etc.)
    if (browserLang.startsWith('es')) {
        return 'es';
    }
    
    // Por defecto, usar inglés
    return 'en';
};

const currentLang = detectLanguage();

const translations = {
    es: {
        // Chatbot
        initialMessage: '¡Hola! Soy tu asistente virtual. Pregúntame sobre mi experiencia, proyectos o cualquier detalle que quieras conocer sobre mí.',
        thinking: 'Déjame pensar...',
        errorMessage: 'Lo siento, no pude obtener una respuesta. Inténtalo de nuevo más tarde.',
        placeholder: 'Escribe tu pregunta...',
        assistantTitle: 'Mi asistente virtual',
        hintText: '¿Prefieres preguntar directamente?<br><strong>¡Háblame aquí!</strong>',
        toggleAriaLabel: 'Abrir asistente virtual',
        closeAriaLabel: 'Cerrar asistente',
        micAriaLabel: 'Dictar mensaje de voz',
        sendAriaLabel: 'Enviar mensaje',
        voiceNotSupported: 'La entrada de voz no está soportada en este navegador',
        // Navigation
        navHome: 'Inicio',
        navAbout: 'Sobre mí',
        navProjects: 'Proyectos',
        navExperience: 'Experiencia',
        navContact: 'Contacto',
        // Home section
        mobileWarning: 'Nota: Versión móvil reducida. En escritorio verás el portafolio completo.',
        availableForOpportunities: 'Disponible para oportunidades',
        homeSubtitleDesktop: 'Construyendo Sistemas Inteligentes y Soluciones Geoespaciales.',
        homeSubtitleMobile: 'Construyendo software inteligente y soluciones GIS.',
        homeDescriptionDesktop: 'Ingeniero de Software y Datos especializado en desarrollo backend en Python, migración a la nube (AWS), integración de IA y Sistemas de Información Geográfica (GIS). Transformo datos complejos en productos digitales accionables.',
        homeDescriptionMobile: 'Especialista en backend Python, AWS, IA y GIS creando impacto digital.',
        viewMyWork: 'Ver mi trabajo',
        getInTouch: 'Contáctame',
        connectWithMe: 'Conéctate conmigo',
        // About section
        aboutMe: 'Sobre mí',
        aboutSubtitleDesktop: 'Ingeniería, Datos y Automatización<br>Conectando código, geo-datos e inteligencia artificial',
        aboutSubtitleMobile: 'Ingeniería + datos + IA conectando código con conocimiento geoespacial.',
        myJourney: 'Mi trayectoria',
        journeyText1Desktop: 'Soy Ingeniero de Software con una sólida formación en Ciencias de la Computación, enfocado en el ciclo completo de desarrollo de software, desde la reingeniería de sistemas legados hasta la migración a la nube e implementación de soluciones avanzadas de IA.',
        journeyText1Mobile: 'Ingeniero de software de ciclo completo entregando transformaciones lideradas por la nube y la IA.',
        journeyText2Desktop: 'Mi especialización principal está en el <strong>desarrollo backend en Python</strong>, donde aprovecho su poder para automatización, procesamiento de datos y creación de APIs altamente eficientes. Tengo experiencia práctica migrando sistemas a <strong>AWS</strong> y desarrollando <strong>chatbots con IA</strong> listos para producción.',
        journeyText2Mobile: 'Líder en backend Python: automatización, migraciones AWS y chatbots con IA listos para producción.',
        journeyText3Desktop: 'Una habilidad diferenciadora clave es mi experiencia en <strong>Sistemas de Información Geográfica (GIS)</strong> usando herramientas como <strong>QGIS y ArcGIS Online</strong> para procesar datos espaciales, ofreciendo insights valiosos para clientes en áreas como predicción agrícola.',
        journeyText3Mobile: 'Diferenciador: análisis GIS avanzado con QGIS y ArcGIS para impulsar insights espaciales.',
        whatIBring: 'Lo que aporto',
        // Projects section
        featuredWork: 'Trabajos destacados',
        projectsSubtitleDesktop: 'Proyectos y casos de estudio<br>Una muestra de mi trabajo reciente, desde el concepto hasta el despliegue',
        projectsSubtitleMobile: 'Proyectos seleccionados destacando estrategia hasta despliegue.',
        // Experience section
        careerJourney: 'Trayectoria profesional',
        experienceSubtitleDesktop: 'Experiencia profesional<br>Una línea de tiempo de mi crecimiento y contribuciones en la industria tecnológica',
        experienceSubtitleMobile: 'Hitos clave que dan forma a mi trayectoria tecnológica.',
        fullTime: 'Tiempo completo',
        education: 'Educación',
        // Contact section
        getInTouchTitle: 'Contáctame',
        contactSubtitleDesktop: 'Trabajemos juntos<br>¿Listo para dar vida a tus ideas? Estoy aquí para ayudarte a construir algo increíble.',
        contactSubtitleMobile: 'Comparte tu visión y lo construiremos juntos.',
        contactInformation: 'Información de contacto',
        email: 'Correo electrónico',
        sendEmailAnytime: 'Envíame un correo en cualquier momento',
        phone: 'Teléfono',
        availableForCalls: 'Disponible para llamadas',
        location: 'Ubicación',
        openToRemote: 'Abierto a oportunidades remotas',
        followMe: 'Sígueme',
        availableForWork: 'Disponible para trabajar',
        availableTextDesktop: 'Actualmente estoy aceptando nuevos proyectos y me encantaría conocer el tuyo.',
        availableTextMobile: 'Actualmente abierto a nuevas colaboraciones.',
        sendMessage: 'Envíame un mensaje',
        fullName: 'Nombre completo',
        emailAddress: 'Dirección de correo',
        subject: 'Asunto',
        message: 'Mensaje',
        sendMessageButton: 'Enviar mensaje',
        usuallyResponds: 'Generalmente responde en 24 horas',
        freeConsultation: 'Consulta gratuita disponible',
        // Footer
        expertise: 'Especialización',
        backendDevelopment: 'Desarrollo Backend',
        cloudMigration: 'Migración a la nube (AWS)',
        aiAutomation: 'IA y Automatización',
        gisSolutions: 'Soluciones GIS',
        footerDescriptionDesktop: 'Ingeniero de Software y Datos especializado en Python, AWS, IA y GIS. Apasionado por construir sistemas inteligentes.',
        footerDescriptionMobile: 'Ingeniero de software y datos creando plataformas inteligentes.',
        // Stats
        yearsExperience: 'Años<br>Experiencia',
        complexProjects: 'Proyectos<br>Complejos',
        automatedProcesses: 'Procesos<br>Automatizados'
    },
    en: {
        // Chatbot
        initialMessage: 'Hello! I am your virtual assistant. Ask me about my experience, projects or any detail you want to know about me.',
        thinking: 'Let me think...',
        errorMessage: 'Sorry, I couldn\'t get a response. Try again later.',
        placeholder: 'Write your question...',
        assistantTitle: 'My virtual assistant',
        hintText: 'Prefer to ask directly?<br><strong>Talk to me here!</strong>',
        toggleAriaLabel: 'Open virtual assistant',
        closeAriaLabel: 'Close assistant',
        micAriaLabel: 'Dictate voice message',
        sendAriaLabel: 'Send message',
        voiceNotSupported: 'Voice input is not supported by this browser',
        // Navigation
        navHome: 'Home',
        navAbout: 'About',
        navProjects: 'Projects',
        navExperience: 'Experience',
        navContact: 'Contact',
        // Home section
        mobileWarning: 'Note: Mobile version reduced. On desktop you will see the full portfolio.',
        availableForOpportunities: 'Available for opportunities',
        homeSubtitleDesktop: 'Building Intelligent Systems and Geo-Spatial Solutions.',
        homeSubtitleMobile: 'Building intelligent software & GIS solutions.',
        homeDescriptionDesktop: 'Software and Data Engineer specializing in Python backend development, cloud migration (AWS), AI integration, and Geographic Information Systems (GIS). I transform complex data into actionable digital products.',
        homeDescriptionMobile: 'Python backend, AWS, AI and GIS specialist crafting digital impact.',
        viewMyWork: 'View My Work',
        getInTouch: 'Get In Touch',
        connectWithMe: 'Connect with me:',
        // About section
        aboutMe: 'About Me',
        aboutSubtitleDesktop: 'Engineering, Data, and Automation<br>Bridging the gap between code, geo-data, and artificial intelligence',
        aboutSubtitleMobile: 'Engineering + data + AI bridging code with geospatial insight.',
        myJourney: 'My Journey',
        journeyText1Desktop: 'I am a Software Engineer with a strong background in Computer Science, focused on the complete software development lifecycle, from re-engineering legacy systems to cloud migration and implementing advanced AI solutions.',
        journeyText1Mobile: 'Full-cycle software engineer delivering cloud and AI-led transformations.',
        journeyText2Desktop: 'My core specialization lies in <strong>Python backend development</strong>, where I leverage its power for automation, data processing, and creating highly efficient APIs. I have hands-on experience migrating systems to <strong>AWS</strong> and developing production-ready <strong>AI-powered chatbots</strong>.',
        journeyText2Mobile: 'Python backend lead: automation, AWS migrations and production-ready AI chatbots.',
        journeyText3Desktop: 'A key differentiating skill is my expertise in <strong>Geographic Information Systems (GIS)</strong> using tools like <strong>QGIS and ArcGIS Online</strong> to process spatial data, offering valuable insights for clients in areas like agricultural prediction.',
        journeyText3Mobile: 'Differentiator: advanced GIS analytics with QGIS & ArcGIS to drive spatial insights.',
        whatIBring: 'What I Bring',
        // Projects section
        featuredWork: 'Featured Work',
        projectsSubtitleDesktop: 'Projects & Case Studies<br>A showcase of my recent work, from concept to deployment',
        projectsSubtitleMobile: 'Selected projects highlighting strategy to deployment.',
        // Experience section
        careerJourney: 'Career Journey',
        experienceSubtitleDesktop: 'Professional Experience<br>A timeline of my growth and contributions in the tech industry',
        experienceSubtitleMobile: 'Key milestones shaping my tech journey.',
        fullTime: 'Full-time',
        education: 'Education',
        // Contact section
        getInTouchTitle: 'Get In Touch',
        contactSubtitleDesktop: 'Let\'s Work Together<br>Ready to bring your ideas to life? I\'m here to help you build something amazing.',
        contactSubtitleMobile: 'Share your vision and we\'ll build it together.',
        contactInformation: 'Contact Information',
        email: 'Email',
        sendEmailAnytime: 'Send me an email anytime',
        phone: 'Phone',
        availableForCalls: 'Available for calls',
        location: 'Location',
        openToRemote: 'Open to remote opportunities',
        followMe: 'Follow Me',
        availableForWork: 'Available for work',
        availableTextDesktop: 'I\'m currently accepting new projects and would love to hear about yours.',
        availableTextMobile: 'Currently open to new collaborations.',
        sendMessage: 'Send me a message',
        fullName: 'Full Name *',
        emailAddress: 'Email Address *',
        subject: 'Subject',
        message: 'Message *',
        sendMessageButton: 'Send Message',
        usuallyResponds: 'Usually responds within 24 hours',
        freeConsultation: 'Free consultation available',
        // Footer
        expertise: 'Expertise',
        backendDevelopment: 'Backend Development',
        cloudMigration: 'Cloud Migration (AWS)',
        aiAutomation: 'AI & Automation',
        gisSolutions: 'GIS Solutions',
        footerDescriptionDesktop: 'Software and Data Engineer specializing in Python, AWS, AI, and GIS. Passionate about building intelligent systems.',
        footerDescriptionMobile: 'Software & data engineer crafting intelligent platforms.',
        // Stats
        yearsExperience: 'Years<br>Experience',
        complexProjects: 'Complex<br>Projects',
        automatedProcesses: 'Automated<br>Processes'
    }
};

const t = translations[currentLang];

/*=============== UPDATE CHATBOT UI TEXT ===============*/
const updateChatbotTexts = () => {
    // Actualizar placeholder del input
    const chatbotInput = document.getElementById('chatbot-input');
    if (chatbotInput) {
        chatbotInput.placeholder = t.placeholder;
    }

    // Actualizar título del asistente
    const assistantTitle = document.querySelector('#chatbot-panel header h3');
    if (assistantTitle) {
        assistantTitle.textContent = t.assistantTitle;
    }

    // Actualizar hint text
    const chatbotHint = document.getElementById('chatbot-hint');
    if (chatbotHint) {
        const hintText = chatbotHint.querySelector('.chatbot__hint-text');
        if (hintText) {
            hintText.innerHTML = t.hintText;
        }
    }

    // Actualizar aria-labels
    const chatbotToggle = document.getElementById('chatbot-toggle');
    if (chatbotToggle) {
        chatbotToggle.setAttribute('aria-label', t.toggleAriaLabel);
    }

    const chatbotClose = document.getElementById('chatbot-close');
    if (chatbotClose) {
        chatbotClose.setAttribute('aria-label', t.closeAriaLabel);
    }

    const chatbotMic = document.getElementById('chatbot-mic');
    if (chatbotMic) {
        chatbotMic.setAttribute('aria-label', t.micAriaLabel);
    }

    const chatbotSend = document.querySelector('.chatbot__send');
    if (chatbotSend) {
        chatbotSend.setAttribute('aria-label', t.sendAriaLabel);
    }
};

/*=============== UPDATE HTML TEXTS ===============*/
const updateHTMLTexts = () => {
    const t = translations[currentLang];
    
    // Actualizar atributo lang del HTML
    document.documentElement.lang = currentLang;
    
    // Navegación
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
        const text = link.textContent.trim();
        if (text.includes('Home')) link.innerHTML = `<i class='bx bxs-home'></i> ${t.navHome}`;
        else if (text.includes('About')) link.innerHTML = `<i class='bx bxs-user'></i> ${t.navAbout}`;
        else if (text.includes('Projects')) link.innerHTML = `<i class='bx bxs-briefcase-alt-2'></i> ${t.navProjects}`;
        else if (text.includes('Experience')) link.innerHTML = `<i class='bx bxs-graduation'></i> ${t.navExperience}`;
        else if (text.includes('Contact')) link.innerHTML = `<i class='bx bxs-contact'></i> ${t.navContact}`;
    });
    
    // Home section
    const mobileWarning = document.querySelector('.home__mobile-warning .text-mobile');
    if (mobileWarning) {
        const icon = mobileWarning.querySelector('i');
        mobileWarning.innerHTML = icon ? `<i class='bx bx-mobile-alt'></i> ${t.mobileWarning}` : t.mobileWarning;
    }
    
    const homeBadge = document.querySelector('.home__badge');
    if (homeBadge) {
        const icon = homeBadge.querySelector('i');
        homeBadge.innerHTML = icon ? `<i class='bx bx-briefcase-alt'></i> ${t.availableForOpportunities}` : t.availableForOpportunities;
    }
    
    const homeSubtitleDesktop = document.querySelector('.home__subtitle .text-desktop');
    if (homeSubtitleDesktop) homeSubtitleDesktop.textContent = t.homeSubtitleDesktop;
    
    const homeSubtitleMobile = document.querySelector('.home__subtitle .text-mobile');
    if (homeSubtitleMobile) homeSubtitleMobile.textContent = t.homeSubtitleMobile;
    
    const homeDescDesktop = document.querySelector('.home__description .text-desktop');
    if (homeDescDesktop) homeDescDesktop.textContent = t.homeDescriptionDesktop;
    
    const homeDescMobile = document.querySelector('.home__description .text-mobile');
    if (homeDescMobile) homeDescMobile.textContent = t.homeDescriptionMobile;
    
    const viewWorkBtn = document.querySelector('.home__buttons .btn--primary');
    if (viewWorkBtn) {
        const icon = viewWorkBtn.querySelector('i');
        viewWorkBtn.innerHTML = icon ? `${t.viewMyWork} <i class='bx bx-right-arrow-alt'></i>` : t.viewMyWork;
    }
    
    const getInTouchBtn = document.querySelector('.home__buttons .btn--secondary');
    if (getInTouchBtn) getInTouchBtn.textContent = t.getInTouch;
    
    const connectText = document.querySelector('.home__social span');
    if (connectText) connectText.textContent = t.connectWithMe;
    
    // About section
    const aboutTitle = document.querySelector('#about .section__title');
    if (aboutTitle) aboutTitle.textContent = t.aboutMe;
    
    const aboutSubtitleDesktop = document.querySelector('#about .section__subtitle .text-desktop');
    if (aboutSubtitleDesktop) aboutSubtitleDesktop.innerHTML = t.aboutSubtitleDesktop;
    
    const aboutSubtitleMobile = document.querySelector('#about .section__subtitle .text-mobile');
    if (aboutSubtitleMobile) aboutSubtitleMobile.textContent = t.aboutSubtitleMobile;
    
    const myJourneyTitle = document.querySelector('.about__section-title');
    if (myJourneyTitle && myJourneyTitle.textContent.includes('Journey')) {
        myJourneyTitle.textContent = t.myJourney;
    }
    
    const journeyTexts = document.querySelectorAll('.about__content p');
    journeyTexts.forEach((p, index) => {
        const desktop = p.querySelector('.text-desktop');
        const mobile = p.querySelector('.text-mobile');
        if (index === 0) {
            if (desktop) desktop.textContent = t.journeyText1Desktop;
            if (mobile) mobile.textContent = t.journeyText1Mobile;
        } else if (index === 1) {
            if (desktop) desktop.innerHTML = t.journeyText2Desktop;
            if (mobile) mobile.textContent = t.journeyText2Mobile;
        } else if (index === 2) {
            if (desktop) desktop.innerHTML = t.journeyText3Desktop;
            if (mobile) mobile.textContent = t.journeyText3Mobile;
        }
    });
    
    const whatIBringTitle = document.querySelectorAll('.about__section-title')[1];
    if (whatIBringTitle && whatIBringTitle.textContent.includes('Bring')) {
        whatIBringTitle.textContent = t.whatIBring;
    }
    
    const stats = document.querySelectorAll('.stat-item span');
    if (stats.length >= 3) {
        if (stats[0].textContent.includes('Years')) stats[0].innerHTML = t.yearsExperience;
        if (stats[1].textContent.includes('Complex')) stats[1].innerHTML = t.complexProjects;
        if (stats[2].textContent.includes('Automated')) stats[2].innerHTML = t.automatedProcesses;
    }
    
    // Projects section
    const projectsTitle = document.querySelector('#projects .section__title');
    if (projectsTitle) projectsTitle.textContent = t.featuredWork;
    
    const projectsSubtitleDesktop = document.querySelector('#projects .section__subtitle .text-desktop');
    if (projectsSubtitleDesktop) projectsSubtitleDesktop.innerHTML = t.projectsSubtitleDesktop;
    
    const projectsSubtitleMobile = document.querySelector('#projects .section__subtitle .text-mobile');
    if (projectsSubtitleMobile) projectsSubtitleMobile.textContent = t.projectsSubtitleMobile;
    
    // Experience section
    const experienceTitle = document.querySelector('#experience .section__title');
    if (experienceTitle) experienceTitle.textContent = t.careerJourney;
    
    const experienceSubtitleDesktop = document.querySelector('#experience .section__subtitle .text-desktop');
    if (experienceSubtitleDesktop) experienceSubtitleDesktop.innerHTML = t.experienceSubtitleDesktop;
    
    const experienceSubtitleMobile = document.querySelector('#experience .section__subtitle .text-mobile');
    if (experienceSubtitleMobile) experienceSubtitleMobile.textContent = t.experienceSubtitleMobile;
    
    // Actualizar textos "Full-time" y "Education"
    const fullTimeTexts = document.querySelectorAll('.timeline-meta span');
    fullTimeTexts.forEach(span => {
        if (span.textContent.includes('Full-time')) {
            const icon = span.querySelector('i');
            span.innerHTML = icon ? `<i class='bx bx-briefcase'></i> ${t.fullTime}` : t.fullTime;
        }
        if (span.textContent.includes('Education')) {
            const icon = span.querySelector('i');
            span.innerHTML = icon ? `<i class='bx bx-briefcase'></i> ${t.education}` : t.education;
        }
    });
    
    // Contact section
    const contactTitle = document.querySelector('#contact .section__title');
    if (contactTitle) contactTitle.textContent = t.getInTouchTitle;
    
    const contactSubtitleDesktop = document.querySelector('#contact .section__subtitle .text-desktop');
    if (contactSubtitleDesktop) contactSubtitleDesktop.innerHTML = t.contactSubtitleDesktop;
    
    const contactSubtitleMobile = document.querySelector('#contact .section__subtitle .text-mobile');
    if (contactSubtitleMobile) contactSubtitleMobile.textContent = t.contactSubtitleMobile;
    
    const contactInfoTitle = document.querySelector('.contact__info-title');
    if (contactInfoTitle && contactInfoTitle.textContent.includes('Contact Information')) {
        contactInfoTitle.textContent = t.contactInformation;
    }
    
    const emailLabel = document.querySelector('.contact__item h4');
    if (emailLabel && emailLabel.textContent === 'Email') {
        emailLabel.textContent = t.email;
        const emailSpan = emailLabel.parentElement.querySelector('span');
        if (emailSpan && emailSpan.textContent.includes('email anytime')) {
            emailSpan.textContent = t.sendEmailAnytime;
        }
    }
    
    const phoneLabel = document.querySelectorAll('.contact__item h4')[1];
    if (phoneLabel && phoneLabel.textContent === 'Phone') {
        phoneLabel.textContent = t.phone;
        const phoneSpan = phoneLabel.parentElement.querySelector('span');
        if (phoneSpan && phoneSpan.textContent.includes('Available for calls')) {
            phoneSpan.textContent = t.availableForCalls;
        }
    }
    
    const locationLabel = document.querySelectorAll('.contact__item h4')[2];
    if (locationLabel && locationLabel.textContent === 'Location') {
        locationLabel.textContent = t.location;
        const locationSpan = locationLabel.parentElement.querySelector('span');
        if (locationSpan && locationSpan.textContent.includes('remote opportunities')) {
            locationSpan.textContent = t.openToRemote;
        }
    }
    
    const followMeTitle = document.querySelectorAll('.contact__info-title')[1];
    if (followMeTitle && followMeTitle.textContent.includes('Follow Me')) {
        followMeTitle.textContent = t.followMe;
    }
    
    const availableForWork = document.querySelector('.contact__availability');
    if (availableForWork) {
        const icon = availableForWork.querySelector('i');
        availableForWork.innerHTML = icon ? `<i class='bx bxs-check-circle'></i> ${t.availableForWork}` : t.availableForWork;
        const p = availableForWork.querySelector('p');
        if (p) {
            const desktop = p.querySelector('.text-desktop');
            const mobile = p.querySelector('.text-mobile');
            if (desktop) desktop.textContent = t.availableTextDesktop;
            if (mobile) mobile.textContent = t.availableTextMobile;
        }
    }
    
    const formTitle = document.querySelector('.contact__form-title');
    if (formTitle) formTitle.textContent = t.sendMessage;
    
    const formLabels = document.querySelectorAll('.form-group label');
    formLabels.forEach(label => {
        const forAttr = label.getAttribute('for');
        if (forAttr === 'name') label.textContent = t.fullName;
        else if (forAttr === 'email') label.textContent = t.emailAddress;
        else if (forAttr === 'subject') label.textContent = t.subject;
        else if (forAttr === 'message') label.textContent = t.message;
    });
    
    const sendButton = document.querySelector('.contact__form .btn--primary');
    if (sendButton) sendButton.textContent = t.sendMessageButton;
    
    const formNote = document.querySelector('.form-response-note');
    if (formNote) {
        const icons = formNote.querySelectorAll('i');
        if (icons.length >= 2) {
            formNote.innerHTML = `<i class='bx bx-time-five'></i> ${t.usuallyResponds}<br><i class='bx bx-coffee'></i> ${t.freeConsultation}`;
        }
    }
    
    // Footer
    const footerTitle = document.querySelector('.footer__title');
    if (footerTitle && footerTitle.textContent.includes('Expertise')) {
        footerTitle.textContent = t.expertise;
    }
    
    const footerLinks = document.querySelectorAll('.footer__link');
    footerLinks.forEach(link => {
        if (link.textContent.includes('Backend Development')) link.textContent = t.backendDevelopment;
        else if (link.textContent.includes('Cloud Migration')) link.textContent = t.cloudMigration;
        else if (link.textContent.includes('AI & Automation')) link.textContent = t.aiAutomation;
        else if (link.textContent.includes('GIS Solutions')) link.textContent = t.gisSolutions;
    });
    
    const footerDescDesktop = document.querySelector('.footer__description .text-desktop');
    if (footerDescDesktop) footerDescDesktop.textContent = t.footerDescriptionDesktop;
    
    const footerDescMobile = document.querySelector('.footer__description .text-mobile');
    if (footerDescMobile) footerDescMobile.textContent = t.footerDescriptionMobile;
};

// Actualizar textos al cargar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        updateHTMLTexts();
        updateChatbotTexts();
    });
} else {
    updateHTMLTexts();
    updateChatbotTexts();
}

async function pedirChatGPT(prompt) {
    try {
        const rawResponseData = localStorage.getItem('chatgptResponseId');
        let storedResponseId = null;

        if (rawResponseData) {
            try {
                const parsed = JSON.parse(rawResponseData);
                const now = Date.now();
                const maxAgeMs = 24 * 60 * 60 * 1000; // 24 horas

                if (parsed?.id && parsed?.storedAt && now - parsed.storedAt < maxAgeMs) {
                    storedResponseId = parsed.id;
                } else {
                    localStorage.removeItem('chatgptResponseId');
                }
            } catch (parseError) {
                localStorage.removeItem('chatgptResponseId');
            }
        }

        const response = await fetch("/.netlify/functions/chatgpt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, previousResponseId: storedResponseId, lang: currentLang }),
        });

        if (!response.ok) {
            if (response.status === 404 || response.status === 400) {
                localStorage.removeItem('chatgptResponseId');
            }
            throw new Error(`Error HTTP ${response.status}`);
        }

        const data = await response.json();
        if (data?.responseId) {
            localStorage.setItem('chatgptResponseId', JSON.stringify({
                id: data.responseId,
                storedAt: Date.now(),
            }));
        }
        return data;
    } catch (error) {
        console.error("No se pudo obtener respuesta de chatgpt:", error);
        return null;
    }
}

/*=============== CHATBOT WIDGET ===============*/
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotPanel = document.getElementById('chatbot-panel');
const chatbotForm = document.getElementById('chatbot-form');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotMic = document.getElementById('chatbot-mic');
const chatbotHint = document.getElementById('chatbot-hint');
const CHATBOT_HINT_STORAGE_KEY = 'chatbotHintDismissed';
const CHATBOT_HINT_TTL_MS = 60 * 60 * 1000; // 1 hora
let chatbotToggleTimer = null;
let chatbotToggleAppearTimer = null;
let chatbotHintTimer = null;

function dismissChatbotHint(permanent = true) {
    if (permanent) {
        try {
            localStorage.setItem(
                CHATBOT_HINT_STORAGE_KEY,
                JSON.stringify({ dismissedAt: Date.now() })
            );
        } catch (error) {
            console.warn('No se pudo guardar el estado del aviso del chatbot:', error);
        }
    }
    if (chatbotHint) {
        chatbotHint.setAttribute('hidden', '');
    }
    if (chatbotHintTimer) {
        clearTimeout(chatbotHintTimer);
        chatbotHintTimer = null;
    }
}

if (chatbotHint) {
    try {
        const rawHintState = localStorage.getItem(CHATBOT_HINT_STORAGE_KEY);
        let hintDismissed = false;

        if (rawHintState) {
            try {
                const parsedState = JSON.parse(rawHintState);
                if (
                    parsedState &&
                    typeof parsedState.dismissedAt === 'number' &&
                    Date.now() - parsedState.dismissedAt < CHATBOT_HINT_TTL_MS
                ) {
                    hintDismissed = true;
                } else {
                    localStorage.removeItem(CHATBOT_HINT_STORAGE_KEY);
                }
            } catch (parseError) {
                console.warn('No se pudo interpretar el estado del aviso del chatbot:', parseError);
                localStorage.removeItem(CHATBOT_HINT_STORAGE_KEY);
            }
        }

        if (hintDismissed) {
            chatbotHint.setAttribute('hidden', '');
        } else {
            chatbotHintTimer = setTimeout(() => dismissChatbotHint(true), 10000);
        }
    } catch (error) {
        console.warn('No se pudo recuperar el estado del aviso del chatbot:', error);
    }
}

function toggleChatbot(forceOpen) {
    const isOpen = chatbotPanel.classList.contains('is-open');
    const shouldOpen = forceOpen !== undefined ? forceOpen : !isOpen;

    if (shouldOpen) {
        if (chatbotToggleTimer) {
            clearTimeout(chatbotToggleTimer);
            chatbotToggleTimer = null;
        }
        if (chatbotToggleAppearTimer) {
            clearTimeout(chatbotToggleAppearTimer);
            chatbotToggleAppearTimer = null;
        }
        chatbotPanel.classList.add('is-open');
        chatbotPanel.setAttribute('aria-hidden', 'false');
        if (chatbotToggle) {
            chatbotToggle.classList.remove('is-appearing');
            chatbotToggle.classList.add('is-hidden');
        }
        dismissChatbotHint(true);
        if (chatbotMessages && chatbotMessages.children.length === 0) {
            appendMessage('assistant', t.initialMessage);
        }
        setTimeout(() => {
            chatbotInput?.focus();
        }, 100);
    } else {
        chatbotPanel.classList.remove('is-open');
        chatbotPanel.setAttribute('aria-hidden', 'true');
        if (chatbotToggleTimer) {
            clearTimeout(chatbotToggleTimer);
        }
        chatbotToggleTimer = setTimeout(() => {
            if (!chatbotToggle) return;
            chatbotToggle.classList.remove('is-hidden');
            chatbotToggle.classList.add('is-appearing');
            if (chatbotToggleAppearTimer) {
                clearTimeout(chatbotToggleAppearTimer);
            }
            chatbotToggleAppearTimer = setTimeout(() => {
                chatbotToggle.classList.remove('is-appearing');
                chatbotToggleAppearTimer = null;
            }, 320);
            chatbotToggleTimer = null;
        }, 320);
    }
}

function appendMessage(role, text) {
    if (!chatbotMessages) return;

    const message = document.createElement('div');
    message.className = `chatbot__message chatbot__message--${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'chatbot__bubble';
    bubble.textContent = text;

    message.appendChild(bubble);
    chatbotMessages.appendChild(message);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function setChatbotBusy(isBusy) {
    if (!chatbotForm || !chatbotInput) return;

    chatbotForm.classList.toggle('is-busy', isBusy);
    chatbotInput.disabled = isBusy;
}

if (chatbotToggle) {
    chatbotToggle.addEventListener('click', () => {
        dismissChatbotHint(true);
        toggleChatbot();
    });
    chatbotToggle.addEventListener('mouseenter', () => {
        if (chatbotHint && !chatbotHint.hasAttribute('hidden')) {
            dismissChatbotHint(false);
        }
    });
}

if (chatbotClose) {
    chatbotClose.addEventListener('click', () => toggleChatbot(false));
}

if (chatbotForm) {
    chatbotForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const message = chatbotInput.value.trim();
        if (!message) return;

        appendMessage('user', message);
        setChatbotBusy(true);
        chatbotInput.value = '';

        appendMessage('assistant', t.thinking);
        const thinkingBubble = chatbotMessages.lastElementChild;

        const response = await pedirChatGPT(message);

        if (thinkingBubble) {
            chatbotMessages.removeChild(thinkingBubble);
        }

        if (response?.reply) {
            appendMessage('assistant', response.reply);
        } else {
            appendMessage('assistant', t.errorMessage);
        }

        setChatbotBusy(false);
    });
}

/*=============== VOICE INPUT (SPEECH RECOGNITION) ===============*/
if (chatbotMic) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        chatbotMic.disabled = true;
        chatbotMic.title = t.voiceNotSupported;
    } else {
        const recognition = new SpeechRecognition();
        recognition.lang = currentLang === 'es' ? 'es-ES' : 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        let isRecording = false;

        const toggleRecording = () => {
            if (isRecording) {
                recognition.stop();
                return;
            }
            try {
                recognition.start();
            } catch (err) {
                console.warn('Could not start recognition:', err);
            }
        };

        recognition.addEventListener('start', () => {
            isRecording = true;
            chatbotMic.classList.add('is-recording');
        });

        recognition.addEventListener('end', () => {
            isRecording = false;
            chatbotMic.classList.remove('is-recording');
        });

        recognition.addEventListener('result', (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join(' ')
                .trim();

            if (!transcript) return;

            if (!chatbotPanel.classList.contains('is-open')) {
                toggleChatbot(true);
            }

            if (chatbotInput.value) {
                chatbotInput.value = `${chatbotInput.value} ${transcript}`.trim();
            } else {
                chatbotInput.value = transcript;
            }

            chatbotInput.focus();
        });

        recognition.addEventListener('error', (event) => {
            console.error('Voice recognition error:', event.error);
        });

        chatbotMic.addEventListener('click', toggleRecording);
    }
}
  