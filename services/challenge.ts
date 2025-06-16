/**
 * Fetches the current challenge from the `/api/challenge` endpoint.
 *
 * Sends a GET request to retrieve challenge data. Throws an error if the response is not OK
 * or if no challenge data is found in the response.
 *
 * @returns {Promise<any>} The challenge data returned from the API.
 * @throws {Error} If the response is not successful or if no challenge is found.
 */
export const getChallenge = async () => {
    const response = await fetch(`/api/challenge`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (response.ok) {
        const data = await response.json();
        console.log("Data fetched from API:", data);

        // Controlla se ci sono utenti nella risposta
        if (!data || data.length === 0) {
            throw new Error("Nessuna challenge trovata.");
        }

        return data;
    }

    throw new Error(`Errore: ${response.status} - ${response.statusText}`);
};