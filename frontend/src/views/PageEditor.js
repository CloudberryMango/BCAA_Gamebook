import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:3000";

function PageEditor() {
  const { pageId } = useParams();
  const navigate = useNavigate(); // Hook pro navigaci (tlačítko Zpět)

  const [page, setPage] = useState(null); // Data aktuální stránky
  const [allPages, setAllPages] = useState([]); // Seznam všech stránek pro výběr v menu
  
  // Pomocné stavy pro přidávání nové volby
  const [choiceText, setChoiceText] = useState("");
  const [targetId, setTargetId] = useState("");

  useEffect(() => {
    // 1. Načíst detail stránky, kterou upravujeme
    fetch(API_URL + "/page/get?id=" + pageId)
      .then(res => res.json())
      .then(data => {
        setPage(data);
        
        // 2. Až máme detail, zjistíme ID příběhu a načteme ostatní stránky
        // abychom je mohli vybrat v roletce (dropdownu)
        fetch(API_URL + "/page/list?storyId=" + data.storyId)
          .then(res => res.json())
          .then(pagesList => setAllPages(pagesList));
      });
  }, []);

  const saveChanges = () => {
    // Odeslání upravené stránky na server
    fetch(API_URL + "/page/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        id: page.id, 
        title: page.title, 
        content: page.content,
        choices: page.choices
      })
    })
    .then(() => {
      alert("Změny byly uloženy!");
    });
  };

  const addChoice = () => {
    if (choiceText === "" || targetId === "") {
      alert("Vyplň text a vyber kam odkaz vede!");
      return;
    }
    
    // Vytvoříme novou volbu
    const newChoice = { 
        text: choiceText, 
        targetPageId: targetId 
    };

    let currentChoices = page.choices;
    if (!currentChoices) {
        currentChoices = [];
    }

    // Zkopírujeme stávající volby a přidáme novou
    const updatedChoices = currentChoices.concat(newChoice);

    // Aktualizujeme stav stránky
    setPage({ ...page, choices: updatedChoices });

    // Vyčistíme políčka
    setChoiceText("");
  };

  const removeChoice = (indexToDelete) => {
    // Vyfiltrujeme volbu podle indexu (pořadí)
    const updatedChoices = page.choices.filter((item, index) => index !== indexToDelete);
    setPage({ ...page, choices: updatedChoices });
  };

  if (!page) return <p>Načítám...</p>;

  return (
    <div>
      <div className="nav-header">
        <button className="secondary" onClick={() => navigate(-1)}>← Zpět</button>
        <h2>Editace stránky</h2>
      </div>

      <label>Název stránky:</label>
      <input 
        value={page.title} 
        // Když uživatel píše, aktualizujeme název v objektu page
        onChange={(e) => setPage({...page, title: e.target.value})} 
      />

      <label>Obsah textu:</label>
      <textarea 
        rows="8" 
        value={page.content} 
        onChange={(e) => setPage({...page, content: e.target.value})} 
      />

      <button onClick={saveChanges}>Uložit změny</button>

      <hr />

      <h3>Nastavení voleb</h3>
      <div style={{ background: '#dfd', padding: '10px', marginBottom: '10px' }}>
        <input 
          placeholder="Text tlačítka (např. Jít do lesa)" 
          value={choiceText}
          onChange={(e) => setChoiceText(e.target.value)}
        />
        
        <select value={targetId} onChange={(e) => setTargetId(e.target.value)}>
          <option value="">-- Vyber kam odkaz vede --</option>
          {allPages.map(p => (
             // Vypíšeme možnosti, ale vynecháme aktuální stránku (aby nešlo odkazovat na sebe)
             p.id !== page.id && <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>

        <button onClick={addChoice}>Přidat volbu</button>
      </div>

      <ul>
        {(page.choices || []).map((choice, index) => {
            const target = allPages.find(p => p.id === choice.targetPageId);
            const targetName = target ? target.title : "Neznámá stránka";

            return (
              <li key={index}>
                <span>
                   Tlačítko: <b>{choice.text}</b> -> vede na: <i>{targetName}</i>
                </span>
                <button className="delete" onClick={() => removeChoice(index)}>Smazat</button>
              </li>
            );
        })}
      </ul>
    </div>
  );
}

export default PageEditor;