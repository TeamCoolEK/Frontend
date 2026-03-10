const urlPost = 'http://localhost:8080/createmovie';
const urlGet  = 'http://localhost:8080/allmovies';

const GetShowingsAPI = "http://localhost:8080/admin/showallshowings";
const PostShowingsAPI = "http://localhost:8080/admin/addshowing";

// Åbn popup
function openPopup(id) {
    document.getElementById(id).classList.add('active');
}

// Åben popup (Showings)
function openShowingPopup(id) {
    loadMovies();
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
        row.innerHTML = `
            <td>${movie.title}</td>
            <td>${movie.category ? movie.category.name : '–'}</td> 
            <td>${movie.ageLimit}+</td>
            <td>${movie.duration} min</td>
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

        //opretter ny række i tBody pr showing
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${showing.movie.title}</td>
            <td>${showing.theatre.name}</td>
            <td>${date}</td>
            <td>${timeOnly}</td>
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

//Beregner slut tidspunkt
function calculateEndTime() {

    const movieSelect = document.getElementById("movieSelect");
    const startTime = document.getElementById("startTime").value;

    const duration = movieSelect.selectedOptions[0]?.dataset.duration;

    if (!startTime || !duration) return;

    const start = new Date(startTime);

    start.setMinutes(start.getMinutes() + parseInt(duration));

    const endTime = start.toLocaleString("da-DK", {
        dateStyle: "short",
        timeStyle: "short"
    });

    document.getElementById("endTime").value = endTime;
}

//Create showing!
async function createShowing() {

    const movieId = document.getElementById("movieSelect").value;
    const theatreId = document.getElementById("theatreSelect").value;
    const startTime = document.getElementById("startTime").value;

    const showing = {
        movieId: movieId,
        theatreId: theatreId,
        startTime: startTime
    };

    await fetch(PostShowingsAPI, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(showing)
    });

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