const urlPost = 'http://localhost:8080/createmovie';
const urlGet  = 'http://localhost:8080/allmovies';

// Åbn popup
function openPopup(id) {
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

/* Kør når siden er loaded. Altså når browseren har indlæst og bygget hele HTML'en færdig er getMovies
funktionen der skal køre når det er */
document.addEventListener('DOMContentLoaded', getMovies);