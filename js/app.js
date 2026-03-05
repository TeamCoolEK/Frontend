const currentDateEl = document.getElementById("currentDate");
const movieContainer = document.getElementById("movie-container");

let currentDate = new Date();

function formatDate(date) {
    return date.toISOString().split('T')[0]; // yyyy-mm-dd
}

function updateDateDisplay() {
    currentDateEl.textContent = currentDate.toLocaleDateString();
    loadShowings();
}
//henter showings fra backend
async function loadShowings() {
    const date = formatDate(currentDate);

    const res = await fetch(`/api/showings?date=${date}`);
    const showings = await res.json();

    movieContainer.innerHTML = "";

    if (showings.length === 0) {
        movieContainer.innerHTML = "<p>Ingen forestillinger denne dag.</p>";
        return;
    }

    showings.forEach(showing => {
        const div = document.createElement("div");
        div.classList.add("movie-card");

        div.innerHTML = `
            <h3>${showing.movieTitle}</h3>
            <p>Tid: ${showing.time}</p>
            <p>Sal: ${showing.room}</p>
        `;

        movieContainer.appendChild(div);
    });
}

// knapper
document.getElementById("prevDay").addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
});

document.getElementById("nextDay").addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
});

// init
updateDateDisplay();