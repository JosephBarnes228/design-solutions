function displayLinks() {
    var links = document.getElementById("links");
    if (links.className === "links") {
        links.className += " responsive";
    } else {
        links.className = "links";
    }
}