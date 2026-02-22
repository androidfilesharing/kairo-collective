document.addEventListener('DOMContentLoaded', () => {
    // --- Scroll Effect ---
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        observer.observe(section);
    });

    // --- Glitch Effect for Title ---
    const tagline = document.querySelector('.tagline');
    if (tagline) {
        const originalText = tagline.innerText;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%^&*()';
        
        let iterations = 0;
        const interval = setInterval(() => {
            tagline.innerText = originalText.split('')
                .map((char, index) => {
                    if(index < iterations) return originalText[index];
                    return chars[Math.floor(Math.random() * chars.length)]
                })
                .join('');
            
            if(iterations >= originalText.length) clearInterval(interval);
            iterations += 1/3;
        }, 30);
    }
});
