import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_URL = "http://localhost:3000";

function StoryDetail() {
  const params = useParams(); // Získáme ID z URL adresy
  const storyId = params.storyId;

  const [story, setStory] = useState(null);
  const [pages, setPages] = useState([]);
  
  // Stavy pro formulář nové stránky
  const [pageTitle, setPageTitle] = useState("");
  const [pageContent, setPageContent] = useState("");

  useEffect(() => {
    // 1. Načíst informace o příběhu (jméno atd.)
    fetch(API_URL + "/story/get?id=" + storyId)
      .then(response => response.json())
      .then(data => setStory(data));

    // 2. Načíst seznam stránek tohoto příběhu
    fetch(API_URL + "/page/list?storyId=" + storyId)
      .then(response => response.json())
      .then(data => setPages(data));
  }, []); // Prázdné pole = spustí se jen jednou při načtení

  const createPage = () => {
    if (pageContent === "") {
      alert("Obsah stránky nesmí být prázdný.");
      return;
    }

    const newPageData = {
      storyId: storyId,
      title: pageTitle || "Bez názvu", // Pokud není název, dáme default
      content: pageContent
    };

    fetch(API_URL + "/page/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPageData)
    })
    .then(response => response.json())
    .then(createdPage => {
      // Přidáme novou stránku do aktuálního seznamu
      const newPagesList = pages.concat(createdPage);
      setPages(newPagesList);
      // Vyčistíme formulář
      setPageTitle("");
      setPageContent("");
    });
  };

  const deletePage = (pageId) => {
    fetch(API_URL + "/page/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: pageId })
    })
    .then(() => {
      // Odstranění ze seznamu na obrazovce
      setPages(pages.filter(p => p.id !== pageId));
    });
  };

  // Pokud se data ještě nenačetla, ukážeme text Načítám
  if (story === null) {
    return <p>Načítám data...</p>;
  }

  return (
    <div>
      <div className="nav-header">
        <Link to="/">← Zpět na seznam</Link>
        <Link to={"/read/" + storyId}>
          <button style={{fontSize: '1.2em'}}>HRÁT PŘÍBĚH</button>
        </Link>
      </div>

      <h1>Příběh: {story.name}</h1>
      <p>Máte vytvořeno {pages.length} stránek.</p>

      <div style={{ background: '#eef', padding: '15px', marginBottom: '20px' }}>
        <h3>Přidat novou stránku</h3>
        <input 
          placeholder="Název stránky (např. Jeskyně)" 
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
        />
        <textarea 
          placeholder="Zde napište děj..." 
          rows="3"
          value={pageContent}
          onChange={(e) => setPageContent(e.target.value)}
        />
        <button onClick={createPage}>Uložit stránku</button>
      </div>

      <h3>Existující stránky</h3>
      <ul>
        {pages.map(page => (
          <li key={page.id}>
            <span>{page.title}</span>
            <div>
              <Link to={"/page/" + page.id}>
                <button className="secondary">Upravit</button>
              </Link>
              <button className="delete" onClick={() => deletePage(page.id)}>X</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StoryDetail;