async function loadFragment(id, url) {
    const res = await fetch(url);
    const text = await res.text();
    document.getElementById(id).innerHTML = text;
}
//loader header/footer på alle sider
loadFragment("header-container", "fragments/header.html");
loadFragment("footer-container", "fragments/footer.html");
