const items = getAllItems();

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const typeFilter = document.getElementById("typeFilter");
const locationFilter = document.getElementById("locationFilter");
const grid = document.getElementById("itemGrid");
const emptyBox = document.getElementById("emptyBox");
const resultCount = document.getElementById("resultCount");

// Fill the location dropdown with the campus places
campusLocations.forEach(loc => {
    const opt = document.createElement("option");
    opt.value = loc.name;
    opt.textContent = loc.name;
    locationFilter.appendChild(opt);
});

// Read ?q=... from the homepage search
const params = new URLSearchParams(window.location.search);
if (params.get("q")) searchInput.value = params.get("q");
if (params.get("place")) locationFilter.value = params.get("place");

function applyFilters() {
    const q = searchInput.value.trim().toLowerCase();

    const result = items.filter(i =>
        (`${i.name} ${i.location} ${i.description}`.toLowerCase().includes(q)) &&
        (categoryFilter.value === "all" || i.category === categoryFilter.value) &&
        (typeFilter.value === "all" || i.status === typeFilter.value) &&
        (locationFilter.value === "all" || getPlace(i) === locationFilter.value)
    );

    grid.innerHTML = result.map(cardHTML).join("");
    emptyBox.style.display = result.length === 0 ? "block" : "none";
    resultCount.textContent = `Showing ${result.length} of ${items.length} items`;
}

searchInput.addEventListener("input", applyFilters);
[categoryFilter, typeFilter, locationFilter].forEach(el =>
    el.addEventListener("change", applyFilters));

document.getElementById("resetBtn").addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "all";
    typeFilter.value = "all";
    locationFilter.value = "all";
    applyFilters();
});

applyFilters();