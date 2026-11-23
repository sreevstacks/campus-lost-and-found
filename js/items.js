const API_URL = "http://localhost:5000/api/items";

let items = [];

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const typeFilter = document.getElementById("typeFilter");
const locationFilter = document.getElementById("locationFilter");
const grid = document.getElementById("itemGrid");
const emptyBox = document.getElementById("emptyBox");
const resultCount = document.getElementById("resultCount");

// Fill the location dropdown
campusLocations.forEach(loc => {
    const opt = document.createElement("option");
    opt.value = loc.name;
    opt.textContent = loc.name;
    locationFilter.appendChild(opt);
});

// Read search and location parameters from the URL
const params = new URLSearchParams(window.location.search);

if (params.get("q")) {
    searchInput.value = params.get("q");
}

if (params.get("place")) {
    locationFilter.value = params.get("place");
}

// Fetch reports from backend
async function loadItems() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to load items.");
        }

        items = Array.isArray(result.data)
            ? result.data
            : Array.isArray(result.items)
                ? result.items
                : [];

        applyFilters();

    } catch (error) {
        console.error("Loading items error:", error);

        grid.innerHTML = "<p>Unable to load items. Please check your backend server.</p>";
        emptyBox.style.display = "none";
        resultCount.textContent = "Unable to load items.";
    }
}

// Apply search and filters
function applyFilters() {
    const q = searchInput.value.trim().toLowerCase();

    const result = items.filter(item => {
        const status = (item.status || item.type || "").toLowerCase();

        const location = [
            item.place,
            item.floor,
            item.spot,
            item.location
        ].filter(Boolean).join(" ");

        const searchableText = `
            ${item.name}
            ${location}
            ${item.description}
            ${item.category}
            ${status}
            `.toLowerCase();

        return (
            searchableText.includes(q) &&
            (categoryFilter.value === "all" ||
                item.category === categoryFilter.value) &&
            (typeFilter.value === "all" ||
                status === typeFilter.value.toLowerCase()) &&
            (locationFilter.value === "all" ||
                getPlace(item) === locationFilter.value)
        );
    });

    grid.innerHTML = result.map(cardHTML).join("");

    emptyBox.style.display = result.length === 0 ? "block" : "none";

    resultCount.textContent =
        `Showing ${result.length} of ${items.length} items`;
}

// Search while typing
searchInput.addEventListener("input", applyFilters);

// Apply dropdown filters
[categoryFilter, typeFilter, locationFilter].forEach(element => {
    element.addEventListener("change", applyFilters);
});

// Reset all filters
document.getElementById("resetBtn").addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "all";
    typeFilter.value = "all";
    locationFilter.value = "all";

    applyFilters();
});

// Start loading
loadItems();