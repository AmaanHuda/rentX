/* ============================================================
   app.js — Vehicle listing page (index.html)
   ============================================================ */

const state = {
  search: "",
  type: "All",
  fuel: "All",
  transmission: "All",
  maxPrice: 5000,
  sort: "default"
};

const grid = document.getElementById("vehicleGrid");
const resultCount = document.getElementById("resultCount");

/**
 * filterVehicles
 * Returns the subset of VEHICLES matching the current search/filter state.
 */
function filterVehicles() {
  return VEHICLES.filter(function (v) {
    const matchesSearch = v.name.toLowerCase().includes(state.search.toLowerCase());
    const matchesType = state.type === "All" || v.type === state.type;
    const matchesFuel = state.fuel === "All" || v.fuel === state.fuel;
    const matchesTransmission = state.transmission === "All" || v.transmission === state.transmission;
    const matchesPrice = v.pricePerDay <= state.maxPrice;
    return matchesSearch && matchesType && matchesFuel && matchesTransmission && matchesPrice;
  });
}

/**
 * sortVehicles
 * Sorts a vehicle array (immutably) based on the current sort mode.
 */
function sortVehicles(list) {
  const copy = list.slice();
  switch (state.sort) {
    case "price-asc":
      return copy.sort(function (a, b) { return a.pricePerDay - b.pricePerDay; });
    case "price-desc":
      return copy.sort(function (a, b) { return b.pricePerDay - a.pricePerDay; });
    case "name-asc":
      return copy.sort(function (a, b) { return a.name.localeCompare(b.name); });
    default:
      return copy;
  }
}

/**
 * vehicleCardHTML
 * Builds the markup for a single vehicle card.
 */
function vehicleCardHTML(v) {
  const availabilityClass = v.available ? "yes" : "no";
  const availabilityLabel = v.available ? "Available" : "Booked out";
  return (
    '<article class="vehicle-card">' +
      '<div class="thumb"><img src="' + v.image + '" alt="' + v.name + '" loading="lazy" /></div>' +
      '<div class="body">' +
        '<div class="top-row">' +
          '<h3>' + v.name + '</h3>' +
          '<span class="type-pill">' + v.type + '</span>' +
        '</div>' +
        '<div class="spec-row">' +
          '<span>' + v.fuel + '</span>' +
          '<span>' + v.transmission + '</span>' +
          '<span>' + v.seats + ' seats</span>' +
        '</div>' +
        '<div class="availability ' + availabilityClass + '">' + availabilityLabel + '</div>' +
        '<div class="card-bottom">' +
          '<div class="price-tag"><strong>₹' + v.pricePerDay.toLocaleString('en-IN') + '</strong><span> / day</span></div>' +
          '<button class="btn btn-primary btn-sm" data-id="' + v.id + '" ' + (v.available ? '' : 'disabled') + '>Rent Now</button>' +
        '</div>' +
      '</div>' +
    '</article>'
  );
}

/**
 * renderVehicles
 * Applies filter + sort, then paints the grid. Shows an empty state
 * when nothing matches.
 */
function renderVehicles() {
  const filtered = filterVehicles();
  const sorted = sortVehicles(filtered);

  resultCount.textContent = sorted.length + (sorted.length === 1 ? ' vehicle' : ' vehicles');

  if (sorted.length === 0) {
    grid.innerHTML =
      '<div class="empty-state">' +
        '<h3>No vehicles found</h3>' +
        '<p>Try widening your filters or clearing the search.</p>' +
      '</div>';
    return;
  }

  grid.innerHTML = sorted.map(vehicleCardHTML).join('');

  // Wire up "Rent Now" buttons after render, since innerHTML wipes old listeners.
  grid.querySelectorAll('button[data-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      window.location.href = 'details.html?id=' + btn.dataset.id;
    });
  });
}

/**
 * renderHeroStats
 * Fills in the small counters in the hero section.
 */
function renderHeroStats() {
  document.getElementById('statTotal').textContent = VEHICLES.length;
  document.getElementById('statAvailable').textContent = VEHICLES.filter(function (v) { return v.available; }).length;
}

function initEventListeners() {
  document.getElementById('searchInput').addEventListener('input', function (e) {
    state.search = e.target.value;
    renderVehicles();
  });

  document.querySelectorAll('#typeTabs button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#typeTabs button').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      state.type = btn.dataset.type;
      renderVehicles();
    });
  });

  document.getElementById('fuelFilter').addEventListener('change', function (e) {
    state.fuel = e.target.value;
    renderVehicles();
  });

  document.getElementById('transmissionFilter').addEventListener('change', function (e) {
    state.transmission = e.target.value;
    renderVehicles();
  });

  const priceFilter = document.getElementById('priceFilter');
  const priceValue = document.getElementById('priceValue');
  priceFilter.addEventListener('input', function (e) {
    state.maxPrice = Number(e.target.value);
    priceValue.textContent = '₹' + state.maxPrice.toLocaleString('en-IN');
    renderVehicles();
  });

  document.getElementById('sortSelect').addEventListener('change', function (e) {
    state.sort = e.target.value;
    renderVehicles();
  });
}

document.addEventListener('DOMContentLoaded', function () {
  renderHeroStats();
  initEventListeners();
  renderVehicles();
});
