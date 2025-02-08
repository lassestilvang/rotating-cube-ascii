const width = 160;
const height = 160;
const asciiChars = " .:-=+*#%@";
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Setup Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

// Create image texture
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("mona_2_invert.png", () => {
  texture.needsUpdate = true;
});

// Create cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ map: texture });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 2;

// Create hidden canvas for reading pixels
const hiddenCanvas = document.createElement("canvas");
hiddenCanvas.width = width;
hiddenCanvas.height = height;
const ctx = hiddenCanvas.getContext("2d");

// ASCII output element
const asciiOutput = document.getElementById("ascii-output");
const container = document.getElementById("container");

// Mouse event handlers
container.addEventListener("mousedown", onMouseDown);
document.addEventListener("mousemove", onMouseMove);
document.addEventListener("mouseup", onMouseUp);

function onMouseDown(event) {
  isDragging = true;
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY,
  };
}

function onMouseMove(event) {
  if (!isDragging) return;

  const deltaMove = {
    x: event.clientX - previousMousePosition.x,
    y: event.clientY - previousMousePosition.y,
  };

  cube.rotation.y += deltaMove.x * 0.01;
  cube.rotation.x += deltaMove.y * 0.01;

  previousMousePosition = {
    x: event.clientX,
    y: event.clientY,
  };
}

function onMouseUp() {
  isDragging = false;
}

function getAsciiChar(brightness) {
  return asciiChars[Math.floor(brightness * (asciiChars.length - 1))];
}

// Default rotation speed
const defaultRotationSpeed = 0.005;
let lastTime = 0;

function render(currentTime) {
  requestAnimationFrame(render);

  // Calculate delta time to ensure smooth rotation regardless of frame rate
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  // Apply default rotation when not dragging
  if (!isDragging) {
    cube.rotation.y += defaultRotationSpeed;
    cube.rotation.x += defaultRotationSpeed * 0.5;
  }

  // Render scene
  renderer.render(scene, camera);

  // Get pixel data
  ctx.drawImage(renderer.domElement, 0, 0);
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  // Convert to ASCII
  let ascii = "";
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const brightness =
        (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 765;
      ascii += getAsciiChar(brightness);
    }
    ascii += "\n";
  }

  asciiOutput.textContent = ascii;
}

render();
