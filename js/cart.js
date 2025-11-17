document.addEventListener('DOMContentLoaded', () => {
    const isCartPage = document.querySelector('body.cart-page');
    const isPaymentPage = document.querySelector('body.payment-page');

    // Run cart rendering logic only on the cart page
    if (isCartPage) {
        renderCartItems();
        updateCartTotals();
    }

    if (isPaymentPage) {
        renderOrderSummary();
    }

    // Add event listeners for all "Add to Cart" buttons on any page
    document.querySelectorAll('.add-to-cart-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card, .purchase-item');
            if (card) {
                let id = card.dataset.productId;
                let name = card.dataset.productName;
                const price = parseFloat(card.dataset.productPrice);
                const image = card.dataset.productImage;

                // Check if there's a size selector in the card
                const sizeSelector = card.querySelector('.size-selector select');
                let selectedSize = null;

                if (sizeSelector) {
                    selectedSize = sizeSelector.value;
                    // Create a unique ID for the product-size combination
                    id = `${id}-${selectedSize}`;
                    // Append the size to the product name
                    name = `${name} (Size: ${selectedSize})`;
                }

                addItemToCart(id, name, price, image, 1);
                
                // Optional: Give user feedback
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i> Added!';
                setTimeout(() => {
                    button.innerHTML = originalText;
                }, 1500);
            }
        });
    });
});

/**
 * Adds an item to the cart in localStorage.
 * @param {string} id - The product ID.
 * @param {string} name - The product name.
 * @param {number} price - The product price.
 * @param {string} image - The product image URL.
 * @param {number} quantity - The quantity to add.
 */
function addItemToCart(id, name, price, image, quantity) {
    let cart = JSON.parse(localStorage.getItem('miCasaCart')) || [];
    
    // Check if item already exists
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id, name, price, image, quantity: quantity });
    }

    localStorage.setItem('miCasaCart', JSON.stringify(cart));
    updateCartIcon();
}

/**
 * Renders the cart items from localStorage onto the cart page.
 */
function renderCartItems() {
    const cart = JSON.parse(localStorage.getItem('miCasaCart')) || [];
    const cartItemsList = document.querySelector('.cart-items-list');
    
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<p>Your cart is empty. <a href="merch.html">Start shopping!</a></p>';
        return;
    }

    cartItemsList.innerHTML = cart.map(item => `
        <div class="cart-item" data-product-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p class="item-price" data-unit-price="${item.price}">R ${item.price.toFixed(2)}</p>
                <div class="quantity-selector">
                    <label for="qty-${item.id}">Qty:</label>
                    <input type="number" id="qty-${item.id}" value="${item.quantity}" min="1" onchange="updateQuantity('${item.id}', this.value)">
                </div>
            </div>
            <button class="remove-item-button" title="Remove Item" onclick="removeItemFromCart('${item.id}')"><i class="fas fa-times"></i></button>
        </div>
    `).join('');
}

/**
 * Updates the quantity of an item in the cart.
 * @param {string} id - The product ID.
 * @param {number} quantity - The new quantity.
 */
function updateQuantity(id, quantity) {
    let cart = JSON.parse(localStorage.getItem('miCasaCart')) || [];
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity = parseInt(quantity, 10);
    }
    localStorage.setItem('miCasaCart', JSON.stringify(cart));
    updateCartTotals();
}

/**
 * Removes an item from the cart.
 * @param {string} id - The product ID.
 */
function removeItemFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('miCasaCart')) || [];
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('miCasaCart', JSON.stringify(cart));
    
    // Re-render the cart to show the item has been removed
    renderCartItems();
    updateCartTotals();
    updateCartIcon();
}

/**
 * Calculates and updates the subtotal and total in the order summary.
 */
function updateCartTotals() {
    const cart = JSON.parse(localStorage.getItem('miCasaCart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = cart.length > 0 ? 100.00 : 0; // Fixed shipping if cart is not empty
    const total = subtotal + shipping;

    document.getElementById('cart-subtotal').textContent = `R ${subtotal.toFixed(2)}`;
    document.getElementById('cart-shipping').textContent = `R ${shipping.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `R ${total.toFixed(2)}`;
}

/**
 * Updates the cart icon with a badge showing the number of items.
 */
function updateCartIcon() {
    const cart = JSON.parse(localStorage.getItem('miCasaCart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartIcon = document.querySelector('a[href="cart.html"]');

    if (cartIcon) {
        // Remove existing badge if it exists
        const existingBadge = cartIcon.querySelector('.cart-badge');
        if (existingBadge) {
            existingBadge.remove();
        }

        // Add new badge if there are items in the cart
        if (totalItems > 0) {
            const badge = document.createElement('span');
            badge.classList.add('cart-badge');
            badge.textContent = totalItems;
            cartIcon.style.position = 'relative';
            cartIcon.appendChild(badge);
        }
    }
}

// Initial call to set the cart icon state on page load
document.addEventListener('DOMContentLoaded', updateCartIcon);

/**
 * Renders a compact order summary on the checkout page.
 */
function renderOrderSummary() {
    const bookingDetails = JSON.parse(localStorage.getItem('bookingDetails'));
    const cart = JSON.parse(localStorage.getItem('miCasaCart')) || [];
    const summaryItemsList = document.getElementById('summary-items-list');

    let subtotal = 0;
    let shipping = 0; // Or service fee for bookings
    let total = 0;

    if (cart.length > 0) {
        // --- Handle Merchandise Cart ---
        summaryItemsList.innerHTML = cart.map(item => `
            <div class="summary-item">
                <span>${item.name} (x${item.quantity})</span>
                <span>R ${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
        subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        shipping = 100.00; // Fixed shipping for merch
        total = subtotal + shipping;

        // If there are booking details, clear them to prevent conflicts on next visit
        if (bookingDetails) {
            localStorage.removeItem('bookingDetails');
        }

    } else if (bookingDetails) {
        // --- Handle Booking Details ---
        summaryItemsList.innerHTML = bookingDetails.tickets
            .filter(ticket => ticket.qty > 0)
            .map(ticket => `
                <div class="summary-item">
                    <span>${bookingDetails.event.title} - ${ticket.name} (x${ticket.qty})</span>
                    <span>R ${(ticket.price * ticket.qty).toFixed(2)}</span>
                </div>
            `).join('');

        if (bookingDetails.specialRequests) {
            summaryItemsList.innerHTML += `
                <div class="summary-item" style="font-size: 0.8em; color: #ccc; flex-direction: column; align-items: flex-start;">
                    <strong>Special Requests:</strong>
                    <span>${bookingDetails.specialRequests}</span>
                </div>`;
        }

        subtotal = bookingDetails.tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.qty), 0);
        shipping = bookingDetails.serviceFee; // This is the service fee
        total = bookingDetails.total;

        // Update the "Shipping" label to "Service Fee"
        const shippingRow = document.getElementById('summary-shipping')?.parentElement;
        if (shippingRow) {
            const shippingLabel = shippingRow.querySelector('span:first-child');
            if (shippingLabel) {
                shippingLabel.textContent = 'Service Fee';
            }
        }

    } else {
        summaryItemsList.innerHTML = '<p>Your cart is empty.</p>';
    }

    // Update total fields
    document.getElementById('summary-subtotal').textContent = `R ${subtotal.toFixed(2)}`;
    document.getElementById('summary-shipping').textContent = `R ${shipping.toFixed(2)}`;
    document.getElementById('summary-total').textContent = `R ${total.toFixed(2)}`;
}