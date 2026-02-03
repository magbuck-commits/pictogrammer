// Default pictogram library with names
const defaultLibrary = [
    { emoji: '📦', name: 'Pakke' },
    { emoji: '📁', name: 'Mappe' },
    { emoji: '📋', name: 'Clipboard' },
    { emoji: '📝', name: 'Noter' },
    { emoji: '📄', name: 'Dokument' },
    { emoji: '📃', name: 'Blad' },
    { emoji: '🎨', name: 'Kunstner' },
    { emoji: '🎭', name: 'Teater' },
    { emoji: '🎪', name: 'Cirkus' },
    { emoji: '🎬', name: 'Film' },
    { emoji: '🎸', name: 'Guitar' },
    { emoji: '🎹', name: 'Klaver' },
    { emoji: '⚙️', name: 'Tandhjul' },
    { emoji: '🔧', name: 'Værktøj' },
    { emoji: '🔨', name: 'Hammer' },
    { emoji: '⚒️', name: 'Pickhammer' },
    { emoji: '🛠️', name: 'Værktøjskasse' },
    { emoji: '⛏️', name: 'Hakke' },
    { emoji: '💡', name: 'Ide' },
    { emoji: '🔦', name: 'Lommelygte' },
    { emoji: '🕯️', name: 'Stearinlys' },
    { emoji: '💰', name: 'Penge' },
    { emoji: '💳', name: 'Kreditkort' },
    { emoji: '💸', name: 'Penge flyver' },
    { emoji: '🏠', name: 'Hus' },
    { emoji: '🏢', name: 'Building' },
    { emoji: '🏭', name: 'Fabrik' },
    { emoji: '🏗️', name: 'Konstruktion' },
    { emoji: '🏛️', name: 'Bygning' },
    { emoji: '🏰', name: 'Slot' },
    { emoji: '👤', name: 'Person' },
    { emoji: '👥', name: 'Mennesker' },
    { emoji: '👨', name: 'Mand' },
    { emoji: '👩', name: 'Kvinde' },
    { emoji: '👶', name: 'Baby' },
    { emoji: '👴', name: 'Gamle mand' },
    { emoji: '❤️', name: 'Hjerte' },
    { emoji: '💝', name: 'Gave hjerte' },
    { emoji: '💖', name: 'Bånd hjerte' },
    { emoji: '💗', name: 'Puls hjerte' },
    { emoji: '💓', name: 'Dansende hjerte' },
    { emoji: '💕', name: 'To hjerte' },
    { emoji: '⭐', name: 'Stjerne' },
    { emoji: '✨', name: 'Gnister' },
    { emoji: '🌟', name: 'Gul stjerne' },
    { emoji: '💫', name: 'Dizziness' },
    { emoji: '⚡', name: 'Lynbolt' },
    { emoji: '🔥', name: 'Ild' },
    { emoji: '🎁', name: 'Gave' },
    { emoji: '🎀', name: 'Bånd' },
    { emoji: '🎉', name: 'Fest popper' },
    { emoji: '🎊', name: 'Konfetti' },
    { emoji: '🎈', name: 'Ballon' },
    { emoji: '🎆', name: 'Fyrværkeri' },
    { emoji: '📱', name: 'Telefon' },
    { emoji: '💻', name: 'Computer' },
    { emoji: '🖥️', name: 'Monitor' },
    { emoji: '⌨️', name: 'Tastatur' },
    { emoji: '🖱️', name: 'Mus' },
    { emoji: '🖨️', name: 'Printer' },
    { emoji: '✅', name: 'Checkmark' },
    { emoji: '❌', name: 'X' },
    { emoji: '⚠️', name: 'Advarsel' },
    { emoji: '🔔', name: 'Klokke' },
    { emoji: '🔕', name: 'Klokke Slået Af' },
    { emoji: '📢', name: 'Megafon' },
    { emoji: '📊', name: 'Diagram' },
    { emoji: '📈', name: 'Grafik Up' },
    { emoji: '📉', name: 'Grafik Down' },
    { emoji: '💹', name: 'Trends' },
    { emoji: '📐', name: 'Trekant' },
    { emoji: '📏', name: 'Lineal' }
];

let selectedItem = null;
let draggedElement = null;
let savedLayouts = [];
let uploadedImages = [];
let uploadedLibraryItems = [];
let deferredInstallPrompt = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeLibrary();
    setupCanvasListeners();
    setupSearchListener();
    setupUploadListener();
    setupCanvasSizeListener();
    setupBgColorListener();
    loadSavedLayouts();
    setupInstallButton();
});

// Setup install prompt handling and button
function setupInstallButton() {
    const btn = document.getElementById('installBtn');
    if (!btn) return;

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        btn.style.display = 'inline-block';
    });

    // Click handler to show prompt
    btn.addEventListener('click', async () => {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
            console.log('User accepted the install prompt');
            btn.style.display = 'none';
        } else {
            console.log('User dismissed the install prompt');
        }
        deferredInstallPrompt = null;
    });

    // Hide button if app installed
    window.addEventListener('appinstalled', () => {
        deferredInstallPrompt = null;
        btn.style.display = 'none';
    });
}

// Initialize the library with default pictograms
function initializeLibrary() {
    const library = document.getElementById('library');
    library.innerHTML = '';
    
    defaultLibrary.forEach(item => {
        const libItem = document.createElement('div');
        libItem.className = 'library-item';
        libItem.style.flexDirection = 'column';
        
        // Title
        const titleDiv = document.createElement('div');
        titleDiv.className = 'library-item-title';
        titleDiv.textContent = item.name;
        titleDiv.title = 'Klik for at redigere titel';
        
        titleDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            editLibraryEmojiTitle(titleDiv, libItem, item);
        });
        
        libItem.appendChild(titleDiv);
        
        // Icon holder
        const emojiHolder = document.createElement('div');
        emojiHolder.style.flex = '1';
        emojiHolder.style.display = 'flex';
        emojiHolder.style.alignItems = 'center';
        emojiHolder.style.justifyContent = 'center';
        emojiHolder.style.padding = '4px';
        emojiHolder.style.fontSize = '2.5em';
        emojiHolder.textContent = item.emoji;
        
        libItem.appendChild(emojiHolder);
        
        libItem.title = item.name + ' (dobbeltklik for at tilføje)';
        libItem.draggable = true;
        libItem.dataset.name = item.name;
        libItem.dataset.displayName = item.name;
        libItem.dataset.emoji = item.emoji;
        
        libItem.addEventListener('dragstart', handleLibraryDragStart);
        libItem.addEventListener('dragend', handleDragEnd);
        libItem.addEventListener('dblclick', () => addToCanvasQuick(item.emoji, libItem.dataset.displayName || item.name));
        
        library.appendChild(libItem);
    });
}

// Handle drag start from library
function handleLibraryDragStart(e) {
    draggedElement = e.target.cloneNode(true);
    draggedElement.classList.remove('selected');
    e.dataTransfer.effectAllowed = 'copy';
    
    // Get the actual emoji or image from the element
    const emojiElement = e.target.dataset.emoji || e.target.textContent;
    const displayName = e.target.dataset.displayName || e.target.dataset.name || '';
    
    e.dataTransfer.setData('text/plain', emojiElement);
    e.dataTransfer.setData('itemName', displayName);
}

// Handle drag end
function handleDragEnd(e) {
    draggedElement = null;
}

// Setup canvas listeners
function setupCanvasListeners() {
    const canvas = document.getElementById('canvas');
    
    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        canvas.classList.add('drag-over');
        e.dataTransfer.dropEffect = 'copy';
    });
    
    canvas.addEventListener('dragleave', () => {
        canvas.classList.remove('drag-over');
    });
    
    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        canvas.classList.remove('drag-over');
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const emoji = e.dataTransfer.getData('text/plain');
        const itemName = e.dataTransfer.getData('itemName') || '';
        addToCanvas(emoji, x, y, itemName);
    });
    
    canvas.addEventListener('click', (e) => {
        if (e.target === canvas || e.target.classList.contains('canvas-hint')) {
            deselectAll();
        }
    });
    
    canvas.addEventListener('contextmenu', (e) => {
        if (e.target.classList.contains('canvas-item')) {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, e.target);
        }
    });
}

// Quick add to canvas via double-click
function addToCanvasQuick(content, itemName = '', type = 'emoji') {
    const canvas = document.getElementById('canvas');
    const rect = canvas.getBoundingClientRect();
    
    // Random position in canvas with some padding
    const x = Math.random() * (rect.width - 100) + 50;
    const y = Math.random() * (rect.height - 150) + 100;
    
    addToCanvas(content, x, y, itemName, type);
}

// Add item to canvas
function addToCanvas(content, x, y, itemName = '') {
    const canvas = document.getElementById('canvas');
    const item = document.createElement('div');
    item.className = 'canvas-item';
    
    // Remove canvas hint when first item is added
    canvas.classList.add('has-items');
    
    // Title holder (top)
    const titleDiv = document.createElement('div');
    titleDiv.className = 'canvas-item-title';
    titleDiv.textContent = itemName || 'Titel';
    titleDiv.title = 'Klik for at redigere overskrift';
    
    titleDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        editItemTitle(titleDiv, item);
    });
    
    item.appendChild(titleDiv);
    
    // Content holder
    const contentDiv = document.createElement('div');
    contentDiv.className = 'canvas-item-content';
    
    // Determine if it's an image (from upload) or emoji
    if (content.startsWith('data:') || content.startsWith('blob:')) {
        const img = document.createElement('img');
        img.src = content;
        contentDiv.appendChild(img);
    } else if (content.includes('.')) {
        // Filename from upload
        const img = document.createElement('img');
        img.src = content;
        contentDiv.appendChild(img);
    } else {
        // Emoji
        const emoji = document.createElement('div');
        emoji.className = 'emoji';
        emoji.textContent = content;
        contentDiv.appendChild(emoji);
    }
    
    item.appendChild(contentDiv);
    
    item.style.left = (x - 40) + 'px';
    item.style.top = (y - 40) + 'px';
    
    // Add event listeners
    item.addEventListener('mousedown', handleCanvasItemMouseDown);
    item.addEventListener('touchstart', handleCanvasItemMouseDown);
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        selectItem(item);
    });
    
    canvas.appendChild(item);
}

// Handle mouse down on canvas item for dragging
function handleCanvasItemMouseDown(e) {
    // Support both mouse and touch
    const isTouch = e.type.startsWith('touch');
    if (!isTouch && e.button !== 0) return; // Only left click for mouse
    
    draggedElement = e.currentTarget;
    selectItem(draggedElement);
    
    const rect = draggedElement.getBoundingClientRect();
    const canvasRect = document.getElementById('canvas').getBoundingClientRect();
    
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;
    
    function handleMouseMove(moveEvent) {
        const x = moveEvent.clientX - canvasRect.left - offsetX;
        const y = moveEvent.clientY - canvasRect.top - offsetY;
        
        draggedElement.style.left = Math.max(0, Math.min(x, canvasRect.width - rect.width)) + 'px';
        draggedElement.style.top = Math.max(0, Math.min(y, canvasRect.height - rect.height)) + 'px';
    }
    
    function handleMouseUp() {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
    }
    
    function handleTouchMove(moveEvent) {
        const x = moveEvent.touches[0].clientX - canvasRect.left - offsetX;
        const y = moveEvent.touches[0].clientY - canvasRect.top - offsetY;
        
        draggedElement.style.left = Math.max(0, Math.min(x, canvasRect.width - rect.width)) + 'px';
        draggedElement.style.top = Math.max(0, Math.min(y, canvasRect.height - rect.height)) + 'px';
    }
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleMouseUp);
}

// Select an item
function selectItem(item) {
    deselectAll();
    item.classList.add('selected');
    selectedItem = item;
    updateSelectedInfo();
}

// Deselect all items
function deselectAll() {
    document.querySelectorAll('.canvas-item').forEach(item => {
        item.classList.remove('selected');
    });
    selectedItem = null;
    updateSelectedInfo();
}

// Update selected info panel
function updateSelectedInfo() {
    const infoBox = document.getElementById('selectedInfo');
    const deleteBtn = document.getElementById('deleteSelected');

    if (!infoBox) return; // no UI for selected info (sidebar removed)

    if (!selectedItem) {
        infoBox.innerHTML = '<p>Vælg et element på canvasset</p>';
        if (deleteBtn) deleteBtn.style.display = 'none';
    } else {
        const left = selectedItem.style.left;
        const top = selectedItem.style.top;
        const width = selectedItem.style.width;
        const height = selectedItem.style.height;
        const title = selectedItem.querySelector('.canvas-item-title')?.textContent || '';

        infoBox.innerHTML = `
            <p><strong>Titel:</strong> ${title}</p>
            <p><small style="cursor: pointer; color: #667eea;" onclick="editItemTitle(selectedItem.querySelector('.canvas-item-title'), selectedItem)">✏️ Rediger titel</small></p>
            <p><strong>Position:</strong> ${left}, ${top}</p>
            <p><strong>Størrelse:</strong> ${width || '90px'} × ${height || '110px'}</p>
            <p><small>Flyt: Træk med musen</small></p>
            <p><small>Højreklik: Mere options</small></p>
        `;
        if (deleteBtn) deleteBtn.style.display = 'block';
    }
}

// Delete selected item
function deleteSelected() {
    if (selectedItem) {
        selectedItem.remove();
        selectedItem = null;
        updateSelectedInfo();
        
        // Show canvas hint if no items left
        const canvas = document.getElementById('canvas');
        if (canvas.children.length === 0) {
            canvas.classList.remove('has-items');
        }
    }
}

// Bring item to front
function bringToFront() {
    if (selectedItem) {
        selectedItem.style.zIndex = Math.max(...Array.from(document.querySelectorAll('.canvas-item'))
            .map(el => parseInt(getComputedStyle(el).zIndex) || 0)) + 1;
    }
}

// Send item to back
function sendToBack() {
    if (selectedItem) {
        selectedItem.style.zIndex = -1;
    }
}

// Show context menu
function showContextMenu(x, y, element) {
    selectItem(element);
    const menu = document.getElementById('contextMenu');
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.classList.add('active');
    
    document.addEventListener('click', hideContextMenu, { once: true });
}

// Hide context menu
function hideContextMenu() {
    document.getElementById('contextMenu').classList.remove('active');
}

// Edit item title (top)
function editItemTitle(titleElement, item) {
    const currentText = titleElement.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText === 'Titel' ? '' : currentText;
    
    titleElement.innerHTML = '';
    titleElement.appendChild(input);
    input.focus();
    input.select();
    
    function saveTitle() {
        const newText = input.value.trim() || 'Titel';
        titleElement.textContent = newText;
        updateSelectedInfo();
    }
    
    input.addEventListener('blur', saveTitle);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveTitle();
        }
    });
}

// Edit item label
function editItemLabel(labelElement, item) {
    const currentText = labelElement.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText === 'Uden navn' ? '' : currentText;
    
    labelElement.innerHTML = '';
    labelElement.appendChild(input);
    input.focus();
    input.select();
    
    function saveLabel() {
        const newText = input.value.trim() || 'Uden navn';
        labelElement.textContent = newText;
        item.dataset.label = newText;
        updateSelectedInfo();
    }
    
    input.addEventListener('blur', saveLabel);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveLabel();
        }
    });
}

// Setup search listener
function setupSearchListener() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const items = document.querySelectorAll('.library-item');
        
        console.log('Search for:', query, 'Found items:', items.length);
        
        items.forEach(item => {
            if (!query) {
                // No search - show everything
                item.style.display = 'flex';
            } else {
                // Search active - filter
                const name = item.dataset.name?.toLowerCase() || '';
                item.style.display = name.includes(query) ? 'flex' : 'none';
            }
        });
    });
}

// Setup upload listener
function setupUploadListener() {
    const uploadInput = document.getElementById('uploadInput');
    const uploadBtn = document.querySelector('.upload-btn');
    
    if (!uploadInput || !uploadBtn) {
        console.error('Upload elements not found');
        return;
    }
    
    console.log('Upload listener setup complete');
    
    // Klik på label/button åbner fil-dialog
    uploadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Upload button clicked');
        uploadInput.click();
    });
    
    // Når fil er valgt, læs og tilføj til bibliotek
    uploadInput.addEventListener('change', (e) => {
        console.log('File selection changed:', e.target.files.length, 'files');
        
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }
        
        Array.from(e.target.files).forEach(file => {
            console.log('Processing file:', file.name, 'Type:', file.type);
            
            // Valider at det er et billede
            if (!file.type.startsWith('image/')) {
                alert('Venligst upload kun billeder!');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                console.log('File loaded:', file.name);
                const dataUrl = event.target.result;
                uploadedImages.push(dataUrl);
                addUploadedItemToLibrary(dataUrl, file.name);
                console.log('Total uploaded images:', uploadedImages.length);
            };
            reader.onerror = () => {
                console.error('Error reading file:', file.name);
                alert('Fejl ved læsning af fil: ' + file.name);
            };
            reader.readAsDataURL(file);
        });
        
        // Reset input så man kan upload samme fil igen
        uploadInput.value = '';
    });
}

// Add uploaded image to library
function addUploadedItemToLibrary(dataUrl, fileName) {
    console.log('Adding uploaded item:', fileName);
    
    const library = document.getElementById('library');
    if (!library) {
        console.error('Library element not found!');
        return;
    }
    
    const item = document.createElement('div');
    item.className = 'library-item';
    item.style.overflow = 'hidden';
    item.style.position = 'relative';
    item.style.display = 'flex';
    item.style.flexDirection = 'column';
    
    // Extract name from filename
    const cleanName = fileName.split('.').slice(0, -1).join('.').substring(0, 20);
    
    // Title element for library item
    const titleDiv = document.createElement('div');
    titleDiv.className = 'library-item-title';
    titleDiv.textContent = cleanName;
    titleDiv.title = 'Klik for at redigere titel';
    titleDiv.style.padding = '4px';
    titleDiv.style.fontSize = '0.75em';
    titleDiv.style.fontWeight = '600';
    titleDiv.style.background = 'rgba(102, 126, 234, 0.1)';
    titleDiv.style.borderBottom = '1px solid rgba(102, 126, 234, 0.2)';
    titleDiv.style.cursor = 'pointer';
    titleDiv.style.textAlign = 'center';
    titleDiv.style.wordBreak = 'break-word';
    
    titleDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        editLibraryTitle(titleDiv, item);
    });
    
    item.appendChild(titleDiv);
    
    // Image holder
    const imgHolder = document.createElement('div');
    imgHolder.style.flex = '1';
    imgHolder.style.display = 'flex';
    imgHolder.style.alignItems = 'center';
    imgHolder.style.justifyContent = 'center';
    imgHolder.style.padding = '4px';
    
    const img = document.createElement('img');
    img.src = dataUrl;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';
    
    imgHolder.appendChild(img);
    item.appendChild(imgHolder);
    
    // Set data attributes
    item.title = cleanName + ' (dobbeltklik for at tilføje)';
    item.dataset.name = cleanName;
    item.dataset.displayTitle = cleanName;
    item.dataset.dataUrl = dataUrl;
    item.id = 'upload-' + Date.now();
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'library-item-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Slet billede';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteUploadedItem(item.id);
    };
    item.appendChild(deleteBtn);
    
    item.draggable = true;
    
    item.addEventListener('dragstart', (e) => {
        draggedElement = document.createElement('div');
        draggedElement.className = 'canvas-item';
        
        const img = document.createElement('img');
        img.src = dataUrl;
        draggedElement.appendChild(img);
        draggedElement.style.width = '80px';
        draggedElement.style.height = '80px';
        
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', dataUrl);
        e.dataTransfer.setData('itemName', item.dataset.displayTitle || cleanName);
    });
    
    item.addEventListener('dblclick', () => addToCanvasQuick(dataUrl, item.dataset.displayTitle || cleanName, 'image'));
    item.addEventListener('dblclick', () => addToCanvasQuick(dataUrl, cleanName, 'image'));
    
    library.appendChild(item);
    
    // Track the uploaded item
    uploadedLibraryItems.push({ id: item.id, dataUrl, fileName, element: item });
}

// Edit emoji library item title
function editLibraryEmojiTitle(titleElement, item, originalItem) {
    const currentText = titleElement.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    
    titleElement.innerHTML = '';
    titleElement.appendChild(input);
    input.focus();
    input.select();
    
    function saveTitle() {
        const newText = input.value.trim() || originalItem.name;
        titleElement.textContent = newText;
        item.dataset.displayName = newText;
        item.dataset.name = newText;
    }
    
    input.addEventListener('blur', saveTitle);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveTitle();
        }
    });
}

// Edit library item title
function editLibraryTitle(titleElement, item) {
    const currentText = titleElement.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    
    titleElement.innerHTML = '';
    titleElement.appendChild(input);
    input.focus();
    input.select();
    
    function saveTitle() {
        const newText = input.value.trim() || 'Billede';
        titleElement.textContent = newText;
        item.dataset.displayTitle = newText;
        item.dataset.name = newText;
    }
    
    input.addEventListener('blur', saveTitle);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveTitle();
        }
    });
}

// Delete uploaded item from library
function deleteUploadedItem(itemId) {
    if (!confirm('Er du sikker på at du vil slette dette billede?')) {
        return;
    }
    
    const itemElement = document.getElementById(itemId);
    if (itemElement) {
        console.log('Deleting item:', itemId);
        // Remove only this specific item, not parent
        itemElement.remove();
        
        // Remove from tracking array
        uploadedLibraryItems = uploadedLibraryItems.filter(item => item.id !== itemId);
        console.log('Remaining uploads:', uploadedLibraryItems.length);
    } else {
        console.error('Item not found:', itemId);
    }
}

// Canvas size listener
function setupCanvasSizeListener() {
    const select = document.getElementById('canvasSize');
    const canvas = document.getElementById('canvas');
    const sizes = {
        'small': '400px',
        'medium': '600px',
        'large': '800px'
    };

    if (select) {
        select.addEventListener('change', (e) => {
            const size = sizes[e.target.value] || sizes['medium'];
            if (canvas) {
                canvas.style.width = size;
                canvas.style.height = size;
            }
        });

        // Set initial size from select if present
        const initial = sizes[select.value] || sizes['medium'];
        if (canvas) {
            canvas.style.width = initial;
            canvas.style.height = initial;
        }
    } else {
        // No select in UI (settings removed) - ensure canvas has sensible default
        if (canvas) {
            canvas.style.width = sizes['medium'];
            canvas.style.height = sizes['medium'];
        }
    }
}

// Background color listener
function setupBgColorListener() {
    const colorInput = document.getElementById('bgColor');
    const canvas = document.getElementById('canvas');
    if (colorInput) {
        colorInput.addEventListener('change', (e) => {
            if (canvas) canvas.style.backgroundColor = e.target.value;
        });

        // Set initial color from input
        if (canvas) canvas.style.backgroundColor = colorInput.value || '#ffffff';
    } else {
        // No color input in UI - set sensible default
        if (canvas) canvas.style.backgroundColor = '#ffffff';
    }
}

// Save layout
function saveLayout() {
    const canvas = document.getElementById('canvas');
    const items = [];
    
    document.querySelectorAll('.canvas-item').forEach(item => {
        const titleElement = item.querySelector('.canvas-item-title');
        
        const itemData = {
            left: item.style.left,
            top: item.style.top,
            zIndex: item.style.zIndex || 'auto',
            title: titleElement?.textContent || 'Titel',
            content: null
        };
        
        // Check if it has an image or emoji
        if (item.querySelector('img')) {
            itemData.content = item.querySelector('img').src;
            itemData.type = 'image';
        } else if (item.querySelector('.emoji')) {
            itemData.content = item.querySelector('.emoji').textContent;
            itemData.type = 'emoji';
        }
        
        items.push(itemData);
    });
    
    const layout = {
        id: Date.now(),
        name: prompt('Hvad skal layoutet hedde?') || 'Layout ' + new Date().toLocaleString('da-DK'),
        items: items,
        bgColor: (document.getElementById('canvas') && document.getElementById('canvas').style.backgroundColor) || '#ffffff',
        size: (function() {
            const select = document.getElementById('canvasSize');
            if (select && select.value) return select.value;
            // infer size from canvas width
            const canvas = document.getElementById('canvas');
            if (canvas) {
                const w = parseInt(canvas.style.width) || canvas.offsetWidth;
                if (w <= 400) return 'small';
                if (w >= 800) return 'large';
                return 'medium';
            }
            return 'medium';
        })()
    };
    
    if (layout.name) {
        savedLayouts.push(layout);
        localStorage.setItem('pictogramLayouts', JSON.stringify(savedLayouts));
        console.log('Saved layout:', layout.name, layout.id);
        // Ensure the saved layouts panel is visible so user can see it immediately
        const panel = document.getElementById('savedLayoutsPanel');
        if (panel) panel.style.display = 'block';
        loadSavedLayouts();
        alert('Layout gemt!');
    }
}

// Load saved layouts
function loadSavedLayouts() {
    const saved = localStorage.getItem('pictogramLayouts');
    savedLayouts = saved ? JSON.parse(saved) : [];
    
    const container = document.getElementById('savedLayouts');
    container.innerHTML = '';
    
    if (savedLayouts.length === 0) {
        container.innerHTML = '<p>Ingen gemte layouts endnu</p>';
        return;
    }
    
    savedLayouts.forEach(layout => {
        const div = document.createElement('div');
        div.className = 'layout-item';
        div.innerHTML = `
            <span onclick="loadLayout(${layout.id})" style="cursor:pointer; flex:1;">📌 ${layout.name}</span>
            <button onclick="deleteLayout(${layout.id})">🗑️</button>
        `;
        container.appendChild(div);
    });
}

// Load a saved layout
function loadLayout(id) {
    const layout = savedLayouts.find(l => l.id === id);
    if (!layout) return;
    
    if (!confirm('Vil du indlæse dette layout? Dit nuværende arbejde bliver overskrevet.')) {
        return;
    }
    
    clearCanvas();
    
    const bgInput = document.getElementById('bgColor');
    if (bgInput) bgInput.value = layout.bgColor;
    const canvas = document.getElementById('canvas');
    if (canvas) canvas.style.backgroundColor = layout.bgColor;
    const sizeSelect = document.getElementById('canvasSize');
    if (sizeSelect) sizeSelect.value = layout.size;
    
    const sizes = { 'small': '400px', 'medium': '600px', 'large': '800px' };
    if (canvas) {
        canvas.style.width = sizes[layout.size] || sizes['medium'];
        canvas.style.height = sizes[layout.size] || sizes['medium'];
    }
    
    layout.items.forEach(itemData => {
        const item = document.createElement('div');
        item.className = 'canvas-item';
        item.style.left = itemData.left;
        item.style.top = itemData.top;
        item.style.zIndex = itemData.zIndex;
        
        // Title holder (top)
        const titleDiv = document.createElement('div');
        titleDiv.className = 'canvas-item-title';
        titleDiv.textContent = itemData.title || 'Titel';
        titleDiv.title = 'Klik for at redigere overskrift';
        
        titleDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            editItemTitle(titleDiv, item);
        });
        
        item.appendChild(titleDiv);
        
        // Content holder
        const contentDiv = document.createElement('div');
        contentDiv.className = 'canvas-item-content';
        
        if (itemData.type === 'emoji') {
            const emoji = document.createElement('div');
            emoji.className = 'emoji';
            emoji.textContent = itemData.content;
            contentDiv.appendChild(emoji);
        } else if (itemData.type === 'image') {
            const img = document.createElement('img');
            img.src = itemData.content;
            contentDiv.appendChild(img);
        }
        
        item.appendChild(contentDiv);
        
        // (no bottom label) -- only title on top
        
        item.addEventListener('mousedown', handleCanvasItemMouseDown);
        item.addEventListener('touchstart', handleCanvasItemMouseDown);
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            selectItem(item);
        });
        
        canvas.appendChild(item);
    });
    
    canvas.classList.add('has-items');
}

// Delete a saved layout
function deleteLayout(id) {
    if (confirm('Vil du slette dette layout? Det kan ikke fortrydes.')) {
        savedLayouts = savedLayouts.filter(l => l.id !== id);
        localStorage.setItem('pictogramLayouts', JSON.stringify(savedLayouts));
        loadSavedLayouts();
    }
}

// Clear canvas
function clearCanvas() {
    if (!confirm('Vil du ryde hele canvasset?')) return;
    
    document.getElementById('canvas').innerHTML = '';
    document.getElementById('canvas').classList.remove('has-items');
    deselectAll();
}

// Toggle saved layouts panel
function toggleSavedLayouts() {
    const panel = document.getElementById('savedLayoutsPanel');
    if (!panel) return;
    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'block';
        loadSavedLayouts();
    } else {
        panel.style.display = 'none';
    }
}

// Download canvas as image
function downloadAsImage() {
    const canvas = document.getElementById('canvas');
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.offsetWidth;
    tempCanvas.height = canvas.offsetHeight;
    
    const ctx = tempCanvas.getContext('2d');
    
    // Draw background
    ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw items (simplified - just text)
    ctx.fillStyle = '#000';
    ctx.font = '40px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    document.querySelectorAll('.canvas-item').forEach(item => {
        const x = parseInt(item.style.left) + 40;
        const y = parseInt(item.style.top) + 40;
        
        const emoji = item.querySelector('.emoji');
        if (emoji) {
            ctx.font = 'bold 40px serif';
            ctx.fillText(emoji.textContent, x, y);
        }
    });
    
    tempCanvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pictogrammer_' + new Date().getTime() + '.png';
        a.click();
        URL.revokeObjectURL(url);
    });
}
