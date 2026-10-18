/* ============================================================
   bookings.js — My Bookings page (bookings.html)
   ============================================================ */

let activeStatusFilter = "All";

const bookingsList = document.getElementById("bookingsList");
const summaryGrid = document.getElementById("summaryGrid");

/**
 * deriveDisplayStatus
 * A booking is stored as "Upcoming" or "Cancelled" at creation/cancel time.
 * If it's still marked Upcoming but the return date has already passed,
 * we treat it as Completed for display + stats purposes.
 */
function deriveDisplayStatus(booking) {
  if (booking.status === "Cancelled") return "Cancelled";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const returnDate = new Date(booking.returnDate);
  if (booking.status === "Upcoming" && returnDate < today) return "Completed";
  return booking.status;
}

/**
 * renderSummary
 * Computes and paints the four summary stat cards.
 */
function renderSummary(allBookings) {
  const withDisplayStatus = allBookings.map(function (b) {
    return Object.assign({}, b, { displayStatus: deriveDisplayStatus(b) });
  });

  const total = withDisplayStatus.length;
  const active = withDisplayStatus.filter(function (b) { return b.displayStatus === "Upcoming"; }).length;
  const completed = withDisplayStatus.filter(function (b) { return b.displayStatus === "Completed"; }).length;
  const totalSpent = withDisplayStatus
    .filter(function (b) { return b.displayStatus !== "Cancelled"; })
    .reduce(function (sum, b) { return sum + b.total; }, 0);

  summaryGrid.innerHTML =
    '<div class="summary-card"><div class="label">Total Bookings</div><div class="value">' + total + '</div></div>' +
    '<div class="summary-card"><div class="label">Active Bookings</div><div class="value">' + active + '</div></div>' +
    '<div class="summary-card"><div class="label">Completed Bookings</div><div class="value">' + completed + '</div></div>' +
    '<div class="summary-card"><div class="label">Total Amount Spent</div><div class="value">₹' + totalSpent.toLocaleString('en-IN') + '</div></div>';
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * bookingRowHTML
 */
function bookingRowHTML(b) {
  const displayStatus = deriveDisplayStatus(b);
  const statusClass = displayStatus.toLowerCase();
  const canCancel = displayStatus === "Upcoming";

  return (
    '<div class="booking-row">' +
      '<div class="field"><div class="label">Vehicle</div><div class="value">' + b.vehicleName + '</div><div class="label" style="margin-top:2px;">' + b.id + '</div></div>' +
      '<div class="field"><div class="label">Pickup</div><div class="value">' + formatDate(b.pickupDate) + '</div></div>' +
      '<div class="field"><div class="label">Return</div><div class="value">' + formatDate(b.returnDate) + '</div></div>' +
      '<div class="field"><div class="label">Days</div><div class="value">' + b.days + '</div></div>' +
      '<div class="field"><div class="label">Total</div><div class="value">₹' + b.total.toLocaleString('en-IN') + '</div></div>' +
      '<div class="field" style="align-items:flex-end; display:flex; flex-direction:column; gap:8px;">' +
        '<span class="status-badge ' + statusClass + '">' + displayStatus + '</span>' +
        (canCancel ? '<button class="btn btn-danger btn-sm" data-cancel="' + b.id + '">Cancel Booking</button>' : '') +
      '</div>' +
    '</div>'
  );
}

/**
 * renderBookings
 * Reads bookings from storage, applies the active status filter,
 * and paints both the summary cards and the list (or an empty state).
 */
function renderBookings() {
  const all = getBookings();
  renderSummary(all);

  const filtered = activeStatusFilter === "All"
    ? all
    : all.filter(function (b) { return deriveDisplayStatus(b) === activeStatusFilter; });

  // Newest first.
  const sorted = filtered.slice().sort(function (a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (sorted.length === 0) {
    bookingsList.innerHTML =
      '<div class="empty-bookings">' +
        '<h3>No bookings here yet</h3>' +
        '<p>Browse vehicles and reserve one to see it show up in this list.</p>' +
        '<br/><a class="btn btn-primary" href="index.html">Browse Vehicles</a>' +
      '</div>';
    return;
  }

  bookingsList.innerHTML = sorted.map(bookingRowHTML).join('');

  bookingsList.querySelectorAll('button[data-cancel]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      cancelBooking(btn.dataset.cancel);
    });
  });
}

/**
 * cancelBooking
 * Marks a booking Cancelled in localStorage, then re-renders the UI
 * and shows a confirmation toast.
 */
function cancelBooking(bookingId) {
  updateBookingStatus(bookingId, "Cancelled");
  renderBookings();
  showToast("Booking " + bookingId + " has been cancelled.");
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show';
  setTimeout(function () { toast.className = 'toast'; }, 2600);
}

function initStatusTabs() {
  document.querySelectorAll('#statusTabs button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#statusTabs button').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeStatusFilter = btn.dataset.status;
      renderBookings();
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initStatusTabs();
  renderBookings();
});
