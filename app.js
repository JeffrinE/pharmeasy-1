// Product Data
const products = [
    { id: 1, name: "Paracetamol", category: "pain", price: 5, image: "https://placehold.co/150?text=Pill" },
    { id: 2, name: "Amoxicillin", category: "wellness", price: 12, image: "https://placehold.co/150?text=Antibiotic" },
    { id: 3, name: "Vitamin C", category: "wellness", price: 18, image: "https://placehold.co/150?text=Vit+C" },
    { id: 4, name: "Ibuprofen", category: "pain", price: 9, image: "https://placehold.co/150?text=Ibuprofen" },
    { id: 5, name: "First Aid Kit", category: "wellness", price: 25, image: "https://placehold.co/150?text=First+Aid" }
];

// Auth Logic
const loginForm = document.getElementById('loginForm');
const loginOverlay = document.getElementById('loginOverlay');
const appContainer = document.getElementById('appContainer');
const loginError = document.getElementById('loginError');

// Toggle Elements
const toggleAuthBtn = document.getElementById('toggleAuthBtn');
const authTitle = document.getElementById('authTitle');
const authHint = document.getElementById('authHint');
const authBtn = document.getElementById('authBtn');
const toggleText = document.getElementById('toggleText');
const confirmPassGroup = document.getElementById('confirmPassGroup');
const defaultCreds = document.getElementById('defaultCreds');

let isSignUp = false;

if (toggleAuthBtn) {
    toggleAuthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isSignUp = !isSignUp;
        updateAuthUI();
    });
}

function updateAuthUI() {
    if (isSignUp) {
        authTitle.innerText = "Sign Up";
        authHint.innerText = "Create a new account";
        authBtn.innerText = "Create Account";
        toggleText.innerText = "Already have an account?";
        toggleAuthBtn.innerText = "Sign In";
        confirmPassGroup.style.display = 'block';
        document.getElementById('confirmPassword').required = true;
        if (defaultCreds) defaultCreds.style.display = 'none';
    } else {
        authTitle.innerText = "Login";
        authHint.innerText = "Enter your credentials";
        authBtn.innerText = "Sign In";
        toggleText.innerText = "Don't have an account?";
        toggleAuthBtn.innerText = "Sign Up";
        confirmPassGroup.style.display = 'none';
        document.getElementById('confirmPassword').required = false;
        if (defaultCreds) defaultCreds.style.display = 'block';
    }
    loginError.innerText = "";
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userIn = document.getElementById('username').value.trim();
    const passIn = document.getElementById('password').value;

    if (isSignUp) {
        // Sign Up Logic
        const confirmPass = document.getElementById('confirmPassword').value;
        if (passIn !== confirmPass) {
            loginError.innerText = "Passwords do not match";
            return;
        }
        if (userIn.length < 3) {
            loginError.innerText = "Username must be at least 3 chars";
            return;
        }

        // Save to LocalStorage
        const existingUsers = JSON.parse(localStorage.getItem('pharmaUsers') || '{}');
        if (existingUsers[userIn]) {
            loginError.innerText = "Username already exists";
            return;
        }

        existingUsers[userIn] = passIn;
        localStorage.setItem('pharmaUsers', JSON.stringify(existingUsers));

        alert("Account created! Please log in.");
        isSignUp = false;
        updateAuthUI();
        document.getElementById('loginForm').reset();

    } else {
        // Login Logic
        try {
            let authenticated = false;

            // 1. Check Static Users (users.js)
            if (typeof USERS_DB !== 'undefined') {
                const lines = USERS_DB.trim().split('\\n');
                for (let line of lines) {
                    const [u, p] = line.trim().split(':');
                    if (u === userIn && p === passIn) {
                        authenticated = true;
                        break;
                    }
                }
            } else {
                // Fallback
                if (userIn === 'admin' && passIn === 'admin123') authenticated = true;
            }

            // 2. Check LocalStorage Users
            if (!authenticated) {
                const storedUsers = JSON.parse(localStorage.getItem('pharmaUsers') || '{}');
                if (storedUsers[userIn] === passIn) {
                    authenticated = true;
                }
            }

            if (authenticated) {
                loginOverlay.style.display = 'none';
                appContainer.style.display = 'block';
            } else {
                loginError.textContent = "Invalid credentials";
            }

        } catch (err) {
            console.error(err);
            loginError.textContent = "System Error";
        }
    }
});

// App Logic
let cart = [];

function renderProducts(filter = 'all') {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';

    const filtered = products.filter(p => filter === 'all' || p.category === filter);

    filtered.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <div class="card-bottom">
                <span>$${p.price.toFixed(2)}</span>
                <button class="add-btn" onclick="addToCart(${p.id})">+</button>
            </div>
        `;
        grid.appendChild(div);
    });
}

// Cart CRUD
window.addToCart = function (id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(i => i.id === id);
    if (existing) existing.qty++;
    else cart.push({ ...product, qty: 1 });
    updateCart();
    // Auto-open cart on add
    document.getElementById('cartOverlay').classList.add('open');
    document.getElementById('cartSidebar').classList.add('open');
};

window.updateQty = function (id, change) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.qty += change;

    if (item.qty <= 0) {
        removeFromCart(id);
    } else {
        updateCart();
    }
};

window.removeFromCart = function (id) {
    cart = cart.filter(i => i.id !== id);
    updateCart();
};

function updateCart() {
    document.getElementById('cartCount').textContent = cart.reduce((a, b) => a + b.qty, 0);
    const cartItems = document.getElementById('cartItems');

    if (cart.length === 0) {
        cartItems.innerHTML = `<p style="text-align:center; color:#999; margin-top:2rem;">Cart is empty 🛒</p>`;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div style="flex:1;">
                    <div style="font-weight:600;">${item.name}</div>
                    <div style="font-size:0.9rem; color:#666;">$${item.price.toFixed(2)}</div>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="display:flex; align-items:center; border:1px solid #ddd; border-radius:4px;">
                        <button onclick="updateQty(${item.id}, -1)" style="padding:2px 8px; cursor:pointer;">-</button>
                        <span style="padding:0 5px; min-width:20px; text-align:center;">${item.qty}</span>
                        <button onclick="updateQty(${item.id}, 1)" style="padding:2px 8px; cursor:pointer;">+</button>
                    </div>
                    <button onclick="removeFromCart(${item.id})" style="color:red; cursor:pointer;">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    const total = cart.reduce((a, b) => a + (b.price * b.qty), 0);
    document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
}

// Checkout Logic
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutForm = document.getElementById('checkoutForm');

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        closeCart();
        checkoutModal.style.display = 'flex';
    });
}

function closeCheckout() {
    if (checkoutModal) checkoutModal.style.display = 'none';
}

if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Simulate Processing
        const btn = document.getElementById('confirmPayBtn');
        const originalText = btn.textContent;
        btn.textContent = "Processing...";
        btn.disabled = true;

        setTimeout(() => {
            alert(`Order Placed Successfully! 🎉\n\nThank you for shopping with PharmaSwift.`);
            cart = [];
            updateCart();
            checkoutForm.reset();
            closeCheckout();
            btn.textContent = originalText;
            btn.disabled = false;
        }, 1500);
    });
}

// UI
document.getElementById('cartBtn').onclick = () => {
    document.getElementById('cartOverlay').classList.add('open');
    document.getElementById('cartSidebar').classList.add('open');
};

const closeCart = () => {
    document.getElementById('cartOverlay').classList.remove('open');
    document.getElementById('cartSidebar').classList.remove('open');
};

document.getElementById('closeCartBtn').onclick = closeCart;
document.getElementById('cartOverlay').onclick = closeCart;

// Init
renderProducts();
