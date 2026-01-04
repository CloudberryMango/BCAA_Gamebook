const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { randomUUID } = require("crypto"); 

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- ÚVODNÍ STRÁNKA ---
app.get("/", (req, res) => {
    res.send("<h1>Gamebook API běží! </h1><p>Zkuste například endpoint: <a href='/story/list'>/story/list</a></p>");
});

// --- DATA SIMULATION ---
let stories = [];
let pages = [];

// --- DAO LAYER ---

const StoryDao = {
  create: (name) => {
    const newStory = { id: randomUUID(), name };
    stories.push(newStory);
    return newStory;
  },
  list: () => {
    return stories;
  },
  get: (id) => {
    return stories.find((s) => s.id === id);
  },
  update: (id, name) => {
    const storyIndex = stories.findIndex((s) => s.id === id);
    if (storyIndex > -1) {
      stories[storyIndex].name = name;
      return stories[storyIndex];
    }
    return null;
  },
  delete: (id) => {
    const index = stories.findIndex((s) => s.id === id);
    if (index > -1) {
      stories.splice(index, 1);
      // Smazání všech stránek, které patří k tomuto příběhu
      pages = pages.filter((p) => p.storyId !== id);
      return true;
    }
    return false;
  }
};

const PageDao = {
  create: (storyId, title, content) => {
    const newPage = { 
      id: randomUUID(), 
      storyId, 
      title,
      content, 
      choices: [] 
    };
    pages.push(newPage);
    return newPage;
  },
  listByStory: (storyId) => {
    return pages.filter((p) => p.storyId === storyId);
  },
  get: (id) => {
    return pages.find((p) => p.id === id);
  },
  update: (id, title, content, choices) => {
    const pageIndex = pages.findIndex((p) => p.id === id);
    if (pageIndex > -1) {
      if (title) pages[pageIndex].title = title;
      if (content) pages[pageIndex].content = content;
      if (choices) pages[pageIndex].choices = choices;
      return pages[pageIndex];
    }
    return null;
  },
  delete: (id) => {
    const index = pages.findIndex((p) => p.id === id);
    if (index > -1) {
      pages.splice(index, 1);
      return true;
    }
    return false;
  }
};

// --- API ENDPOINTS ---

// 1. STORY ENDPOINTS
app.post("/story/create", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  const story = StoryDao.create(name);
  res.json(story);
});

app.get("/story/list", (req, res) => {
  res.json(StoryDao.list());
});

app.get("/story/get", (req, res) => {
  const { id } = req.query;
  const story = StoryDao.get(id);
  if (!story) return res.status(404).json({ error: "Story not found" });
  res.json(story);
});

app.post("/story/update", (req, res) => {
  const { id, name } = req.body;
  const updatedStory = StoryDao.update(id, name);
  if (!updatedStory) return res.status(404).json({ error: "Story not found" });
  res.json(updatedStory);
});

app.post("/story/delete", (req, res) => {
  const { id } = req.body;
  const success = StoryDao.delete(id);
  if (!success) return res.status(404).json({ error: "Story not found" });
  res.json({ message: "Story deleted" });
});

// 2. PAGE ENDPOINTS

app.post("/page/create", (req, res) => {
  const { storyId, title, content } = req.body;
  
  const storyExists = StoryDao.get(storyId);
  if (!storyExists) return res.status(400).json({ error: "Story ID is invalid" });
  if (!content) return res.status(400).json({ error: "Content is required" });
  // Pokud uživatel nezadá název, vygenerujeme ho automaticky
  const finalTitle = title || "Nepojmenovaná stránka"; 

  const page = PageDao.create(storyId, finalTitle, content);
  res.json(page);
});

app.get("/page/list", (req, res) => {
  const { storyId } = req.query;
  if (!storyId) return res.status(400).json({ error: "storyId required" });
  res.json(PageDao.listByStory(storyId));
});

app.get("/page/get", (req, res) => {
  const { id } = req.query;
  const page = PageDao.get(id);
  if (!page) return res.status(404).json({ error: "Page not found" });
  res.json(page);
});

app.post("/page/update", (req, res) => {
  const { id, title, content, choices } = req.body;
  const updatedPage = PageDao.update(id, title, content, choices);
  if (!updatedPage) return res.status(404).json({ error: "Page not found" });
  res.json(updatedPage);
});

app.post("/page/delete", (req, res) => {
  const { id } = req.body;
  const success = PageDao.delete(id);
  if (!success) return res.status(404).json({ error: "Page not found" });
  res.json({ message: "Page deleted" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});