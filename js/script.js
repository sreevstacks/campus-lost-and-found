// ---------- SAMPLE ITEMS (temporary demo data) ----------

const sampleItems = [
    {
        name: "Wireless Headphones",
        category: "Electronics",
        status: "Lost",
        location: "Library",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
    },
    {
        name: "Student ID Card",
        category: "Documents",
        status: "Found",
        location: "Main Block",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600"
    },
    {
        name: "Wrist Watch",
        category: "Accessories",
        status: "Lost",
        location: "Canteen",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
    },
    {
        name: "Laptop Bag",
        category: "Others",
        status: "Found",
        location: "Computer Lab",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"
    }
];


// ---------- LOAD REPORTS SAVED FROM THE FORMS ----------

const savedReports = JSON.parse(localStorage.getItem("reports")) || [];

// Newest reports first, then the sample items
const items = [...savedReports, ...sampleItems];


// ---------- SAFETY: stop users injecting HTML into the page ----------

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}


// ---------- DISPLAY ITEMS ----------

function displayItems(data) {

    const grid = document.getElementById("itemGrid");

    grid.innerHTML = "";

    document.getElementById("emptyMessage").style.display =
        data.length === 0 ? "block" : "none";

    data.forEach(item => {

        grid.innerHTML += `
            <div class="item-card">

                <img src="${item.image}" alt="${escapeHTML(item.name)}">

                <div class="item-info">

                    <span class="status ${item.status}">
                        ${item.status}
                    </span>

                    <h3>${escapeHTML(item.name)}</h3>

                    <p>Category: ${escapeHTML(item.category)}</p>

                    <p>Location: ${escapeHTML(item.location)}</p>

                </div>

            </div>
        `;
    });
}


// ---------- SEARCH AND FILTER ----------

function filterItems() {

    const search = document
        .getElementById("searchInput")
        .value.toLowerCase();

    const category =
        document.getElementById("categoryFilter").value;

    const status =
        document.getElementById("statusFilter").value;

    const filtered = items.filter(item => {

        return (
            item.name.toLowerCase().includes(search) &&
            (category === "all" || item.category === category) &&
            (status === "all" || item.status === status)
        );

    });

    displayItems(filtered);
}


// ---------- SEARCH WHILE TYPING ----------

document.getElementById("searchInput")
    .addEventListener("input", filterItems);

document.getElementById("categoryFilter")
    .addEventListener("change", filterItems);

document.getElementById("statusFilter")
    .addEventListener("change", filterItems);


// ---------- SHOW ALL ITEMS WHEN THE PAGE LOADS ----------

displayItems(items);