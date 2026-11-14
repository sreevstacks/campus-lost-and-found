const form = document.getElementById("reportForm");
const type = document.body.dataset.type; // "Lost" or "Found"

// Fill the place and floor dropdowns
setupLocationPicker();

// Date can't be in the future
const dateInput = document.getElementById("date");
const today = new Date().toISOString().split("T")[0];
dateInput.max = today;
dateInput.value = today;

// Photo preview
const photoInput = document.getElementById("photo");
const preview = document.getElementById("photoPreview");

photoInput.addEventListener("change", () => {
    const file = photoInput.files[0];
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = "block";
    } else {
        preview.style.display = "none";
    }
});

// Shrink the photo so it fits in browser storage
function resizeImage(file, maxSize = 800) {
    return new Promise(resolve => {
        if (!file) return resolve("");

        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
                const canvas = document.createElement("canvas");
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", 0.75));
            };
            img.onerror = () => resolve("");
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const photo = await resizeImage(photoInput.files[0]);

    if (!photo) {
        alert("Please upload a valid photo of the item.");
        return;
    }

    const place = document.getElementById("place").value;
    const floor = document.getElementById("floor").value;
    const spot = document.getElementById("spot").value.trim();

    // Example result: "Lab Block · Floor 3 · near the staircase"
    const location = [place, floor, spot].filter(Boolean).join(" · ");

    const report = {
        id: Date.now(),
        status: type,
        state: "Open",
        name: document.getElementById("name").value.trim(),
        category: document.getElementById("category").value,
        place: place,
        location: location,
        date: document.getElementById("date").value,
        description: document.getElementById("description").value.trim(),
        contact: document.getElementById("contact").value.trim(),
        image: photo
    };

    const saved = getSavedReports();
    saved.unshift(report);

    try {
        saveReports(saved);
    } catch (err) {
        alert("Storage is full. Delete some old reports and try again.");
        return;
    }

    document.getElementById("formArea").style.display = "none";
    document.getElementById("success").style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
});