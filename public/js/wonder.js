"use strict";

async function getSingleWonder() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const container = document.getElementById("wonderDetails");

    if (!id) {
        container.textContent = "No wonder ID provided.";
        return;
    }

    try {
        const response = await fetch(`/api/wonder/${encodeURIComponent(id)}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Could not fetch wonder");
        }

        displaySingleWonder(result.data);

    } catch (err) {
        console.error("Could not load wonder:", err);
        container.textContent = "Could not load wonder.";
    }
}


function displaySingleWonder(wonder) {
    const container = document.getElementById("wonderDetails");
    container.replaceChildren();

    const heading = document.createElement("h2");
    heading.textContent = wonder.name;

    const country = document.createElement("p");
    country.textContent = `Country: ${wonder.country}`;

    const year = document.createElement("p");
    year.textContent = `Year: ${wonder.year} ${wonder.era}`;

    const survived = document.createElement("p");
    survived.textContent = `Survived: ${wonder.survived ? "Yes" : "No"}`;

    container.append(
        heading,
        country,
        year,
        survived
    );
}


document.addEventListener("DOMContentLoaded", getSingleWonder);