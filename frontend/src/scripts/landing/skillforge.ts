/**
 * SkillForge specific interactvity
 */

document.addEventListener('DOMContentLoaded', () => {
    // Spotlight Effect
    const spotlight = document.querySelector('.spotlight-cone') as HTMLElement;
    if (spotlight) {
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            // Limit movement to avoid looking unnatural
            const moveX = (x - 0.5) * 30; // max 15deg rotation
            const moveY = (y - 0.5) * 10;
            
            spotlight.style.transform = `translateX(-50%) perspective(1000px) rotateX(${45 + moveY}deg) rotateY(${moveX}deg)`;
        });
    }

    // Initialize specific forms / validation if any exist in the fragment
    // const leadForm = document.getElementById('skillforge-lead-form');
    // ... we will attach validators once the HTML structure is finalized
});
