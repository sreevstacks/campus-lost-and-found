const API_URL = "http://localhost:5000/api/items";

const listBox = document.getElementById("reportList");
const noReports = document.getElementById("noReports");

// Get report IDs saved by this browser
function getMyReportIds() {
    try {
        return JSON.parse(localStorage.getItem("myReportIds")) || [];
    } catch (error) {
        return [];
    }
}

// Load this browser's reports from backend
async function render() {
    const reportIds = getMyReportIds();

    if (reportIds.length === 0) {
        listBox.innerHTML = "";
        noReports.style.display = "block";
        return;
    }

    try {
        const responses = await Promise.all(
            reportIds.map(id =>
                fetch(`${API_URL}/${id}`).then(response => {
                    if (!response.ok) return null;
                    return response.json();
                })
            )
        );

        const reports = responses
            .filter(result => result && result.status === "success" && result.data)
            .map(result => result.data);

        noReports.style.display = reports.length === 0 ? "block" : "none";

        listBox.innerHTML = reports.map(report => {
            const state = report.state || "Open";
            const status = report.type
                ? report.type.charAt(0).toUpperCase() + report.type.slice(1)
                : "Unknown";

            const location = [
                report.place,
                report.floor,
                report.spot
            ].filter(Boolean).join(" · ");

            return `
                <div class="report-row">
                    <div class="report-thumb">${mediaHTML(report)}</div>

                    <div class="report-details">
                        <span class="badge badge-${status}">${escapeHTML(status)}</span>
                        <h3>${escapeHTML(report.name)}</h3>
                        <p class="meta">
                            ${escapeHTML(report.category)} ·
                            ${escapeHTML(location)} ·
                            ${escapeHTML(report.date)}
                        </p>
                    </div>

                    <div class="report-actions">
                        <select onchange="changeState(${report.id}, this.value)">
                            <option value="Open" ${state === "Open" ? "selected" : ""}>Open</option>
                            <option value="Claimed" ${state === "Claimed" ? "selected" : ""}>Claimed</option>
                            <option value="Returned" ${state === "Returned" ? "selected" : ""}>Returned</option>
                        </select>

                        <button class="delete-btn" onclick="deleteReport(${report.id})">
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("My Reports loading error:", error);
        listBox.innerHTML = "<p>Unable to load your reports. Please try again.</p>";
    }
}

// Update report status in backend
async function changeState(id, newState) {
    try {
        const response = await fetch(`${API_URL}/${id}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ state: newState })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Could not update status.");
        }

        alert("Report status updated!");
        render();

    } catch (error) {
        console.error("Status update error:", error);
        alert(error.message);
        render();
    }
}

// Delete report from backend
async function deleteReport(id) {
    if (!confirm("Delete this report?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Could not delete report.");
        }

        const remainingIds = getMyReportIds().filter(
            reportId => String(reportId) !== String(id)
        );

        localStorage.setItem("myReportIds", JSON.stringify(remainingIds));

        alert("Report deleted successfully!");
        render();

    } catch (error) {
        console.error("Delete error:", error);
        alert(error.message);
    }
}

render();