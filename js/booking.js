document.addEventListener('DOMContentLoaded', () => {
    // --- Data for our events ---
    const eventsData = {
        la: {
            title: "The Cosmic Arena - Los Angeles",
            date: "Dec 15, 2025",
            time: "8:00 PM",
            description: "Get ready for an unforgettable night as Mi Casa takes over The Cosmic Arena. Experience the hits from 'We Made It' and 'Familia' live in one of LA's most iconic venues. This will be a night of pure energy, soulful music, and non-stop dancing.",
            images: [
                'images/venue1pic.jpg',
                'images/venue1pic2.png',
                'images/venue1pic3.jpg',
                'images/venue1pic4.jpg'
            
            ]
        },
        ny: {
            title: "Galaxy Theater - New York",
            date: "Dec 22, 2025",
            time: "7:30 PM",
            description: "Mi Casa brings their electrifying performance to the heart of New York City. The Galaxy Theater will come alive with the sounds of Afro-House. Don't miss this East Coast spectacle!",
            images: [
              'images/venue2pic1.webp',
              'images/venue2pic2.png',
              'images/venue2pic3.webp',
              'images/venue2pic4.webp'
            
            ]
        },
        ct: {
            title: "Stellar Dome - Cape Town",
            date: "Jan 12, 2026",
            time: "8:00 PM",
            description: "A homecoming show! Join Mi Casa under the stars at the magnificent Stellar Dome in Cape Town for a magical night of music, rhythm, and celebration.",
            images: [
            'images/venue3pic1.webp',
              'images/venue3pic2.webp',
              'images/venue3pic3.webp',
              'images/venue3pic4.webp'
            
            ]
        }
    };

    // --- CONFIGURATION ---
    const SERVICE_FEE = 50.00;
    const CURRENCY = 'R';

    // --- DOM ELEMENTS ---
    const bookingForm = document.getElementById('booking-form');
    const gaTicketsInput = document.getElementById('ga-tickets');
    const vipTicketsInput = document.getElementById('vip-tickets');
    const subtotalEl = document.getElementById('booking-subtotal');
    const feeEl = document.getElementById('booking-fee');
    const totalEl = document.getElementById('booking-total');
    const paymentButton = document.getElementById('proceed-to-payment');
    const calendarHeaderEl = document.getElementById('calendar-header');
    const calendarGridEl = document.getElementById('calendar-grid');
    const modal = document.getElementById('confirmation-modal');
    const confirmBtn = document.getElementById('confirm-booking');
    const cancelBtn = document.getElementById('cancel-booking');

    // --- State for booking details ---
    let bookingDetailsForConfirmation = null;

    // --- State for the calendar ---
    let currentCalendarDate = new Date();

    // --- Ticket Calculation Logic ---
    const gaPrice = parseFloat(document.querySelector('.ticket-type [for="ga-tickets"] + .ticket-price').dataset.price);
    const vipPrice = parseFloat(document.querySelector('.ticket-type [for="vip-tickets"] + .ticket-price').dataset.price);

    /**
     * Parses a date string in "Mmm DD, YYYY" format into a Date object.
     * This is more reliable than `new Date(string)`.
     * @param {string} dateString - The date string to parse (e.g., "Dec 15, 2025").
     * @returns {Date}
     */
    function parseEventDate(dateString) {
        const parts = dateString.replace(',', '').split(' '); // -> ["Dec", "15", "2025"]
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames.indexOf(parts[0]);
        const day = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }

    function updateTotals() {
        const gaQty = parseInt(gaTicketsInput.value, 10) || 0;
        const vipQty = parseInt(vipTicketsInput.value, 10) || 0;

        const subtotal = (gaQty * gaPrice) + (vipQty * vipPrice);
        const totalTickets = gaQty + vipQty;
        const currentFee = totalTickets > 0 ? SERVICE_FEE : 0;
        const total = subtotal + currentFee;

        // Update the UI
        subtotalEl.textContent = `${CURRENCY} ${subtotal.toFixed(2)}`;
        feeEl.textContent = `${CURRENCY} ${currentFee.toFixed(2)}`;
        totalEl.textContent = `${CURRENCY} ${total.toFixed(2)}`;

        // Enable or disable the payment button
        if (totalTickets > 0) {
            paymentButton.disabled = false;
            paymentButton.style.opacity = 1;
        } else {
            paymentButton.disabled = true;
            paymentButton.style.opacity = 0.5;
        }
    }

    /**
     * Renders a calendar for a given month and year, highlighting available event dates.
     * @param {Date} date - The date to determine the month and year to render.
     * @param {string} selectedEventId - The ID of the currently selected event.
     */
    function renderCalendar(date, selectedEventId) {
        const year = date.getFullYear();
        const month = date.getMonth();
        currentCalendarDate = new Date(year, month, 1);

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        
        // Add navigation buttons to the header
        calendarHeaderEl.innerHTML = `
            <button id="prev-month" class="calendar-nav-button" aria-label="Previous month">&lt;</button>
            <span>${monthNames[month]} ${year}</span>
            <button id="next-month" class="calendar-nav-button" aria-label="Next month">&gt;</button>
        `;
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        calendarGridEl.innerHTML = ''; // Clear previous calendar

        // Add day names
        ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(day => {
            calendarGridEl.innerHTML += `<div class="day-name">${day}</div>`;
        });

        // Add empty cells for the first week
        for (let i = 0; i < firstDay; i++) {
            calendarGridEl.innerHTML += `<div class="day past"></div>`;
        }

        // Get all available event dates for the current month
        const availableDates = {};
        for (const eventId in eventsData) {
            const eventDate = parseEventDate(eventsData[eventId].date);
            if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
                availableDates[eventDate.getDate()] = eventId;
            }
        }

        // Add day cells
        for (let day = 1; day <= daysInMonth; day++) {
            let classes = 'day';
            let eventIdForDay = availableDates[day];
            if (eventIdForDay) {
                classes += ' available';
                if (eventIdForDay === selectedEventId) {
                    classes += ' selected';
                }
            }
            calendarGridEl.innerHTML += `<div class="${classes}" data-day="${day}">${day}</div>`;
        }
    }

    /**
     * Updates all page content based on the selected event ID.
     * @param {string} eventId - The ID of the event to display (e.g., 'la', 'ny').
     */
    function updatePageForEvent(eventId) {
        const event = eventsData[eventId];
        if (!event) return;

        document.getElementById('event-title').textContent = event.title;
        document.getElementById('event-date').innerHTML = `<i class="fas fa-calendar-alt"></i> ${event.date}`;
        document.getElementById('event-time').innerHTML = `<i class="fas fa-clock"></i> ${event.time}`;
        document.getElementById('event-description').textContent = event.description;

        // Update the venue gallery images
        const galleryImages = document.querySelectorAll('.booking-image-gallery .gallery-image');
        galleryImages.forEach((imgDiv, index) => {
            imgDiv.style.backgroundImage = `url('${event.images[index]}')`;
        });

        renderCalendar(parseEventDate(event.date), eventId);
        updateTotals();
    }

    // Add event listeners for ticket inputs
    gaTicketsInput.addEventListener('input', updateTotals);
    vipTicketsInput.addEventListener('input', updateTotals);

    // --- Calendar Event Handling (Event Delegation) ---
    if (calendarGridEl) {
        calendarGridEl.addEventListener('click', (e) => {
            // Check if an available day was clicked
            const clickedDayEl = e.target.closest('.day.available');
            if (clickedDayEl) {
                const day = clickedDayEl.dataset.day;
                const year = currentCalendarDate.getFullYear();
                const month = currentCalendarDate.getMonth();

                // Find the eventId for the clicked day
                for (const eventId in eventsData) {
                    const eventDate = parseEventDate(eventsData[eventId].date);
                    if (eventDate.getFullYear() === year && eventDate.getMonth() === month && eventDate.getDate() == day) { // Note: `==` is fine here for string/number comparison
                        // --- Immediate Visual Feedback ---
                        // Remove 'selected' from any currently selected day
                        const currentlySelected = calendarGridEl.querySelector('.day.selected');
                        if (currentlySelected) {
                            currentlySelected.classList.remove('selected');
                        }
                        // Add 'selected' to the clicked day
                        clickedDayEl.classList.add('selected');

                        // Update URL without reloading the page
                        const newUrl = `${window.location.pathname}?event=${eventId}`;
                        window.history.pushState({ path: newUrl }, '', newUrl);
                        updatePageForEvent(eventId);
                        break; // Exit loop once found
                    }
                }
            }
        });
    }

    if (calendarHeaderEl) {
        calendarHeaderEl.addEventListener('click', (e) => {
            const selectedEventId = new URLSearchParams(window.location.search).get('event') || 'la';
            if (e.target.matches('#prev-month')) {
                currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
                renderCalendar(currentCalendarDate, selectedEventId);
            } else if (e.target.matches('#next-month')) {
                currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
                renderCalendar(currentCalendarDate, selectedEventId);
            }
        });
    }

    // Handle form submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const gaQty = parseInt(gaTicketsInput.value) || 0;
            const vipQty = parseInt(vipTicketsInput.value) || 0;

            if (gaQty + vipQty === 0) {
                alert("Please select at least one ticket.");
                return;
            }

            const currentEventId = new URLSearchParams(window.location.search).get('event') || 'la';
            
            // --- Validate and sanitize special requests ---
            const specialRequestsInput = document.getElementById('special-requests');
            let specialRequests = specialRequestsInput.value.trim();

            // Sanitize the input to prevent HTML injection
            const tempDiv = document.createElement('div');
            tempDiv.textContent = specialRequests;
            const sanitizedRequests = tempDiv.innerHTML;


            // Create booking details object to pass to the next page
            bookingDetailsForConfirmation = {
                event: eventsData[currentEventId],
                tickets: [
                    { name: 'General Admission', qty: gaQty, price: gaPrice, },
                    { name: 'VIP Experience', qty: vipQty, price: vipPrice }
                ],
                specialRequests: sanitizedRequests, // Add sanitized requests
                serviceFee: SERVICE_FEE,
                total: parseFloat(totalEl.textContent.replace(`${CURRENCY} `, ''))
            };

            // --- Populate and show the confirmation modal ---
            document.getElementById('confirm-event-title').textContent = bookingDetailsForConfirmation.event.title;
            document.getElementById('confirm-event-date').textContent = bookingDetailsForConfirmation.event.date;
            document.getElementById('confirm-total').textContent = `${CURRENCY} ${bookingDetailsForConfirmation.total.toFixed(2)}`;
            
            const ticketsContainer = document.getElementById('confirm-tickets-container');
            ticketsContainer.innerHTML = ''; // Clear previous
            
            const ticketsSummary = bookingDetailsForConfirmation.tickets
                .filter(t => t.qty > 0)
                .map(t => `${t.qty} x ${t.name}`)
                .join('<br>');
            
            ticketsContainer.innerHTML = `<strong>Tickets:</strong><span>${ticketsSummary}</span>`;

            modal.classList.add('visible');
        });
    }

    // Handle modal button clicks
    if (modal) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('visible');
            bookingDetailsForConfirmation = null; // Clear details
        });

        confirmBtn.addEventListener('click', () => {
            if (bookingDetailsForConfirmation) {
                // Save to localStorage to be retrieved on the payment page
                localStorage.setItem('bookingDetails', JSON.stringify(bookingDetailsForConfirmation));

                // Redirect to payment page
                window.location.href = 'payment.html';
            }
        });
    }

    // --- INITIALIZATION ---
    // Get initial event ID from URL and populate the page
    const initialUrlParams = new URLSearchParams(window.location.search);
    const initialEventId = initialUrlParams.get('event') || 'la'; // Default to 'la'
    updatePageForEvent(initialEventId);
});