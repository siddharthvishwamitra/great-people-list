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
  addPersistentBorders();
}

function addPersistentBorders() {
  const images = document.querySelectorAll('.image-grid img');
  images.forEach(image => {
    const key = 'border-' + image.alt;
    let color = localStorage.getItem(key);
    if (!color) {
      color = getDarkRandomColor();
      localStorage.setItem(key, color);
    }
    image.style.border = `2px solid ${color}`;
  });
}

function getDarkRandomColor() {
  let r = Math.floor(Math.random() * 156);
  let g = Math.floor(Math.random() * 156);
  let b = Math.floor(Math.random() * 156);
  return `rgb(${r},${g},${b})`;
}

function showShimmer() {
  const grid = document.getElementById('character-grid');
  grid.innerHTML = Array.from({ length: 15 }).map(() => `
    <div class="shimmer-item">
      <div class="shimmer-img shimmer-animate"></div>
      <div class="shimmer-text shimmer-animate"></div>
    </div>
  `).join('');
}

// Main logic
openDB().then(db => {
  showShimmer(); // Show shimmer right away
  const start = Date.now(); // Track start time

  getFromCache(db).then(cached => {
    if (cached.length > 0) {
      const elapsed = Date.now() - start;
      const delay = Math.max(1000 - elapsed, 0);
      setTimeout(() => loadCharacters(cached), delay);
    } else {
      fetch('/js/char.json')
        .then(res => res.json())
        .then(data => {
          const elapsed = Date.now() - start;
          const delay = Math.max(1000 - elapsed, 0);
          setTimeout(() => {
            loadCharacters(data);
            saveToCache(db, data);
          }, delay);
        });
    }
  });
});