// Scene setup
let scene, camera, renderer, controls;
let raycaster, mouse;
let bookObjects = [];
let selectedBook = null;
let animatingBook = null;
let animationProgress = 0;
let animationDirection = 1; // 1 for slide out, -1 for slide back

// Cache for loaded textures
const textureLoader = new THREE.TextureLoader();
const coverCache = {};

// Default book collection with covers - vibrant colors
const defaultBooks = [
    {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        description: "A romantic novel of manners that follows the character development of Elizabeth Bennet.",
        color: 0xE91E63,
        coverDesign: "classic"
    },
    {
        title: "1984",
        author: "George Orwell",
        description: "A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.",
        color: 0x212121,
        coverDesign: "modern"
    },
    {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        description: "A novel about racial injustice and the destruction of innocence in the American South.",
        color: 0xD4A373,
        coverDesign: "vintage"
    },
    {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        description: "A critique of the American Dream set in the Jazz Age of the 1920s.",
        color: 0x00897B,
        coverDesign: "art-deco"
    },
    {
        title: "Moby Dick",
        author: "Herman Melville",
        description: "The saga of Captain Ahab's obsessive quest to kill the white whale.",
        color: 0x1565C0,
        coverDesign: "classic"
    },
    {
        title: "Jane Eyre",
        author: "Charlotte Brontë",
        description: "A coming-of-age story following the emotions and experiences of Jane Eyre.",
        color: 0xC62828,
        coverDesign: "romantic"
    },
    {
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        description: "A story about teenage rebellion and alienation narrated by Holden Caulfield.",
        color: 0xF4511E,
        coverDesign: "modern"
    },
    {
        title: "Wuthering Heights",
        author: "Emily Brontë",
        description: "A tale of passion and revenge on the Yorkshire moors.",
        color: 0x6A1B9A,
        coverDesign: "gothic"
    },
    {
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        description: "Bilbo Baggins' unexpected journey to reclaim treasure from the dragon Smaug.",
        color: 0x558B2F,
        coverDesign: "fantasy"
    },
    {
        title: "Little Women",
        author: "Louisa May Alcott",
        description: "The lives and loves of the four March sisters coming of age in Civil War-era America.",
        color: 0xFF4081,
        coverDesign: "classic"
    },
    {
        title: "Brave New World",
        author: "Aldous Huxley",
        description: "A dystopian vision of a technologically advanced future society.",
        color: 0x0277BD,
        coverDesign: "sci-fi"
    },
    {
        title: "The Picture of Dorian Gray",
        author: "Oscar Wilde",
        description: "A philosophical novel about a man who sells his soul for eternal youth.",
        color: 0xAB47BC,
        coverDesign: "art-deco"
    },
    {
        title: "Frankenstein",
        author: "Mary Shelley",
        description: "A scientist creates a sapient creature in an unorthodox scientific experiment.",
        color: 0x2E7D32,
        coverDesign: "gothic"
    },
    {
        title: "Dracula",
        author: "Bram Stoker",
        description: "The classic vampire tale of Count Dracula's attempt to move to England.",
        color: 0x880E4F,
        coverDesign: "gothic"
    },
    {
        title: "The Odyssey",
        author: "Homer",
        description: "The epic tale of Odysseus's journey home after the Trojan War.",
        color: 0xF57C00,
        coverDesign: "classic"
    },
    {
        title: "Alice in Wonderland",
        author: "Lewis Carroll",
        description: "Alice falls down a rabbit hole into a fantasy world of peculiar creatures.",
        color: 0x00ACC1,
        coverDesign: "fantasy"
    },
    {
        title: "The Secret Garden",
        author: "Frances Hodgson Burnett",
        description: "A young girl discovers a hidden garden and transforms lives.",
        color: 0x7CB342,
        coverDesign: "classic"
    },
    {
        title: "Anne of Green Gables",
        author: "L.M. Montgomery",
        description: "The adventures of Anne Shirley, an imaginative young orphan.",
        color: 0xE53935,
        coverDesign: "classic"
    }
];

// Fetch book cover from Open Library API
async function fetchBookCover(title, author) {
    try {
        const query = encodeURIComponent(`${title} ${author}`);
        const response = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=1`);
        const data = await response.json();
        
        if (data.docs && data.docs.length > 0 && data.docs[0].cover_i) {
            const coverId = data.docs[0].cover_i;
            return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
        }
    } catch (error) {
        console.log(`Could not fetch cover for ${title}`);
    }
    return null;
}

// Initialize scene
function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2d1b3d);
    scene.fog = new THREE.Fog(0x2d1b3d, 12, 35);

    // Camera
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 4, 12);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('container').appendChild(renderer.domElement);

    // Lights - warm and colorful
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xfff4e6, 1.0);
    directionalLight.position.set(5, 12, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Warm orange light from left
    const pointLight1 = new THREE.PointLight(0xff6b35, 0.8, 25);
    pointLight1.position.set(-7, 4, 3);
    scene.add(pointLight1);

    // Cool purple light from right
    const pointLight2 = new THREE.PointLight(0x9b59b6, 0.6, 25);
    pointLight2.position.set(7, 4, 3);
    scene.add(pointLight2);

    // Accent teal light from below
    const pointLight3 = new THREE.PointLight(0x00d4aa, 0.4, 20);
    pointLight3.position.set(0, 1, 5);
    scene.add(pointLight3);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.target.set(0, 2, 0);

    // Raycaster for interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Create the bookshelf and books
    createEnvironment();
    createBookshelf();
    loadBooksWithCovers();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onMouseClick);
    window.addEventListener('mousemove', onMouseMove);

    // Animation loop
    animate();
}

// Create environment (floor, walls)
function createEnvironment() {
    // Floor with warmer color
    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x3d2e4f,
        roughness: 0.7,
        metalness: 0.3
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1;
    floor.receiveShadow = true;
    scene.add(floor);
}

// Create the wooden bookshelf with multiple levels
function createBookshelf() {
    const shelfGroup = new THREE.Group();

    // Wood material
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B6F47,
        roughness: 0.85,
        metalness: 0.1
    });

    const backMaterial = new THREE.MeshStandardMaterial({
        color: 0x6D4C3D,
        roughness: 0.9
    });

    // Create 3 shelf levels
    const shelfLevels = [0, 2.5, 5];
    const shelfGeometry = new THREE.BoxGeometry(12, 0.25, 2.5);

    shelfLevels.forEach(yPos => {
        const shelf = new THREE.Mesh(shelfGeometry, woodMaterial);
        shelf.position.y = yPos;
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        shelfGroup.add(shelf);
    });

    // Back panel (taller to cover all shelves)
    const backGeometry = new THREE.BoxGeometry(12, 7.5, 0.2);
    const back = new THREE.Mesh(backGeometry, backMaterial);
    back.position.set(0, 3.75, -1.15);
    back.receiveShadow = true;
    shelfGroup.add(back);

    // Side panels (taller)
    const sideGeometry = new THREE.BoxGeometry(0.25, 7.5, 2.5);
    const leftSide = new THREE.Mesh(sideGeometry, woodMaterial);
    leftSide.position.set(-6, 3.75, 0);
    leftSide.castShadow = true;
    shelfGroup.add(leftSide);

    const rightSide = new THREE.Mesh(sideGeometry, woodMaterial);
    rightSide.position.set(6, 3.75, 0);
    rightSide.castShadow = true;
    shelfGroup.add(rightSide);

    // Top panel
    const topGeometry = new THREE.BoxGeometry(12, 0.3, 2.5);
    const top = new THREE.Mesh(topGeometry, woodMaterial);
    top.position.y = 7.5;
    top.castShadow = true;
    shelfGroup.add(top);

    scene.add(shelfGroup);
}

// Load books with real covers from API
async function loadBooksWithCovers() {
    // Show loading state
    console.log('Loading book covers...');
    
    // Fetch all cover URLs
    const coverPromises = defaultBooks.map(book => 
        fetchBookCover(book.title, book.author)
    );
    const coverUrls = await Promise.all(coverPromises);
    
    // Create books with cover URLs
    createBooks(coverUrls);
}

// Create books with covers distributed across shelves
function createBooks(coverUrls = []) {
    const booksPerShelf = 6;
    const shelfLevels = [0, 2.5, 5];
    const shelfWidth = 11;
    const gap = 0.15;

    // First, create all books to know their widths
    const allBooks = defaultBooks.map((bookData, index) => 
        createBook(bookData, coverUrls[index])
    );

    // Organize books by shelf
    let currentShelf = 0;
    let bookIndex = 0;

    shelfLevels.forEach((yPos, shelfIndex) => {
        const booksForThisShelf = allBooks.slice(bookIndex, bookIndex + booksPerShelf);
        
        // Calculate total width needed for this shelf
        const totalBooksWidth = booksForThisShelf.reduce((sum, book) => sum + book.userData.width, 0);
        const totalGapsWidth = (booksForThisShelf.length - 1) * gap;
        const totalWidth = totalBooksWidth + totalGapsWidth;
        
        // Start position (centered on shelf)
        let currentX = -totalWidth / 2;
        
        booksForThisShelf.forEach((book, i) => {
            // Position book at center of its width
            book.position.set(
                currentX + book.userData.width / 2,
                yPos + 0.15 + book.userData.height / 2,
                0
            );
            
            // Store book data
            book.userData.info = defaultBooks[bookIndex];
            
            scene.add(book);
            bookObjects.push(book);
            
            // Move to next position
            currentX += book.userData.width + gap;
            bookIndex++;
        });
    });
}

// Create a single book with cover
function createBook(bookData, coverUrl = null) {
    const bookGroup = new THREE.Group();

    // Random dimensions
    const width = 0.25 + Math.random() * 0.15;
    const height = 1.5 + Math.random() * 0.6;
    const depth = 1.0;

    // Book body (pages)
    const bodyGeometry = new THREE.BoxGeometry(width, height, depth);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFF8DC,
        roughness: 0.9
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    bookGroup.add(body);

    // Spine with cover texture (this is what faces the camera)
    const spineGeometry = new THREE.BoxGeometry(width + 0.04, height, depth + 0.1);
    let spineMaterial;
    
    if (coverUrl) {
        // Load texture for spine (the visible book cover)
        spineMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.5,
            metalness: 0.1
        });
        
        // Load and apply texture
        textureLoader.load(
            coverUrl,
            (texture) => {
                spineMaterial.map = texture;
                spineMaterial.needsUpdate = true;
            },
            undefined,
            (error) => {
                // Fallback to color if texture fails
                spineMaterial.color.setHex(bookData.color);
            }
        );
    } else {
        // Fallback to solid color
        spineMaterial = new THREE.MeshStandardMaterial({
            color: bookData.color,
            roughness: 0.6,
            metalness: 0.2
        });
    }
    
    const spine = new THREE.Mesh(spineGeometry, spineMaterial);
    spine.castShadow = true;
    bookGroup.add(spine);

    // Simple covers on front and back (darker color)
    const coverGeometry = new THREE.BoxGeometry(width + 0.02, height, 0.05);
    const coverMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(bookData.color).multiplyScalar(0.6),
        roughness: 0.7,
        metalness: 0.1
    });
    
    const frontCover = new THREE.Mesh(coverGeometry, coverMaterial);
    frontCover.position.z = depth / 2 + 0.08;
    frontCover.castShadow = true;
    bookGroup.add(frontCover);

    const backCover = new THREE.Mesh(coverGeometry, coverMaterial);
    backCover.position.z = -depth / 2 - 0.08;
    backCover.castShadow = true;
    bookGroup.add(backCover);

    // Add decorative elements only if no texture
    if (!coverUrl) {
        addCoverDecoration(spine, bookData);
    }

    // Store dimensions (spine is the widest part)
    bookGroup.userData.width = width + 0.04; // Spine width
    bookGroup.userData.height = height;

    return bookGroup;
}

// Add decorative elements to book cover
function addCoverDecoration(cover, bookData) {
    // Title area (golden rectangle)
    const titleGeometry = new THREE.BoxGeometry(
        cover.geometry.parameters.width * 0.7,
        cover.geometry.parameters.height * 0.15,
        0.01
    );
    const titleMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        roughness: 0.3,
        metalness: 0.8
    });
    const titleBox = new THREE.Mesh(titleGeometry, titleMaterial);
    titleBox.position.set(0, cover.geometry.parameters.height * 0.25, 0.03);
    cover.add(titleBox);

    // Decorative lines
    const lineGeometry = new THREE.BoxGeometry(
        cover.geometry.parameters.width * 0.8,
        0.02,
        0.01
    );
    const lineMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        roughness: 0.4,
        metalness: 0.6
    });
    
    const topLine = new THREE.Mesh(lineGeometry, lineMaterial);
    topLine.position.set(0, cover.geometry.parameters.height * 0.35, 0.03);
    cover.add(topLine);

    const bottomLine = new THREE.Mesh(lineGeometry, lineMaterial);
    bottomLine.position.set(0, cover.geometry.parameters.height * 0.15, 0.03);
    cover.add(bottomLine);
}

// Mouse move handler
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Check for hover
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(bookObjects, true);

    // Change cursor
    if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'grab';
    }
}

// Mouse click handler
function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(bookObjects, true);

    if (intersects.length > 0) {
        // Get the root book object
        let bookObject = intersects[0].object;
        while (bookObject.parent && !bookObject.userData.info) {
            bookObject = bookObject.parent;
        }

        if (bookObject.userData.info) {
            showBookInfo(bookObject.userData.info);
            selectedBook = bookObject;
            
            // Animate book selection
            animateBookSelection(bookObject);
        }
    } else {
        hideBookInfo();
    }
}

// Show book information
function showBookInfo(bookData) {
    const infoPanel = document.getElementById('bookInfo');
    document.getElementById('bookTitle').textContent = bookData.title;
    document.getElementById('bookAuthor').textContent = 'by ' + bookData.author;
    document.getElementById('bookDescription').textContent = bookData.description;
    
    infoPanel.classList.add('active');
}

// Hide book information
function hideBookInfo() {
    const infoPanel = document.getElementById('bookInfo');
    infoPanel.classList.remove('active');
    selectedBook = null;
}

// Animate book selection - slide out and rotate
function animateBookSelection(book) {
    // If clicking the same book, slide it back
    if (selectedBook === book && animatingBook === book) {
        animationDirection = -1;
        hideBookInfo();
        selectedBook = null;
    } else {
        // If another book was selected, slide it back first
        if (animatingBook && animatingBook !== book) {
            animatingBook.position.copy(animatingBook.userData.originalPosition);
            animatingBook.rotation.copy(animatingBook.userData.originalRotation);
        }
        
        // Start sliding out the new book
        animatingBook = book;
        animationDirection = 1;
        animationProgress = 0;
        
        // Store original position and rotation if not already stored
        if (!book.userData.originalPosition) {
            book.userData.originalPosition = book.position.clone();
            book.userData.originalRotation = book.rotation.clone();
        }
    }
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    controls.update();
    
    // Animate selected book sliding out and rotating
    if (animatingBook) {
        const animationSpeed = 0.05;
        animationProgress += animationSpeed * animationDirection;
        
        // Clamp progress between 0 and 1
        animationProgress = Math.max(0, Math.min(1, animationProgress));
        
        // Easing function for smooth animation
        const easeProgress = animationProgress < 0.5
            ? 2 * animationProgress * animationProgress
            : 1 - Math.pow(-2 * animationProgress + 2, 2) / 2;
        
        const originalPos = animatingBook.userData.originalPosition;
        const originalRot = animatingBook.userData.originalRotation;
        
        // Slide out along Z axis and rotate to face camera
        animatingBook.position.z = originalPos.z + easeProgress * 3;
        animatingBook.rotation.y = originalRot.y + easeProgress * Math.PI / 2;
        
        // Stop animation when complete
        if (animationProgress === 0 || animationProgress === 1) {
            if (animationProgress === 0) {
                animatingBook = null;
            }
        }
    }
    
    // Subtle floating animation for non-selected books
    bookObjects.forEach((book, index) => {
        if (book !== animatingBook) {
            const time = Date.now() * 0.001;
            const originalRot = book.userData.originalRotation || book.rotation;
            book.rotation.y = originalRot.y + Math.sin(time * 0.5 + index) * 0.02;
        }
    });
    
    renderer.render(scene, camera);
}

// Initialize on load
window.addEventListener('load', init);
