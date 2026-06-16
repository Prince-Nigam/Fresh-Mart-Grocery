// ============================================================
//  FreshMart — Grocery Store Application
// ============================================================

class GroceryStore {
    constructor() {
        this.products        = [];
        this.cart            = JSON.parse(localStorage.getItem('fm_cart') || '[]');
        this.currentCategory = 'all';
        this.currentSort     = 'name';
        this.maxPrice        = 500;
        this.init();
    }

    // ── Init ──────────────────────────────────────────────
    init() {
        this.loadProducts();
        this.setupEventListeners();
        this.renderProducts();
        this.updateCartUI();
        this.setupUserArea();
    }

    // ── Auth header area ──────────────────────────────────
    setupUserArea() {
        const userArea = document.getElementById('userArea');
        if (!userArea) return;

        const raw = localStorage.getItem('fm_user');
        if (!raw) {
            userArea.innerHTML = `
                <a href="login.html" class="user-icon-link" title="Login" aria-label="Login">
                    <i class="fas fa-user"></i>
                </a>`;
            return;
        }

        const user     = JSON.parse(raw);
        const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const ADMIN_EMAILS = ['admin@freshmart.com', 'hn878283@gmail.com', 'princenigam972@gmail.com'];
        const isAdmin  = ADMIN_EMAILS.includes(user.email.toLowerCase());

        userArea.innerHTML = `
            <div class="user-dropdown-wrap" id="userDropdownWrap">
                <button type="button" class="user-avatar-btn" id="userAvatarBtn" aria-label="Account menu">
                    <div class="user-avatar">${initials}</div>
                    <span class="user-name-label">${user.name.split(' ')[0]}</span>
                    <i class="fas fa-chevron-down user-caret"></i>
                </button>
                <div class="user-dropdown" id="userDropdown">
                    <div class="ud-header">
                        <div class="ud-avatar">${initials}</div>
                        <div>
                            <div class="ud-name">${user.name}</div>
                            <div class="ud-email">${user.email}</div>
                        </div>
                    </div>
                    <div class="ud-divider"></div>
                    ${isAdmin
                        ? `<a href="admin.html" class="ud-item ud-admin">
                               <i class="fas fa-shield-alt"></i> Admin Dashboard
                           </a>
                           <div class="ud-divider"></div>`
                        : `<a href="orders.html" class="ud-item">
                               <i class="fas fa-shopping-bag"></i> My Orders
                           </a>
                           <a href="profile.html" class="ud-item">
                               <i class="fas fa-user"></i> My Profile
                           </a>
                           <div class="ud-divider"></div>`
                    }
                    <button type="button" class="ud-item ud-logout" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>`;

        // Toggle dropdown
        document.getElementById('userAvatarBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('userDropdown').classList.toggle('open');
        });

        // Close on outside click
        document.addEventListener('click', () => {
            document.getElementById('userDropdown')?.classList.remove('open');
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('fm_user');
            this.showNotification('Logged out successfully!', 'success');
            setTimeout(() => window.location.reload(), 800);
        });
    }

    // ── Products ──────────────────────────────────────────
    loadProducts() {
        // Base products (hardcoded)
        const baseProducts = [
            { id: 1,  name: 'Fresh Apples',    category: 'fruits',     price: 248, unit: 'kg',      rating: 4.5, image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400', stock: 50 },
            { id: 2,  name: 'Bananas',          category: 'fruits',     price: 165, unit: 'dozen',   rating: 4.3, image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400', stock: 30 },
            { id: 3,  name: 'Oranges',          category: 'fruits',     price: 290, unit: 'kg',      rating: 4.4, image: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=400', stock: 25 },
            { id: 4,  name: 'Strawberries',     category: 'fruits',     price: 414, unit: '250g',    rating: 4.6, image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400', stock: 20 },
            { id: 5,  name: 'Grapes',           category: 'fruits',     price: 331, unit: 'kg',      rating: 4.2, image: 'https://images.unsplash.com/photo-1599819177626-c2f9c9ca6e0d?w=400', stock: 15 },
            { id: 6,  name: 'Watermelon',       category: 'fruits',     price: 497, unit: 'piece',   rating: 4.7, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784210?w=400', stock: 10 },
            { id: 31, name: 'Mango',            category: 'fruits',     price: 380, unit: 'kg',      rating: 4.8, image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400', stock: 18 },
            { id: 32, name: 'Pineapple',        category: 'fruits',     price: 299, unit: 'piece',   rating: 4.4, image: 'https://images.unsplash.com/photo-1571575173700-afb9492e6a50?w=400', stock: 12 },
            { id: 7,  name: 'Carrots',          category: 'vegetables', price: 124, unit: 'kg',      rating: 4.1, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400', stock: 40 },
            { id: 8,  name: 'Tomatoes',         category: 'vegetables', price: 207, unit: 'kg',      rating: 4.3, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400', stock: 35 },
            { id: 9,  name: 'Lettuce',          category: 'vegetables', price: 165, unit: 'bunch',   rating: 4.0, image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400', stock: 25 },
            { id: 10, name: 'Broccoli',         category: 'vegetables', price: 248, unit: 'piece',   rating: 4.2, image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400', stock: 20 },
            { id: 11, name: 'Potatoes',         category: 'vegetables', price: 165, unit: 'kg',      rating: 4.4, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', stock: 30 },
            { id: 12, name: 'Onions',           category: 'vegetables', price: 107, unit: 'kg',      rating: 4.1, image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400', stock: 45 },
            { id: 33, name: 'Spinach',          category: 'vegetables', price: 99,  unit: 'bunch',   rating: 4.3, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400', stock: 22 },
            { id: 34, name: 'Bell Pepper',      category: 'vegetables', price: 280, unit: 'pack',    rating: 4.2, image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400', stock: 18 },
            { id: 13, name: 'Fresh Milk',       category: 'dairy',      price: 290, unit: 'litre',   rating: 4.5, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', stock: 20 },
            { id: 14, name: 'Cheese',           category: 'dairy',      price: 414, unit: '200g',    rating: 4.3, image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400', stock: 15 },
            { id: 15, name: 'Yogurt',           category: 'dairy',      price: 248, unit: '400g',    rating: 4.2, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', stock: 25 },
            { id: 16, name: 'Butter',           category: 'dairy',      price: 331, unit: '100g',    rating: 4.4, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400', stock: 18 },
            { id: 17, name: 'Eggs',             category: 'dairy',      price: 207, unit: '12 pcs',  rating: 4.6, image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400', stock: 30 },
            { id: 18, name: 'Chicken Breast',   category: 'meat',       price: 580, unit: 'kg',      rating: 4.5, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400', stock: 12 },
            { id: 19, name: 'Ground Beef',      category: 'meat',       price: 497, unit: '500g',    rating: 4.3, image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400', stock: 10 },
            { id: 20, name: 'Salmon Fillet',    category: 'meat',       price: 747, unit: '500g',    rating: 4.7, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400', stock: 8  },
            { id: 21, name: 'Pork Chops',       category: 'meat',       price: 456, unit: 'kg',      rating: 4.2, image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400', stock: 15 },
            { id: 22, name: 'Fresh Bread',      category: 'bakery',     price: 248, unit: 'loaf',    rating: 4.4, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', stock: 20 },
            { id: 23, name: 'Croissants',       category: 'bakery',     price: 331, unit: '4 pcs',   rating: 4.6, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', stock: 15 },
            { id: 24, name: 'Muffins',          category: 'bakery',     price: 207, unit: '6 pcs',   rating: 4.3, image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400', stock: 18 },
            { id: 25, name: 'Bagels',           category: 'bakery',     price: 290, unit: '4 pcs',   rating: 4.2, image: 'https://images.unsplash.com/photo-1551106652-a5bcf4b29ab6?w=400', stock: 12 },
            { id: 35, name: 'Whole Wheat Roti', category: 'bakery',     price: 149, unit: '10 pcs',  rating: 4.5, image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400', stock: 25 },
            { id: 26, name: 'Orange Juice',     category: 'beverages',  price: 331, unit: '1L',      rating: 4.3, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', stock: 25 },
            { id: 27, name: 'Coffee',           category: 'beverages',  price: 414, unit: '250g',    rating: 4.5, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', stock: 20 },
            { id: 28, name: 'Green Tea',        category: 'beverages',  price: 248, unit: '25 bags', rating: 4.2, image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400', stock: 30 },
            { id: 29, name: 'Sparkling Water',  category: 'beverages',  price: 165, unit: '1L',      rating: 4.1, image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400', stock: 35 },
            { id: 30, name: 'Energy Drink',     category: 'beverages',  price: 207, unit: '250ml',   rating: 3.9, image: 'https://images.unsplash.com/photo-1622543925917-763c34f6a1a7?w=400', stock: 22 },
            { id: 36, name: 'Mango Lassi',      category: 'beverages',  price: 199, unit: '500ml',   rating: 4.6, image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400', stock: 16 }
        ];

        // Merge with admin-managed products from localStorage
        const deletedIds     = JSON.parse(localStorage.getItem('fm_deleted_products') || '[]');
        const customProducts = JSON.parse(localStorage.getItem('fm_custom_products')  || '[]');

        // Filter out deleted/edited base products, then add custom ones
        const filteredBase = baseProducts.filter(p => !deletedIds.includes(p.id));
        this.products = [...filteredBase, ...customProducts];
    }

    // ── Events ────────────────────────────────────────────
    setupEventListeners() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                this.filterByCategory(link.dataset.category);
                this.updateActiveNav(link);
            });
        });

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let t;
            searchInput.addEventListener('input', e => {
                clearTimeout(t);
                t = setTimeout(() => this.searchProducts(e.target.value), 200);
            });
        }

        document.getElementById('sortSelect')?.addEventListener('change', e => {
            this.currentSort = e.target.value;
            this.renderProducts();
        });

        const priceRange = document.getElementById('priceRange');
        const priceValue = document.getElementById('priceValue');
        if (priceRange && priceValue) {
            const updatePrice = (val) => {
                val = Math.max(1, Math.min(500, val));
                this.maxPrice = val;
                priceRange.value = val;
                priceValue.textContent = `₹${val}`;
                this.renderProducts();
            };

            priceRange.addEventListener('input', e => {
                updatePrice(parseInt(e.target.value));
            });

            document.getElementById('priceDecrBtn')?.addEventListener('click', () => {
                updatePrice(this.maxPrice - 50);
            });

            document.getElementById('priceIncrBtn')?.addEventListener('click', () => {
                updatePrice(this.maxPrice + 50);
            });
        }

        document.getElementById('cartIcon')?.addEventListener('click', () => this.toggleCart());
        document.getElementById('closeCart')?.addEventListener('click', () => this.closeCart());
        document.getElementById('cartOverlay')?.addEventListener('click', () => this.closeCart());
        document.getElementById('checkoutBtn')?.addEventListener('click', () => this.checkout());
        document.getElementById('shopNowBtn')?.addEventListener('click', () => {
            document.getElementById('productsGrid')?.scrollIntoView({ behavior: 'smooth' });
        });
        document.getElementById('closeModal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('productModal')?.addEventListener('click', e => {
            if (e.target === e.currentTarget) this.closeModal();
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') { this.closeCart(); this.closeModal(); }
        });
    }

    // ── Category / Search ─────────────────────────────────
    filterByCategory(category) {
        this.currentCategory = category;
        const labels = { all:'All Products', breakfast:'🍳 Breakfast', fruits:'🍎 Fruits', vegetables:'🥕 Vegetables', dairy:'🥛 Dairy', meat:'🍗 Meat & Fish', bakery:'🍞 Bakery', beverages:'☕ Beverages' };
        const title = document.getElementById('sectionTitle');
        if (title) title.textContent = labels[category] || 'Products';
        this.renderProducts();
    }

    updateActiveNav(link) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    }

    searchProducts(query) {
        if (!query.trim()) { this.renderProducts(); return; }
        const q = query.toLowerCase();
        this.renderProductCards(this.products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)));
    }

    getFilteredProducts() {
        let f = [...this.products];
        if (this.currentCategory !== 'all') f = f.filter(p => p.category === this.currentCategory);
        f = f.filter(p => p.price <= this.maxPrice);
        f.sort((a, b) => {
            switch (this.currentSort) {
                case 'name':       return a.name.localeCompare(b.name);
                case 'price-low':  return a.price - b.price;
                case 'price-high': return b.price - a.price;
                case 'rating':     return b.rating - a.rating;
                default:           return 0;
            }
        });
        return f;
    }

    // ── Render Products ───────────────────────────────────
    renderProducts(products = null) {
        this.renderProductCards(products || this.getFilteredProducts());
    }

    renderProductCards(products) {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;
        if (!products.length) {
            grid.innerHTML = `<div class="empty-state"><i class="fas fa-search"></i><h3>No products found</h3><p>Try adjusting your search or filters</p></div>`;
            return;
        }
        grid.innerHTML = products.map(p => this.buildProductCard(p)).join('');
    }

    buildProductCard(p) {
        const inCart       = this.cart.find(i => i.id === p.id);
        const isLowStock   = p.stock > 0 && p.stock <= 5;
        const isOutOfStock = p.stock === 0;
        // Only show img tag if image URL is non-empty
        const hasImage = p.image && p.image.trim() !== '';
        const imageHtml = hasImage
            ? `<img src="${p.image}" alt="${p.name}" loading="lazy"
                    onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
            : '';
        const emojiStyle = hasImage ? 'display:none' : 'display:flex';

        return `
        <article class="product-card">
            <div class="product-image" onclick="groceryStore.openModal(${p.id})" style="cursor:pointer">
                ${imageHtml}
                <div class="fallback-emoji" style="${emojiStyle}">${this.getCategoryEmoji(p.category)}</div>
                <span class="product-badge">${p.category}</span>
                ${isOutOfStock ? '<span class="out-of-stock-badge">Out of Stock</span>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${p.name}</h3>
                <p class="product-category">${p.category}</p>
                <div class="product-price-row">
                    <span class="product-price">₹${p.price.toLocaleString('en-IN')}</span>
                    <span class="product-price-unit">/ ${p.unit || 'unit'}</span>
                </div>
                <div class="product-rating">
                    <div class="stars">${this.renderStars(p.rating)}</div>
                    <span class="rating-text">${p.rating} (${Math.floor(p.rating*20)} reviews)</span>
                </div>
                <p class="stock-info ${isLowStock ? 'low' : ''}">
                    ${isOutOfStock ? '❌ Out of stock' : isLowStock ? `⚠️ Only ${p.stock} left` : `✅ In stock (${p.stock})`}
                </p>
                <button type="button" class="add-to-cart" onclick="groceryStore.addToCart(${p.id})"
                    ${isOutOfStock ? 'disabled' : ''}>
                    ${isOutOfStock ? '<i class="fas fa-ban"></i> Out of Stock'
                      : inCart ? `<i class="fas fa-check"></i> In Cart (${inCart.quantity})`
                               : '<i class="fas fa-cart-plus"></i> Add to Cart'}
                </button>
            </div>
        </article>`;
    }

    renderStars(rating) {
        let h = '';
        const full = Math.floor(rating), half = rating % 1 >= 0.5, empty = 5 - Math.ceil(rating);
        for (let i = 0; i < full; i++)  h += '<i class="fas fa-star"></i>';
        if (half)                        h += '<i class="fas fa-star-half-alt"></i>';
        for (let i = 0; i < empty; i++) h += '<i class="far fa-star"></i>';
        return h;
    }

    getCategoryEmoji(cat) {
        return { fruits:'🍎', vegetables:'🥕', dairy:'🥛', meat:'🍗', bakery:'🍞', beverages:'☕' }[cat] || '📦';
    }

    // ── Product Modal ─────────────────────────────────────
    openModal(productId) {
        const p = this.products.find(x => x.id === productId);
        if (!p) return;
        const modal = document.getElementById('productModal');
        const body  = document.getElementById('modalBody');
        if (!modal || !body) return;

        const hasImage = p.image && p.image.trim() !== '';
        body.innerHTML = `
            <div class="modal-img-wrap">
                ${hasImage
                    ? `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
                    : ''}
                <div class="fallback-emoji" style="${hasImage ? 'display:none' : 'display:flex'};font-size:6rem">${this.getCategoryEmoji(p.category)}</div>
            </div>
            <h2 class="modal-product-name">${p.name}</h2>
            <p class="modal-category">${p.category}</p>
            <div class="modal-price-row">
                <span class="modal-price">₹${p.price.toLocaleString('en-IN')}</span>
                <span class="modal-unit">/ ${p.unit || 'unit'}</span>
            </div>
            <div class="modal-rating">
                <div class="stars">${this.renderStars(p.rating)}</div>
                <span>${p.rating}/5.0 — ${Math.floor(p.rating*20)} reviews</span>
            </div>
            <p class="modal-desc">${this.getProductDescription(p)}</p>
            <div class="modal-tags">
                <span class="modal-tag green">${p.stock > 0 ? '✅ ' + p.stock + ' in stock' : '❌ Out of stock'}</span>
                <span class="modal-tag blue">🚚 Same-day delivery</span>
            </div>
            <button type="button" class="add-to-cart" onclick="groceryStore.addToCart(${p.id});groceryStore.closeModal();" ${p.stock===0?'disabled':''}>
                ${p.stock === 0 ? '<i class="fas fa-ban"></i> Out of Stock' : '<i class="fas fa-cart-plus"></i> Add to Cart'}
            </button>`;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('productModal')?.classList.remove('active');
        document.body.style.overflow = '';
    }

    getProductDescription(p) {
        const desc = {
            fruits:     `Fresh ${p.name} sourced directly from farms. Rich in vitamins and natural sweetness.`,
            vegetables: `Farm-fresh ${p.name} picked at peak ripeness. Packed with nutrients for healthy cooking.`,
            dairy:      `Premium quality ${p.name} from trusted dairies. Pasteurized and safely packaged.`,
            meat:       `Fresh-cut ${p.name} from certified farms. High in protein, cleaned and ready to cook.`,
            bakery:     `Freshly baked ${p.name} made daily. No preservatives — just wholesome goodness.`,
            beverages:  `Refreshing ${p.name} made with quality ingredients. Perfect for any time of day.`
        };
        return desc[p.category] || `Quality ${p.name} delivered fresh to your door.`;
    }

    // ── Cart ──────────────────────────────────────────────
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product || product.stock === 0) return;

        const existing = this.cart.find(i => i.id === productId);
        if (existing) {
            if (existing.quantity < product.stock) existing.quantity++;
            else { this.showNotification('Maximum stock reached!', 'error'); return; }
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }

        this.saveCart();
        this.updateCartUI();
        this.showNotification(`<i class="fas fa-check-circle"></i> ${product.name} added!`);
        this.renderProducts();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(i => i.id !== productId);
        this.saveCart(); this.updateCartUI(); this.renderProducts();
    }

    updateQuantity(productId, change) {
        const item    = this.cart.find(i => i.id === productId);
        const product = this.products.find(p => p.id === productId);
        if (!item || !product) return;
        const newQty = item.quantity + change;
        if (newQty <= 0) this.removeFromCart(productId);
        else if (newQty <= product.stock) { item.quantity = newQty; this.saveCart(); this.updateCartUI(); }
        else this.showNotification('Not enough stock available!', 'error');
    }

    saveCart() { localStorage.setItem('fm_cart', JSON.stringify(this.cart)); }

    updateCartUI() {
        const cartCount    = document.getElementById('cartCount');
        const cartItems    = document.getElementById('cartItems');
        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartTotal    = document.getElementById('cartTotal');
        const deliveryFee  = document.getElementById('deliveryFee');

        const totalItems = this.cart.reduce((s, i) => s + i.quantity, 0);
        if (cartCount) { cartCount.textContent = totalItems; cartCount.style.display = totalItems > 0 ? 'flex' : 'none'; }

        if (!cartItems) return;
        if (!this.cart.length) {
            cartItems.innerHTML = `<div class="empty-state" style="padding:3rem 1rem"><i class="fas fa-shopping-cart"></i><h3>Your cart is empty</h3><p>Add some fresh products!</p></div>`;
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                        <div class="fallback-emoji" style="display:none;font-size:1.7rem;background:transparent">${this.getCategoryEmoji(item.category)}</div>
                    </div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
                    </div>
                    <div class="cart-item-controls">
                        <button type="button" class="quantity-btn" onclick="groceryStore.updateQuantity(${item.id},-1)" aria-label="Decrease">−</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button type="button" class="quantity-btn" onclick="groceryStore.updateQuantity(${item.id},1)" aria-label="Increase">+</button>
                        <button type="button" class="remove-item" onclick="groceryStore.removeFromCart(${item.id})" aria-label="Remove">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>`).join('');
        }

        const subtotal = this.cart.reduce((s, i) => s + (i.price * i.quantity), 0);
        const delivery = subtotal > 0 && subtotal < 500 ? 40 : 0;
        if (cartSubtotal) cartSubtotal.textContent = subtotal.toFixed(2);
        if (deliveryFee)  deliveryFee.textContent  = delivery === 0 && subtotal > 0 ? '🎉 FREE' : `₹${delivery}`;
        if (cartTotal)    cartTotal.textContent    = (subtotal + delivery).toFixed(2);
    }

    toggleCart() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        const isOpen  = sidebar?.classList.contains('open');
        sidebar?.classList.toggle('open');
        overlay?.classList.toggle('active');
        document.body.style.overflow = isOpen ? '' : 'hidden';
    }

    closeCart() {
        document.getElementById('cartSidebar')?.classList.remove('open');
        document.getElementById('cartOverlay')?.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ── Checkout ──────────────────────────────────────────
    checkout() {
        if (!this.cart.length) {
            this.showNotification('<i class="fas fa-exclamation-circle"></i> Cart is empty!', 'error');
            return;
        }
        if (!localStorage.getItem('fm_user')) {
            this.showNotification('<i class="fas fa-user"></i> Please login to checkout!', 'error');
            setTimeout(() => window.location.href = 'login.html', 1200);
            return;
        }
        this.closeCart();
        this.openCheckoutModal();
    }

    openCheckoutModal() {
        const subtotal  = this.cart.reduce((s, i) => s + (i.price * i.quantity), 0);
        const delivery  = subtotal < 500 ? 40 : 0;
        const total     = subtotal + delivery;
        const itemCount = this.cart.reduce((s, i) => s + i.quantity, 0);
        const user      = JSON.parse(localStorage.getItem('fm_user') || '{}');

        document.getElementById('checkoutModal')?.remove();

        const modal = document.createElement('div');
        modal.id = 'checkoutModal';
        modal.className = 'checkout-modal-overlay';
        modal.innerHTML = `
        <div class="checkout-modal-box">
            <div class="checkout-modal-header">
                <h2><i class="fas fa-map-marker-alt"></i> Delivery Details</h2>
                <button type="button" class="checkout-close-btn" id="closeCheckoutModal"><i class="fas fa-times"></i></button>
            </div>
            <div class="checkout-modal-body">

                <div class="checkout-order-strip">
                    <div class="co-strip-item"><i class="fas fa-box"></i> ${itemCount} item${itemCount>1?'s':''}</div>
                    <div class="co-strip-item"><i class="fas fa-tags"></i> ₹${subtotal.toLocaleString('en-IN')}</div>
                    <div class="co-strip-item"><i class="fas fa-truck"></i> Delivery: ${delivery===0?'FREE 🎉':'₹'+delivery}</div>
                    <div class="co-strip-total">Total <strong>₹${total.toLocaleString('en-IN')}</strong></div>
                </div>

                <form id="checkoutAddressForm" novalidate>
                    <p class="co-section-title"><i class="fas fa-user"></i> Contact Information</p>
                    <div class="co-row">
                        <div class="co-field">
                            <label for="co_name">Full Name *</label>
                            <div class="co-input-wrap"><i class="fas fa-user"></i>
                                <input type="text" id="co_name" placeholder="Rahul Sharma" required value="${user.name || ''}">
                            </div>
                        </div>
                        <div class="co-field">
                            <label for="co_phone">Phone Number *</label>
                            <div class="co-input-wrap"><i class="fas fa-phone"></i>
                                <input type="tel" id="co_phone" placeholder="9876543210" required>
                            </div>
                        </div>
                    </div>
                    <div class="co-field">
                        <label for="co_email">Email *</label>
                        <div class="co-input-wrap"><i class="fas fa-envelope"></i>
                            <input type="email" id="co_email" placeholder="you@example.com" required value="${user.email || ''}">
                        </div>
                    </div>

                    <p class="co-section-title"><i class="fas fa-map-marker-alt"></i> Delivery Address</p>
                    <div class="co-field">
                        <label for="co_address">House / Flat / Street *</label>
                        <div class="co-input-wrap"><i class="fas fa-home"></i>
                            <input type="text" id="co_address" placeholder="House No. 12, Green Colony" required>
                        </div>
                    </div>
                    <div class="co-row">
                        <div class="co-field">
                            <label for="co_landmark">Landmark</label>
                            <div class="co-input-wrap"><i class="fas fa-map-pin"></i>
                                <input type="text" id="co_landmark" placeholder="Near SBI Bank">
                            </div>
                        </div>
                        <div class="co-field">
                            <label for="co_area">Area / Colony *</label>
                            <div class="co-input-wrap"><i class="fas fa-map"></i>
                                <input type="text" id="co_area" placeholder="Sector 15, Noida" required>
                            </div>
                        </div>
                    </div>
                    <div class="co-row">
                        <div class="co-field">
                            <label for="co_city">City *</label>
                            <div class="co-input-wrap"><i class="fas fa-city"></i>
                                <input type="text" id="co_city" placeholder="Greater Noida" required>
                            </div>
                        </div>
                        <div class="co-field">
                            <label for="co_state">State *</label>
                            <div class="co-input-wrap"><i class="fas fa-flag"></i>
                                <select id="co_state" required>
                                    <option value="">Select State</option>
                                    <option value="Uttar Pradesh" selected>Uttar Pradesh</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="West Bengal">West Bengal</option>
                                    <option value="Rajasthan">Rajasthan</option>
                                    <option value="Gujarat">Gujarat</option>
                                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                                    <option value="Bihar">Bihar</option>
                                    <option value="Punjab">Punjab</option>
                                    <option value="Haryana">Haryana</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="co-row">
                        <div class="co-field">
                            <label for="co_pincode">PIN Code *</label>
                            <div class="co-input-wrap"><i class="fas fa-hashtag"></i>
                                <input type="text" id="co_pincode" placeholder="201310" maxlength="6" required>
                            </div>
                        </div>
                        <div class="co-field">
                            <label for="co_payment">Payment Method *</label>
                            <div class="co-input-wrap"><i class="fas fa-credit-card"></i>
                                <select id="co_payment">
                                    <option value="COD">💵 Cash on Delivery</option>
                                    <option value="UPI">📱 UPI / GPay / PhonePe</option>
                                    <option value="Card">💳 Debit / Credit Card</option>
                                    <option value="NetBanking">🏦 Net Banking</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="co-field">
                        <label for="co_notes">Delivery Instructions (optional)</label>
                        <div class="co-input-wrap"><i class="fas fa-sticky-note"></i>
                            <input type="text" id="co_notes" placeholder="Leave at door, call before delivery...">
                        </div>
                    </div>

                    <div class="co-err" id="coError"></div>

                    <button type="submit" class="co-place-btn">
                        <i class="fas fa-check-circle"></i> Place Order — ₹${total.toLocaleString('en-IN')}
                    </button>
                </form>
            </div>
        </div>`;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        document.getElementById('closeCheckoutModal').addEventListener('click', () => {
            modal.remove(); document.body.style.overflow = '';
        });
        modal.addEventListener('click', e => {
            if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; }
        });
        document.getElementById('checkoutAddressForm').addEventListener('submit', e => {
            e.preventDefault();
            this.placeOrder(modal, total, subtotal, delivery);
        });
    }

    placeOrder(modal, total, subtotal, delivery) {
        const get   = id => document.getElementById(id)?.value.trim();
        const errEl = document.getElementById('coError');
        const name     = get('co_name');
        const phone    = get('co_phone');
        const email    = get('co_email');
        const address  = get('co_address');
        const area     = get('co_area');
        const city     = get('co_city');
        const state    = get('co_state');
        const pincode  = get('co_pincode');
        const payment  = get('co_payment');
        const landmark = get('co_landmark');
        const notes    = get('co_notes');

        if (!name || !phone || !email || !address || !area || !city || !state || !pincode) {
            errEl.textContent = '⚠️ Please fill all required fields.';
            errEl.style.display = 'block'; return;
        }
        if (!/^\d{6}$/.test(pincode)) {
            errEl.textContent = '⚠️ PIN code must be exactly 6 digits.';
            errEl.style.display = 'block'; return;
        }
        if (!/^\d{10}$/.test(phone.replace(/[\s\-\+]/g, ''))) {
            errEl.textContent = '⚠️ Enter a valid 10-digit phone number.';
            errEl.style.display = 'block'; return;
        }

        const orderId = 'FM' + Date.now().toString().slice(-8).toUpperCase();
        const order = {
            orderId,
            date:    new Date().toISOString(),
            status:  'Pending',
            customer: { name, phone, email },
            address:  { street: address, landmark, area, city, state, pincode },
            payment, notes,
            items: this.cart.map(i => ({
                id: i.id, name: i.name, category: i.category,
                price: i.price, unit: i.unit, quantity: i.quantity,
                subtotal: i.price * i.quantity
            })),
            subtotal, delivery, total
        };

        const orders = JSON.parse(localStorage.getItem('fm_orders') || '[]');
        orders.unshift(order);
        localStorage.setItem('fm_orders', JSON.stringify(orders));

        this.cart = [];
        this.saveCart();
        this.updateCartUI();
        this.renderProducts();
        modal.remove();
        document.body.style.overflow = '';
        this.showOrderSuccess(order);
    }

    showOrderSuccess(order) {
        const el = document.createElement('div');
        el.className = 'checkout-modal-overlay';
        el.innerHTML = `
        <div class="checkout-modal-box order-success-box">
            <div class="order-success-icon"><i class="fas fa-check-circle"></i></div>
            <h2>Order Placed Successfully!</h2>
            <p class="order-success-id">Order ID: <strong>${order.orderId}</strong></p>
            <div class="order-success-details">
                <div><i class="fas fa-user"></i> ${order.customer.name}</div>
                <div><i class="fas fa-phone"></i> ${order.customer.phone}</div>
                <div><i class="fas fa-map-marker-alt"></i> ${order.address.area}, ${order.address.city} — ${order.address.pincode}</div>
                <div><i class="fas fa-credit-card"></i> ${order.payment}</div>
                <div><i class="fas fa-rupee-sign"></i> Total: ₹${order.total.toLocaleString('en-IN')}</div>
            </div>
            <p class="order-success-msg">We'll deliver within <strong>2–4 hours</strong>. Our delivery partner will call you.</p>
            <button type="button" class="co-place-btn" onclick="this.closest('.checkout-modal-overlay').remove();document.body.style.overflow=''">
                <i class="fas fa-home"></i> Continue Shopping
            </button>
        </div>`;
        document.body.appendChild(el);
        document.body.style.overflow = 'hidden';
    }

    // ── Notification ──────────────────────────────────────
    showNotification(message, type = 'success') {
        document.querySelectorAll('.notification').forEach(n => n.remove());
        const el = document.createElement('div');
        el.className = `notification ${type}`;
        el.innerHTML = message;
        document.body.appendChild(el);
        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
        setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 350); }, 2800);
    }
}

// Bootstrap
let groceryStore;
document.addEventListener('DOMContentLoaded', () => { groceryStore = new GroceryStore(); });
