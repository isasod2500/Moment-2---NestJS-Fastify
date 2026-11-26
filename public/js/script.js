"use strict";


async function getWonder() {
    try {
        const response = await fetch("/api/wonder");
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Could not fetch wonders");
        }

        displayWonders(result.data)
    } catch (err) {
        console.error("Could not load wonders:", err);

        document.getElementById("wonderList").textContent = "Could not load wonders";
    }
}

function displayWonders(wonders) {
    const wonderContainer = document.getElementById("wonderList");

    if (!wonderContainer) return;

    wonderContainer.replaceChildren();

    if (wonders.length === 0) {
        wonderContainer.textContent = "No wonders added yet.";
        return;
    }

    const list = document.createElement("ul");

    wonders.forEach((wonder) => {
        const listItem = document.createElement("li");

        const heading = document.createElement("h3");
        heading.textContent = wonder.name;

        const info = document.createElement("p");
        info.textContent = `${wonder.country}, ${wonder.year}${wonder.era}`;

        const survived = document.createElement("p")
        if (wonder.survived == false) {
            survived.textContent = `Survived: No`
        } else {
            survived.textContent = `Survived: Yes`
        }

        const viewButton = document.createElement("button");
        viewButton.textContent = "→";
        viewButton.classList.add("viewButton");
        viewButton.type = "button";
        viewButton.setAttribute("aria-label", `View ${wonder.name}`);

        viewButton.addEventListener("click", () => {
            window.location.href = `/wonder.html?id=${wonder._id}`;
        });

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.classList.add("editButton")
        editButton.type = "button"

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("deleteButton")
        deleteButton.type = "button";

        editButton.addEventListener("click", () => {
            const oldForm = listItem.querySelector("form");

            if (oldForm) {
                oldForm.remove();
                return;
            }

            listItem.appendChild(createEditForm(wonder));
        });

        deleteButton.addEventListener("click", () => {
            deleteWonder(wonder._id);
        });

        listItem.append(
            heading,
            info,
            survived,
            viewButton,
            editButton,
            deleteButton
        );

        list.appendChild(listItem);
    });
    wonderContainer.appendChild(list);
}

function createEditForm(wonder) {

    const form = document.createElement("form");
    form.classList.add("editForm");

    const errors = []
    errors.length = 0;



    const fields = [
        { label: "Wonder name:", name: "name", type: "text", value: wonder.name },
        { label: "Country:", name: "country", type: "text", value: wonder.country },
        { label: "Year built:", name: "year", type: "number", value: wonder.year },
    ];

    fields.forEach((field) => {
        const label = document.createElement("label");
        label.textContent = field.label;

        const input = document.createElement("input");
        input.type = field.type;
        input.name = field.name;
        input.value = field.value;

        form.append(label, input);
    })

    const survivedDiv = document.createElement("div")
    survivedDiv.classList.add("survivedDiv")

    const survivedLabel = document.createElement("label");
    survivedLabel.textContent = "Survived:";

    const survivedInput = document.createElement("input");
    survivedInput.type = "checkbox";
    survivedInput.name = "survived";
    survivedInput.checked = wonder.survived;

    survivedDiv.append(survivedLabel, survivedInput)
    form.append(survivedDiv);

    const eraDiv = document.createElement("div");
    eraDiv.classList.add("eraField");

    const eraLabel = document.createElement("label");
    eraLabel.textContent = "Era:";

    const eraSelect = document.createElement("select");
    eraSelect.name = "era";

    ["BC", "AD"].forEach((era) => {
        const option = document.createElement("option");
        option.value = era;
        option.textContent = era;
        eraSelect.appendChild(option);
    });

    eraSelect.value = wonder.era;

    eraDiv.append(eraLabel, eraSelect);
    form.appendChild(eraDiv);

    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.classList.add("saveButton");
    saveButton.textContent = "Save changes";

    form.appendChild(saveButton);

    const editErrorList = document.createElement("ul")
    editErrorList.classList.add("editErrorList")
    editErrorList.innerHTML = ""

    form.appendChild(editErrorList);



    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = form.elements.namedItem("name").value.trim();
        const country = form.elements.namedItem("country").value.trim();
        const year = Number(form.elements.namedItem("year").value);
        const era = form.elements.namedItem("era").value;
        const survived = survivedInput.checked;

        if (!name || name.length < 3) {

            errors.push("Wonder name missing or too short.")
        }

        if (!country || country.length < 4) {

            errors.push("Country name missing or too short.")
        }


        if (!Number.isInteger(year) || year <= 0) {

            errors.push("Wonder year missing or invalid")
        }

        if (errors.length > 0) {
            errors.forEach(error => {
                let errorLine = document.createElement("li")
                errorLine.innerHTML = error
                editErrorList.appendChild(errorLine)

            });
            return;
        }


        editWonder(wonder._id, name, country, year, era, survived);
    })

    return form;
}

async function editWonder(id, name, country, year, era, survived) {
    try {
        const response = await fetch(`/api/wonder/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                country,
                year,
                era,
                survived
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Could ont update wonder");
        }

        getWonder();
    } catch (err) {
        console.error("Could not update wonder:", err)
    }
}

async function deleteWonder(id) {
    if (!confirm("Are you sure you want to delete this wonder?")) {
        return;
    }

    try {
        const response = await fetch(`/api/wonder/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            console.error("Could not delete wonder:", result.message);
        }

        getWonder();

    } catch (err) {
        console.error("Could not delete wonder:", err);
    }
}

async function sendWonder(event) {
    event.preventDefault();

    const errors = []
    errors.length = 0;
    const errorList = document.getElementById("errorList")
    errorList.innerHTML = ""

    const form = document.getElementById("wonderForm");

    const name = form.elements.namedItem("name").value.trim();
    const country = form.elements.namedItem("country").value.trim();
    const year = Number(form.elements.namedItem("year").value);
    const era = form.elements.namedItem("era").value;
    const survived = form.elements.namedItem("survived").checked;

    if (!name || name.length < 3) {

        errors.push("Wonder name missing or too short.")
    }

    if (!country || country.length < 4) {

        errors.push("Country name missing or too short.")
    }


    if (!Number.isInteger(year) || year <= 0) {

        errors.push("Wonder year missing or invalid")
    }

    if (errors.length > 0) {
        errors.forEach(error => {
            let errorLine = document.createElement("li")
            errorLine.innerHTML = error
            errorList.appendChild(errorLine)

        });
        return;
    }

    try {
        const response = await fetch("/api/wonder", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                country,
                year,
                era,
                survived
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Could not save wonder");
        }

        form.reset();

        await getWonder();
    } catch (err) {
        console.error("Could not save wonder:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    getWonder();

    const wonderForm = document.getElementById("wonderForm");

    wonderForm.addEventListener("submit", sendWonder);
})