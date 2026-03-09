//Backend URL
const API_BASE = "http://localhost:8080";

//Her finder vi HTML elementet hvor den aktuelle dato skal vises
const currentDateEl = document.getElementById("currentDate");
//Her finder vi containeren hvor filmvisninger skal indsættes
const movieContainer = document.getElementById("movie-container");

//Vi opretter en variabel med dags dato
let currentDate = new Date();

//Funktion der formaterer dato til formatet yyyy-mm-dd
//Bruges i API kaldet til backend
function formatDate(date) {
    return date.toISOString().split('T')[0];  //splitter ISO dato og tage kun dato-delen
}

// Opdaterer datoen på siden og henter nye filmvisninger for datoen
function updateDateDisplay() {
    //Viser datoen i brugervenligt format
    currentDateEl.textContent = currentDate.toLocaleDateString();
    //Henter filmvisninger for aktuelle dato
    loadShowings();
}
//Funktionen henter showings fra backend API  - Async bruges fordi vi laver API kald med await
async function loadShowings() {
    //formatterer datoen så backend kan forstå den
    const date = formatDate(currentDate);

    //Kalder backend endpoint med den valgte dato
    const res = await fetch(API_BASE + "/showByDate?date=" + date);

    //Konverterer response fra JSON til JavasCript objekt
    const showings = await res.json();

    //Rydder containeren så gamle film ikke bliver stående
    movieContainer.innerHTML = "";

    //Hvis der ikke er nogen forestillinger den dag
    if (showings.length === 0) {
        movieContainer.innerHTML = "<p>Ingen forestillinger denne dag.</p>";
        return; //stopper funktionen
    }

    //Loop, igennem alle showings der kommer fra backend
    showings.forEach(showing => {
        //Tjekker at showing bliver vist korrekt
        console.log(showing);

        //Opretter et nyt div  element til hver film
        const div = document.createElement("div");

        //tilføjer en CSS klasse til styling
        div.classList.add("movie-card");

        //formatter start tid, så der kun vises klokkeslæt
        const start = new Date(showing.startTime);
        const formattedTime = start.getHours().toString().padStart(2, '0')
                                    + ":" + start.getMinutes().toString().padStart(2, '0');

        //indsætter filmens information i HTML - Template strings (${ }) bruges til at indsætte data
        div.innerHTML = `
            <h3>${showing.movie.title}</h3>
            <p>Tid: ${formattedTime}</p>
            <p>Sal: ${showing.theatre.name}</p>
        `;

        //eventlistner til at klikke på showing og komme videre til sæde reservation
        div.addEventListener("click", async () => {
            try {
                // Sender API-kald til backend med showing id
                const res = await fetch(API_BASE + "/showings/" + showing.id + "/available-seats");
                // Konventere API-kald til json
                const details = await res.json();

                // Navigere til showing HTML
                window.location.href = "showing.html";
            } catch (error) {
                console.error("Fejl ved hentning af showing:", error);
            }
        })

        //Tilføjer filmkortet til containeren i HTML
        movieContainer.appendChild(div);
    });
}

//Even listener på knappen der går til forrige dag
document.getElementById("prevDay").addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() - 1); //trækker 1 dag fra nuværende dato
    updateDateDisplay();  //opdaterer  visningen og henter nye showings
});

//Event listener på knappen der går til næste dag
document.getElementById("nextDay").addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() + 1); //lægger 1 dag til nuværende dato
    updateDateDisplay(); //opdaterer visning  og henter nye showings
});

// init - Initialiserer siden når den loader, viser dags dato og henter showings for i dag.
updateDateDisplay();