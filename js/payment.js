document.addEventListener('DOMContentLoaded', () => {
    const paymentForm = document.getElementById('payment-form');
    if (!paymentForm) return;

    // --- Initialize intl-tel-input ---
    const phoneInputField = document.querySelector("#phone-number");
    let phoneInput = null;
    if (phoneInputField) {
        phoneInput = window.intlTelInput(phoneInputField, {
            initialCountry: "za", // Default to South Africa
            utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js",
            separateDialCode: true,
            nationalMode: true,
        });
    }

    // --- Helper function to show/hide error messages ---
    const showError = (inputId, message) => {
        const errorEl = document.getElementById(`${inputId}-error`);
        const inputEl = document.getElementById(inputId);
        if (errorEl && inputEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            inputEl.style.borderColor = '#ff4d4d'; // Highlight the invalid field
        }
    };

    const clearError = (inputId) => {
        const errorEl = document.getElementById(`${inputId}-error`);
        const inputEl = document.getElementById(inputId);
        if (errorEl && inputEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
            inputEl.style.borderColor = ''; // Reset border color
        }
    };

    const clearAllErrors = () => {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });
        const formControls = paymentForm.querySelectorAll('input');
        formControls.forEach(input => {
            input.style.borderColor = '';
        });
    };

    // --- Toast Notification ---
    const showToast = (message) => {
        const toast = document.getElementById('toast-notification');
        const toastMessage = document.getElementById('toast-message');
        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.classList.add('show');

            // Hide the toast after a few seconds
            setTimeout(() => {
                toast.classList.remove('show');
            }, 4000); // Toast visible for 4 seconds
        }
    };

    // --- Validation Functions ---
    const validateRequired = (inputId, fieldName) => {
        const value = document.getElementById(inputId).value.trim();
        if (!value) {
            showError(inputId, `${fieldName} is required.`);
            return false;
        }
        clearError(inputId);
        return true;
    };

    const validateCardNumber = () => {
        const inputId = 'card-number';
        const cardNum = document.getElementById(inputId).value.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(cardNum)) {
            showError(inputId, 'Please enter a valid card number.');
            return false;
        }
        clearError(inputId);
        return true;
    };

    const validateExpiryDate = () => {
        const inputId = 'expiry-date';
        const expiry = document.getElementById(inputId).value.trim();
        const match = expiry.match(/^(\d{2})\s*\/\s*(\d{2})$/);

        if (!match) {
            showError(inputId, 'Please use MM / YY format.');
            return false;
        }

        const month = parseInt(match[1], 10);
        const year = parseInt(match[2], 10);
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;

        if (month < 1 || month > 12) {
            showError(inputId, 'Invalid month.');
            return false;
        }

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            showError(inputId, 'Card has expired.');
            return false;
        }

        clearError(inputId);
        return true;
    };

    const validateCVC = () => {
        const inputId = 'cvc';
        const cvc = document.getElementById(inputId).value.trim();
        if (!/^\d{3,4}$/.test(cvc)) {
            showError(inputId, 'Enter a valid 3 or 4 digit CVC.');
            return false;
        }
        clearError(inputId);
        return true;
    };

    const validatePostalCode = () => {
        const inputId = 'postal-code';
        const code = document.getElementById(inputId).value.trim();
        if (!/^\d{4,5}$/.test(code)) { // Common postal code formats
            showError(inputId, 'Enter a valid postal code.');
            return false;
        }
        clearError(inputId);
        return true;
    };

    const validatePhoneNumber = () => {
        const inputId = 'phone-number';
        if (!phoneInput) return false; // Don't validate if the input wasn't found

        if (phoneInput.isValidNumber()) {
            clearError(inputId);
            return true;
        } else {
            const errorCode = phoneInput.getValidationError();
            const errorMap = ["Invalid number", "Invalid country code", "Too short", "Too long", "Invalid number"];
            showError(inputId, errorMap[errorCode] || "Invalid phone number");
            return false;
        }
    };

    // --- Form Submission Handler ---
    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop form from submitting
        clearAllErrors();

        // Run all validations
        const isNameValid = validateRequired('full-name', 'Full Name');
        const isPhoneValid = validatePhoneNumber();
        const isAddressValid = validateRequired('address', 'Street Address');
        const isCityValid = validateRequired('city', 'City');
        const isPostalCodeValid = validatePostalCode();
        const isCountryValid = validateRequired('country', 'Country');
        const isCardNumberValid = validateCardNumber();
        const isExpiryValid = validateExpiryDate();
        const isCvcValid = validateCVC();

        // Check if all validations passed
        if (isNameValid && isPhoneValid && isAddressValid && isCityValid && isPostalCodeValid && isCountryValid && isCardNumberValid && isExpiryValid && isCvcValid) {
            // In a real application, you would now send the data to a payment gateway.
            // For this demo, we'll simulate success.
            showToast('Payment Successful! Thank you for your order.');

            // Wait for the toast to be seen before redirecting
            setTimeout(() => {
                // Clear cart and booking details from localStorage
                localStorage.removeItem('miCasaCart');
                localStorage.removeItem('bookingDetails');

                // Redirect to the homepage
                window.location.href = 'index.html';
            }, 2500); // Redirect after 2.5 seconds
        }
    });
});