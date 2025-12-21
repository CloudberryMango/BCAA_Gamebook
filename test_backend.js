// Soubor: test_backend.js

async function runTest() {
    const baseURL = "http://localhost:3000";
    console.log("Spouštění testu...\n");

    try {
        // 1. ZALOŽENÍ PŘÍBĚHU
        console.log("1. Vytvoření příběhu...");
        const storyRes = await fetch(`${baseURL}/story/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Cesta do dračího hradu" })
        });
        const story = await storyRes.json();
        if (!story.id) throw new Error("Chyba: Příběh se nevytvořil.");
        console.log(`Příběh vytvořen: "${story.name}" (ID: ${story.id})`);

        // 2. VYTVOŘENÍ PRVNÍ STRÁNKY (ÚVOD)
        console.log("\n2. Vytvoření úvodní stránky...");
        const page1Res = await fetch(`${baseURL}/page/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                storyId: story.id, 
                title: "Úvod",
                content: "Stojíš před bránou hradu." 
            })
        });
        const page1 = await page1Res.json();
        console.log(`Stránka 1 vytvořena: "${page1.title}"`);

        // 3. VYTVOŘENÍ DRUHÉ STRÁNKY (CÍL)
        console.log("\n3. Vytvoření druhé stránky (Les)...");
        const page2Res = await fetch(`${baseURL}/page/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                storyId: story.id, 
                title: "Temný les",
                content: "Vstoupil jsi do lesa. Je tu tma." 
            })
        });
        const page2 = await page2Res.json();
        console.log(`Stránka 2 vytvořena: "${page2.title}"`);

        // 4. PROPOJENÍ STRÁNEK
        console.log("\n4. Propojení úvodu s druhou stránkou...");
        const updateRes = await fetch(`${baseURL}/page/update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: page1.id,
                choices: [{ text: "Jít do lesa", targetPageId: page2.id }]
            })
        });
        const updatedPage1 = await updateRes.json();
        
        // Kontrola propojení
        if (updatedPage1.choices.length > 0 && updatedPage1.choices[0].targetPageId === page2.id) {
            console.log("Propojení úspěšné! Volba byla uložena.");
        } else {
            throw new Error("Chyba: Volba se neuložila.");
        }

        // 5. KONTROLA SEZNAMU STRÁNEK
        console.log("\n5. Kontrola výpisu stránek...");
        const listRes = await fetch(`${baseURL}/page/list?storyId=${story.id}`);
        const list = await listRes.json();
        console.log(`Nalezeno ${list.length} stránek v příběhu.`);

        console.log("\nTest proběhl úspšně");

    } catch (error) {
        console.error("\nChyba testu:", error.message);
    }
}

runTest();