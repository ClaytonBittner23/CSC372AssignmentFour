//Grabs these from the HTML Page
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const showGallery = document.getElementById("show-gallery");
const statusMessage = document.getElementById("status-message");

//Adding a listener to the submit button on the search box
searchForm.addEventListener("submit", handleSearchFormSubmit);

//Runs this function when you hit submit.
async function handleSearchFormSubmit(event) {
    event.preventDefault();

    const query = searchInput.value;
    await searchShows(query);
}

//This function is used when you search
async function searchShows(query) {

    //Clears out the existing cards
    showGallery.replaceChildren();

    //Checks to see if you entered nothing
    if (!query.trim()) {
        statusMessage.textContent = "Please enter a show name";
        return;
    }

    //message while loading
    statusMessage.textContent = "Loading shows....";

    //api url with the search input tacked on to the end to pull up relivent data
    const apiUrl = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query.trim())}`;

    try {
        const response = await fetch(apiUrl);

        //if not a ok response, throw a error
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        //Grabs the json data and cuts off anything past the top 10
        const results = await response.json();
        const shows = results.slice(0, 10);

        //If theres no shows, say so
        if (shows.length === 0) {
            statusMessage.textContent = "No shows found. Try another search.";
            return;
        }

        //Output the number of found shows
        statusMessage.textContent = ("Found " + shows.length + " shows.");

        //for every show found, max 10, create a card for that
        for (const result of shows) {
            const show = result.show;
            const card = createShowCard(show);

            //add that showcard to the gallery
            showGallery.appendChild(card);
        }

    //If there is a error with the response, throw this
    } catch (error) {
        statusMessage.textContent = "Something went wrong while loading shows. Please try again.";
        console.error("Error fetching shows:", error);
    }
}

//function for creating a card for each show
function createShowCard(show) {

    //Creates a card element under the show-card class
    const card = document.createElement("article");
    card.className = "show-card";

    //Header of teh show name
    const title = document.createElement("h2");
    title.textContent = show.name || "Not available";
    card.appendChild(title);

    //If theres a poster, add the image to the card
    if (show.image && show.image.medium) {
        const poster = document.createElement("img");
        poster.src = show.image.medium;
        poster.alt = "Poster for the show";
        card.appendChild(poster);
    }

    //Create a paragraph for the summary and display it if poss
    const summary = document.createElement("p");
    if (show.summary) {
        summary.textContent = htmlToText(show.summary);
    } else {
        summary.textContent = "Not available";
    }
    card.appendChild(summary);

    //These three call a function with the detail name provided, it then checks to see if the api has the data for the other half of it
    addDetail(card, "Released", show.premiered);
    addDetail(card, "Genres", show.genres.join(", "));
    addDetail(card, "Average rating", show.rating.average);

    //Creating the link to view the show on tvMaze
    const link = document.createElement("a");
    link.href = show.url;
    link.textContent = "View on TVmaze";
    card.appendChild(link);

    //All done, return the card
    return card;
}

//add detail fucntion to check and see if the details have informaiton before they are tacked on
function addDetail(card, label, value) {
    const detail = document.createElement("p");

    //If a value is null, undefined, or blank, set it to not avaliable
    if (value === null || value === undefined || value === "") {
        value = "Not available";
    }

    //stick the label and the value it goes with together to make the detail, then stick it onto the card
    detail.textContent = (label + ": " + value);
    card.appendChild(detail);
}

//this part cleans up the html by removing the tag and html specfic things with nothing so you get a clean output
function htmlToText(html) {
    return html.replace(/<[^>]*>/g, "");
}

//Default to FMA anime. It was this or Steins;Gate
searchShows("Fullmetal Alchemist");
