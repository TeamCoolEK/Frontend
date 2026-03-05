
const urlPost = 'http://localhost:8080/createmovie'
const urlGet = 'http://localhost:8080/allmovies';

async function getMovies() {
    const allMovies = await fetch(urlGet);
    const data = await allMovies.json();
    console.log(data);
}



//Promise der afventer Post request før denne metode køres.
async function createMovie() {
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const ageLimit = document.getElementById('ageLimit').value;
    const duration = document.getElementById('duration').value;

    if (!title || !category || !ageLimit || !duration) {
        alert('Udfyld venligst alle felter.');
        return;
    }

    const response = await fetch(urlPost, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, category, ageLimit, duration })
    })
    if (response.ok) {
        alert('Film oprettet');