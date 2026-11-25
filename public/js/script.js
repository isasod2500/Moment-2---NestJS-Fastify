"use strict";

async function getWonder() {
    try {
        const response = await fetch("/api/wonder");
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Could not fetch wonders");
        }

        displayWonder(result.data)
    } catch (err) {
        console.error("Could not load wonders:", err);

        document.getElementById("wonderrList").textContent = "Could not load wonders";
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

    wonders.forEacH((wonder) => {
        const listItem = document.createElement("li");

        const heading = document.createElement("h3");
        heading.textContent = wonder.name;

        const info = document.createElement("p");
        info.textContent = `${wonder.country}, ${wonder.year}, Survived: ${wonder.survived}`;

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.type = "button"

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
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
            editButton,
            deleteButton
        );

        list.appendChild(listItem);
    });
    wonderContainer.appendChild(list);
}

function createEditForm(wonder) {
    const form = document.createElement("form");

    const fields = [
        { label: "Wonder name:", name: "name", type: "text", value: wonder.name },
        { label: "Country:", name: "country", type: "text", value: wonder.country },
        { label: "Year:", name: "year", type: "number", value: wonder.year }
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

    const survivedLabel = document.createElement("label");
    survivedLabel.textContent = "Survived:";

    const survivedInput = document.createElement("input");
    survivedInput.type = "checkbox";
    survivedInput.name = "survived";
    survivedInput.checked = wonder.survived;

    form.append(survivedLabel, survivedInput);

    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.textContent = "Save changes";

    form.appendChild(saveButton);

    form.addeventListener("submit", (event) => {
        event.preventDefault();

        const name = form.elements.namedItem("name").value.trim();
        const country = form.elements.namedItem("country").value.trim();
        const year = Number(form.elements.namedItem("year").value);
        const survived = survivedInput.checked;

        if (!name || !country || !Number.isInteger(year)) {
            alert("Field(s) missing valid value.")
            return;
        }

        editWonder(wonder._id, name, country, year, survived);
    })

    return form;
}

async function editWonder(id, name, country, year, survived) {
    try {
        const response = await fetch(`/api/wonder/${id}`, {
            method: "PUT",
            headers: {
                "Content_Type": "application/json"
            },
            body: JSON.stringify({
                name,
                country,
                year,
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
    if(!confirm("Are you sure you want to delete this wonder?")) {
        return;
    }

    try {
        const response = await fetch(`/api/wonder/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            console.error("Could not delete wonder:", err);
        }

        getWonder();

    } catch (err) {
        console.error("Could not delete wonder:", err);
    }
}

async function sendWonder(event)  {
    event.preventDefault();

    const form = document.getElementById("wonderForm");

    const name = form.elements.namedItem("name").value.trim();
    const country = form.elements.namedItem("country").value.trim();
    const year = Number(form.elements.namedItem("year").value);
    const survived = form.elements.namedItem("survived").checked;

    if (!name || !country || !Number.isInteger(year)) {
        alert("Field(s) missing valid values")
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
                survived
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Could not save wonder");
        }

        form.reset();

        await getWonder();
    } catch(err) {
        console.error("Could not save wonder:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    getWonder();

    const wonderForm = document.getElementById("wonderForm");

    wonderForm.addeventListener("submit", sendWonder);
})