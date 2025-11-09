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

async function pedirChatGPT(prompt) {
    try {
        const rawThreadData = localStorage.getItem('chatgptThreadId');
        let storedThreadId = null;

        if (rawThreadData) {
            try {
                const parsed = JSON.parse(rawThreadData);
                const now = Date.now();
                const maxAgeMs = 24 * 60 * 60 * 1000; // 24 horas

                if (parsed?.id && parsed?.storedAt && now - parsed.storedAt < maxAgeMs) {
                    storedThreadId = parsed.id;
                } else {
                    localStorage.removeItem('chatgptThreadId');
                }
            } catch (parseError) {
                localStorage.removeItem('chatgptThreadId');
            }
        }

        const response = await fetch("/.netlify/functions/chatgpt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, threadId: storedThreadId }),
        });

        if (!response.ok) {
            if (response.status === 404 || response.status === 400) {
                localStorage.removeItem('chatgptThreadId');
            }
            throw new Error(`Error HTTP ${response.status}`);
        }

        const data = await response.json();
        if (data?.threadId) {
            localStorage.setItem('chatgptThreadId', JSON.stringify({
                id: data.threadId,
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
            appendMessage('assistant', '¡Hello! I am your virtual assistant. Ask me about my experience, projects or any detail you want to know about me.');
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

        appendMessage('assistant', 'Let me think...');
        const thinkingBubble = chatbotMessages.lastElementChild;

        const response = await pedirChatGPT(message);

        if (thinkingBubble) {
            chatbotMessages.removeChild(thinkingBubble);
        }

        if (response?.reply) {
            appendMessage('assistant', response.reply);
        } else {
            appendMessage('assistant', 'Sorry, I couldn\'t get a response. Try again later.');
        }

        setChatbotBusy(false);
    });
}

/*=============== VOICE INPUT (SPEECH RECOGNITION) ===============*/
if (chatbotMic) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        chatbotMic.disabled = true;
        chatbotMic.title = "Voice input is not supported by this browser";
    } else {
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
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
  