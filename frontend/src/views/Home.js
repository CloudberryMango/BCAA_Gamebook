import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = "http://localhost:3000";

function Home() {
  // Stav pro seznam příběhů
  const [stories, setStories] = useState([]);
  // Stav pro textové pole nového názvu
  const [newName, setNewName] = useState("");

  // Načtení dat po spuštění stránky
  useEffect(() => {
    fetch(API_URL + "/story/list")
      .then(response => response.json())
      .then(data => {
        setStories(data);
      });
  }, []);

  // Funkce pro vytvoření příběhu
  const createStory = () => {
    if (newName === "") {
      alert("Musíte zadat název!");
      return;
    }

    const requestBody = {
      name: newName
    };

    fetch(API_URL + "/story/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
      // Přidáme nový příběh do seznamu, abychom nemuseli reloadovat stránku
      const newStoriesList = [...stories, data];
      setStories(newStoriesList);
      setNewName(""); // Vymazat input
    });
  };

  // Funkce pro smazání
  const deleteStory = (idToDelete) => {
    fetch(API_URL + "/story/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: idToDelete })
    })
    .then(() => {
      // Vyfiltrujeme smazaný příběh ze seznamu
      const remainingStories = stories.filter(story => story.id !== idToDelete);
      setStories(remainingStories);
    });
  };

  return (
    <div>
      <h1>📚 Moje Gamebooky</h1>
      
      <div style={{ background: '#eee', padding: '15px', borderRadius: '5px' }}>
        <h3>Založit nový příběh</h3>
        <input 
          placeholder="Název příběhu" 
          value={newName} 
          onChange={(event) => setNewName(event.target.value)} 
        />
        <button onClick={createStory}>Vytvořit</button>
      </div>

      <ul>
        {stories.map(story => (
          <li key={story.id}>
            <span><strong>{story.name}</strong></span>
            <div>
              <Link to={"/read/" + story.id}>
                <button style={{ backgroundColor: '#28a745' }}>Hrát</button>
              </Link>

              <Link to={"/story/" + story.id}>
                <button>Spravovat</button>
              </Link>
              <button className="delete" onClick={() => deleteStory(story.id)}>Smazat</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;