export const getChallenge = async () => {
    const response = await fetch(`/api/challenge`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Data fetched from API:", data);

    // Controlla se ci sono utenti nella risposta
    if (!data || data.length === 0) {
        throw new Error("Nessuna challenge trovata.");
    }

    return data;
};