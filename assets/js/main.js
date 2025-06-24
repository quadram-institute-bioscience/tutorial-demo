document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle functionality
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!sidebar.contains(event.target) && !mobileToggle.contains(event.target)) {
                sidebar.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        });
        
        // Close mobile menu when clicking on a nav link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                sidebar.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }
    
    // Add copy button to code blocks
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(function(codeBlock) {
        const pre = codeBlock.parentElement;
        const button = document.createElement('button');
        button.className = 'copy-btn';
        button.textContent = 'Copy';
        button.setAttribute('aria-label', 'Copy code to clipboard');
        
        button.addEventListener('click', function() {
            navigator.clipboard.writeText(codeBlock.textContent).then(function() {
                button.textContent = 'Copied!';
                setTimeout(function() {
                    button.textContent = 'Copy';
                }, 2000);
            }).catch(function() {
                button.textContent = 'Failed';
                setTimeout(function() {
                    button.textContent = 'Copy';
                }, 2000);
            });
        });
        
        pre.style.position = 'relative';
        pre.appendChild(button);
    });
    
    // Add styles for copy button
    const style = document.createElement('style');
    style.textContent = `
        .copy-btn {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0.25rem 0.5rem;
            border-radius: 3px;
            font-size: 0.75rem;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        
        pre:hover .copy-btn {
            opacity: 1;
        }
        
        .copy-btn:hover {
            background: #086b61;
        }
    `;
    document.head.appendChild(style);
    
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
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
});