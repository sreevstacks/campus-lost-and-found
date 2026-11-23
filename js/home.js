const API_URL = "http://localhost:5000/api";

async function loadHomePage() {
    try {
        // Fetch recent items, statistics and all items from the backend
        const [recentResponse, statsResponse, allResponse] = await Promise.all([
            fetch(`${API_URL}/items/recent`),
            fetch(`${API_URL}/items/stats`),
            fetch(`${API_URL}/items`)
        ]);

        if (!recentResponse.ok || !statsResponse.ok || !allResponse.ok) {
            throw new Error("Could not fetch homepage data");
        }

        const recentData = await recentResponse.json();
        const stats = await statsResponse.json();
        const allData = await allResponse.json();

        const recentItems = recentData.data || [];
        const allItems = allData.data || [];

        // Recent items
        const recentGrid = document.getElementById("recentGrid");

        if (recentItems.length === 0) {
            recentGrid.innerHTML = `
                <div class="empty-box" style="display: block; grid-column: 1 / -1;">
                    <h3>No items reported yet</h3>
                    <p style="margin: 8px 0 20px;">Be the first to report a lost or found item.</p>
                    <a href="lost.html" class="btn btn-primary">Report lost item</a>
                    <a href="found.html" class="btn btn-outline">Report found item</a>
                </div>
            `;
        } else {
            recentGrid.innerHTML = recentItems.map(cardHTML).join("");
        }

        // Stats
        document.getElementById("statTotal").textContent = stats.data.total || 0;
        document.getElementById("statLost").textContent = stats.data.lost || 0;
        document.getElementById("statFound").textContent = stats.data.found || 0;
        document.getElementById("statReturned").textContent = stats.data.returned || 0;

        // Browse by location cards (counts come from ALL items)
        document.getElementById("locationGrid").innerHTML = campusLocations.map(loc => {
            const open = allItems.filter(item =>
                getPlace(item) === loc.name &&
                (item.state || "Open") === "Open"
            ).length;

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

    } catch (error) {
        console.error("Homepage loading error:", error);
        document.getElementById("recentGrid").innerHTML =
            "<p>Unable to load items. Please check that the backend server is running.</p>";
    }
}

loadHomePage();