// Resout les dates symboliques (TODAY / TOMORROW / TODAY+N) en YYYY-MM-DD au
// runtime : garde les fixtures sans date en dur, donc les bornes restent
// valides quel que soit le jour d'execution.
export function convertDate(value) {
    if (value === null) {
        return value;
    }
    const date = new Date();
    if (value === "TODAY") {
        // Aucun decalage : c'est la borne inferieure INVALIDE (min = demain),
        // utilisee pour verifier qu'un transfert date d'aujourd'hui est refuse.
    }
    else if (value === "TOMORROW") {
        date.setDate(date.getDate() + 1);
    }
    else if (value.startsWith("TODAY+")) {
        const days = parseInt(value.split("+")[1], 10);
        if (!isNaN(days)) date.setDate(date.getDate() + days);
    }
    else {
        // Valeur deja litterale (ex. une date brute) : renvoyee telle quelle.
        return value;
    }
    const p = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}
