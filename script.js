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
        skillsTechnologies: 'Habilidades y Tecnologías',
        pythonMastery: '<strong>Python</strong> Dominio y Automatización',
        cloudMigration: 'Migración a la Nube y Servicios (AWS)',
        aiIntegration: 'Integración de APIs de IA (Chatbots, Predicción)',
        geoAnalysis: 'Análisis de Datos Geoespaciales (GIS, QGIS, ArcGIS)',
        backendDev: 'Desarrollo Backend (Java, Spring Boot, Python)',
        bigDataTech: 'Tecnologías Big Data (Spark, Kafka, ElasticSearch)',
        // Projects section
        featuredWork: 'Trabajos destacados',
        projectsSubtitleDesktop: 'Proyectos y casos de estudio<br>Una muestra de mi trabajo reciente, desde el concepto hasta el despliegue',
        projectsSubtitleMobile: 'Proyectos seleccionados destacando estrategia hasta despliegue.',
        // Project descriptions
        project1Title: 'Predicción de Cosechas con GIS',
        project1DescDesktop: 'Implementé una solución geoespacial para <strong>Congelados de Navarra</strong> que involucra detección de caída de vegetación y predicción de cosechas (estimación de kilos). Esto requirió habilidades avanzadas en <strong>QGIS y ArcGIS Online</strong> para análisis preciso de datos espaciales.',
        project1DescMobile: 'Congelados de Navarra: análisis GIS prediciendo rendimientos de cosecha con QGIS/ArcGIS.',
        project2Title: 'Desarrollo de Chatbots IA y Automatización Interna',
        project2DescDesktop: 'Diseñé y desplegué numerosos <strong>chatbots con IA</strong> internos usando varias APIs de IA. Esto se combinó con automatización extensa de procesos en los flujos de trabajo de la empresa, demostrando dominio en <strong>Python</strong> para scripting complejo e integración.',
        project2DescMobile: 'Chatbots IA + automatización Python optimizando operaciones internas.',
        project3Title: 'Teledetección y Automatización GIS (Congelados de Navarra)',
        project3DescDesktop: 'Entregué un flujo de trabajo de teledetección de extremo a extremo para <strong>Congelados de Navarra</strong>, combinando detección de caída de vegetación, pronóstico de cosechas e informes automatizados. El pipeline ingiere escenas satelitales, construye índices espectrales y envía alertas usando <strong>QGIS, ArcGIS Online</strong> y orquestación Python.',
        project3DescMobile: 'Teledetección + automatización GIS pronosticando pérdida de vegetación y rendimientos.',
        project4Title: 'Reingeniería Backend Nematool y Migración AWS',
        project4DescDesktop: 'Lideré la reingeniería completa del backend de la plataforma Nematool usando técnicas de <strong>ingeniería inversa</strong>. Desarrollé una nueva aplicación web y gestioné la migración completa del sistema a <strong>Amazon Web Services (AWS)</strong> para escalabilidad y rendimiento.',
        project4DescMobile: 'Nematool reconstruido de extremo a extremo: backend de ingeniería inversa, nueva app web y migración AWS.',
        project5Title: 'Planificador Keylines para Viñedos (Bayer)',
        project5DescDesktop: 'Construí una aplicación web para diseñar <strong>keylines</strong> de viñedos sobre topografía de alta resolución. Una interfaz <strong>PHP</strong> se conecta a un backend <strong>Python</strong> que calcula líneas de contorno, optimiza patrones de drenaje y exporta planes de plantación listos para campo.',
        project5DescMobile: 'Planificador Keylines con frontend PHP y cálculos geoespaciales Python.',
        project6Title: 'Monitoreo y Reportes de Datos SCADA',
        project6DescDesktop: 'Desarrollé funciones de monitoreo y reportes para sistemas SCADA en la plataforma Ignition, utilizando <strong>Python, SQL Server y JavaScript</strong> para asegurar adquisición precisa de datos industriales y generación de informes.',
        project6DescMobile: 'Monitoreo y reportes SCADA en Ignition usando Python + SQL Server.',
        // Experience section
        careerJourney: 'Trayectoria profesional',
        experienceSubtitleDesktop: 'Experiencia profesional<br>Una línea de tiempo de mi crecimiento y contribuciones en la industria tecnológica',
        experienceSubtitleMobile: 'Hitos clave que dan forma a mi trayectoria tecnológica.',
        fullTime: 'Tiempo completo',
        education: 'Educación',
        spain: 'España',
        present: 'Presente',
        // Experience descriptions
        exp1Title: 'Ingeniero de Software y Datos',
        exp1Company: 'Ager Technology',
        exp1Location: 'Logroño, La Rioja (España)',
        exp1DescDesktop: 'Impulso automatización inteligente combinando backends Python, datos geoespaciales e IA para transformar operaciones agrícolas y agroalimentarias.',
        exp1DescMobile: 'Python, GIS e IA entregando automatización inteligente para negocios agrícolas.',
        exp1Achievement1: '<strong>Backend Python:</strong> <span class="text-desktop">Arquitecto sistemas robustos con bases de datos relacionales (PostgreSQL, MySQL) y no relacionales (MongoDB) que impulsan productos basados en datos.</span><span class="text-mobile">Backends Python con SQL y NoSQL.</span>',
        exp1Achievement2: '<strong>Nematool:</strong> <span class="text-desktop">Reconstruí todo el backend, entregué un nuevo frontend y habilité integraciones MQTT para telemetría y automatización avanzada.</span><span class="text-mobile">Nuevo backend + MQTT para Nematool.</span>',
        exp1Achievement3: '<strong>PWAs y Chatbots:</strong> <span class="text-desktop">Construyo múltiples PWAs con React y chatbots conectados a APIs externas (ChatGPT, Gemini) que refuerzan soporte y toma de decisiones.</span><span class="text-mobile">PWAs React y chatbots IA.</span>',
        exp1Achievement4: '<strong>Automatización:</strong> <span class="text-desktop">Orquesto pipelines de automatización a gran escala aprovechando Python, colas de eventos y flujos de trabajo serverless.</span><span class="text-mobile">Pipelines de automatización complejos.</span>',
        exp1Achievement5: '<strong>Teledetección:</strong> <span class="text-desktop">Entregó modelos de teledetección y predicción para Congelados de Navarra usando Sentinel, PlanetScope y APIs AgroMonitoring.</span><span class="text-mobile">Pronóstico de cultivos Sentinel/Planet.</span>',
        exp1Achievement6: '<strong>QGIS e IA:</strong> <span class="text-desktop">Desarrollo plugins QGIS y cuadernos de campo digitales con IA que agilizan el registro agrícola.</span><span class="text-mobile">Plugins QGIS + cuaderno de campo inteligente.</span>',
        exp1Achievement7: '<strong>Calidad Viñedos:</strong> <span class="text-desktop">Creo una app que estima la calidad de viñedos fusionando índices espectrales con observaciones de campo.</span><span class="text-mobile">App de estimación de calidad de viñedos.</span>',
        exp1Achievement8: '<strong>Keylines Bayer:</strong> <span class="text-desktop">Produzco planificación automatizada de Keylines para Bayer mediante análisis topográfico y visualización web.</span><span class="text-mobile">Keylines automatizados para Bayer.</span>',
        exp2Title: 'Desarrollador Full-Stack',
        exp2Company: 'Bosonit - Tech & Data',
        exp2DescDesktop: 'Desarrollo colaborativo de aplicaciones full-stack con formación en tecnologías empresariales modernas.',
        exp2DescMobile: 'Ingeniería full-stack práctica con stacks empresariales.',
        exp2Achievement1: '<span class="text-desktop">Recibí formación intensiva en desarrollo <strong>Spring Boot</strong>.</span><span class="text-mobile">Bootcamp intensivo Spring Boot.</span>',
        exp2Achievement2: '<span class="text-desktop">Desarrollé aplicaciones usando una amplia gama de tecnologías: <strong>Java, Angular, Python, Spark, Docker, Kafka, ElasticSearch</strong> y Web Semantics.</span><span class="text-mobile">Construí productos con Java, Angular, Python, Spark, Docker, Kafka y Elastic.</span>',
        exp2Achievement3: '<span class="text-desktop">Apliqué conceptos de Machine Learning a sistemas Big Data.</span><span class="text-mobile">Apliqué ML a cargas de trabajo big data.</span>',
        exp3Title: 'Desarrollador de Sistemas SCADA',
        exp3Company: 'Standard Profil',
        exp3DescDesktop: 'Enfocado en sistemas de monitoreo y reportes de datos en un entorno industrial.',
        exp3DescMobile: 'Iniciativas de monitoreo y reportes de datos industriales.',
        exp3Achievement1: '<span class="text-desktop">Recibí formación formal en la plataforma SCADA <strong>Ignition</strong>.</span><span class="text-mobile">Certificado en Ignition SCADA.</span>',
        exp3Achievement2: '<span class="text-desktop">Responsable de monitoreo de datos y escritura de informes técnicos.</span><span class="text-mobile">Responsable de monitoreo y reportes de datos industriales.</span>',
        exp3Achievement3: '<span class="text-desktop">Gané experiencia práctica usando <strong>Python, SQL Server y JavaScript</strong> en un entorno industrial.</span><span class="text-mobile">Práctica con Python, SQL Server y JS en planta.</span>',
        exp4Title: 'Desarrollador Front-End',
        exp4Company: 'SDi Digital Group',
        exp4DescDesktop: 'Enfocado en diseño web, mantenimiento y sistemas de generación de leads.',
        exp4DescMobile: 'Diseño de experiencia web y soluciones de automatización de leads.',
        exp4Achievement1: '<span class="text-desktop">Realicé diseño web y mantenimiento para páginas de clientes.</span><span class="text-mobile">Entregué diseño web y mantenimiento para clientes.</span>',
        exp4Achievement2: '<span class="text-desktop">Implementé un sistema para crear leads de <strong>Wordpress a Odoo</strong>.</span><span class="text-mobile">Automaticé flujo de leads Wordpress → Odoo.</span>',
        exp4Achievement3: '<span class="text-desktop">Recibí formación básica en <strong>PHP</strong>.</span><span class="text-mobile">Introducido a fundamentos PHP.</span>',
        exp5Title: 'Grado en Ingeniería Informática',
        exp5Company: 'Universidad de La Rioja',
        exp5DescDesktop: 'Completé el grado en Ingeniería Informática, construyendo una base sólida en sistemas de software, programación y gestión de datos.',
        exp5DescMobile: 'Grado en Ingeniería Informática: base sólida en software, programación y datos.',
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
        skillsTechnologies: 'Skills & Technologies',
        pythonMastery: '<strong>Python</strong> Mastery & Automation',
        cloudMigration: 'Cloud Migration & Services (AWS)',
        aiIntegration: 'AI API Integration (Chatbots, Prediction)',
        geoAnalysis: 'Geo-Spatial Data Analysis (GIS, QGIS, ArcGIS)',
        backendDev: 'Backend Development (Java, Spring Boot, Python)',
        bigDataTech: 'Big Data Technologies (Spark, Kafka, ElasticSearch)',
        // Projects section
        featuredWork: 'Featured Work',
        projectsSubtitleDesktop: 'Projects & Case Studies<br>A showcase of my recent work, from concept to deployment',
        projectsSubtitleMobile: 'Selected projects highlighting strategy to deployment.',
        // Project descriptions
        project1Title: 'GIS-Powered Harvest Prediction',
        project1DescDesktop: 'Implemented a geospatial solution for <strong>Congelados de Navarra</strong> involving vegetation fall detection and harvest prediction (kilo estimation). This relied on advanced skills in <strong>QGIS and ArcGIS Online</strong> for accurate spatial data analysis.',
        project1DescMobile: 'Congelados de Navarra: GIS analytics predicting harvest yields with QGIS/ArcGIS.',
        project2Title: 'AI Chatbot Development & Internal Automation',
        project2DescDesktop: 'Designed and deployed numerous internal <strong>AI-powered chatbots</strong> using various AI APIs. This was coupled with extensive process automation across the company\'s workflows, demonstrating mastery in <strong>Python</strong> for complex scripting and integration.',
        project2DescMobile: 'AI chatbots + Python automation streamlining internal operations.',
        project3Title: 'Remote Sensing & GIS Automation (Congelados de Navarra)',
        project3DescDesktop: 'Delivered an end-to-end remote sensing workflow for <strong>Congelados de Navarra</strong>, combining vegetation fall detection, harvest forecasting, and automated reporting. The pipeline ingests satellite scenes, builds spectral indices, and dispatches alerts using <strong>QGIS, ArcGIS Online</strong>, and Python orchestration.',
        project3DescMobile: 'Remote sensing + GIS automation forecasting vegetation loss and yields.',
        project4Title: 'Nematool Backend Re-engineering & AWS Migration',
        project4DescDesktop: 'Led the full re-engineering of the Nematool platform\'s backend using <strong>reverse engineering</strong> techniques. Developed a new web application and managed the complete system migration to <strong>Amazon Web Services (AWS)</strong> for scalability and performance.',
        project4DescMobile: 'Nematool rebuilt end-to-end: reverse engineered backend, new web app and AWS migration.',
        project5Title: 'Keylines Planner for Vineyards (Bayer)',
        project5DescDesktop: 'Built a web application to design vineyard <strong>keylines</strong> over high-resolution topography. A <strong>PHP</strong> interface connects to a <strong>Python</strong> backend that computes contour lines, optimizes drainage patterns, and exports field-ready planting plans.',
        project5DescMobile: 'Keylines planner with PHP frontend and Python geospatial calculations.',
        project6Title: 'SCADA System Data Monitoring & Reporting',
        project6DescDesktop: 'Developed monitoring and reporting features for SCADA systems on the Ignition platform, utilizing <strong>Python, SQL Server, and JavaScript</strong> to ensure accurate industrial data acquisition and report generation.',
        project6DescMobile: 'SCADA monitoring & reporting on Ignition using Python + SQL Server.',
        // Experience section
        careerJourney: 'Career Journey',
        experienceSubtitleDesktop: 'Professional Experience<br>A timeline of my growth and contributions in the tech industry',
        experienceSubtitleMobile: 'Key milestones shaping my tech journey.',
        fullTime: 'Full-time',
        education: 'Education',
        spain: 'Spain',
        present: 'Present',
        // Experience descriptions
        exp1Title: 'Software & Data Engineer',
        exp1Company: 'Ager Technology',
        exp1Location: 'Logroño, La Rioja (Spain)',
        exp1DescDesktop: 'I drive intelligent automation by combining Python backends, geospatial data, and AI to transform agricultural and agri-food operations.',
        exp1DescMobile: 'Python, GIS, and AI delivering smart automation for agri businesses.',
        exp1Achievement1: '<strong>Python Back-end:</strong> <span class="text-desktop">Architect robust systems with relational databases (PostgreSQL, MySQL) and non-relational databases (MongoDB) that power data-driven products.</span><span class="text-mobile">Python backends with SQL & NoSQL.</span>',
        exp1Achievement2: '<strong>Nematool:</strong> <span class="text-desktop">Rebuilt the entire backend, delivered a new front-end, and enabled MQTT integrations for telemetry and advanced automation.</span><span class="text-mobile">New backend + MQTT for Nematool.</span>',
        exp1Achievement3: '<strong>PWAs & Chatbots:</strong> <span class="text-desktop">Build multiple PWAs with React and chatbots connected to external APIs (ChatGPT, Gemini) that reinforce support and decision-making.</span><span class="text-mobile">React PWAs and AI chatbots.</span>',
        exp1Achievement4: '<strong>Automation:</strong> <span class="text-desktop">Orchestrate large-scale automation pipelines leveraging Python, event queues, and serverless workflows.</span><span class="text-mobile">Complex automation pipelines.</span>',
        exp1Achievement5: '<strong>Remote Sensing:</strong> <span class="text-desktop">Deliver remote sensing and prediction models for Congelados de Navarra using Sentinel, PlanetScope, and AgroMonitoring APIs.</span><span class="text-mobile">Sentinel/Planet crop forecasting.</span>',
        exp1Achievement6: '<strong>QGIS & AI:</strong> <span class="text-desktop">Develop QGIS plugins and AI-powered digital field notebooks that streamline agricultural record keeping.</span><span class="text-mobile">QGIS plugins + smart field logbook.</span>',
        exp1Achievement7: '<strong>Vineyard Quality:</strong> <span class="text-desktop">Create an app that estimates vineyard quality by fusing spectral indices with field observations.</span><span class="text-mobile">Vineyard quality estimation app.</span>',
        exp1Achievement8: '<strong>Keylines Bayer:</strong> <span class="text-desktop">Produce automated Keyline planning for Bayer through topographic analysis and web visualization.</span><span class="text-mobile">Automated Keylines for Bayer.</span>',
        exp2Title: 'Full-Stack Developer',
        exp2Company: 'Bosonit - Tech & Data',
        exp2DescDesktop: 'Collaborative development of full-stack applications with training in modern enterprise technologies.',
        exp2DescMobile: 'Hands-on full-stack engineering with enterprise stacks.',
        exp2Achievement1: '<span class="text-desktop">Received intensive training in <strong>Spring Boot</strong> development.</span><span class="text-mobile">Intensive Spring Boot bootcamp.</span>',
        exp2Achievement2: '<span class="text-desktop">Developed applications using a wide range of technologies: <strong>Java, Angular, Python, Spark, Docker, Kafka, ElasticSearch</strong>, and Web Semantics.</span><span class="text-mobile">Built products across Java, Angular, Python, Spark, Docker, Kafka and Elastic.</span>',
        exp2Achievement3: '<span class="text-desktop">Applied Machine Learning concepts to Big Data systems.</span><span class="text-mobile">Applied ML to big data workloads.</span>',
        exp3Title: 'SCADA Systems Developer',
        exp3Company: 'Standard Profil',
        exp3DescDesktop: 'Focused on data monitoring and reporting systems within an industrial setting.',
        exp3DescMobile: 'Industrial data monitoring and reporting initiatives.',
        exp3Achievement1: '<span class="text-desktop">Received formal training in the <strong>Ignition</strong> SCADA platform.</span><span class="text-mobile">Certified on Ignition SCADA.</span>',
        exp3Achievement2: '<span class="text-desktop">Responsible for data monitoring and writing technical reports.</span><span class="text-mobile">Owned industrial data monitoring and reporting.</span>',
        exp3Achievement3: '<span class="text-desktop">Gained practical experience using <strong>Python, SQL Server, and JavaScript</strong> in an industrial environment.</span><span class="text-mobile">Hands-on with Python, SQL Server & JS on shop floor.</span>',
        exp4Title: 'Front-End Developer',
        exp4Company: 'SDi Digital Group',
        exp4DescDesktop: 'Focused on web design, maintenance, and lead generation systems.',
        exp4DescMobile: 'Web experience design and lead automation solutions.',
        exp4Achievement1: '<span class="text-desktop">Performed web design and maintenance for client pages.</span><span class="text-mobile">Delivered client web design & upkeep.</span>',
        exp4Achievement2: '<span class="text-desktop">Implemented a system for creating leads from <strong>Wordpress to Odoo</strong>.</span><span class="text-mobile">Automated Wordpress → Odoo lead flow.</span>',
        exp4Achievement3: '<span class="text-desktop">Received basic training in <strong>PHP</strong>.</span><span class="text-mobile">Introduced to PHP foundations.</span>',
        exp5Title: 'B.S. in Computer Engineering',
        exp5Company: 'University of La Rioja',
        exp5DescDesktop: 'Completed the degree in Computer Engineering, building a strong foundation in software systems, programming, and data management.',
        exp5DescMobile: 'B.S. Computer Engineering: solid base in software, programming and data.',
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
    
    // Traducir lista "What I Bring"
    const aboutListItems = document.querySelectorAll('.about__list li');
    if (aboutListItems.length >= 6) {
        aboutListItems.forEach((li, index) => {
            const icon = li.querySelector('i');
            let newText = '';
            if (index === 0) newText = t.pythonMastery;
            else if (index === 1) newText = t.cloudMigration;
            else if (index === 2) newText = t.aiIntegration;
            else if (index === 3) newText = t.geoAnalysis;
            else if (index === 4) newText = t.backendDev;
            else if (index === 5) newText = t.bigDataTech;
            if (newText && icon) {
                li.innerHTML = `<i class='bx bx-check'></i> ${newText}`;
            }
        });
    }
    
    // Traducir "Skills & Technologies"
    const skillsTitle = document.querySelector('.about__skills .about__section-title');
    if (skillsTitle && skillsTitle.textContent.includes('Skills')) {
        skillsTitle.textContent = t.skillsTechnologies;
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
    
    // Traducir proyectos
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        const title = card.querySelector('.project-title');
        const descDesktop = card.querySelector('.project-description .text-desktop');
        const descMobile = card.querySelector('.project-description .text-mobile');
        
        if (index === 0 && title && title.textContent.includes('GIS-Powered')) {
            if (title) title.textContent = t.project1Title;
            if (descDesktop) descDesktop.innerHTML = t.project1DescDesktop;
            if (descMobile) descMobile.textContent = t.project1DescMobile;
        } else if (index === 1 && title && title.textContent.includes('AI Chatbot')) {
            if (title) title.textContent = t.project2Title;
            if (descDesktop) descDesktop.innerHTML = t.project2DescDesktop;
            if (descMobile) descMobile.textContent = t.project2DescMobile;
        } else if (index === 2 && title && title.textContent.includes('Remote Sensing')) {
            if (title) title.textContent = t.project3Title;
            if (descDesktop) descDesktop.innerHTML = t.project3DescDesktop;
            if (descMobile) descMobile.textContent = t.project3DescMobile;
        } else if (index === 3 && title && title.textContent.includes('Nematool')) {
            if (title) title.textContent = t.project4Title;
            if (descDesktop) descDesktop.innerHTML = t.project4DescDesktop;
            if (descMobile) descMobile.textContent = t.project4DescMobile;
        } else if (index === 4 && title && title.textContent.includes('Keylines')) {
            if (title) title.textContent = t.project5Title;
            if (descDesktop) descDesktop.innerHTML = t.project5DescDesktop;
            if (descMobile) descMobile.textContent = t.project5DescMobile;
        } else if (index === 5 && title && title.textContent.includes('SCADA')) {
            if (title) title.textContent = t.project6Title;
            if (descDesktop) descDesktop.innerHTML = t.project6DescDesktop;
            if (descMobile) descMobile.textContent = t.project6DescMobile;
        }
    });
    
    // Experience section
    const experienceTitle = document.querySelector('#experience .section__title');
    if (experienceTitle) experienceTitle.textContent = t.careerJourney;
    
    const experienceSubtitleDesktop = document.querySelector('#experience .section__subtitle .text-desktop');
    if (experienceSubtitleDesktop) experienceSubtitleDesktop.innerHTML = t.experienceSubtitleDesktop;
    
    const experienceSubtitleMobile = document.querySelector('#experience .section__subtitle .text-mobile');
    if (experienceSubtitleMobile) experienceSubtitleMobile.textContent = t.experienceSubtitleMobile;
    
    // Traducir experiencia profesional
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        const title = item.querySelector('.timeline-title');
        const descDesktop = item.querySelector('.timeline-description .text-desktop');
        const descMobile = item.querySelector('.timeline-description .text-mobile');
        const achievements = item.querySelectorAll('.timeline-achievements li');
        const locationSpans = item.querySelectorAll('.timeline-meta span');
        
        // Actualizar "Spain" y "Full-time"/"Education"
        locationSpans.forEach(span => {
            if (span.textContent.includes('Spain') && !span.textContent.includes('Logroño')) {
                const icon = span.querySelector('i');
                span.innerHTML = icon ? `<i class='bx bx-map'></i> ${t.spain}` : t.spain;
            }
            if (span.textContent.includes('Full-time')) {
                const icon = span.querySelector('i');
                span.innerHTML = icon ? `<i class='bx bx-briefcase'></i> ${t.fullTime}` : t.fullTime;
            }
            if (span.textContent.includes('Education')) {
                const icon = span.querySelector('i');
                span.innerHTML = icon ? `<i class='bx bx-briefcase'></i> ${t.education}` : t.education;
            }
            if (span.textContent.includes('Present')) {
                span.innerHTML = span.innerHTML.replace('Present', t.present);
            }
        });
        
        // Experiencia 1: Ager Technology
        if (index === 0) {
            if (title && title.textContent.includes('Software & Data')) {
                title.textContent = t.exp1Title;
            }
            if (descDesktop) descDesktop.textContent = t.exp1DescDesktop;
            if (descMobile) descMobile.textContent = t.exp1DescMobile;
            achievements.forEach((achievement, achIndex) => {
                if (achIndex < 8) {
                    const key = `exp1Achievement${achIndex + 1}`;
                    if (t[key]) achievement.innerHTML = t[key];
                }
            });
        }
        // Experiencia 2: Bosonit
        else if (index === 1) {
            if (title && title.textContent.includes('Full-Stack')) {
                title.textContent = t.exp2Title;
            }
            if (descDesktop) descDesktop.textContent = t.exp2DescDesktop;
            if (descMobile) descMobile.textContent = t.exp2DescMobile;
            achievements.forEach((achievement, achIndex) => {
                if (achIndex < 3) {
                    const key = `exp2Achievement${achIndex + 1}`;
                    if (t[key]) achievement.innerHTML = t[key];
                }
            });
        }
        // Experiencia 3: Standard Profil
        else if (index === 2) {
            if (title && title.textContent.includes('SCADA')) {
                title.textContent = t.exp3Title;
            }
            if (descDesktop) descDesktop.textContent = t.exp3DescDesktop;
            if (descMobile) descMobile.textContent = t.exp3DescMobile;
            achievements.forEach((achievement, achIndex) => {
                if (achIndex < 3) {
                    const key = `exp3Achievement${achIndex + 1}`;
                    if (t[key]) achievement.innerHTML = t[key];
                }
            });
        }
        // Experiencia 4: SDi Digital Group
        else if (index === 3) {
            if (title && title.textContent.includes('Front-End')) {
                title.textContent = t.exp4Title;
            }
            if (descDesktop) descDesktop.textContent = t.exp4DescDesktop;
            if (descMobile) descMobile.textContent = t.exp4DescMobile;
            achievements.forEach((achievement, achIndex) => {
                if (achIndex < 3) {
                    const key = `exp4Achievement${achIndex + 1}`;
                    if (t[key]) achievement.innerHTML = t[key];
                }
            });
        }
        // Experiencia 5: Universidad
        else if (index === 4) {
            if (title && title.textContent.includes('B.S.')) {
                title.textContent = t.exp5Title;
            }
            if (descDesktop) descDesktop.textContent = t.exp5DescDesktop;
            if (descMobile) descMobile.textContent = t.exp5DescMobile;
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
  