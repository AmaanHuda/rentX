/* ============================================================
   details.js — Vehicle details & booking page (details.html)
   ============================================================ */

const INSURANCE_FLAT = 500;
const TAX_RATE = 0.065; // ~6.5% applied to base rental

const root = document.getElementById("detailsRoot");
let currentVehicle = null;

/**
 * getVehicleIdFromUrl
 * Reads ?id=... from the current URL's query string.
 */
function getVehicleIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

/**
 * renderNotFound
 * Shown when the URL has no matching vehicle id.
 */
function renderNotFound() {
  root.innerHTML =
    '<div class="empty-state" style="padding:90px 20px;">' +
      '<h3>Vehicle not found</h3>' +
      '<p>This listing may have been removed. Head back and pick another vehicle.</p>' +
      '<br/><a class="btn btn-primary" href="index.html">Back to Vehicles</a>' +
    '</div>';
}

/**
 * renderDetailsPage
 * Paints the vehicle info + empty booking form shell for a found vehicle.
 */
function renderDetailsPage(v) {
  const today = new Date().toISOString().split("T")[0];

  root.innerHTML =
    '<div class="details-grid">' +
      '<div class="details-media">' +
        '<img src="' + v.image + '" alt="' + v.name + '" />' +
        '<div class="details-specs">' +
          '<div class="spec-box"><div class="label">Fuel</div><div class="value">' + v.fuel + '</div></div>' +
          '<div class="spec-box"><div class="label">Transmission</div><div class="value">' + v.transmission + '</div></div>' +
          '<div class="spec-box"><div class="label">Seats</div><div class="value">' + v.seats + '</div></div>' +
        '</div>' +
      '</div>' +

      '<div>' +
        '<div class="details-header">' +
          '<span class="type-pill">' + v.type + '</span>' +
          '<h1 style="margin-top:10px;">' + v.name + '</h1>' +
          '<p class="meta">' + (v.available ? "Available for booking" : "Currently unavailable") + '</p>' +
        '</div>' +
        '<div class="price-hero"><strong>₹' + v.pricePerDay.toLocaleString('en-IN') + '</strong><span>/ day</span></div>' +

        '<div class="booking-card" style="margin-top:24px;">' +
          '<h2>Book this vehicle</h2>' +
          '<p class="sub">Fill in your details to reserve it.</p>' +

          '<form id="bookingForm" novalidate>' +
            '<div class="form-grid">' +

              '<div class="form-field full">' +
                '<label for="custName">Full name</label>' +
                '<input type="text" id="custName" name="custName" placeholder="e.g. Aditi Sharma" />' +
                '<div class="field-error" id="err-custName"></div>' +
              '</div>' +

              '<div class="form-field">' +
                '<label for="custEmail">Email</label>' +
                '<input type="text" id="custEmail" name="custEmail" placeholder="you@example.com" />' +
                '<div class="field-error" id="err-custEmail"></div>' +
              '</div>' +

              '<div class="form-field">' +
                '<label for="custPhone">Phone number</label>' +
                '<input type="text" id="custPhone" name="custPhone" placeholder="10-digit number" />' +
                '<div class="field-error" id="err-custPhone"></div>' +
              '</div>' +

              '<div class="form-field">' +
                '<label for="pickupDate">Pickup date</label>' +
                '<input type="date" id="pickupDate" name="pickupDate" min="' + today + '" />' +
                '<div class="field-error" id="err-pickupDate"></div>' +
              '</div>' +

              '<div class="form-field">' +
                '<label for="returnDate">Return date</label>' +
                '<input type="date" id="returnDate" name="returnDate" min="' + today + '" />' +
                '<div class="field-error" id="err-returnDate"></div>' +
              '</div>' +

            '</div>' +

            '<div class="price-breakdown" id="priceBreakdown">' +
              '<div class="row"><span id="baseLabel">Base rental</span><span id="baseValue">₹0</span></div>' +
              '<div class="row"><span>Insurance</span><span id="insuranceValue">₹0</span></div>' +
              '<div class="row"><span>Taxes</span><span id="taxValue">₹0</span></div>' +
              '<div class="row total"><span>Total</span><span id="totalValue">₹0</span></div>' +
            '</div>' +

            '<button type="submit" class="btn btn-primary btn-block" style="margin-top:20px;" ' + (v.available ? '' : 'disabled') + '>' +
              (v.available ? 'Confirm Booking' : 'Unavailable') +
            '</button>' +
          '</form>' +
        '</div>' +
      '</div>' +
    '</div>';
}

/**
 * calculateRentalDays
 * Returns whole days between pickup and return date strings ("YYYY-MM-DD").
 * Returns 0 if either date is missing/invalid.
 */
function calculateRentalDays(pickup, ret) {
  if (!pickup || !ret) return 0;
  const pickupDate = new Date(pickup);
  const returnDate = new Date(ret);
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.round((returnDate - pickupDate) / msPerDay);
  return diff > 0 ? diff : 0;
}

/**
 * calculateTotal
 * Builds the full price breakdown for a given number of days.
 * @returns {{days:number, base:number, insurance:number, tax:number, total:number}}
 */
function calculateTotal(days, pricePerDay) {
  const base = days * pricePerDay;
  const insurance = days > 0 ? INSURANCE_FLAT : 0;
  const tax = Math.round(base * TAX_RATE);
  const total = base + insurance + tax;
  return { days: days, base: base, insurance: insurance, tax: tax, total: total };
}

/**
 * updatePriceBreakdown
 * Reads the current form dates and repaints the price panel.
 */
function updatePriceBreakdown() {
  const pickup = document.getElementById('pickupDate').value;
  const ret = document.getElementById('returnDate').value;
  const days = calculateRentalDays(pickup, ret);
  const breakdown = calculateTotal(days, currentVehicle.pricePerDay);

  const baseLabel = document.getElementById('baseLabel');
  baseLabel.textContent = days > 0
    ? days + ' day' + (days > 1 ? 's' : '') + ' × ₹' + currentVehicle.pricePerDay.toLocaleString('en-IN') + '/day'
    : 'Base rental';

  document.getElementById('baseValue').textContent = '₹' + breakdown.base.toLocaleString('en-IN');
  document.getElementById('insuranceValue').textContent = '₹' + breakdown.insurance.toLocaleString('en-IN');
  document.getElementById('taxValue').textContent = '₹' + breakdown.tax.toLocaleString('en-IN');
  document.getElementById('totalValue').textContent = '₹' + breakdown.total.toLocaleString('en-IN');

  return breakdown;
}

/**
 * validateBookingForm
 * Validates every field, writes inline error messages, and returns
 * true only if the whole form is valid.
 */
function validateBookingForm(values) {
  let isValid = true;
  const errors = {};

  if (!values.custName.trim()) {
    errors.custName = "Please enter your name.";
    isValid = false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(values.custEmail.trim())) {
    errors.custEmail = "Enter a valid email address.";
    isValid = false;
  }

  const phonePattern = /^[6-9]\d{9}$/;
  if (!phonePattern.test(values.custPhone.trim())) {
    errors.custPhone = "Enter a valid 10-digit phone number.";
    isValid = false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pickup = values.pickupDate ? new Date(values.pickupDate) : null;
  const ret = values.returnDate ? new Date(values.returnDate) : null;

  if (!pickup || pickup < today) {
    errors.pickupDate = "Pickup date cannot be in the past.";
    isValid = false;
  }

  if (!ret || !pickup || ret <= pickup) {
    errors.returnDate = "Return date must be after the pickup date.";
    isValid = false;
  }

  // Paint / clear inline errors for every tracked field.
  ["custName", "custEmail", "custPhone", "pickupDate", "returnDate"].forEach(function (field) {
    const input = document.getElementById(field);
    const errBox = document.getElementById("err-" + field);
    if (errors[field]) {
      input.classList.add("invalid");
      errBox.textContent = errors[field];
    } else {
      input.classList.remove("invalid");
      errBox.textContent = "";
    }
  });

  return isValid;
}

/**
 * createBooking
 * Builds the booking object from form values + price breakdown.
 */
function createBooking(values, breakdown, vehicle) {
  return {
    id: generateBookingId(),
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    vehicleType: vehicle.type,
    custName: values.custName.trim(),
    custEmail: values.custEmail.trim(),
    custPhone: values.custPhone.trim(),
    pickupDate: values.pickupDate,
    returnDate: values.returnDate,
    days: breakdown.days,
    base: breakdown.base,
    insurance: breakdown.insurance,
    tax: breakdown.tax,
    total: breakdown.total,
    status: "Upcoming",
    createdAt: new Date().toISOString()
  };
}

function showToast(message, isError) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(function () { toast.className = 'toast'; }, 2600);
}

function handleBookingSubmit(e) {
  e.preventDefault();

  const values = {
    custName: document.getElementById('custName').value,
    custEmail: document.getElementById('custEmail').value,
    custPhone: document.getElementById('custPhone').value,
    pickupDate: document.getElementById('pickupDate').value,
    returnDate: document.getElementById('returnDate').value
  };

  if (!validateBookingForm(values)) {
    showToast("Please fix the highlighted fields.", true);
    return;
  }

  const breakdown = updatePriceBreakdown();
  const booking = createBooking(values, breakdown, currentVehicle);
  saveBooking(booking);

  document.getElementById('modalBookingId').textContent = booking.id;
  document.getElementById('successModal').classList.add('show');
}

function initBookingForm(vehicle) {
  const form = document.getElementById('bookingForm');
  const pickupInput = document.getElementById('pickupDate');
  const returnInput = document.getElementById('returnDate');

  pickupInput.addEventListener('change', function () {
    // Keep the return-date min in sync with the chosen pickup date.
    returnInput.min = pickupInput.value;
    updatePriceBreakdown();
  });
  returnInput.addEventListener('change', updatePriceBreakdown);

  form.addEventListener('submit', handleBookingSubmit);

  updatePriceBreakdown();
}

document.addEventListener('DOMContentLoaded', function () {
  const id = getVehicleIdFromUrl();
  currentVehicle = id ? getVehicleById(id) : null;

  if (!currentVehicle) {
    renderNotFound();
    return;
  }

  renderDetailsPage(currentVehicle);
  initBookingForm(currentVehicle);

  document.getElementById('modalContinue').addEventListener('click', function () {
    window.location.href = 'bookings.html';
  });
});
