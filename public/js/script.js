"use strict";

async function getWonder() {
    try {
        const response = await fetch("/api/wonder");
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error (result.message || "Could not fetch wonders");
        }

        displayWonder(result.data)
    }
}