const DB_NAME = 'CharacterCache';
const STORE_NAME = 'characters';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

function getFromCache(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get('list');
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function saveToCache(db, data) {
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.put(data, 'list');
}

function loadCharacters(data) {
  const grid = document.getElementById('character-grid');
  grid.innerHTML = data.map(char =>
    `<a href="view.html?${char.slug}" target="_blank">
      <img src="${char.img}" alt="${char.name}">
      <p>${char.name}</p>
    </a>`
  ).join('');
  addRandomBorders();
}

function addRandomBorders() {
  const images = document.querySelectorAll('.image-grid img');
  images.forEach(image => {
    const randomColor = getRandomColor();
    image.style.border = `2px solid ${randomColor}`;
  });
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Main logic
openDB().then(db => {
  getFromCache(db).then(cached => {
    if (cached.length > 0) {
      loadCharacters(cached);
    } else {
      fetch('characters.json')
        .then(res => res.json())
        .then(data => {
          loadCharacters(data);
          saveToCache(db, data);
        });
    }
  });
});