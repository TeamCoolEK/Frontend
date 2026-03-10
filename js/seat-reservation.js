const API_BASE = "http://localhost:8080";
// Backend URL

const inpShowingId = document.getElementById("showingId"); // Henter inputfeltet hvor brugeren skriver showing id
const inpPhoneNr = document.getElementById("phoneNr"); // Henter inputfeltet hvor brugeren skriver telefonnummer
const btnLoadSeats = document.getElementById("btnLoadSeats"); // Henter knappen der skal hente sæder
const seatGrid = document.getElementById("seatGrid"); // Henter området hvor sæde-knapperne skal vises
const statusText = document.getElementById("statusText"); // Henter tekstfeltet hvor statusbeskeder vises
const selectedSeatsText = document.getElementById("selectedSeatsText"); // Henter tekstfeltet der viser valgte sæder
const btnCreateReservation = document.getElementById("btnCreateReservation"); // Henter knappen der laver reservationen
const resultMessage = document.getElementById("resultMessage"); // Henter feltet hvor reservationsbeskeden vises

const confirmationPopup = document.getElementById("confirmationPopup"); // Popup baggrund

const popupShowing = document.getElementById("popupShowing"); // Viser showing i popup
const popupPhone = document.getElementById("popupPhone"); // Viser telefonnummer i popup
const popupSeats = document.getElementById("popupSeats"); // Viser valgte sæder i popup
const popupOkBtn = document.getElementById("popupOkBtn"); // OK-knap i popup

let selectedSeatIds = []; // Liste af sædeID'er som man har valgt
let currentShowingId = null; // gemmer showing ID'et man har tastet

//Henter showingId fra window.location.search, som bliver gemt fra index.html, når en showing vælges (app.js)
const params = new URLSearchParams(window.location.search);
const showingIdFromUrl = params.get("showingId");

if (showingIdFromUrl) {
    inpShowingId.value = showingIdFromUrl; // sætter værdien i inputfeltet
    currentShowingId = showingIdFromUrl;   // gemmer showingId
    loadAvailableSeats(showingIdFromUrl);  // henter sæder automatisk
}

btnLoadSeats.addEventListener("click", function () { // Kører når man trykker på "hentsæder"
    const showingId = inpShowingId.value; // Henter det man taster ind

    if (showingId === "" || showingId < 1) { // Tjekker om input feltet er gyldigt
        statusText.textContent = "Skriv et gyldigt showing id"; // Viser fejl hvis ugyldigt
        return;
    }

    currentShowingId = showingId; // Gemmer showingID
    selectedSeatIds = []; // Nulstiller tidligere valgte sæder
    selectedSeatsText.textContent = "Ingen"; // Tømmer tekstfeltet med de valgte sæder
    resultMessage.textContent = ""; // Tømmer reservationsbeskeden

    loadAvailableSeats(showingId); // kalder på den funktion som henter ledige sæder fra vores backend
});

function loadAvailableSeats(showingId) { // funktion som henter ledige sæder fra backend
    statusText.textContent = "Henter sæder...";
    seatGrid.innerHTML = "";

    fetch(API_BASE + `/showings/${showingId}/available-seats`) // Sender GET request til backend
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Fejl ved hentning af sæder");
            }
            return response.json();
        })
        .then(function (availableSeats) { // modtager liste af ledige sæder
            if (availableSeats.length === 0) {
                statusText.textContent = "Ingen ledige sæder fundet";
                return;
            }

            statusText.textContent = "Vælg sæder";

            renderAllSeats(availableSeats); // viser alle 240 sæder
        })
        .catch(function () {
            statusText.textContent = "Kunne ikke hente sæder";
        });
}

function renderAllSeats(availableSeats) { // laver alle sæder
    seatGrid.innerHTML = "";

    let maxRow = 0;
    let maxSeatNo = 0;

    // finder største række og største sædenummer
    for (let i = 0; i < availableSeats.length; i++) {
        if (availableSeats[i].rowNo > maxRow) {
            maxRow = availableSeats[i].rowNo;
        }

        if (availableSeats[i].seatNo > maxSeatNo) {
            maxSeatNo = availableSeats[i].seatNo;
        }
    }

    // sætter grid så det passer til salen
    seatGrid.style.gridTemplateColumns = "repeat(" + maxSeatNo + ", 55px)";

    for (let row = 1; row <= maxRow; row++) {
        for (let seatNo = 1; seatNo <= maxSeatNo; seatNo++) {

            let foundSeat = null;

            for (let i = 0; i < availableSeats.length; i++) {
                if (availableSeats[i].rowNo === row && availableSeats[i].seatNo === seatNo) {
                    foundSeat = availableSeats[i];
                    break;
                }
            }

            const button = document.createElement("button");
            button.textContent = row + "-" + seatNo;
            button.classList.add("seat");

            if (foundSeat !== null) {
                // sædet er ledigt
                button.classList.add("available");
                button.dataset.seatId = foundSeat.id;

                button.addEventListener("click", function () {
                    toggleSeat(foundSeat.id, button);
                });
            } else {
                // sædet er reserveret
                button.classList.add("reserved");
                button.disabled = true;
            }

            seatGrid.appendChild(button);
        }
    }
}

function toggleSeat(seatId, button) { // Funktion som vælger eller fravælger sæde
    const index = selectedSeatIds.indexOf(seatId); // finder sædets placering i liste over valgte sæder

    if (index === -1) { // hvis sædet ikke er valgt i forvejen
        selectedSeatIds.push(seatId); // tilføjer sædet til liste
        button.classList.remove("available");
        button.classList.add("selected");
    } else {
        selectedSeatIds.splice(index, 1); // hvis sædet allerede er valgt fjernes det fra listen
        button.classList.remove("selected");
        button.classList.add("available");
    }

    if (selectedSeatIds.length === 0) {
        selectedSeatsText.textContent = "Ingen";
    } else {
        selectedSeatsText.textContent = "Valgte sæder: " + selectedSeatIds.join(", "); // Viser ens valgte sæder som tekst
    }
}

btnCreateReservation.addEventListener("click", function () { // Kører når man trykker på "Create Reservation"
    if (currentShowingId == null || selectedSeatIds.length === 0) {
        resultMessage.textContent = "Vælg mindst ét sæde";
        return;
    }

    const phoneNr = inpPhoneNr.value; // Henter telefonnummer fra input

    if (phoneNr === "") {
        resultMessage.textContent = "Skriv telefonnummer";
        return;
    }

    // Bygger URL til POST request
    let url = API_BASE + "/reservations?showingId=" + currentShowingId + "&phoneNr=" + phoneNr;

    for (let i = 0; i < selectedSeatIds.length; i++) { // tilføjer alle sædeID'er til request
        url += "&seatIds=" + selectedSeatIds[i];
    }

    fetch(url, {
        method: "POST"
    })
        .then(function (response) {
            return response.text();
        })
        .then(function (message) {
            resultMessage.textContent = message; // viser svar fra backend

            popupShowing.textContent = currentShowingId; // viser showing id
            popupPhone.textContent = phoneNr; // viser telefonnummer
            popupSeats.textContent = selectedSeatIds.join(", "); // viser valgte sæder

            confirmationPopup.style.display = "flex"; // viser popup
        })
        .catch(function () {
            resultMessage.textContent = "Fejl ved oprettelse af reservation";
        });
});

    popupOkBtn.addEventListener("click", function () {
    window.location.href = "index.html";
});