document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("profile-container");
  const params = new URLSearchParams(window.location.search);
  
  if ([...params].length === 0) {
    container.innerHTML = `
      <div class="info-box">
        <h2>No person selected!</h2>
        <p>Use a URL like <code>view.html?bhisma-pitamah</code> to view a person profile.</p>
      </div>
    `;
    return;
  }
  
  const characterKey = Object.keys(Object.fromEntries(params.entries()))[0];
  
  fetch(`data/${characterKey}.json`)
    .then(response => {
      if (!response.ok) throw new Error("Character not found.");
      return response.json();
    })
    .then(data => {
      document.title = data.name + " - Character Profile";
      
      const vowsList = data.notableVows.map(vow => `<li>${vow}</li>`).join("");
      const weapons = data.weapons.join(", ");
      const traits = data.traits.join(", ");
      
      container.innerHTML = `
        <div class="card">
          <img src="${data.image}" alt="${data.name}">
          <div class="card-content">
            <h1>${data.name}</h1>
            <h2>${data.title}</h2>
            <p><strong>Born:</strong> ${data.born}</p>
            <p><strong>Died:</strong> ${data.died}</p>
            <p><strong>Birthplace:</strong> ${data.birthplace}</p>
            <p><strong>Affiliation:</strong> ${data.affiliation}</p>
            <p><strong>Parents:</strong> ${data.parents}</p>
            <p><strong>Notable Vows:</strong></p>
            <ul>${vowsList}</ul>
            <p><strong>Weapons:</strong> ${weapons}</p>
            <p><strong>Traits:</strong> ${traits}</p>
            <p>${data.bio}</p>
          </div>
        </div>
        <div class="summary-box">
          <h2>Life Summary</h2>
          <p>${data.lifeSummary}</p>
        </div>
      `;
    })
    .catch(() => {
      container.innerHTML = `
        <div class="info-box">
          <h2>Error</h2>
          <p>Character not found or unable to load data. Check the name in the URL.</p>
        </div>
      `;
    });
});