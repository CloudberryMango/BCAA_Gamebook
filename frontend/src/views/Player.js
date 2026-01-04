import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_URL = "http://localhost:3000";

function Player() {
  const { storyId } = useParams();
  
  const [currentPage, setCurrentPage] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // 1. Nejdříve musíme zjistit, jaká je první stránka příběhu
    fetch(API_URL + "/page/list?storyId=" + storyId)
      .then(res => res.json())
      .then(pages => {
        if (pages.length > 0) {
          // Pokud existují stránky, vezmeme první v seznamu jako start
          setCurrentPage(pages[0]);
        } else {
          // Příběh nemá žádné stránky
          setError(true);
        }
      });
  }, []);

  // Funkce pro načtení další stránky po kliknutí na tlačítko
  const goToPage = (pageId) => {
    fetch(API_URL + "/page/get?id=" + pageId)
      .then(res => res.json())
      .then(data => {
        setCurrentPage(data);
      });
  };

  if (error) {
    return (
      <div>
        <h3>Chyba: Tento příběh je prázdný.</h3>
        <Link to="/">Zpět domů</Link>
      </div>
    );
  }

  if (!currentPage) {
    return <p>Načítám příběh...</p>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ textAlign: 'left', marginBottom: '20px' }}>
         <Link to="/" style={{ color: 'gray', textDecoration: 'none' }}>Ukončit hru</Link>
      </div>

      <div style={{ background: 'white', padding: '30px', border: '1px solid #ccc', borderRadius: '10px' }}>
        <h2>{currentPage.title}</h2>
        <p style={{ fontSize: '18px', textAlign: 'left', whiteSpace: 'pre-wrap' }}>
          {currentPage.content}
        </p>
      </div>

      <div style={{ marginTop: '30px' }}>
        {/* Zobrazíme tlačítka, pokud existují nějaké volby */}
        {currentPage.choices && currentPage.choices.map((choice, index) => (
            <button 
              key={index} 
              className="choice-btn"
              onClick={() => goToPage(choice.targetPageId)}
            >
              {choice.text}
            </button>
        ))}

        {/* Pokud nejsou žádné volby, je to konec */}
        {(!currentPage.choices || currentPage.choices.length === 0) && (
          <div style={{ marginTop: '20px', color: 'red' }}>
            <h3>KONEC PŘÍBĚHU</h3>
            <Link to="/"><button>Hlavní menu</button></Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Player;