// Initialize Three.js scene
let scene, camera, renderer, controls;
let shelf, books = [];
let bookMeshes = [];

// Book data storage
let bookData = JSON.parse(localStorage.getItem('books')) || [];

// Initialize the scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2c3e50);

    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);

    // Create renderer
    const container = document.getElementById('canvas-container');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth || 800, 600);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    // Add orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 15;
    controls.maxPolarAngle = Math.PI / 2;

    // Create shelf
    createShelf();

    // Load existing books
    bookData.forEach(book => {
        addBookToShelf(book);
    });

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start animation loop
    animate();

    // Update book list display
    updateBookList();
}

// Create the 3D shelf
function createShelf() {
    const shelfGroup = new THREE.Group();

    // Shelf parameters
    const shelfWidth = 10;
    const shelfDepth = 2;
    const shelfThickness = 0.2;
    const shelfHeight = 0.1;

    // Create main horizontal shelf
    const shelfGeometry = new THREE.BoxGeometry(shelfWidth, shelfThickness, shelfDepth);
    const shelfMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.2
    });
    const shelfMesh = new THREE.Mesh(shelfGeometry, shelfMaterial);
    shelfMesh.position.y = 0;
    shelfMesh.castShadow = true;
    shelfMesh.receiveShadow = true;
    shelfGroup.add(shelfMesh);

    // Create back panel
    const backGeometry = new THREE.BoxGeometry(shelfWidth, 3, 0.1);
    const backMaterial = new THREE.MeshStandardMaterial({
        color: 0x654321,
        roughness: 0.9
    });
    const backMesh = new THREE.Mesh(backGeometry, backMaterial);
    backMesh.position.set(0, 1.5, -shelfDepth / 2);
    backMesh.receiveShadow = true;
    shelfGroup.add(backMesh);

    // Create side panels
    const sideGeometry = new THREE.BoxGeometry(0.2, 3, shelfDepth);
    const sideMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.8
    });

    const leftSide = new THREE.Mesh(sideGeometry, sideMaterial);
    leftSide.position.set(-shelfWidth / 2, 1.5, 0);
    leftSide.castShadow = true;
    shelfGroup.add(leftSide);

    const rightSide = new THREE.Mesh(sideGeometry, sideMaterial);
    rightSide.position.set(shelfWidth / 2, 1.5, 0);
    rightSide.castShadow = true;
    shelfGroup.add(rightSide);

    scene.add(shelfGroup);
    shelf = shelfGroup;
}

// Create a 3D book
function createBook(color, title, author) {
    const bookGroup = new THREE.Group();

    // Random book dimensions for variety
    const width = 0.3 + Math.random() * 0.2;
    const height = 1.2 + Math.random() * 0.5;
    const depth = 1.2;

    // Book body
    const bookGeometry = new THREE.BoxGeometry(width, height, depth);
    const bookMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.7,
        metalness: 0.1
    });
    const bookMesh = new THREE.Mesh(bookGeometry, bookMaterial);
    bookMesh.castShadow = true;
    bookMesh.receiveShadow = true;
    bookGroup.add(bookMesh);

    // Book spine (slightly darker)
    const spineGeometry = new THREE.BoxGeometry(width + 0.02, height, 0.1);
    const spineMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color).multiplyScalar(0.7),
        roughness: 0.8
    });
    const spineMesh = new THREE.Mesh(spineGeometry, spineMaterial);
    spineMesh.position.z = depth / 2;
    bookGroup.add(spineMesh);

    // Store book data
    bookGroup.userData = { title, author, color, width, height };

    return bookGroup;
}

// Add book to shelf
function addBookToShelf(bookInfo) {
    const bookMesh = createBook(bookInfo.color, bookInfo.title, bookInfo.author);

    // Calculate position based on existing books
    let xPosition = -4.5 + (bookMeshes.length * 0.6);
    
    // Reset to new row if exceeding shelf width
    if (xPosition > 4.5) {
        xPosition = -4.5 + ((bookMeshes.length % 15) * 0.6);
    }

    bookMesh.position.set(
        xPosition,
        0.1 + bookMesh.userData.height / 2,
        -0.3
    );

    scene.add(bookMesh);
    bookMeshes.push(bookMesh);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Update book list in UI
function updateBookList() {
    const booksList = document.getElementById('booksList');
    booksList.innerHTML = '';

    bookData.forEach((book, index) => {
        const li = document.createElement('li');
        
        const bookInfo = document.createElement('div');
        bookInfo.className = 'book-info';
        
        const title = document.createElement('div');
        title.className = 'book-title';
        title.textContent = book.title;
        
        const author = document.createElement('div');
        author.className = 'book-author';
        author.textContent = `by ${book.author}`;
        
        bookInfo.appendChild(title);
        bookInfo.appendChild(author);
        
        const colorBadge = document.createElement('div');
        colorBadge.className = 'book-color-badge';
        colorBadge.style.backgroundColor = book.color;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteBook(index);
        
        li.appendChild(bookInfo);
        li.appendChild(colorBadge);
        li.appendChild(deleteBtn);
        booksList.appendChild(li);
    });
}

// Add book handler
document.getElementById('addBook').addEventListener('click', () => {
    const titleInput = document.getElementById('bookTitle');
    const authorInput = document.getElementById('bookAuthor');
    const colorInput = document.getElementById('bookColor');

    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const color = colorInput.value;

    if (!title || !author) {
        alert('Please enter both title and author');
        return;
    }

    const bookInfo = { title, author, color };
    
    // Add to data
    bookData.push(bookInfo);
    localStorage.setItem('books', JSON.stringify(bookData));

    // Add to 3D scene
    addBookToShelf(bookInfo);

    // Update list
    updateBookList();

    // Clear inputs
    titleInput.value = '';
    authorInput.value = '';
});

// Delete book handler
function deleteBook(index) {
    // Remove from data
    bookData.splice(index, 1);
    localStorage.setItem('books', JSON.stringify(bookData));

    // Remove all book meshes
    bookMeshes.forEach(mesh => scene.remove(mesh));
    bookMeshes = [];

    // Re-add all books
    bookData.forEach(book => addBookToShelf(book));

    // Update list
    updateBookList();
}

// Initialize on page load
window.addEventListener('load', init);
