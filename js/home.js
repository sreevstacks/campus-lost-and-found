const all = getAllItems();

// Recent items
const recentGrid = document.getElementById("recentGrid");

if (all.length === 0) {
    recentGrid.innerHTML = `
        <div class="empty-box" style="display: block; grid-column: 1 / -1;">
            <h3>No items reported yet</h3>
            <p style="margin: 8px 0 20px;">Be the first to report a lost or found item.</p>
            <a href="lost.html" class="btn btn-primary">Report lost item</a>
            <a href="found.html" class="btn btn-outline">Report found item</a>
        </div>
    `;
} else {
    recentGrid.innerHTML = all.slice(0, 6).map(cardHTML).join("");
}

// Stats
document.getElementById("statTotal").textContent = all.length;
document.getElementById("statLost").textContent =
    all.filter(i => i.status === "Lost").length;
document.getElementById("statFound").textContent =
    all.filter(i => i.status === "Found").length;
document.getElementById("statReturned").textContent =
    all.filter(i => i.state === "Returned").length;

// Browse by location cards
document.getElementById("locationGrid").innerHTML = campusLocations.map(loc => {
    const open = all.filter(i =>
        getPlace(i) === loc.name && (i.state || "Open") === "Open").length;

    const floorsText = loc.floors > 0 ? `${loc.floors} floors` : "Open area";
    const note = loc.note ? ` · ${loc.note}` : "";

    return `
        <a href="items.html?place=${encodeURIComponent(loc.name)}"
           class="location-card"
           style="background-image: url('${loc.image}'), linear-gradient(135deg, #16465c, #0d9488);">
            <div class="location-overlay">
                <h3>${loc.name}</h3>
                <p>${floorsText}${note}</p>
                <span class="location-count">${open} open item${open === 1 ? "" : "s"}</span>
            </div>
        </a>
    `;
}).join("");