// app.js - Router yang load file dari server
class ExternalFileRouter {
    constructor() {
        this.routes = {};
        this.currentUrl = '';
        this.app = document.getElementById('app');
        this.footer = document.getElementsByClassName('footer');
        this.copyright = document.getElementsByClassName('copyright');
        this.textFooter = document.querySelectorAll('.text-footer');
        this.loading = document.getElementById('loading');
        this.serverUrl = 'http://localhost:3000'; // URL server lokal
        this.init();
    }

    init() {
        this.setupRoutes();
        
        // Check if server is running
        this.checkServer();
        
        window.addEventListener('DOMContentLoaded', () => {
            this.loadPage();
        });

        window.addEventListener('hashchange', () => {
            this.loadPage();
        });
    }

    setupRoutes() {
        // Definisikan file HTML untuk setiap route
        this.routes = {
            '/': {
                title: 'Home | CanCode Store',
                file: 'pages/landing_page/shoes.html',
                bgcolor: '#FF4725'
            },
            '/t_shirt': {
                title: 'T-Shirts | CanCode Store',
                file: 'pages/landing_page/t_shirt.html',
                bgcolor: '#9D32FF'
            },
            '/hats_headwear': {
                title: 'Hats & Headwear | CanCode Store',
                file: 'pages/landing_page/hats_headwear.html',
                bgcolor: '#BC0018'
            },
            '/order': {
                title: 'Order | CanCode Store',
                file: 'pages/transaction/order.html',
                bgcolor: '#8F8F8F'
            },
            '/ai_design': {
                title: 'AI Desaign | CanCode Store',
                file: 'pages/transaction/ai_design.html',
                bgcolor: '#8F8F8F'
            },
            '/payment': {
                title: 'Payment | CanCode Store',
                file: 'pages/transaction/payment.html',
                bgcolor: '#8F8F8F'
            }
        };
    }

    async checkServer() {
        try {
            const response = await fetch(this.serverUrl, { mode: 'no-cors' });
            console.log('✅ Server is running');
        } catch (error) {
            console.warn('⚠️ Server not detected. Please run: node server.js');
            console.warn('📝 Command: node server.js');
        }
    }

    async loadPage() {
        this.showLoading();
        this.app.innerHTML = '';
        
        const hash = window.location.hash.substring(1) || '/';
        this.currentUrl = hash;
        
        const route = this.routes[hash];
        
        if (route && route.file) {
            try {
                // Load file dari server
                const content = await this.loadExternalFile(route.file);
                document.title = route.title;
                this.app.innerHTML = content;
                this.initPageScripts();
            } catch (error) {
                console.error('❌ Error loading file:', error);
                this.showServerError();
            }
        } else {
            this.show404();
        }
        // add backgruond color
        this.app.style.backgroundColor = route && route.bgcolor ? route.bgcolor + "80" : '#ffffff';
        this.footer[0].style.backgroundColor = route && route.bgcolor ? route.bgcolor : '#000';
        this.copyright[0].style.backgroundColor = route && route.bgcolor ? route.bgcolor + "80" : '#ffffff';
        console.log(this.textFooter);
        
        this.textFooter.forEach(el => {
            el.style.color = route && route.bgcolor == "#8F8F8F" ? '#fff' : '#000';
        });

        
        this.hideLoading();
    }

    async loadExternalFile(filePath) {
        const url = `${this.serverUrl}/${filePath}`;
        console.log(`📥 Loading: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.text();
    }

    initPageScripts() {
        // Handle internal navigation links
        this.app.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const hash = link.getAttribute('href').substring(1);
                window.location.hash = hash || '/';
            });
        });
        
        // Handle image errors
        this.app.querySelectorAll('img').forEach(img => {
            img.onerror = () => {
                console.warn('🖼️ Image failed:', img.src);
                this.createImagePlaceholder(img);
            };
        });
    }

    createImagePlaceholder(img) {
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.innerHTML = `
            <div style="
                width: 100%;
                height: ${img.height || 120}px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: white;
            ">
                <span style="font-size: 2rem;">🖼️</span>
                <small>Image not found</small>
            </div>
        `;
        
        img.style.display = 'none';
        img.parentNode.insertBefore(placeholder, img);
    }

    showLoading() {
        if (this.loading) {
            this.loading.style.display = 'block';
            this.loading.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <div class="spinner"></div>
                    <p>Loading from server...</p>
                </div>
            `;
        }
    }

    hideLoading() {
        if (this.loading) this.loading.style.display = 'none';
    }

    show404() {
        this.app.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <h2>404 - Page Not Found</h2>
                <a href="#/" style="
                    display: inline-block;
                    margin-top: 1rem;
                    padding: 0.5rem 1.5rem;
                    background: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                ">Go Home</a>
            </div>
        `;
        this.initPageScripts();
    }

    showServerError() {
        this.app.innerHTML = `
            <div style="text-align: center; padding: 4rem; max-width: 600px; margin: 0 auto;">
                <h2>🚨 Server Required</h2>
                <p>To load external HTML files, you need to run a local server.</p>
                
                <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 2rem 0; text-align: left;">
                    <h3>📋 Steps to fix:</h3>
                    <ol style="margin: 1rem 0;">
                        <li>Open terminal/command prompt</li>
                        <li>Navigate to your project folder</li>
                        <li>Run: <code style="background: #e9ecef; padding: 0.2rem 0.4rem; border-radius: 3px;">node server.js</code></li>
                        <li>Refresh this page</li>
                    </ol>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <a href="#/" style="
                        display: inline-block;
                        padding: 0.5rem 1.5rem;
                        background: #667eea;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                    ">Go Home</a>
                    
                    <button onclick="location.reload()" style="
                        padding: 0.5rem 1.5rem;
                        background: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Retry</button>
                </div>
            </div>
        `;
    }
}

// Initialize router
document.addEventListener('DOMContentLoaded', () => {
    window.router = new ExternalFileRouter();
});