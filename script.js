/*=============== SHOW MENU (Mobile Menu) ===============*/
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navLinks = document.querySelectorAll('.nav__link');

/* Show and hide menu */
if(navToggle){
    navToggle.addEventListener('click', () =>{
        const nav = document.querySelector('.nav');
        nav.classList.toggle('show-menu');
        // Actualizar la sección activa cuando se abre el menú
        if (nav.classList.contains('show-menu')) {
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


/*=============== BACK TO TOP BUTTON ===============*/
function scrollUp(){
    const scrollUp = document.getElementById('back-to-top');
    // Add 'show-scroll' class when scroll is greater than 400px
    if(this.scrollY >= 400) {
        scrollUp.classList.add('show-scroll');
    } else {
        scrollUp.classList.remove('show-scroll');
    }
}
window.addEventListener('scroll', scrollUp);

// Función para hacer scroll suave al hacer clic
const backToTopBtn = document.getElementById('back-to-top');
if(backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}


/*=============== INITIALIZE AOS ANIMATIONS ===============*/
AOS.init({
    duration: 1000,
    easing: 'ease-in-out',
    once: true,
    mirror: false
});

async function pedirChatGPT(prompt) {
    try {
        const response = await fetch("/.netlify/functions/chatgpt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error("No se pudo obtener respuesta de chatgpt:", error);
        return null;
    }
}

pedirChatGPT("Hola, ¿qué tal estás?");

  