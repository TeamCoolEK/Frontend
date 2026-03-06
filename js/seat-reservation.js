const API_BASE = "http://localhost:8080";

const inpShowingId = document.getElementById("showingId");
const btnLoadSeats = document.getElementById("btnLoadSeats");
const seatGrid = document.getElementById("seatGrid");
const statusText = document.getElementById("statusText");
const selectedSeatsText = document.getElementById("selectedSeatsText");
const btnCreateReservation = document.getElementById("btnCreateReservation");
const resultMessage = document.getElementById("resultMessage");

let selectedSeatIds = [];
let currentShowingId = null;

btnLoadSeats.addEventListener("click", function () {
    const showingId = inpShowingId.value;

    if (showingId === "" || showingId < 1) {
        statusText.textContent = "Skriv et gyldigt showing id";
        return;
    }

    currentShowingId = showingId;
    selectedSeatIds = [];
    selectedSeatsText.textContent = "";
    resultMessage.textContent = "";

    loadAvailableSeats(showingId);
});

btnCreateReservation.addEventListener("click", function () {
    if (currentShowingId == null || selectedSeatIds.length === 0) {
        return;
    }

    resultMessage.textContent =
        "Tak for reservationen.";
});

function loadAvailableSeats(showingId) {
    statusText.textContent = "Henter sæder...";
    seatGrid.innerHTML = "";

    fetch(API_BASE + "/showings/" + showingId + "/available-seats")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Fejl ved hentning af sæder");
            }
            return response.json();
        })
        .then(function (seats) {
            if (seats.length === 0) {
                statusText.textContent = "Ingen ledige sæder fundet";
                return;
            }

            statusText.textContent = "Vælg sæder";

            for (let i = 0; i < seats.length; i++) {
                const seat = seats[i];

                const button = document.createElement("button");
                button.textContent = "Række " + seat.rowNo + " Sæde " + seat.seatNo;

                button.addEventListener("click", function () {
                    toggleSeat(seat.id);
                });

                seatGrid.appendChild(button);
            }
        })
        .catch(function () {
            statusText.textContent = "Kunne ikke hente sæder";
        });
}

function toggleSeat(seatId) {
    const index = selectedSeatIds.indexOf(seatId);

    if (index === -1) {
        selectedSeatIds.push(seatId);
    } else {
        selectedSeatIds.splice(index, 1);
    }

    selectedSeatsText.textContent = "Valgte sæder: " + selectedSeatIds.join(", ");
}