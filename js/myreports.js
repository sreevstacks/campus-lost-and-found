const listBox = document.getElementById("reportList");
const noReports = document.getElementById("noReports");

function render() {
    const reports = getSavedReports();

    noReports.style.display = reports.length === 0 ? "block" : "none";

    listBox.innerHTML = reports.map(r => {
        const state = r.state || "Open";

        return `
            <div class="report-row">
                <div class="report-thumb">${mediaHTML(r)}</div>

                <div class="report-details">
                    <span class="badge badge-${r.status}">${r.status}</span>
                    <h3>${escapeHTML(r.name)}</h3>
                    <p class="meta">${escapeHTML(r.category)} · ${escapeHTML(r.location)} · ${escapeHTML(r.date)}</p>
                </div>

                <div class="report-actions">
                    <select onchange="changeState(${r.id}, this.value)">
                        <option ${state === "Open" ? "selected" : ""}>Open</option>
                        <option ${state === "Claimed" ? "selected" : ""}>Claimed</option>
                        <option ${state === "Returned" ? "selected" : ""}>Returned</option>
                    </select>
                    <button class="delete-btn" onclick="deleteReport(${r.id})">Delete</button>
                </div>
            </div>
        `;
    }).join("");
}

function changeState(id, newState) {
    const reports = getSavedReports();
    const report = reports.find(r => r.id === id);
    if (report) {
        report.state = newState;
        saveReports(reports);
    }
}

function deleteReport(id) {
    if (!confirm("Delete this report?")) return;
    saveReports(getSavedReports().filter(r => r.id !== id));
    render();
}

render();