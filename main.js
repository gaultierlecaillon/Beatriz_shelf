import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

// Camera setup
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 1.6, 5);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Remove loading screen
document.querySelector('.loading').style.display = 'none';

// Controls setup - OrbitControls for rotating view
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 3;
controls.maxDistance = 10;
controls.target.set(0, 1.5, 0);
controls.update();

// Lighting - Much brighter
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xffffff, 2, 100);
pointLight1.position.set(0, 3, 5);
pointLight1.castShadow = true;
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 1.5, 100);
pointLight2.position.set(-4, 2, 3);
scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0xffffff, 1.5, 100);
pointLight3.position.set(4, 2, 3);
scene.add(pointLight3);

const spotLight = new THREE.SpotLight(0xffffff, 2);
spotLight.position.set(0, 5, 3);
spotLight.angle = Math.PI / 3;
spotLight.penumbra = 0.3;
spotLight.castShadow = true;
scene.add(spotLight);

// Room creation
function createRoom() {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2d2d44,
        roughness: 0.8,
        metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const ceiling = floor.clone();
    ceiling.position.y = 4;
    ceiling.rotation.x = Math.PI / 2;
    scene.add(ceiling);

    // Back wall
    const wallGeometry = new THREE.PlaneGeometry(20, 4);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x16213e,
        roughness: 0.9
    });
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.set(0, 2, -10);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.position.set(-10, 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.position.set(10, 2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    scene.add(rightWall);
}

createRoom();

// Book data
const bookTitles = [
    { title: "The Quantum Paradox", author: "Dr. Sarah Chen", color: 0x3498db },
    { title: "Echoes of Tomorrow", author: "Michael Torres", color: 0xe74c3c },
    { title: "Digital Dreams", author: "Alex Rivera", color: 0x2ecc71 },
    { title: "The Last Algorithm", author: "Emma Watson", color: 0x9b59b6 },
    { title: "Neon Nights", author: "Jake Morrison", color: 0xf39c12 },
    { title: "Code of Silence", author: "Lisa Zhang", color: 0x1abc9c },
    { title: "Stellar Odyssey", author: "Marcus Lee", color: 0xe67e22 },
    { title: "Mindscape", author: "Dr. James Park", color: 0x34495e },
    { title: "The Void Between", author: "Sofia Martinez", color: 0xc0392b },
    { title: "Binary Hearts", author: "David Kim", color: 0x16a085 },
    { title: "Fragments of Light", author: "Rachel Green", color: 0x8e44ad },
    { title: "The Neural Net", author: "Tom Anderson", color: 0x2980b9 },
    { title: "Crimson Shadows", author: "Nina Patel", color: 0xc0392b },
    { title: "Future's Echo", author: "Ryan Cooper", color: 0x27ae60 },
    { title: "The Glass Ceiling", author: "Amanda White", color: 0x7f8c8d },
    { title: "Cyber Souls", author: "Chris Brown", color: 0x2c3e50 },
    { title: "Infinite Horizon", author: "Zara Ali", color: 0x3498db },
    { title: "The Architect's Dream", author: "Oliver Stone", color: 0xe74c3c },
];

// Create bookshelf
const books = [];
let selectedBook = null;
let animatingBook = null;

function createBookshelf() {
    // Bookshelf frame
    const shelfMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x654321,
        roughness: 0.7,
        metalness: 0.1
    });

    // Vertical supports
    const supportGeometry = new THREE.BoxGeometry(0.1, 3, 0.4);
    const leftSupport = new THREE.Mesh(supportGeometry, shelfMaterial);
    leftSupport.position.set(-2.5, 1.5, 0);
    leftSupport.castShadow = true;
    scene.add(leftSupport);

    const rightSupport = leftSupport.clone();
    rightSupport.position.set(2.5, 1.5, 0);
    scene.add(rightSupport);

    // Shelves
    const shelfGeometry = new THREE.BoxGeometry(5, 0.05, 0.4);
    const shelfCount = 3;
    
    for (let i = 0; i < shelfCount; i++) {
        const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
        shelf.position.set(0, 0.5 + i * 0.8, 0);
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        scene.add(shelf);
    }

    // Top of bookshelf
    const top = new THREE.Mesh(shelfGeometry, shelfMaterial);
    top.position.set(0, 2.5, 0);
    scene.add(top);

    // Back panel
    const backPanel = new THREE.Mesh(
        new THREE.BoxGeometry(5, 3, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x4a3728 })
    );
    backPanel.position.set(0, 1.5, -0.175);
    backPanel.receiveShadow = true;
    scene.add(backPanel);
}

function createBook(title, author, color, position) {
    const thickness = 0.04 + Math.random() * 0.03; // Book thickness (spine width)
    const height = 0.25 + Math.random() * 0.05;     // Book height
    const width = 0.18 + Math.random() * 0.04;      // Book width (cover width)

    // Create book group
    const bookGroup = new THREE.Group();
    bookGroup.position.copy(position);

    // Book spine (the part that shows when book is on shelf)
    const spineGeometry = new THREE.BoxGeometry(thickness, height, width);
    const spineMaterial = new THREE.MeshStandardMaterial({ 
        color: color,
        roughness: 0.6,
        metalness: 0.1
    });
    const spine = new THREE.Mesh(spineGeometry, spineMaterial);
    spine.castShadow = true;
    spine.receiveShadow = true;
    bookGroup.add(spine);

    // Front cover
    const coverGeometry = new THREE.BoxGeometry(0.005, height, width);
    const coverMaterial = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(color).multiplyScalar(0.9),
        roughness: 0.4,
        metalness: 0.2
    });
    const frontCover = new THREE.Mesh(coverGeometry, coverMaterial);
    frontCover.position.set(thickness / 2, 0, 0);
    bookGroup.add(frontCover);

    // Back cover
    const backCover = frontCover.clone();
    backCover.position.set(-thickness / 2, 0, 0);
    bookGroup.add(backCover);

    // Text on spine (using canvas texture)
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = new THREE.Color(color).getStyle();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 50px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, canvas.width / 2, canvas.height / 2);

    const textTexture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshStandardMaterial({ 
        map: textTexture,
        roughness: 0.6
    });
    
    // Text on front of spine
    const textGeometry = new THREE.PlaneGeometry(thickness * 0.95, height * 0.9);
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 0, width / 2 + 0.001);
    textMesh.rotation.x = 0;
    bookGroup.add(textMesh);

    // Add book data to the group
    bookGroup.userData = {
        title: title,
        author: author,
        color: color,
        isBook: true,
        originalPosition: position.clone(),
        originalRotation: new THREE.Euler(0, 0, 0),
        isAnimating: false,
        animationProgress: 0,
        isOpen: false
    };

    books.push(bookGroup);
    scene.add(bookGroup);
    
    return bookGroup;
}

function populateBookshelf() {
    const shelves = [0.65, 1.45, 2.25];
    let bookIndex = 0;

    shelves.forEach(shelfY => {
        let xPos = -2.2;
        const booksPerShelf = 6;
        
        for (let i = 0; i < booksPerShelf && bookIndex < bookTitles.length; i++) {
            const bookData = bookTitles[bookIndex];
            const position = new THREE.Vector3(xPos, shelfY, 0.1);
            createBook(bookData.title, bookData.author, bookData.color, position);
            xPos += 0.08 + Math.random() * 0.04;
            bookIndex++;
        }
    });
}

createBookshelf();
populateBookshelf();

// Raycasting for book selection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

document.addEventListener('click', (event) => {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Cast ray from camera through mouse position
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(books, true);

    if (intersects.length > 0) {
        let targetBook = intersects[0].object;
        
        // Find the parent book mesh
        while (targetBook && !targetBook.userData.isBook) {
            targetBook = targetBook.parent;
        }

        if (targetBook && targetBook.userData.isBook) {
            selectBook(targetBook);
        }
    }
});

function selectBook(book) {
    // If another book is open, close it first
    if (animatingBook && animatingBook !== book) {
        animatingBook.userData.isOpen = false;
        animatingBook.userData.isAnimating = true;
    }

    selectedBook = book;
    animatingBook = book;
    book.userData.isAnimating = true;
    book.userData.isOpen = !book.userData.isOpen;

    // Show book info
    const bookInfo = document.getElementById('book-info');
    bookInfo.innerHTML = `
        <h3>${book.userData.title}</h3>
        <p>by ${book.userData.author}</p>
    `;
    
    if (book.userData.isOpen) {
        bookInfo.style.display = 'block';
    } else {
        setTimeout(() => {
            bookInfo.style.display = 'none';
        }, 500);
    }
}

// Animation loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Update OrbitControls
    controls.update();

    // Animate books
    books.forEach(book => {
        if (book.userData.isAnimating) {
            const speed = delta * 3;
            
            if (book.userData.isOpen) {
                // Open animation: move to center and rotate to face camera
                book.userData.animationProgress = Math.min(1, book.userData.animationProgress + speed);
                const progress = book.userData.animationProgress;
                
                // Smooth easing
                const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                
                // Position in front of camera
                const cameraDirection = new THREE.Vector3();
                camera.getWorldDirection(cameraDirection);
                const targetPos = new THREE.Vector3()
                    .copy(camera.position)
                    .add(cameraDirection.multiplyScalar(1.5));
                
                book.position.lerpVectors(book.userData.originalPosition, targetPos, eased);
                
                // Make book face camera by looking at camera position
                if (eased > 0.1) {
                    book.lookAt(camera.position);
                    book.rotation.z = 0; // Keep book upright
                    book.rotateY(Math.PI / 2); // Rotate 90° so cover faces camera
                }
                
                if (progress >= 1) {
                    book.userData.isAnimating = false;
                }
            } else {
                // Close animation: return to original position
                book.userData.animationProgress = Math.max(0, book.userData.animationProgress - speed);
                const progress = book.userData.animationProgress;
                
                // Smooth easing
                const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                
                // Position in front of camera
                const cameraDirection = new THREE.Vector3();
                camera.getWorldDirection(cameraDirection);
                const targetPos = new THREE.Vector3()
                    .copy(camera.position)
                    .add(cameraDirection.multiplyScalar(1.5));
                
                book.position.lerpVectors(book.userData.originalPosition, targetPos, eased);
                
                // Rotate back to original
                if (eased > 0.1) {
                    book.lookAt(camera.position);
                    book.rotation.z = 0;
                }
                
                if (progress <= 0) {
                    book.position.copy(book.userData.originalPosition);
                    book.rotation.set(0, 0, 0);
                    book.userData.isAnimating = false;
                    if (animatingBook === book) {
                        animatingBook = null;
                    }
                }
            }
        } else if (book.userData.isOpen && book.userData.animationProgress >= 1) {
            // Keep facing camera even when not animating
            book.lookAt(camera.position);
            book.rotation.z = 0;
            book.rotateY(Math.PI / 2); // Rotate 90° so cover faces camera
        }
    });

    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
