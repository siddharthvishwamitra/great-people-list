  document.addEventListener("DOMContentLoaded", function() {
    const images = document.querySelectorAll('.image-grid img');
    
    images.forEach(image => {
      const randomColor = getRandomColor();
      image.style.border = `2px solid ${randomColor}`;
    });
  });
  
  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }