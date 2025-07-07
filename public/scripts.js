let currentUser = null;
let authToken = localStorage.getItem('authToken');

// API Base URL
const API_BASE = '/api';

// DOM Elements
const authSection = document.getElementById('authSection');
const mainContent = document.getElementById('mainContent');
const userInfo = document.getElementById('userInfo');
const logoutBtn = document.getElementById('logoutBtn');

// Auth Elements
const showLogin = document.getElementById('showLogin');
const showRegister = document.getElementById('showRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginSubmit = document.getElementById('loginSubmit');
const registerSubmit = document.getElementById('registerSubmit');

// Product Elements
const productsList = document.getElementById('productsList');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const addProductBtn = document.getElementById('addProductBtn');

// Cart Elements
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCartBtn');
const checkoutBtn = document.getElementById('checkoutBtn');

// Order Elements
const ordersList = document.getElementById('ordersList');

// Modal Elements
const addProductModal = document.getElementById('addProductModal');
const checkoutModal = document.getElementById('checkoutModal');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        getCurrentUser();
    }
    
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Auth listeners
    showLogin.addEventListener('click', () => {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    });
    
    showRegister.addEventListener('click', () => {
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });
    
    loginSubmit.addEventListener('click', login);
    registerSubmit.addEventListener('click', register);
    logoutBtn.addEventListener('click', logout);
    
    // Product listeners
    searchInput.addEventListener('input', debounce(loadProducts, 300));
    categoryFilter.addEventListener('change', loadProducts);
    addProductBtn.addEventListener('click', () => {
        addProductModal.classList.remove('hidden');
    });
    
    // Cart listeners
    clearCartBtn.addEventListener('click', clearCart);
    checkoutBtn.addEventListener('click', () => {
        checkoutModal.classList.remove('hidden');
    });
    
    // Modal listeners
    document.getElementById('cancelAddProduct').addEventListener('click', () => {
        addProductModal.classList.add('hidden');
    });
    
    document.getElementById('submitAddProduct').addEventListener('click', addProduct);
    
    document.getElementById('cancelCheckout').addEventListener('click', () => {
        checkoutModal.classList.add('hidden');
    });
    
    document.getElementById('submitCheckout').addEventListener('click', placeOrder);
}

// Auth Functions
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            showMainContent();
            showMessage('Login successful!', 'success');
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Login failed!', 'error');
    }
}

async function register() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, role })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            showMainContent();
            showMessage('Registration successful!', 'success');
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Registration failed!', 'error');
    }
}

async function getCurrentUser() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            showMainContent();
        } else {
            logout();
        }
    } catch (error) {
        logout();
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    authSection.classList.remove('hidden');
    mainContent.classList.add('hidden');
    userInfo.textContent = '';
    logoutBtn.classList.add('hidden');
}

function showMainContent() {
    authSection.classList.add('hidden');
    mainContent.classList.remove('hidden');
    userInfo.textContent = `Welcome, ${currentUser.name}!`;
    logoutBtn.classList.remove('hidden');
    
    if (currentUser.role === 'admin') {
        addProductBtn.classList.remove('hidden'); // ✅ Show for admin
    } else {
        addProductBtn.classList.add('hidden');    // ❌ Hide for customer
    }
    
    loadProducts();
    loadCart();
    loadOrders();
}

// Product Functions
async function loadProducts() {
    const search = searchInput.value;
    const category = categoryFilter.value;
    
    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        
        const response = await fetch(`${API_BASE}/products?${params}`);
        const data = await response.json();
        
        if (response.ok) {
            displayProducts(data.products);
        }
    } catch (error) {
        showMessage('Failed to load products', 'error');
    }
}

function displayProducts(products) {
    productsList.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'border rounded-lg p-4 hover:shadow-md transition-shadow';
        productCard.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}" class="w-full h-48 object-cover rounded-md mb-2">
            <h3 class="font-medium text-lg mb-1">${product.name}</h3>
            <p class="text-gray-600 text-sm mb-2">${product.description}</p>
            <p class="text-xl font-bold text-green-600 mb-2">$${product.price}</p>
            <p class="text-sm text-gray-500 mb-2">Stock: ${product.stock}</p>
            <p class="text-sm text-blue-600 mb-3">${product.category}</p>
            <button onclick="addToCart('${product._id}')" class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors">
                Add to Cart
            </button>
        `;
        productsList.appendChild(productCard);
    });
}

async function addProduct() {
    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value.toLowerCase(),
        stock: parseInt(document.getElementById('productStock').value),
        imageUrl: document.getElementById('productImage').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(productData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            addProductModal.classList.add('hidden');
            loadProducts();
            showMessage('Product added successfully!', 'success');
            
            // Clear form
            document.getElementById('productName').value = '';
            document.getElementById('productDescription').value = '';
            document.getElementById('productPrice').value = '';
            document.getElementById('productCategory').value = '';
            document.getElementById('productStock').value = '';
            document.getElementById('productImage').value = '';
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Failed to add product', 'error');
    }
}

// Cart Functions
async function addToCart(productId) {
    try {
        const response = await fetch(`${API_BASE}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            loadCart();
            showMessage('Item added to cart!', 'success');
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Failed to add item to cart', 'error');
    }
}

async function loadCart() {
    try {
        const response = await fetch(`${API_BASE}/cart`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayCart(data.cart);
        }
    } catch (error) {
        showMessage('Failed to load cart', 'error');
    }
}

function displayCart(cart) {
    cartItems.innerHTML = '';
    
    if (!cart.items || cart.items.length === 0) {
        cartItems.innerHTML = '<p class="text-gray-500">Your cart is empty</p>';
        cartTotal.textContent = 'Total: $0.00';
        return;
    }
    
    cart.items.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'flex items-center justify-between p-3 border rounded-md';
        cartItem.innerHTML = `
            <div class="flex items-center space-x-3">
                <img src="${item.product.imageUrl}" alt="${item.product.name}" class="w-12 h-12 object-cover rounded">
                <div>
                    <h4 class="font-medium">${item.product.name}</h4>
                    <p class="text-gray-600">$${item.price} × ${item.quantity}</p>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <button onclick="updateCartQuantity('${item.product._id}', ${item.quantity - 1})" class="bg-gray-200 px-2 py-1 rounded">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateCartQuantity('${item.product._id}', ${item.quantity + 1})" class="bg-gray-200 px-2 py-1 rounded">+</button>
                <button onclick="removeFromCart('${item.product._id}')" class="bg-red-500 text-white px-2 py-1 rounded ml-2">Remove</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = `Total: $${cart.totalAmount.toFixed(2)}`;
}

async function updateCartQuantity(productId, quantity) {
    if (quantity < 1) return;
    
    try {
        const response = await fetch(`${API_BASE}/cart/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ productId, quantity })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            loadCart();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Failed to update cart', 'error');
    }
}

async function removeFromCart(productId) {
    try {
        const response = await fetch(`${API_BASE}/cart/remove/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            loadCart();
            showMessage('Item removed from cart!', 'success');
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Failed to remove item from cart', 'error');
    }
}

async function clearCart() {
    try {
        const response = await fetch(`${API_BASE}/cart/clear`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            loadCart();
            showMessage('Cart cleared!', 'success');
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Failed to clear cart', 'error');
    }
}

// Order Functions
async function placeOrder() {
    const shippingAddress = {
        street: document.getElementById('shippingStreet').value,
        city: document.getElementById('shippingCity').value,
        state: document.getElementById('shippingState').value,
        zipCode: document.getElementById('shippingZip').value,
        country: document.getElementById('shippingCountry').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ shippingAddress })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            checkoutModal.classList.add('hidden');
            loadCart();
            loadOrders();
            showMessage('Order placed successfully!', 'success');
            
            // Clear form
            document.getElementById('shippingStreet').value = '';
            document.getElementById('shippingCity').value = '';
            document.getElementById('shippingState').value = '';
            document.getElementById('shippingZip').value = '';
            document.getElementById('shippingCountry').value = '';
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Failed to place order', 'error');
    }
}

async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE}/orders/my-orders`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayOrders(data.orders);
        }
    } catch (error) {
        showMessage('Failed to load orders', 'error');
    }
}

function displayOrders(orders) {
    ordersList.innerHTML = '';
    
    if (!orders || orders.length === 0) {
        ordersList.innerHTML = '<p class="text-gray-500">No orders found</p>';
        return;
    }
    
    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'border rounded-lg p-4 mb-4';
        orderCard.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-medium">Order #${order.orderNumber}</h4>
                <span class="px-2 py-1 rounded text-sm ${getStatusColor(order.status)}">${order.status}</span>
            </div>
            <p class="text-gray-600">Total: $${order.totalAmount.toFixed(2)}</p>
            <p class="text-gray-600">Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p class="text-gray-600">Items: ${order.items.length}</p>
        `;
        ordersList.appendChild(orderCard);
    });
}

function getStatusColor(status) {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800',
        processing: 'bg-blue-100 text-blue-800',
        shipped: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

// Utility Functions
function showMessage(message, type) {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-md text-white z-50 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Global functions for onclick handlers
window.addToCart = addToCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;