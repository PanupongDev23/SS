/**
 * Valentine's Day Project - Script.js
 * Implements RelationshipTimer and PhotoGallery classes.
 */

// Configuration
const CONFIG = {
    startDate: '2023-12-10T00:00:00',
    // List of images found in the Picture folder
    images: [
        '1000016484.jpg', '1000016485.jpg', '1000016486.jpg', '1000016487.jpg',
        '1000016488.jpg', '1000016489.jpg', '1000016490.jpg', '1000016491.jpg',
        '1000016492.jpg', '1000016493.jpg', '1000016494.jpg', '1000016495.jpg',
        '1000016496.jpg', '1000016497.jpg', '1000016498.jpg', '1000016499.jpg',
        '1000016500.jpg', '1000016501.jpg', '1000016502.jpg', '1000016503.jpg',
        '1000016504.jpg', '1000016505.jpg', '1000016506.jpg', '1000016507.jpg',
        '1000016508.jpg', '1000016509.jpg', '1000016510.jpg', '1000016511.jpg',
        '1000016512.jpg', '1000016513.jpg', '1000016514.jpg'
    ]
};

/**
 * Class to handle the relationship timer logic
 */
class RelationshipTimer {
    constructor(startDateStr, containerId) {
        this.startDate = new Date(startDateStr);
        this.container = document.getElementById(containerId);
        this.timerInterval = null;
    }

    init() {
        if (!this.container) return; // Only run if element exists
        this.renderStructure();
        this.update();
        this.start();
    }

    renderStructure() {
        // Create the HTML structure for the timer
        // If we want labels in Thai, change here
        const units = [
            { id: 'days', label: 'Days' },
            { id: 'hours', label: 'Hours' },
            { id: 'minutes', label: 'Minutes' },
            { id: 'seconds', label: 'Seconds' }
        ];

        this.container.innerHTML = units.map(unit => `
            <div class="timer-box">
                <span id="${unit.id}">0</span>
                <span class="label">${unit.label}</span>
            </div>
        `).join('');
    }

    calculateTime() {
        const now = new Date();
        const diff = now - this.startDate;

        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / 1000 / 60) % 60),
            seconds: Math.floor((diff / 1000) % 60)
        };
    }

    update() {
        const time = this.calculateTime();
        Object.keys(time).forEach(key => {
            const el = document.getElementById(key);
            if (el) el.innerText = time[key];
        });
    }

    start() {
        this.timerInterval = setInterval(() => this.update(), 1000);
    }
}

/**
 * Class to handle the Photo Gallery and Lightbox
 */
class PhotoGallery {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.images = [];
        this.options = options;

        // Lightbox Elements
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImg = document.getElementById('lightbox-img');
        this.closeBtn = document.getElementById('lightbox-close');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');

        this.currentIndex = 0;
    }

    init() {
        if (!this.container) return;

        this.loadImages();
        this.shuffleImages();
        this.renderGrid();
        this.setupLightboxEvents();
    }

    loadImages() {
        // Use the hardcoded list from CONFIG
        this.images = CONFIG.images.map(filename => `Picture/${filename}`);

        // If the array is empty for some reason, we can add a fallback or log a message
        if (this.images.length === 0) {
            console.warn('No images configured.');
        }
    }

    shuffleImages() {
        // Fisher-Yates Shuffle
        for (let i = this.images.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.images[i], this.images[j]] = [this.images[j], this.images[i]];
        }
    }

    renderGrid() {
        this.container.innerHTML = '';
        this.images.forEach((src, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';

            const img = document.createElement('img');
            img.src = src;
            img.alt = `Memory ${index + 1}`;
            img.loading = 'lazy';

            // Fallback for demo if users haven't put images yet
            img.onerror = function () {
                // If local file fails, use a placeholder
                this.src = `https://source.unsplash.com/random/400x600?romance,couple&sig=${index}`;
                // Or a simple placeholder color
                // this.src = 'https://via.placeholder.com/400x600/eee/aaa?text=Add+Image';
            };

            item.appendChild(img);
            item.addEventListener('click', () => this.openLightbox(index));
            this.container.appendChild(item);
        });

        // Add "Coming Soon" item
        const comingSoon = document.createElement('div');
        comingSoon.className = 'gallery-item coming-soon';
        comingSoon.innerHTML = `
            <div>
                <i class="fas fa-heart" style="font-size: 3rem; color: #ffcccb; margin-bottom: 10px;"></i><br>
                Coming Soon...<br>
                <span style="font-size: 0.9rem; font-weight: normal;">More memories to come!</span>
            </div>
        `;
        this.container.appendChild(comingSoon);
    }

    openLightbox(index) {
        this.currentIndex = index;
        this.updateLightboxImage();
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Disable scroll
    }

    closeLightbox() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateLightboxImage();
    }

    prevImage() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateLightboxImage();
    }

    updateLightboxImage() {
        const src = this.images[this.currentIndex];
        // We need to handle the case where the grid image might have fallen back to a placeholder
        // But for simplicity, we try to load the source.
        // A robust way is to check the actual DOM element's src in the grid.

        // Optimisation: Get the src from the rendered grid to ensure we show the same image (even if fallback)
        const gridImg = this.container.children[this.currentIndex].querySelector('img');
        this.lightboxImg.src = gridImg.src;
    }

    setupLightboxEvents() {
        this.closeBtn.addEventListener('click', () => this.closeLightbox());

        this.nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.nextImage();
        });

        this.prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.prevImage();
        });

        // Close on background click
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) this.closeLightbox();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') this.closeLightbox();
            if (e.key === 'ArrowRight') this.nextImage();
            if (e.key === 'ArrowLeft') this.prevImage();
        });

        // Swipe support (Touch)
        this.touchStartX = 0;
        this.touchEndX = 0;

        this.lightbox.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.lightbox.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
    }

    handleSwipe() {
        const threshold = 50;
        if (this.touchEndX < this.touchStartX - threshold) this.nextImage(); // Swipe Left -> Next
        if (this.touchEndX > this.touchStartX + threshold) this.prevImage(); // Swipe Right -> Prev
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    // Init Timer
    const timer = new RelationshipTimer(CONFIG.startDate, 'relationship-timer');
    timer.init();

    // Init Gallery
    const gallery = new PhotoGallery('gallery-root');
    gallery.init();
});
