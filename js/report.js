const form = document.getElementById("reportForm");
const type = document.body.dataset.type; // "Lost" or "Found"

// Backend API address
const API_URL = "http://localhost:5000/api/reports";

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

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitButton = form.querySelector('[type="submit"]');
    const originalText = submitButton.textContent;

    const place = document.getElementById("place").value;
    const floor = document.getElementById("floor").value;
    const spot = document.getElementById("spot").value.trim();

    // Build the data to send (text fields + photo)
    const formData = new FormData();
    formData.append("type", type.toLowerCase());
    formData.append("name", document.getElementById("name").value.trim());
    formData.append("category", document.getElementById("category").value);
    formData.append("date", dateInput.value);
    formData.append("place", place);
    formData.append("floor", floor);
    formData.append("spot", spot);
    formData.append("description", document.getElementById("description").value.trim());
    formData.append("contact", document.getElementById("contact").value.trim());

    // Attach the photo
    const photo = photoInput.files[0];

    if (!photo) {
        alert("Please upload a photo of the item.");
        return;
    }

    if (!photo.type.startsWith("image/")) {
        alert("Please select a valid image.");
        return;
    }

    if (photo.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5 MB.");
        return;
    }

    formData.append("image", photo);

    try {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        const response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to submit report.");
        }

        // Remember this report ID for the My Reports page
        const myReportIds = JSON.parse(localStorage.getItem("myReportIds") || "[]");
        myReportIds.push(result.reportId);
        localStorage.setItem("myReportIds", JSON.stringify(myReportIds));

        document.getElementById("formArea").style.display = "none";
        document.getElementById("success").style.display = "block";
        window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error) {
        console.error("Report submission error:", error);
        alert(error.message || "Unable to connect to the backend. Please try again.");

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});