const urlPost = 'http://localhost:8080/createmovie';
const urlGet  = 'http://localhost:8080/allmovies';

const GetShowingsAPI = "http://localhost:8080/showallshowings";
const PostShowingsAPI = "http://localhost:8080/addshowing";

const GetReservations="http://localhost:8080/allreservations";

// Åbn popup
function openPopup(id) {
    loadMovies(); //til at hente film til create showing
    document.getElementById(id).classList.add('active');
}

// Luk popup
function closePopup(id) {
    document.getElementById(id).classList.remove('active');
}

// Luk popup ved klik udenfor boksen
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('overlay')) {
        e.target.classList.remove('active');
    }
});

// Hent alle film og vis i tabellen på adminside
async function getMovies() {
    const response = await fetch(urlGet);
    const movies = await response.json();

    // Finder <tbody id="moviesTableBody"> elementet i HTML'en
    const tbody = document.getElementById('moviesTableBody');

    // Rydder tabellen så vi ikke får dubletter når vi opdaterer listen
    tbody.innerHTML = '';

    // Løber igennem hvert movie objekt i arrayet
    movies.forEach(movie => {
        // Opretter en ny <tr> (tabelrække) i hukommelsen
        const row = document.createElement('tr');

        const performanceText = movie.underperforming ? "Dårlig" : "God";
        const performanceColor = movie.underperforming ? "red" : "green";

        row.innerHTML = `
            <td>${movie.title}</td>
            <td>${movie.category ? movie.category.name : '–'}</td> 
            <td>${movie.ageLimit}+</td>
            <td>${movie.duration} min</td>
            <td style="color:${performanceColor}; font-weight:bold;"> ${performanceText}</td>
            <td><button onclick="deleteMovie(${movie.id})">Slet film</button></td>
        `;
        // Tilføjer den færdige række til tabellen i HTML'en
        tbody.appendChild(row);
    });
}

//Henter alle showings i tabellen
async function getShowings () {
    const response = await fetch (GetShowingsAPI);
    const showings = await response.json();

    //Henter tabel til showings fra DOM
    const tBody = document.getElementById('showingsTableBody');

    //Fjerner gammel data fra tabel (ingen dupletter)
    tBody.innerHTML = '';

    //Looper gennem showings og tilføjer dem til tabel
    showings.forEach(showing => {
        const dateTime = showing.startTime; //Date time gemt i variabel
        const [date, time] = dateTime.split("T"); //Splitter date og time ved T og gemmer det i array
        const timeOnly = time.substring(0,5); //Fjerner sekunder fra time (Henter kun de første 5 indexer i string hh:mm)
        const endTimeOnly = showing.endTime.substring(11,16); //YYYY-MM-DDTHH:mm:ss

        //opretter ny række i tBody pr showing
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${showing.movie.title}</td>
            <td>${showing.theatre.name}</td>
            <td>${date}</td>
            <td>${timeOnly} - ${endTimeOnly}</td>
            <td><button onclick="deleteShowing(${showing.id})">Slet Forestilling</button></td>
        `;
        //tilføjer tækker til tabel
        tBody.appendChild(row);
    })
}

//Ryd formular efter film er oprettet
function resetMovieForm() {
    document.getElementById('title').value = '';
    document.getElementById('category').value = '';
    document.getElementById('ageLimit').value = '';
    document.getElementById('duration').value = '';
}

//Opret film
async function createMovie() {
    const title = document.getElementById('title').value;
    const categoryId = parseInt(document.getElementById('category').value);
    const ageLimit   = parseInt(document.getElementById('ageLimit').value);
    const duration   = parseInt(document.getElementById('duration').value);

    if (!title || !categoryId || !ageLimit || !duration) {
        alert('Udfyld venligst alle felter.');
        return;
    }

    // Sender en HTTP request til backend (http://localhost:8080/createmovie)
    const response = await fetch(urlPost, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title,
            ageLimit,
            duration,
            category: { id: categoryId }
            /* category sendes som objekt med id, så Spring Boot kan finde den i databasen
            i stedet for at prøve at oprette en ny */
        })
    });

    if (response.ok) {
        closePopup('moviePopup');
        resetMovieForm();
        await getMovies();
    } else {
        const err = await response.text();
        console.error('Fejl:', err);
        alert('Noget gik galt: ' + err);
    }
}

//Henter movies til showing (til option i stedet for tabel)
async function loadMovies() {
    const response = await fetch(urlGet);
    const movies = await response.json();

    //henter movieSelect fra DOM
    const movieSelect = document.getElementById("movieSelect");
    movieSelect.innerHTML = '<option value="">– Vælg film –</option>';
    //looper igennem alle film
    movies.forEach(movie => {
        //laver en ny option ud fra hvert film element
        const option = document.createElement("option");
        option.value = movie.id;
        option.textContent = movie.title;

        // gemmer varighed i option
        option.dataset.duration = movie.duration;

        movieSelect.appendChild(option);
    });
}

//beregner EndTime Værdi til brug i create Showing og beregning af den i real tid.
function calculateEndTimeValue(startTime, duration) {

    const start = new Date(startTime);
    const end = new Date(startTime);

    end.setMinutes(end.getMinutes() + parseInt(duration));

    // Hvis datoen ændrer sig → filmen går over midnat
    if (start.getDate() !== end.getDate()) {
        alert("Filmen kan ikke slutte efter kl. 23:59")
        throw new Error("Filmen kan ikke slutte efter kl. 23:59");
    }

    return end.toISOString().slice(0, 19); // iso string (yyyy-MM-ddTHH:mm:ss)
}

//Beregner slut tidspunkt
function calculateEndTime() {

    const movieSelect = document.getElementById("movieSelect");
    const startTime = document.getElementById("startTime").value;

    const duration = movieSelect.selectedOptions[0]?.dataset.duration;

    if (!startTime || !duration) return;

    // const start = new Date(startTime);
    //
    // start.setMinutes(start.getMinutes() + parseInt(duration));
    //
    // const endTime = start.toLocaleString("da-DK", {
    //     dateStyle: "short",
    //     timeStyle: "short"
    // });

    const endTime = calculateEndTimeValue(startTime, duration);

    document.getElementById("endTime").value = endTime;
}

//Reset create showing formular
function resetMovieFomular () {
    const movieId = document.getElementById("movieSelect").value;
    const theatreId = document.getElementById("theatreSelect").value;
    const startTime = document.getElementById("startTime").value;
}

//Create showing!
async function createShowing() {

    const movieId = document.getElementById("movieSelect").value;
    console.log(movieId);
    const theatreId = document.getElementById("theatreSelect").value;
    console.log(theatreId)
    const startTime = document.getElementById("startTime").value;
    console.log(startTime)

    //Variabel til filmens længde i minutter
    const duration = movieSelect.selectedOptions[0]?.dataset.duration;

    let endTime = null;

    //Hvis vi både har en start time og en længde af film
    if (startTime && duration) {
        endTime = calculateEndTimeValue(startTime, duration);
    }

    console.log(endTime);

    if (!movieId || !theatreId || !startTime || !endTime) {
        alert('Udfyld venligst alle felter.');
        return;
    }

    // Sender en HTTP request til backend (http://localhost:8080/createmovie)
    const response = await fetch(PostShowingsAPI, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            movie: { id: movieId },
            theatre: { id: theatreId},
            startTime,
            endTime
            /* category sendes som objekt med id, så Spring Boot kan finde den i databasen
            i stedet for at prøve at oprette en ny */
        })
    });

    if (!response.ok) {
        const error = await response.text();
        alert(error);
        return;
    }
    closePopup("showingPopup");

    await getShowings(); // opdater tabel
}


/* Kør når siden er loaded. Altså når browseren har indlæst og bygget hele HTML'en færdig er getMovies
funktionen der skal køre når det er */
document.addEventListener('DOMContentLoaded', getMovies);
document.addEventListener('DOMContentLoaded', getShowings);

//Lytter til movieSelect og startime, for at udrenge endtime til showing
document.getElementById("movieSelect").addEventListener("change", calculateEndTime);
document.getElementById("startTime").addEventListener("change", calculateEndTime);

//Slet film fra tabellen og databsen
async function deleteMovie(id) {
    if (!confirm('Er du sikker på at du vil slette filmen?')) return;

    const response = await fetch(`http://localhost:8080/admin/movie/${id}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        await getMovies();
    } else {
        alert('Noget gik galt. Prøv igen.');
    }
}

//Slet showing fra tabellen og database
async function deleteShowing(id) {
    if (!confirm('Er du sikker på at du vil slette forestillingen?')) return;

    const response = await fetch(`http://localhost:8080/deleteshowing/${id}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        await getShowings();
    } else {
        alert('Noget gik galt. Prøv igen.');
    }

}

//henter data fra backend
async function getReservations() {
    //sender get requst til url i toppen og venter på svar fra backend før den fortsætter
    const response = await fetch(GetReservations);
    //konverter JSON til JavaScript aray af reservation objekter
    const reservations = await response.json();

    //finder <tbody id="reservationsTableBody"> elementet i HTML'en
    const tbody = document.getElementById('reservationsTableBody');
   //Rydder tabellen så vi ike får dubletter
    tbody.innerHTML = '';

    //løber igennem hvert reservation objekt i arrayet (som vi konverteret før)
    reservations.forEach(reservation => {

        // Gemmer de tre felter i lokale variabler så de er nemme at tilgå
        const customer = reservation.customer;
        const showing = reservation.showing;
        const seatReservations = reservation.seatReservations;

        //opretter ny tabelrække
        const row = document.createElement('tr');

        //? betyder -> hvis feltes findes vis værdien ellers vis '-'
        //length tæller antal sæder i resrvationen
        row.innerHTML = `
         <td>${customer ? customer.name : '–'}</td>
            <td>${customer ? customer.phoneNr : '–'}</td>
            <td>${showing ? showing.movie.title : '–'}</td>
            <td>${seatReservations ? seatReservations.length : '–'}</td> 
            <td>${showing ? showing.startTime.substring(0, 16).replace('T', ' ') : '–'}</td>
        `; //substring(0, 16).replace('T', ' ') formaterer 2026-03-06T18:00:00 til 2026-03-06 18:00.
        tbody.appendChild(row); //tilføjer den færdige række til tabellen i HTML'en'
    });
}
//Kører getReservations funktionen når hele HTML siden er indlæst færdigt.
document.addEventListener('DOMContentLoaded', getReservations);