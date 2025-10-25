
// Sample data
let inventory = [
    { id: 1, name: 'Laptop Computer', sku: 'LAP001', quantity: 25, location: 'A1-B2' },
    { id: 2, name: 'Office Chair', sku: 'CHR001', quantity: 15, location: 'B2-C3' },
    { id: 3, name: 'Desk Lamp', sku: 'LMP001', quantity: 8, location: 'C1-A2' },
    { id: 4, name: 'Monitor', sku: 'MON001', quantity: 12, location: 'A2-B1' },
    { id: 5, name: 'Keyboard', sku: 'KEY001', quantity: 30, location: 'C2-A3' }
];

let orders = [
    { id: 'ORD001', customer: 'ABC Corp', status: 'Pending', date: '2024-01-15', items: ['Laptop Computer x2', 'Office Chair x1'] },
    { id: 'ORD002', customer: 'XYZ Ltd', status: 'Shipped', date: '2024-01-14', items: ['Desk Lamp x3'] },
    { id: 'ORD003', customer: 'Tech Solutions', status: 'Processing', date: '2024-01-13', items: ['Laptop Computer x1', 'Desk Lamp x2'] },
    { id: 'ORD004', customer: 'Global Inc', status: 'Delivered', date: '2024-01-12', items: ['Monitor x2', 'Keyboard x2'] },
    { id: 'ORD005', customer: 'StartUp Co', status: 'Pending', date: '2024-01-11', items: ['Office Chair x3'] }
];

// DOM elements
const loginPage = document.getElementById('loginPage');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const userDisplay = document.getElementById('userDisplay');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

function initializeEventListeners() {
    // Password visibility toggle
    document.getElementById('togglePassword').addEventListener('click', togglePasswordVisibility);
    
    // Login functionality
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout functionality
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', handleNavigation);
    });
    
    // Modal event listeners
    setupModalEventListeners();
    
    // Form event listeners
    setupFormEventListeners();
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    const eyeOffIcon = document.getElementById('eyeOffIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.add('hidden');
        eyeOffIcon.classList.remove('hidden');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('hidden');
        eyeOffIcon.classList.add('hidden');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username && password) {
        userDisplay.textContent = username;
        loginPage.classList.add('hidden');
        dashboard.classList.remove('hidden');
        loadInventory();
        loadOrders();
        updateReports();
        showNotification(`Welcome back, ${username}!`);
    }
}

function handleLogout() {
    dashboard.classList.add('hidden');
    loginPage.classList.remove('hidden');
    loginForm.reset();
    
    // Reset password visibility
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    const eyeOffIcon = document.getElementById('eyeOffIcon');
    passwordInput.type = 'password';
    eyeIcon.classList.remove('hidden');
    eyeOffIcon.classList.add('hidden');
    
    showNotification('Logged out successfully');
}

function handleNavigation() {
    const section = this.dataset.section;
    
    // Update active nav
    document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.remove('text-white', 'border-b-2', 'border-blue-500');
        b.classList.add('text-gray-300');
    });
    this.classList.add('text-white', 'border-b-2', 'border-blue-500');
    this.classList.remove('text-gray-300');
    
    // Show section
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(section + 'Section').classList.remove('hidden');
}

function setupModalEventListeners() {
    // Add item modal
    document.getElementById('addItemBtn').addEventListener('click', () => {
        document.getElementById('addItemModal').classList.remove('hidden');
    });
    
    document.getElementById('cancelAddItem').addEventListener('click', () => {
        document.getElementById('addItemModal').classList.add('hidden');
        document.getElementById('addItemForm').reset();
    });
    
    // Edit item modal
    document.getElementById('cancelEditItem').addEventListener('click', () => {
        document.getElementById('editItemModal').classList.add('hidden');
        document.getElementById('editItemForm').reset();
    });
    
    // Order modals
    document.getElementById('closeViewOrder').addEventListener('click', () => {
        document.getElementById('viewOrderModal').classList.add('hidden');
    });
    
    document.getElementById('cancelUpdateOrder').addEventListener('click', () => {
        document.getElementById('updateOrderModal').classList.add('hidden');
        document.getElementById('updateOrderForm').reset();
    });
    
    // Items list modal
    document.getElementById('closeItemsList').addEventListener('click', () => {
        document.getElementById('itemsListModal').classList.add('hidden');
    });
    
    // Create order button
    document.getElementById('createOrderBtn').addEventListener('click', function() {
        showNotification('Create order functionality would integrate with AWS API here');
    });
}

function setupFormEventListeners() {
    // Add item form
    document.getElementById('addItemForm').addEventListener('submit', handleAddItem);
    
    // Edit item form
    document.getElementById('editItemForm').addEventListener('submit', handleEditItem);
    
    // Update order form
    document.getElementById('updateOrderForm').addEventListener('submit', handleUpdateOrder);
}

function handleAddItem(e) {
    e.preventDefault();
    
    const newItem = {
        id: Math.max(...inventory.map(i => i.id)) + 1,
        name: document.getElementById('itemName').value,
        sku: document.getElementById('itemSku').value,
        quantity: parseInt(document.getElementById('itemQuantity').value),
        location: document.getElementById('itemLocation').value
    };
    
    inventory.push(newItem);
    loadInventory();
    updateReports();
    document.getElementById('addItemModal').classList.add('hidden');
    document.getElementById('addItemForm').reset();
    showNotification(`${newItem.name} added successfully`);
}

function handleEditItem(e) {
    e.preventDefault();
    
    const itemId = parseInt(document.getElementById('editItemId').value);
    const itemIndex = inventory.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
        const updatedItem = {
            id: itemId,
            name: document.getElementById('editItemName').value,
            sku: document.getElementById('editItemSku').value,
            quantity: parseInt(document.getElementById('editItemQuantity').value),
            location: document.getElementById('editItemLocation').value
        };
        
        inventory[itemIndex] = updatedItem;
        loadInventory();
        updateReports();
        document.getElementById('editItemModal').classList.add('hidden');
        document.getElementById('editItemForm').reset();
        showNotification(`${updatedItem.name} updated successfully`);
    }
}

function handleUpdateOrder(e) {
    e.preventDefault();
    
    const orderId = document.getElementById('updateOrderId').value;
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].customer = document.getElementById('updateOrderCustomer').value;
        orders[orderIndex].status = document.getElementById('updateOrderStatus').value;
        
        loadOrders();
        updateReports();
        document.getElementById('updateOrderModal').classList.add('hidden');
        document.getElementById('updateOrderForm').reset();
        showNotification(`Order ${orderId} updated successfully`);
    }
}

// Load inventory table
function loadInventory() {
    const tbody = document.getElementById('inventoryTable');
    tbody.innerHTML = '';
    
    inventory.forEach(item => {
        const row = document.createElement('tr');
        const quantityClass = item.quantity < 10 ? 'text-red-600 font-semibold' : 'text-gray-500';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.sku}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm ${quantityClass}">${item.quantity}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.location}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3" onclick="editItem(${item.id})">Edit</button>
                <button class="text-red-600 hover:text-red-900" onclick="deleteItem(${item.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load orders table
function loadOrders() {
    const tbody = document.getElementById('ordersTable');
    tbody.innerHTML = '';
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        const statusClass = getStatusClass(order.status);
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.customer}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="${statusClass}">${order.status}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.date}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3" onclick="viewOrder('${order.id}')">View</button>
                <button class="text-green-600 hover:text-green-900" onclick="updateOrder('${order.id}')">Update</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getStatusClass(status) {
    const statusClasses = {
        'Pending': 'status-pending',
        'Processing': 'status-processing',
        'Shipped': 'status-shipped',
        'Delivered': 'status-delivered',
        'Cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-pending';
}

// Update reports
function updateReports() {
    document.getElementById('totalItems').textContent = inventory.length;
    document.getElementById('pendingOrders').textContent = orders.filter(o => o.status === 'Pending').length;
    document.getElementById('lowStockItems').textContent = inventory.filter(i => i.quantity < 10).length;
}

// Item management functions
function editItem(id) {
    const item = inventory.find(i => i.id === id);
    if (item) {
        document.getElementById('editItemId').value = item.id;
        document.getElementById('editItemName').value = item.name;
        document.getElementById('editItemSku').value = item.sku;
        document.getElementById('editItemQuantity').value = item.quantity;
        document.getElementById('editItemLocation').value = item.location;
        
        document.getElementById('editItemModal').classList.remove('hidden');
    }
}

function deleteItem(id) {
    const item = inventory.find(i => i.id === id);
    if (item) {
        // Create inline confirmation
        const confirmDiv = document.createElement('div');
        confirmDiv.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4';
        confirmDiv.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
                <p class="text-sm text-gray-600 mb-6">Are you sure you want to delete "${item.name}"? This action cannot be undone.</p>
                <div class="flex justify-end space-x-3">
                    <button id="cancelDelete" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md">
                        Cancel
                    </button>
                    <button id="confirmDelete" class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md">
                        Delete
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmDiv);
        
        document.getElementById('cancelDelete').addEventListener('click', () => {
            document.body.removeChild(confirmDiv);
        });
        
        document.getElementById('confirmDelete').addEventListener('click', () => {
            inventory = inventory.filter(i => i.id !== id);
            loadInventory();
            updateReports();
            document.body.removeChild(confirmDiv);
            showNotification(`${item.name} has been deleted`);
        });
    }
}

// Order management functions
function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        document.getElementById('viewOrderId').textContent = order.id;
        document.getElementById('viewOrderCustomer').textContent = order.customer;
        document.getElementById('viewOrderStatus').textContent = order.status;
        document.getElementById('viewOrderDate').textContent = order.date;
        
        const itemsDiv = document.getElementById('viewOrderItems');
        itemsDiv.innerHTML = order.items.map(item => `<div class="py-1">${item}</div>`).join('');
        
        document.getElementById('viewOrderModal').classList.remove('hidden');
    }
}

function updateOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        document.getElementById('updateOrderId').value = order.id;
        document.getElementById('updateOrderCustomer').value = order.customer;
        document.getElementById('updateOrderStatus').value = order.status;
        
        document.getElementById('updateOrderModal').classList.remove('hidden');
    }
}

// Report functions
function showAllItems() {
    showItemsList('All Items', inventory);
}

function showPendingOrders() {
    const pendingOrdersList = orders.filter(o => o.status === 'Pending');
    document.getElementById('itemsListTitle').textContent = 'Pending Orders';
    
    const tbody = document.getElementById('itemsListTable');
    tbody.innerHTML = '';
    
    // Update table headers for orders
    const thead = tbody.parentElement.querySelector('thead tr');
    thead.innerHTML = `
        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
    `;
    
    pendingOrdersList.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-4 py-2 text-sm text-gray-900">${order.id}</td>
            <td class="px-4 py-2 text-sm text-gray-500">${order.customer}</td>
            <td class="px-4 py-2 text-sm"><span class="status-pending">${order.status}</span></td>
            <td class="px-4 py-2 text-sm text-gray-500">${order.date}</td>
        `;
        tbody.appendChild(row);
    });
    
    document.getElementById('itemsListModal').classList.remove('hidden');
}

function showLowStockItems() {
    const lowStockItems = inventory.filter(i => i.quantity < 10);
    showItemsList('Low Stock Items (< 10)', lowStockItems);
}

function showItemsList(title, items) {
    document.getElementById('itemsListTitle').textContent = title;
    
    // Reset table headers for items
    const thead = document.querySelector('#itemsListModal thead tr');
    thead.innerHTML = `
        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
    `;
    
    const tbody = document.getElementById('itemsListTable');
    tbody.innerHTML = '';
    
    items.forEach(item => {
        const row = document.createElement('tr');
        const quantityClass = item.quantity < 10 ? 'text-red-600 font-semibold' : 'text-gray-500';
        row.innerHTML = `
            <td class="px-4 py-2 text-sm text-gray-900">${item.name}</td>
            <td class="px-4 py-2 text-sm text-gray-500">${item.sku}</td>
            <td class="px-4 py-2 text-sm ${quantityClass}">${item.quantity}</td>
            <td class="px-4 py-2 text-sm text-gray-500">${item.location}</td>
        `;
        tbody.appendChild(row);
    });
    
    document.getElementById('itemsListModal').classList.remove('hidden');
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : 'bg-blue-600';
    
    notification.className = `notification fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Utility functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function generateOrderId() {
    const prefix = 'ORD';
    const number = String(orders.length + 1).padStart(3, '0');
    return prefix + number;
}

// Export functions for global access (needed for onclick handlers)
window.editItem = editItem;
window.deleteItem = deleteItem;
window.viewOrder = viewOrder;
window.updateOrder = updateOrder;
window.showAllItems = showAllItems;
window.showPendingOrders = showPendingOrders;
window.showLowStockItems = showLowStockItems;
