// Hash Router with Dynamic Base Path Detection
class HashRouter {
    constructor() {
        this.routes = {};
        this.currentUrl = '';
        this.rootElement = document.getElementById('app');
        this.loadingElement = document.getElementById('loading');
        this.basePath = this.detectBasePath();
        console.log('Base path detected:', this.basePath);
        this.init();
    }

    detectBasePath() {
        // Get current page URL
        const currentPath = window.location.pathname;
        
        // Remove index.html from path
        const pathParts = currentPath.split('/');
        pathParts.pop(); // Remove index.html
        
        // Reconstruct base path
        const base = pathParts.join('/') + '/pages/';
        return base || 'pages/';
    }

    init() {
        // Handle initial load
        window.addEventListener('DOMContentLoaded', () => {
            this.loadPage();
        });

        // Handle hash changes
        window.addEventListener('hashchange', () => {
            this.loadPage();
        });

        // Handle mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.querySelector('.nav-menu').classList.toggle('active');
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-container')) {
                document.querySelector('.nav-menu').classList.remove('active');
            }
        });

        // Setup routes configuration
        this.setupRoutes();
    }

    setupRoutes() {
        // Define routes with their file paths and titles
        this.routes = {
            '/': {
                title: 'Shoes | CanCode Store',
                file: 'landing_page/shoes.html',
                bgcolor: 'FF4725'
            },
            '/t_shirt': {
                title: 'T-Shirts | CanCode Store',
                file: 'landing_page/t_shirt.html',
                bgcolor: '9D32FF'
            },
            '/hats_headwear': {
                title: 'Hats & Headwear | CanCode Store',
                file: 'landing_page/hats_headwear.html',
                bgcolor: 'BC0018'
            },
            // Add more routes as needed
            '404': {
                title: 'Page Not Found | CanCode Store',
                content: `
                    <div class="not-found">
                        <div style="font-size: 8rem; margin-bottom: 1rem;">😕</div>
                        <h2>404 - Page Not Found</h2>
                        <p>The page you're looking for doesn't exist or has been moved.</p>
                        <div style="margin-top: 2rem;">
                            <a href="#/" class="submit-btn" data-link style="text-decoration: none;">Go Back Home</a>
                        </div>
                    </div>
                `
            }
        };
    }

    async loadPage() {
        // Show loading
        this.loadingElement.style.display = 'block';
        this.rootElement.innerHTML = '';
        
        // Get current hash (remove #)
        let hash = window.location.hash.substring(1);
        
        // Default to home if no hash
        if (!hash || hash === '') {
            hash = '/';
        }
        
        // Update current URL
        this.currentUrl = hash;
        
        // Find the route
        const route = this.routes[hash];
        
        try {
            if (route) {
                // Update page title
                document.title = route.title;
                
                // Load content from file if file path exists
                if (route.file) {
                    const filePath = this.basePath + route.file;
                    console.log('Loading file:', filePath);
                    const content = await this.loadContentFromFile(filePath);
                    this.rootElement.innerHTML = content;
                } 
                // Or use embedded content
                else if (route.content) {
                    this.rootElement.innerHTML = route.content;
                } else {
                    throw new Error('No content available for this route');
                }

                this.rootElement.style.backgroundColor = route.bgcolor ? `#${route.bgcolor + "80"}` : 'white';
                
                // Update active link
                this.updateActiveLink();
                
                // Initialize interactive elements
                this.initPageScripts();
                
            } else {
                // Show 404 page
                this.show404();
            }
            
        } catch (error) {
            console.error('Error loading page:', error);
            this.showError();
            
        } finally {
            // Hide loading
            this.loadingElement.style.display = 'none';
            
            // Close mobile menu
            document.querySelector('.nav-menu')?.classList.remove('active');
            
            // Scroll to top
            window.scrollTo(0, 0);
        }
    }

    async loadContentFromFile(filePath) {
        try {
            console.log('Attempting to load:', filePath);
            
            // Try multiple methods to load the file
            const html = await this.tryLoadFile(filePath);
            return html;
            
        } catch (error) {
            console.error('Error loading file:', error);
            
            // Try alternative paths
            const alternativePaths = [
                `./pages/${this.routes[this.currentUrl]?.file}`,
                `pages/${this.routes[this.currentUrl]?.file}`,
                `../pages/${this.routes[this.currentUrl]?.file}`,
                `${this.routes[this.currentUrl]?.file}`
            ];
            
            for (const altPath of alternativePaths) {
                try {
                    console.log('Trying alternative path:', altPath);
                    const html = await this.tryLoadFile(altPath);
                    return html;
                } catch (altError) {
                    console.log('Failed with path:', altPath);
                    continue;
                }
            }
            
            // If all fails, show error content
            return `
                <div class="error">
                    <h2>Error Loading Content</h2>
                    <p>Could not load: ${this.routes[this.currentUrl]?.file}</p>
                    <p>Current base path: ${this.basePath}</p>
                    <p>Please check if the file exists in the pages/landing_page folder.</p>
                    <p>Full URL: ${window.location.href}</p>
                    <a href="#/" class="submit-btn" data-link style="text-decoration: none;">Go Back Home</a>
                </div>
            `;
        }
    }

    async tryLoadFile(filePath) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            xhr.open('GET', filePath, true);
            xhr.responseType = 'text';
            
            xhr.onload = function() {
                console.log('XHR status:', xhr.status, 'for:', filePath);
                if (xhr.status === 0 || xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                }
            };
            
            xhr.onerror = function() {
                console.log('XHR error for:', filePath);
                reject(new Error('Network error'));
            };
            
            xhr.ontimeout = function() {
                console.log('XHR timeout for:', filePath);
                reject(new Error('Request timeout'));
            };
            
            xhr.timeout = 5000; // 5 second timeout
            xhr.send();
        });
    }

    updateActiveLink() {
        // Remove active class from all links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current link
        const currentLink = document.querySelector(`.nav-link[href="#${this.currentUrl}"]`);
        if (currentLink) {
            currentLink.classList.add('active');
        }
    }

    initPageScripts() {
        // Re-initialize all data-link elements
        document.querySelectorAll('[data-link]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    window.location.hash = href.substring(1);
                }
            });
        });
        
        // Initialize form if exists
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Thank you for your message!');
                contactForm.reset();
            });
        }
        
        // Initialize add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', () => {
                alert('Added to cart!');
            });
        });
    }

    show404() {
        document.title = this.routes['404'].title;
        this.rootElement.innerHTML = this.routes['404'].content;
        this.initPageScripts();
    }

    showError() {
        this.rootElement.innerHTML = `
            <div class="error">
                <h2>Something went wrong</h2>
                <p>Please try again or go back to home page.</p>
                <a href="#/" class="submit-btn" data-link style="text-decoration: none;">Go Back Home</a>
            </div>
        `;
        this.initPageScripts();
    }

    // Method to navigate programmatically
    navigate(path) {
        window.location.hash = path;
    }
}

// Initialize the router when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.router = new HashRouter();
    
    // Debug info
    console.log('Current URL:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    console.log('Hash:', window.location.hash);
});