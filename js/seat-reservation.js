const API_BASE = "http://localhost:8080";
// Backend URL

const inpShowingId = document.getElementById("showingId"); // Henter inputfeltet hvor brugeren skriver showing id
const btnLoadSeats = document.getElementById("btnLoadSeats"); // Henter knappen der skal hente sæder
const seatGrid = document.getElementById("seatGrid"); // Henter området hvor sæde-knapperne skal vises
const statusText = document.getElementById("statusText"); // Henter tekstfeltet hvor statusbeskeder vises
const selectedSeatsText = document.getElementById("selectedSeatsText"); // Henter tekstfeltet der viser valgte sæder
const btnCreateReservation = document.getElementById("btnCreateReservation"); // Henter knappen der laver reservationen
const resultMessage = document.getElementById("resultMessage"); // Henter feltet hvor reservationsbeskeden vises

let selectedSeatIds = []; // Liste af sædeID'er som man har valgt
let currentShowingId = null; // gemmer showing ID'et man har tastet

btnLoadSeats.addEventListener("click", function () { // Kører functionen når man trykker på "hentsæder"
    const showingId = inpShowingId.value; // Henter det man taster ind

    if (showingId === "" || showingId < 1) { // Tjekker om input feltet er gyldigt
        statusText.textContent = "Skriv et gyldigt showing id"; // Viser fejl hvis ugyldigt
        return;
    }

    currentShowingId = showingId; // Gemmer showingID
    selectedSeatIds = []; // Nulstiller tidligere valgte sæder
    selectedSeatsText.textContent = ""; // Tømmer tekstfeltet med de valgte sæder
    resultMessage.textContent = ""; // Tømmer reservationsbeskeden

    loadAvailableSeats(showingId); // kalder på den funktion som hhenter ledige sæder fra vores backend
});

btnCreateReservation.addEventListener("click", function () {
    if (currentShowingId == null || selectedSeatIds.length === 0) {
        return;
    }

    resultMessage.textContent =
        "Tak for reservationen.";
});

function loadAvailableSeats(showingId) { // funktion som henter ledige sæder fra backend
    statusText.textContent = "Henter sæder...";
    seatGrid.innerHTML = "";

    fetch(API_BASE + "/showings/" + showingId + "/available-seats") // Sender GET request til backend
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Fejl ved hentning af sæder");
            }
            return response.json();
        })
        .then(function (seats) { // modtager liste af sæder
            if (seats.length === 0) { // tjekker om der er ledige sæder
                statusText.textContent = "Ingen ledige sæder fundet";
                return;
            }

            statusText.textContent = "Vælg sæder";

            for (let i = 0; i < seats.length; i++) { // Gennemgår alle sæder i listen
                const seat = seats[i]; // Gemmer valgte sæde i en variable

                const button = document.createElement("button"); //Laver knap til sædet
                button.textContent = "Række " + seat.rowNo + " Sæde " + seat.seatNo; // Skriver række og sæde nr. på knappen

                button.addEventListener("click", function () { // Kører når man trykker på et sæde
                    toggleSeat(seat.id); // Tilføjer eller fjerner sldet fra listen af valgte sæder
                });

                seatGrid.appendChild(button); // tilføjer knap til HTML
            }
        })
        .catch(function () {
            statusText.textContent = "Kunne ikke hente sæder";
        });
}

function toggleSeat(seatId) { // Funktion som vælger eller fravælger sæde
    const index = selectedSeatIds.indexOf(seatId); // finder sædets placering i liste over valgte sæder

    if (index === -1) { // hvis sædet ikke er valgt i forvejen
        selectedSeatIds.push(seatId); // tilføjer sædet til liste
    } else {
        selectedSeatIds.splice(index, 1); // hvis sædet allerede er valgt fjernes det fra listen
    }

    selectedSeatsText.textContent = "Valgte sæder: " + selectedSeatIds.join(", "); // Viser ens valgte sæder som tekst
}
