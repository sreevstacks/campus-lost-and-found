// ---------- CAMPUS LOCATIONS (single source of truth) ----------

const campusLocations = [
    { name: "Lab Block", floors: 6, note: "Food court inside", image: "images/lab-block.jpg" },
    { name: "Academic Block", floors: 4, image: "images/academic-block.jpg" },
    
    { name: "BSN Block", floors: 6, image: "images/bsn-block.jpg" },
    { name: "Library", floors: 0, image: "images/library.jpg" },
    { name: "Food Court", floors: 0, note: "Inside Lab Block", image: "images/food-court.jpg" },
    { name: "Kuteera Canteen", floors: 0, image: "images/kuteera-canteen.jpg" },
    { name: "Stationery", floors: 0, image: "images/stationary.jpg" },
    { name: "Playground", floors: 0, image: "images/playground.jpg" },
    { name: "Parking Area", floors: 0, image: "images/parking-area.jpg" }
];


// ---------- STORAGE HELPERS ----------

function getSavedReports() {
    try {
        return JSON.parse(localStorage.getItem("reports")) || [];
    } catch (e) {
        return [];
    }
}

function saveReports(reports) {
    localStorage.setItem("reports", JSON.stringify(reports));
}

// Only real reports (no demo items)
function getAllItems() {
    return getSavedReports();
}


// ---------- SAFETY ----------

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text == null ? "" : text;
    return div.innerHTML;
}


// ---------- LOCATION HELPERS ----------

// Works for old reports that have no "place" field
function getPlace(item) {
    return item.place || (item.location || "").split(" · ")[0];
}

// Fills the Place dropdown and shows the Floor dropdown when needed
function setupLocationPicker() {
    const place = document.getElementById("place");
    const floorField = document.getElementById("floorField");
    const floor = document.getElementById("floor");

    campusLocations.forEach(loc => {
        const opt = document.createElement("option");
        opt.value = loc.name;
        opt.textContent = loc.name;
        place.appendChild(opt);
    });

    place.addEventListener("change", () => {
        const loc = campusLocations.find(l => l.name === place.value);
        floor.innerHTML = "";

        if (loc && loc.floors > 0) {
            floor.innerHTML = '<option value="">Select floor</option>';
            for (let i = 1; i <= loc.floors; i++) {
                floor.innerHTML += `<option>Floor ${i}</option>`;
            }
            floorField.style.display = "grid";
            floor.required = true;
        } else {
            floorField.style.display = "none";
            floor.required = false;
        }
    });
}


// ---------- SHARED HTML BUILDERS ----------

// Block photo as background + the real item photo in a frame on top
function mediaHTML(item) {
    const loc = campusLocations.find(l => l.name === getPlace(item));
    const bg = loc ? `url('${loc.image}'), ` : "";

    // Support both old localStorage images and backend-uploaded images
    let photoSrc = "";

    if (item.image && item.image.startsWith("data:image")) {
        photoSrc = item.image;
    } else if (item.image_path) {
        photoSrc = item.image_path.startsWith("http")
            ? item.image_path
            : `http://localhost:5000${item.image_path}`;
    }

    const inner = photoSrc
        ? `<div class="media-photo">
               <img src="${photoSrc}" alt="${escapeHTML(item.name)}"
                    onerror="this.parentElement.innerHTML='Photo unavailable'">
           </div>`
        : `<div class="media-photo media-empty">No photo</div>`;

    return `
        <div class="media-scene"
             style="background-image: ${bg}linear-gradient(135deg, #16465c, #0d9488);">
            ${inner}
        </div>
    `;
}

function cardHTML(item) {
    const state = item.state || "Open";

    // Backend uses "type"; older frontend reports used "status"
    const status = item.status || (
        item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : "Unknown"
    );

    // Build location from backend fields
    const location = item.location ||
        [item.place, item.floor, item.spot].filter(Boolean).join(" · ");

    return `
        <article class="item-card" onclick="openItem(${item.id})">
            <div class="item-media">
                ${mediaHTML(item)}
                <span class="badge badge-${status}">${escapeHTML(status)}</span>
            </div>
            <div class="item-body">
                <h3>${escapeHTML(item.name)}</h3>
                <p class="meta">📍 ${escapeHTML(location)}</p>
                <p class="meta">📅 ${escapeHTML(item.date)}</p>
                <div class="item-foot">
                    <span class="cat">${escapeHTML(item.category)}</span>
                    <span class="state state-${state}">${escapeHTML(state)}</span>
                </div>
            </div>
        </article>
    `;
}


// ---------- DETAILS POPUP ----------

function buildModal() {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "modalOverlay";
    overlay.innerHTML = `<div class="modal" id="modalBox"></div>`;
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });
}

async function openItem(id) {
    try {
        const response = await fetch(`http://localhost:5000/api/items/${id}`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Could not load item details.");
        }

        const item = result.data;

        if (!item) {
            throw new Error("Item not found.");
        }

        const state = item.state || "Open";

        const status = item.status || (
            item.type
                ? item.type.charAt(0).toUpperCase() + item.type.slice(1)
                : "Unknown"
        );

        const location = item.location ||
            [item.place, item.floor, item.spot].filter(Boolean).join(" · ");

        document.getElementById("modalBox").innerHTML = `
            <div class="item-media">
                ${mediaHTML(item)}
                <span class="badge badge-${status}">${escapeHTML(status)}</span>
            </div>

            <div class="modal-body">
                <span class="state state-${state}">${escapeHTML(state)}</span>
                <h2>${escapeHTML(item.name)}</h2>
                <p class="desc">${escapeHTML(item.description)}</p>

                <div class="detail-grid">
                    <div><small>Category</small><strong>${escapeHTML(item.category)}</strong></div>
                    <div><small>Location</small><strong>${escapeHTML(location)}</strong></div>
                    <div><small>Date</small><strong>${escapeHTML(item.date)}</strong></div>
                    <div><small>Contact</small><strong>${escapeHTML(item.contact)}</strong></div>
                </div>

                <button class="btn btn-primary modal-close" onclick="closeModal()">Close</button>
            </div>
        `;

        document.getElementById("modalOverlay").classList.add("open");

    } catch (error) {
        console.error("Item details error:", error);
        alert(error.message || "Unable to load item details.");
    }
}

function closeModal() {
    document.getElementById("modalOverlay").classList.remove("open");
}


// ---------- MOBILE MENU + SETUP ----------

document.addEventListener("DOMContentLoaded", () => {
    buildModal();

    const btn = document.getElementById("menuBtn");
    if (btn) {
        btn.addEventListener("click", () => {
            document.querySelector(".navbar").classList.toggle("open");
        });
    }
});