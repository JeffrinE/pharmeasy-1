// Product Data
const products = [
    { id: 1, name: "Paracetamol", category: "pain", price: 5, image: "https://placehold.co/150?text=Pill" },
    { id: 2, name: "Amoxicillin", category: "wellness", price: 12, image: "https://placehold.co/150?text=Antibiotic" },
    { id: 3, name: "Vitamin C", category: "wellness", price: 18, image: "https://placehold.co/150?text=Vit+C" },
    { id: 4, name: "Ibuprofen", category: "pain", price: 9, image: "https://placehold.co/150?text=Ibuprofen" },
    { id: 5, name: "First Aid Kit", category: "wellness", price: 25, image: "https://placehold.co/150?text=First+Aid" }
];

// Login Logic
const loginForm = document.getElementById('loginForm');
const loginOverlay = document.getElementById('loginOverlay');
const appContainer = document.getElementById('appContainer');
const loginError = document.getElementById('loginError');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userIn = document.getElementById('username').value;
    const passIn = document.getElementById('password').value;

    try {
        const response = await fetch('users.txt');
        if (!response.ok) throw new Error("Could not read users file");

        const text = await response.text();
        const lines = text.split('\n');

        let authenticated = false;

        for (let line of lines) {
            const [u, p] = line.trim().split(':');
            if (u === userIn && p === passIn) {
                authenticated = true;
                break;
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
        // Fallback for file:// protocol where fetch might fail
        if (userIn === 'admin' && passIn === 'admin123') {
            loginOverlay.style.display = 'none';
            appContainer.style.display = 'block';
        } else {
            loginError.textContent = "Error reading users file (Check console or use admin:admin123)";
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
                <span>$${p.price}</span>
                <button class="add-btn" onclick="addToCart(${p.id})">+</button>
            </div>
        `;
        grid.appendChild(div);
    });
}

window.addToCart = function (id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(i => i.id === id);
    if (existing) existing.qty++;
    else cart.push({ ...product, qty: 1 });
    updateCart();
};

function updateCart() {
    document.getElementById('cartCount').textContent = cart.reduce((a, b) => a + b.qty, 0);
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span>${item.name} x${item.qty}</span>
            <span>$${item.price * item.qty}</span>
        </div>
    `).join('');

    const total = cart.reduce((a, b) => a + (b.price * b.qty), 0);
    document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
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
