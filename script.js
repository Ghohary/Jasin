/* ========================================
   GHOHARY - Luxury Evening Dress Website
   Mobile-First JavaScript Interactions
   ======================================== */

// ========== GLOBAL VARIABLES ==========
let currentSlide = 0;
let cart = JSON.parse(localStorage.getItem('ghoharyCart')) || [];
let wishlist = JSON.parse(localStorage.getItem('ghoharyWishlist')) || [];
let slideInterval;

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    initializeSlider();
    updateCartCount();
    initializeIntersectionObserver();
    initializeScrollEffects();
    loadCartItems();

    // Prevent default form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (!form.hasAttribute('data-allow-submit')) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
            });
        }
    });
});

// ========== HERO SLIDER ==========
function initializeSlider() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;

    // Auto-advance slider every 5 seconds
    slideInterval = setInterval(() => {
        changeSlide(1);
    }, 5000);

    // Pause on hover
    const slider = document.querySelector('.hero-slider');
    if (slider) {
        slider.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });

        slider.addEventListener('mouseleave', () => {
            slideInterval = setInterval(() => {
                changeSlide(1);
            }, 5000);
        });
    }
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');

    if (slides.length === 0) return;

    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');

    currentSlide = (currentSlide + direction + slides.length) % slides.length;

    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

function setSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');

    if (slides.length === 0) return;

    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');

    currentSlide = index;

    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');

    // Reset auto-advance timer
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
        changeSlide(1);
    }, 5000);
}

// ========== MOBILE MENU ==========
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBtn = document.querySelector('.mobile-menu-btn');

    if (mobileMenu && menuBtn &&
        !mobileMenu.contains(event.target) &&
        !menuBtn.contains(event.target)) {
        mobileMenu.classList.remove('active');
    }
});

// ========== SHOPPING CART ==========
function addToCart(productName, price) {
    const existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1,
            id: Date.now()
        });
    }

    saveCart();
    updateCartCount();
    showNotification(`${productName} added to cart`);
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    updateCartCount();
    loadCartItems();
    showNotification('Item removed from cart');
}

function updateQuantity(itemId, change) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            saveCart();
            loadCartItems();
        }
    }
}

function saveCart() {
    localStorage.setItem('ghoharyCart', JSON.stringify(cart));
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function loadCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <svg style="width: 80px; height: 80px; stroke: #ccc; margin: 0 auto 20px;" viewBox="0 0 24 24" fill="none">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <h3 style="margin-bottom: 10px; color: #333;">Your cart is empty</h3>
                <p style="color: #999; margin-bottom: 20px;">Add some luxury pieces to get started</p>
                <a href="evening-wear.html"><button class="btn-primary">SHOP NOW</button></a>
            </div>
        `;
        if (cartSummary) {
            cartSummary.style.display = 'none';
        }
        return;
    }

    let total = 0;
    let itemsHTML = '';

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        itemsHTML += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=200&q=80" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p class="cart-item-price">AED ${item.price.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button onclick="updateQuantity(${item.id}, -1)"></button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <div class="cart-item-total">
                    <p>AED ${itemTotal.toFixed(2)}</p>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = itemsHTML;

    if (cartSummary) {
        const shipping = total > 500 ? 0 : 25;
        const tax = total * 0.05;
        const finalTotal = total + shipping + tax;

        cartSummary.innerHTML = `
            <h3>ORDER SUMMARY</h3>
            <div class="summary-line">
                <span>Subtotal:</span>
                <span>AED ${total.toFixed(2)}</span>
            </div>
            <div class="summary-line">
                <span>Shipping:</span>
                <span>${shipping === 0 ? 'FREE' : 'AED ' + shipping.toFixed(2)}</span>
            </div>
            <div class="summary-line">
                <span>Tax (5%):</span>
                <span>AED ${tax.toFixed(2)}</span>
            </div>
            <div class="summary-line total">
                <span>Total:</span>
                <span>AED ${finalTotal.toFixed(2)}</span>
            </div>
            ${total < 500 ? '<p class="free-shipping-notice">Add AED ' + (500 - total).toFixed(2) + ' for FREE shipping</p>' : ''}
            <button class="btn-primary" onclick="proceedToCheckout()" style="width: 100%; margin-top: 20px;">PROCEED TO CHECKOUT</button>
        `;
        cartSummary.style.display = 'block';
    }
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty');
        return;
    }
    showNotification('Proceeding to checkout...');
    // In a real application, this would redirect to checkout page
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartCount();
    loadCartItems();
    showNotification('Cart cleared');
}

// ========== WISHLIST ==========
function toggleWishlist(productId, productName) {
    const index = wishlist.findIndex(item => item.id === productId);

    if (index > -1) {
        wishlist.splice(index, 1);
        showNotification(`${productName} removed from wishlist`);
    } else {
        wishlist.push({
            id: productId,
            name: productName,
            addedAt: Date.now()
        });
        showNotification(`${productName} added to wishlist`);
    }

    localStorage.setItem('ghoharyWishlist', JSON.stringify(wishlist));
}

// ========== NOTIFICATIONS ==========
function showNotification(message) {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ========== NEWSLETTER ==========
function subscribeNewsletter(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;

    if (email) {
        showNotification('Thank you for subscribing!');
        form.reset();
    }
}

// ========== INTERSECTION OBSERVER (FADE IN ANIMATIONS) ==========
function initializeIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe product cards, category cards
    const elementsToObserve = document.querySelectorAll('.product-card, .category-card, .section-header');
    elementsToObserve.forEach(el => {
        observer.observe(el);
    });
}

// ========== SCROLL EFFECTS ==========
function initializeScrollEffects() {
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Navbar hide/show on scroll
        if (navbar) {
            if (currentScroll <= 0) {
                navbar.style.transform = 'translateY(0)';
            } else if (currentScroll > lastScroll && currentScroll > 100) {
                // Scrolling down
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                navbar.style.transform = 'translateY(0)';
            }
        }

        lastScroll = currentScroll;
    });
}

// ========== PRODUCT FILTERING ==========
let currentFilter = 'all';
let currentSort = 'featured';

function filterProducts(category) {
    currentFilter = category;
    applyFiltersAndSort();

    // Update active filter button
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === category) {
            btn.classList.add('active');
        }
    });
}

function sortProducts(sortBy) {
    currentSort = sortBy;
    applyFiltersAndSort();

    // Update sort dropdown
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.value = sortBy;
    }
}

function applyFiltersAndSort() {
    const productCards = document.querySelectorAll('.product-card');
    let visibleProducts = [];

    // Filter
    productCards.forEach(card => {
        const category = card.dataset.category || 'all';
        if (currentFilter === 'all' || category === currentFilter) {
            card.style.display = 'block';
            visibleProducts.push(card);
        } else {
            card.style.display = 'none';
        }
    });

    // Sort
    const productsGrid = document.querySelector('.products-grid');
    if (productsGrid && visibleProducts.length > 0) {
        visibleProducts.sort((a, b) => {
            const priceA = parseFloat(a.dataset.price || 0);
            const priceB = parseFloat(b.dataset.price || 0);

            switch(currentSort) {
                case 'price-low':
                    return priceA - priceB;
                case 'price-high':
                    return priceB - priceA;
                case 'newest':
                    return (b.dataset.date || 0) - (a.dataset.date || 0);
                default:
                    return 0;
            }
        });

        visibleProducts.forEach(card => {
            productsGrid.appendChild(card);
        });
    }
}

// ========== IMAGE LAZY LOADING ==========
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========== PRODUCT QUICK VIEW ==========
function quickView(productId) {
    // This would typically open a modal with product details
    showNotification('Quick view feature - Product ID: ' + productId);
}

// ========== SIZE GUIDE ==========
function showSizeGuide() {
    showNotification('Size guide modal would open here');
}

// ========== UTILITY FUNCTIONS ==========
function formatPrice(price) {
    return `AED ${parseFloat(price).toFixed(2)}`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========== TOUCH GESTURES FOR MOBILE ==========
let touchStartX = 0;
let touchEndX = 0;

function handleGesture() {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;

    if (touchEndX < touchStartX - 50) {
        // Swiped left
        changeSlide(1);
    }
    if (touchEndX > touchStartX + 50) {
        // Swiped right
        changeSlide(-1);
    }
}

const heroSlider = document.querySelector('.hero-slider');
if (heroSlider) {
    heroSlider.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    heroSlider.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleGesture();
    });
}

// ========== PERFORMANCE OPTIMIZATION ==========
// Debounced resize handler
const handleResize = debounce(() => {
    // Update any size-dependent calculations
    updateCartCount();
}, 250);

window.addEventListener('resize', handleResize);

// ========== ACCESSIBILITY ENHANCEMENTS ==========
// Keyboard navigation for slider
document.addEventListener('keydown', (e) => {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;

    if (e.key === 'ArrowLeft') {
        changeSlide(-1);
    } else if (e.key === 'ArrowRight') {
        changeSlide(1);
    }
});

// ========== EXPORT FUNCTIONS (FOR USE IN HTML) ==========
window.changeSlide = changeSlide;
window.setSlide = setSlide;
window.toggleMobileMenu = toggleMobileMenu;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.toggleWishlist = toggleWishlist;
window.subscribeNewsletter = subscribeNewsletter;
window.filterProducts = filterProducts;
window.sortProducts = sortProducts;
window.quickView = quickView;
window.showSizeGuide = showSizeGuide;
window.proceedToCheckout = proceedToCheckout;
window.clearCart = clearCart;
