/* ============================================================
   data.js
   Single source of truth for vehicle inventory.
   Loaded before app.js / details.js / bookings.js on every page.
   ============================================================ */

const VEHICLES = [
  {
    id: "v01",
    name: "Toyota Camry",
    type: "Cars",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    pricePerDay: 4200,
    available: true,
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: "v02",
    name: "Honda City",
    type: "Cars",
    fuel: "Petrol",
    transmission: "Manual",
    seats: 5,
    pricePerDay: 2400,
    available: true,
    image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: "v03",
    name: "Hyundai Creta",
    type: "SUVs",
    fuel: "Diesel",
    transmission: "Automatic",
    seats: 5,
    pricePerDay: 3200,
    available: true,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: "v04",
    name: "Tata Nexon",
    type: "SUVs",
    fuel: "Electric",
    transmission: "Automatic",
    seats: 5,
    pricePerDay: 2900,
    available: true,
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: "v05",
    name: "Mahindra Thar",
    type: "SUVs",
    fuel: "Diesel",
    transmission: "Manual",
    seats: 4,
    pricePerDay: 3800,
    available: false,
    image: "https://images.unsplash.com/photo-1669132693550-d64a35b3a2fa?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: "v06",
    name: "Maruti Swift",
    type: "Cars",
    fuel: "Petrol",
    transmission: "Manual",
    seats: 5,
    pricePerDay: 1800,
    available: true,
    image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: "v07",
    name: "Royal Enfield Classic 350",
    type: "Bikes",
    fuel: "Petrol",
    transmission: "Manual",
    seats: 2,
    pricePerDay: 1200,
    available: true,
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: "v08",
    name: "Yamaha R15",
    type: "Bikes",
    fuel: "Petrol",
    transmission: "Manual",
    seats: 2,
    pricePerDay: 1100,
    available: true,
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: "v09",
    name: "Honda Activa",
    type: "Bikes",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 2,
    pricePerDay: 700,
    available: true,
    image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: "v10",
    name: "Mahindra XUV700",
    type: "SUVs",
    fuel: "Diesel",
    transmission: "Automatic",
    seats: 7,
    pricePerDay: 4600,
    available: true,
    image: "https://images.unsplash.com/photo-1662469004409-fbd5ea1a24da?auto=format&fit=crop&w=800&q=60"
  }
];

/**
 * getVehicleById
 * Looks up a single vehicle by its id. Used by details.js.
 * @param {string} id
 * @returns {object|undefined}
 */
function getVehicleById(id) {
  return VEHICLES.find(function (vehicle) {
    return vehicle.id === id;
  });
}

/* ============================================================
   Shared localStorage layer for bookings.
   Lives here (rather than in details.js / bookings.js) because
   both pages need read + write access to the same store.
   ============================================================ */

const BOOKINGS_KEY = "rentx_bookings";

/**
 * getBookings
 * Reads every saved booking from localStorage.
 * @returns {Array<object>}
 */
function getBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Could not read bookings from localStorage:", err);
    return [];
  }
}

/**
 * saveBooking
 * Appends a new booking to the store.
 * @param {object} booking
 */
function saveBooking(booking) {
  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

/**
 * updateBookingStatus
 * Changes the status of one booking by id and persists the change.
 * @param {string} bookingId
 * @param {string} newStatus
 */
function updateBookingStatus(bookingId, newStatus) {
  const bookings = getBookings();
  const target = bookings.find(function (b) { return b.id === bookingId; });
  if (target) {
    target.status = newStatus;
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  }
  return target;
}

/**
 * generateBookingId
 * Produces a short, human-readable, unique-enough booking reference.
 */
function generateBookingId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return "RX-" + stamp + rand;
}
