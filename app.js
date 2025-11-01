// ============================
// ✅ API URLS
// ============================
const API_BASE = "https://99x9kefd8f.execute-api.ap-south-1.amazonaws.com/prod";
const GEMINI_API_KEY = "AIzaSyAP7JtEmTvQ9UkUu4q0jSHEg6R6o6XorOU"; 
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

// ============================
// ✅ NEW: COGNITO CONFIG
// ============================
// These are your IDs from the AWS Cognito User Pool.
const cognitoConfig = {
    UserPoolId: 'ap-south-1_PSXAa42Xy',
    ClientId: '7l367m6dbshit1u0u25j4qnmcr',
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(cognitoConfig);
let cognitoUser;
let userToken; // This is the JWT token

// ============================
// ⭐ NEW: Master List for Search
// ============================
let allInventoryItems = [];

// ============================
// NOTIFICATION SYSTEM
// ============================
const notification = document.getElementById("notification");
const notificationMessage = document.getElementById("notificationMessage");

function showNotification(message, isError = false) {
    notificationMessage.textContent = message;
    if (isError) {
        notification.classList.remove("bg-green-500");
        notification.classList.add("bg-red-500");
    } else {
        notification.classList.remove("bg-red-500");
        notification.classList.add("bg-green-500");
    }
    notification.classList.remove("hidden");
    setTimeout(() => notification.classList.add("hidden"), 3000);
}

// ============================
// LOGIN / SIGN UP LOGIC (COGNITO)
// ============================
const authPage = document.getElementById("authPage");
const dashboard = document.getElementById("dashboard");
const userDisplay = document.getElementById("userDisplay");
const logoutBtn = document.getElementById("logoutBtn");

// Forms
const loginForm = document.getElementById("loginForm");
const signUpForm = document.getElementById("signUpForm");
const confirmForm = document.getElementById("confirmForm");

// Form Containers
const loginFormContainer = document.getElementById("loginFormContainer");
const signUpFormContainer = document.getElementById("signUpFormContainer");
const confirmModal = document.getElementById("confirmModal");

// Buttons
const showSignUpBtn = document.getElementById("showSignUpBtn");
const showLoginBtn = document.getElementById("showLoginBtn");
const resendCodeBtn = document.getElementById("resendCodeBtn");

// Form Toggles
showSignUpBtn.addEventListener("click", () => {
    loginFormContainer.classList.add("hidden");
    signUpFormContainer.classList.remove("hidden");
});

showLoginBtn.addEventListener("click", () => {
    signUpFormContainer.classList.add("hidden");
    loginFormContainer.classList.remove("hidden");
});

// --- 1. Sign Up ---
signUpForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("signUpEmail").value;
    const password = document.getElementById("signUpPassword").value;

    const attributeList = [
        new AmazonCognitoIdentity.CognitoUserAttribute({
            Name: 'email',
            Value: email,
        })
    ];

    showNotification("Signing you up...", false);

    userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) {
            showNotification(err.message || JSON.stringify(err), true);
            return;
        }
        cognitoUser = result.user;
        document.getElementById("confirmEmailDisplay").textContent = email;
        signUpFormContainer.classList.add("hidden");
        authPage.classList.add("hidden"); 
        confirmModal.classList.remove("hidden"); 
        showNotification("Sign up successful! Please check your email for a confirmation code.", false);
    });
});

// --- 2. Confirm Sign Up ---
confirmForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = document.getElementById("confirmationCode").value;

    cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
            showNotification(err.message || JSON.stringify(err), true);
            return;
        }
        showNotification("Account confirmed! You can now sign in.", false);
        confirmModal.classList.add("hidden");
        authPage.classList.remove("hidden"); 
        loginFormContainer.classList.remove("hidden"); 
        signUpForm.reset();
        confirmForm.reset();
    });
});

// --- 3. Resend Code ---
resendCodeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (!cognitoUser) {
        showNotification("No user found to resend code to. Please try signing up again.", true);
        return;
    }
    cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
            showNotification(err.message || JSON.stringify(err), true);
            return;
        }
        showNotification("A new code has been sent to your email.", false);
    });
});

// --- 4. Sign In ---
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: email,
        Password: password,
    });

    cognitoUser = new AmazonCognitoIdentity.CognitoUser({
        Username: email,
        Pool: userPool,
    });

    showNotification("Signing you in...", false);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: async (result) => {
            userToken = result.getIdToken().getJwtToken(); 
            userDisplay.textContent = email; 
            authPage.classList.add("hidden");
            dashboard.classList.remove("hidden");
            try {
                await loadInventory();
            } catch (error) {
                showNotification(error.message, true);
            }
        },
        onFailure: (err) => {
            showNotification(err.message || JSON.stringify(err), true);
        },
    });
});

// --- 5. Logout ---
logoutBtn.addEventListener("click", () => {
    if (cognitoUser) {
        cognitoUser.signOut();
    }
    cognitoUser = null;
    userToken = null;
    allInventoryItems = []; // ⭐ NEW: Clear master list on logout
    searchInput.value = ""; // ⭐ NEW: Clear search input on logout

    dashboard.classList.add("hidden");
    authPage.classList.remove("hidden");
    loginFormContainer.classList.remove("hidden"); 
    signUpFormContainer.classList.add("hidden"); 
    confirmModal.classList.add("hidden"); 

    loginForm.reset();
    signUpForm.reset();
    confirmForm.reset();
});

// ============================
// NAVIGATION HANDLING
// ============================
document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".section").forEach((sec) => sec.classList.add("hidden"));
        document.querySelectorAll(".nav-btn").forEach((b) =>
            b.classList.remove("border-blue-500", "text-white")
        );
        const target = btn.dataset.section;
        document.getElementById(target + "Section").classList.remove("hidden");
        btn.classList.add("border-blue-500", "text-white");
    });
});

// ============================
// INVENTORY CRUD OPERATIONS
// ============================
const inventoryTable = document.getElementById("inventoryTable");
const addItemBtn = document.getElementById("addItemBtn");
const addItemModal = document.getElementById("addItemModal");
const addItemForm = document.getElementById("addItemForm");
const cancelAddItem = document.getElementById("cancelAddItem");
const editItemModal = document.getElementById("editItemModal");
const editItemForm = document.getElementById("editItemForm");
const cancelEditItem = document.getElementById("cancelEditItem");

// ⭐ NEW: Search Input
const searchInput = document.getElementById("searchInput");

addItemBtn.addEventListener("click", () => addItemModal.classList.remove("hidden"));
cancelAddItem.addEventListener("click", () => {
    addItemModal.classList.add("hidden");
    addItemForm.reset();
});
cancelEditItem.addEventListener("click", () => {
    editItemModal.classList.add("hidden");
    editItemForm.reset();
});

// ⭐ NEW: Add event listener for the search bar
searchInput.addEventListener("input", renderFilteredInventory);

// Load Inventory Items
async function loadInventory(returnItems = false) {
    if (API_BASE === "PASTE_YOUR_AWS_API_URL_HERE") {
        const msg = "AWS API_BASE URL is not set in app.js";
        if (!returnItems) showNotification(msg, true);
        renderInventoryTable([]);
        if (returnItems) throw new Error(msg);
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/items`, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        }); 
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                showNotification("Session expired. Please log in again.", true);
                logoutBtn.click();
            }
            throw new Error(`Failed to fetch inventory: ${response.statusText}`);
        }
        const items = await response.json();
        
        // ⭐ NEW: Store the full list in our master variable
        allInventoryItems = items;
        
        if (returnItems) return items;
        
        // ⭐ NEW: Render the table based on the (possibly filtered) search
        renderFilteredInventory();
        updateReportCards(items); // Update report cards with the full list
    } catch (error) {
        console.error("Error loading inventory:", error);
        if (!returnItems) showNotification(error.message, true);
        renderInventoryTable([]);
        if (returnItems) throw error;
    }
}

// ⭐ NEW: Function to render the table based on search
function renderFilteredInventory() {
    const searchTerm = searchInput.value.toLowerCase();
    
    // If search is empty, render the full list
    if (!searchTerm) {
        renderInventoryTable(allInventoryItems);
        return;
    }
    
    // Otherwise, filter the list
    const filteredItems = allInventoryItems.filter(item => 
        (item.itemName && item.itemName.toLowerCase().includes(searchTerm)) || 
        (item.sku && item.sku.toLowerCase().includes(searchTerm))
    );
    
    renderInventoryTable(filteredItems);
}


// Render inventory data into table
function renderInventoryTable(items) {
    inventoryTable.innerHTML = "";
    if (!Array.isArray(items) || items.length === 0) {
        inventoryTable.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-gray-500">No items found.</td></tr>`;
        return;
    }
    items.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${item.itemName}</td>
            <td class="px-6 py-4 whitespace-nowrap">${item.sku}</td>
            <td class="px-6 py-4 whitespace-nowrap">${item.quantity}</td>
            <td class="px-6 py-4 whitespace-nowrap">${item.location}</td>
            <td class="px-6 py-4 whitespace-nowrap space-x-2 text-sm">
                <button class="text-blue-600 hover:text-blue-800 edit-btn" data-id="${item.itemId}">Edit</button>
                <button class="text-red-600 hover:text-red-800 delete-btn" data-id="${item.itemId}">Delete</button>
            </td>`;
        inventoryTable.appendChild(row);
    });
    document.querySelectorAll(".edit-btn").forEach((btn) =>
        btn.addEventListener("click", () => openEditModal(btn.dataset.id))
    );
    document.querySelectorAll(".delete-btn").forEach((btn) =>
        btn.addEventListener("click", () => deleteItem(btn.dataset.id))
    );
}

// Add new item
addItemForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const item = {
        itemName: document.getElementById("itemName").value,
        sku: document.getElementById("itemSku").value,
        quantity: Number(document.getElementById("itemQuantity").value),
        location: document.getElementById("itemLocation").value,
    };

    try {
        const res = await fetch(`${API_BASE}/items`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error(`Failed to add item: ${res.statusText}`);
        showNotification("Item added successfully!", false);
        addItemModal.classList.add("hidden");
        addItemForm.reset();
        await loadInventory(); // This will reload the full list and re-apply the filter
    } catch (err) {
        console.error(err);
        showNotification(err.message, true);
    }
});

// Edit item - open modal
async function openEditModal(itemId) {
    if (API_BASE === "PASTE_YOUR_AWS_API_URL_HERE") {
        showNotification("AWS API_BASE URL is not set in app.js", true);
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/items/${itemId}`, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });
        if (!res.ok) throw new Error(`Failed to fetch item: ${res.statusText}`);
        const item = await res.json();
        document.getElementById("editItemId").value = item.itemId;
        document.getElementById("editItemName").value = item.itemName;
        document.getElementById("editItemSku").value = item.sku;
        document.getElementById("editItemQuantity").value = item.quantity;
        document.getElementById("editItemLocation").value = item.location;
        editItemModal.classList.remove("hidden");
    } catch (err) {
        console.error(err);
        showNotification(err.message, true);
    }
}

// Update item
editItemForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const itemId = document.getElementById("editItemId").value;
    const updatedItem = {
        itemName: document.getElementById("editItemName").value,
        sku: document.getElementById("editItemSku").value,
        quantity: Number(document.getElementById("editItemQuantity").value),
        location: document.getElementById("editItemLocation").value,
    };

    try {
        const res = await fetch(`${API_BASE}/items/${itemId}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify(updatedItem),
        });
        if (!res.ok) throw new Error(`Failed to update item: ${res.statusText}`);
        showNotification("Item updated. Refreshing list...", false);
        editItemModal.classList.add("hidden");
        await loadInventory(); // This will reload the full list and re-apply the filter
    } catch (err) {
        console.error(err);
        showNotification(err.message, true);
    }
});

// Delete item
async function deleteItem(itemId) {
    try {
        const res = await fetch(`${API_BASE}/items/${itemId}`, { 
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });
        if (!res.ok) throw new Error(`Failed to delete item: ${res.statusText}`);
        showNotification("Item deleted successfully!", false);
        await loadInventory(); // This will reload the full list and re-apply the filter
    } catch (err) {
        console.error(err);
        showNotification(err.message, true);
    }
}

// ============================
// REPORTS
// ============================
function updateReportCards(items) {
    const lowStockItems = items.filter(item => item.quantity < 10);
    document.getElementById("totalItems").textContent = items.length;
    document.getElementById("lowStockItems").textContent = lowStockItems.length;
    document.getElementById("pendingOrders").textContent = 0; // Placeholder
}

function showAllItems() {
    document.querySelector('.nav-btn[data-section="inventory"]').click();
}
function showPendingOrders() {
    showNotification("Order data is not connected (demo)", false);
}
function showLowStockItems() {
    showNotification("Report: Low stock items (demo)", false);
}


// ============================
// ✨ NEW GEMINI AI FEATURE
// ============================
const generateReportBtn = document.getElementById("generateReportBtn");
const geminiReportModal = document.getElementById("geminiReportModal");
const closeGeminiReport = document.getElementById("closeGeminiReport");
const geminiLoading = document.getElementById("geminiLoading");
const geminiReportContent = document.getElementById("geminiReportContent");

generateReportBtn.addEventListener("click", generateLowStockReport);
closeGeminiReport.addEventListener("click", () => {
    geminiReportModal.classList.add("hidden");
    geminiReportContent.innerHTML = "";
});

async function generateLowStockReport() {
    if (GEMINI_API_KEY === "PASTE_YOUR_GEMINI_API_KEY_HERE") {
        showNotification("GEMINI_API_KEY is not set in app.js", true);
        return;
    }

    geminiReportModal.classList.remove("hidden");
    geminiLoading.classList.remove("hidden");
    geminiReportContent.innerHTML = "";

    try {
        const items = await loadInventory(true);
        if (!items) return; 

        const lowStockItems = items.filter(item => item.quantity < 10);
        if (lowStockItems.length === 0) {
            geminiReportContent.innerHTML = "<p>No low stock items found. Great job!</p>";
            geminiLoading.classList.add("hidden");
            return;
        }

        let promptText = "You are a professional warehouse operations manager. The following items in my inventory are running low on stock:\n\n";
        lowStockItems.forEach(item => {
            promptText += `- Item: ${item.itemName}, SKU: ${item.sku}, Quantity: ${item.quantity}, Location: ${item.location}\n`;
        });
        promptText += "\nPlease write a brief, prioritized re-ordering report. Start with the most critical items (lowest quantity) first. Format it as a simple bulleted list with a brief summary and professional tone.";

        const aiResponse = await callGemini(promptText);
        
        let htmlResponse = aiResponse
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/•/g, '<li>')
            .replace(/\n/g, '<br>');
        htmlResponse = htmlResponse.replace(/<li>/g, '<ul class="list-disc pl-5"><li>');
        htmlResponse = htmlResponse.replace(/<br><ul/g, '<ul');
        htmlResponse = htmlResponse.replace(/<\/li><br>/g, '</li>');
        htmlResponse = htmlResponse.replace(/<\/li><br><br>/g, '</li></ul><br>');
        
        geminiReportContent.innerHTML = htmlResponse;

    } catch (error) {
        console.error("Error generating AI report:", error);
        geminiReportContent.innerHTML = `<p class="text-red-500">Error generating report: ${error.message}</p>`;
    } finally {
        geminiLoading.classList.add("hidden");
    }
}

async function callGemini(promptText) {
    const payload = {
        contents: [{
            parts: [{ text: promptText }]
        }]
    };

    let attempt = 0;
    const maxAttempts = 3;
    while (attempt < maxAttempts) {
        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                    return result.candidates[0].content.parts[0].text;
                } else {
                    throw new Error("Invalid response structure from Gemini API.");
                }
            } else if (response.status === 429 || response.status >= 500) {
                const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                attempt++;
            } else {
                const errorBody = await response.text();
                throw new Error(`Gemini API error: ${response.status} ${errorBody}`);
            }
        } catch (error) {
            const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            attempt++;
        }
    }
    throw new Error("Failed to call Gemini API after several attempts.");
}


// ============================
// PASSWORD TOGGLE
// ============================
const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("loginPassword"); // Corrected to loginPassword
const eyeIcon = document.getElementById("eyeIcon");
const eyeOffIcon = document.getElementById("eyeOffIcon");

togglePassword.addEventListener("click", () => {
    const type = password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);
    eyeIcon.classList.toggle("hidden");
    eyeOffIcon.classList.toggle("hidden");
});

