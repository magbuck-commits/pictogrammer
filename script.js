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
let slides = [];
let currentSlideIndex = -1;
let pendingConfirmAction = null;
let recentItems = [];
const RECENT_LIMIT = 8;
let pendingNameResolve = null;
let slidesListenersSetup = false;
let snapToGrid = false;
const GRID_SIZE = 10;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeLibrary();
    setupCanvasListeners();
    setupSearchListener();
    setupUploadListener();
    setupCanvasSizeListener();
    setupBgColorListener();
    setupCanvasResizeHandler();
    loadSavedLayouts();
    setupInstallButton();
    setupConfirmModal();
    setupNameModal();
    loadRecentItems();
    renderRecentItems();
    setSnapButtonState();
    setupTemplateSelects();
});

function setupTemplateSelects() {
    document.querySelectorAll('.template-select').forEach(select => {
        select.addEventListener('change', (e) => {
            setView(e.target.value);
        });
    });
    updateTemplateSelects('canvas');
}

function updateTemplateSelects(value) {
    document.querySelectorAll('.template-select').forEach(select => {
        select.value = value;
    });
}

function setupConfirmModal() {
    const modal = document.getElementById('confirmModal');
    const cancelBtn = document.getElementById('confirmCancelBtn');
    const okBtn = document.getElementById('confirmOkBtn');
    const backdrop = modal ? modal.querySelector('.confirm-modal-backdrop') : null;

    if (!modal || !cancelBtn || !okBtn || !backdrop) return;

    cancelBtn.addEventListener('click', () => hideConfirmModal());
    backdrop.addEventListener('click', () => hideConfirmModal());
    okBtn.addEventListener('click', () => {
        const action = pendingConfirmAction;
        hideConfirmModal();
        if (action) action();
    });
}

function showConfirmModal(message, onConfirm, title = 'Er du sikker?') {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmModalTitle');
    const messageEl = document.getElementById('confirmModalMessage');
    if (!modal || !titleEl || !messageEl) return;

    titleEl.textContent = title;
    messageEl.textContent = message;
    pendingConfirmAction = onConfirm;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

function hideConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    pendingConfirmAction = null;
}

function setupNameModal() {
    const modal = document.getElementById('nameModal');
    const cancelBtn = document.getElementById('nameCancelBtn');
    const okBtn = document.getElementById('nameOkBtn');
    const backdrop = modal ? modal.querySelector('.confirm-modal-backdrop') : null;
    const input = document.getElementById('layoutNameInput');

    if (!modal || !cancelBtn || !okBtn || !backdrop || !input) return;

    cancelBtn.addEventListener('click', () => finishNameModal(null));
    backdrop.addEventListener('click', () => finishNameModal(null));
    okBtn.addEventListener('click', () => finishNameModal(input.value));
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            finishNameModal(input.value);
        }
    });
}

function showNameModal(defaultValue) {
    const modal = document.getElementById('nameModal');
    const input = document.getElementById('layoutNameInput');
    if (!modal || !input) return Promise.resolve(null);

    input.value = defaultValue || '';
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => input.focus(), 0);

    return new Promise((resolve) => {
        pendingNameResolve = resolve;
    });
}

function finishNameModal(value) {
    const modal = document.getElementById('nameModal');
    const input = document.getElementById('layoutNameInput');
    if (!modal || !input) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    const trimmed = (value || '').trim();
    const resolve = pendingNameResolve;
    pendingNameResolve = null;
    if (resolve) resolve(trimmed || null);
    input.value = '';
}

function getCanvasElement() {
    return document.getElementById('canvas');
}

function updateItemRelativePosition(item) {
    const canvas = getCanvasElement();
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const maxLeft = Math.max(0, canvasRect.width - itemRect.width);
    const maxTop = Math.max(0, canvasRect.height - itemRect.height);
    const leftPx = parseFloat(item.style.left) || 0;
    const topPx = parseFloat(item.style.top) || 0;

    item.dataset.relLeft = maxLeft > 0 ? (leftPx / maxLeft) : 0;
    item.dataset.relTop = maxTop > 0 ? (topPx / maxTop) : 0;
}

function applyItemRelativePosition(item) {
    const canvas = getCanvasElement();
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const maxLeft = Math.max(0, canvasRect.width - itemRect.width);
    const maxTop = Math.max(0, canvasRect.height - itemRect.height);
    let relLeft = parseFloat(item.dataset.relLeft);
    let relTop = parseFloat(item.dataset.relTop);

    if (Number.isNaN(relLeft) || Number.isNaN(relTop)) {
        const leftPx = parseFloat(item.style.left) || 0;
        const topPx = parseFloat(item.style.top) || 0;
        relLeft = maxLeft > 0 ? (leftPx / maxLeft) : 0;
        relTop = maxTop > 0 ? (topPx / maxTop) : 0;
        item.dataset.relLeft = relLeft;
        item.dataset.relTop = relTop;
    }

    item.style.left = (maxLeft * relLeft) + 'px';
    item.style.top = (maxTop * relTop) + 'px';
}

function applyAllItemPositions() {
    document.querySelectorAll('.canvas-item').forEach(item => {
        applyItemRelativePosition(item);
    });
}

function normalizeSizeValue(value) {
    if (value == null) return '';
    if (typeof value === 'number') return value + 'px';
    if (typeof value === 'string' && value.trim() !== '') return value;
    return '';
}

function parseSizeValue(value) {
    if (value == null) return null;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
}

function snapValue(value, gridSize) {
    return Math.round(value / gridSize) * gridSize;
}

function setSnapButtonState() {
    const btn = document.getElementById('snapToggleBtn');
    if (!btn) return;
    btn.textContent = snapToGrid ? '🧲 Snap: Til' : '🧲 Snap: Fra';
}

function toggleSnapGrid() {
    snapToGrid = !snapToGrid;
    setSnapButtonState();
}
function updateItemContentScale(item) {
    if (!item) return;
    const emoji = item.querySelector('.emoji');
    if (!emoji) return;
    const size = Math.min(item.clientWidth, item.clientHeight) * 0.6;
    const clamped = Math.max(12, Math.floor(size));
    emoji.style.fontSize = clamped + 'px';
}

function addResizeHandle(item) {
    if (!item || item.querySelector('.resize-handle')) return;
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    handle.addEventListener('mousedown', startResize);
    handle.addEventListener('touchstart', startResize, { passive: false });
    item.appendChild(handle);
}

function getPointerPosition(e) {
    if (e.touches && e.touches[0]) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
}

function startResize(e) {
    e.preventDefault();
    e.stopPropagation();

    const handle = e.currentTarget;
    const item = handle ? handle.parentElement : null;
    const canvas = document.getElementById('canvas');
    if (!item || !canvas) return;
    if (item.dataset.locked === 'true') return;

    const startPos = getPointerPosition(e);
    const startWidth = item.offsetWidth;
    const startHeight = item.offsetHeight;
    const canvasRect = canvas.getBoundingClientRect();
    const itemLeft = parseFloat(item.style.left) || 0;
    const itemTop = parseFloat(item.style.top) || 0;
    const maxWidth = Math.max(40, canvasRect.width - itemLeft);
    const maxHeight = Math.max(50, canvasRect.height - itemTop);

    function onMove(ev) {
        if (ev.cancelable) ev.preventDefault();
        const pos = getPointerPosition(ev);
        const dx = pos.x - startPos.x;
        const dy = pos.y - startPos.y;
        let newWidth = Math.max(40, Math.min(maxWidth, startWidth + dx));
        let newHeight = Math.max(50, Math.min(maxHeight, startHeight + dy));
        if (snapToGrid) {
            newWidth = snapValue(newWidth, GRID_SIZE);
            newHeight = snapValue(newHeight, GRID_SIZE);
            newWidth = Math.max(40, Math.min(maxWidth, newWidth));
            newHeight = Math.max(50, Math.min(maxHeight, newHeight));
        }
        item.style.width = newWidth + 'px';
        item.style.height = newHeight + 'px';
        item.dataset.savedWidth = newWidth;
        item.dataset.savedHeight = newHeight;
        updateItemContentScale(item);
    }

    function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
        updateItemRelativePosition(item);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
}

function setupCanvasResizeHandler() {
    window.addEventListener('resize', () => {
        applyAllItemPositions();
    });
}

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
        
        // Add to Slides button
        const addToSlidesBtn = document.createElement('button');
        addToSlidesBtn.className = 'library-item-add-slides';
        addToSlidesBtn.innerHTML = '➕';
        addToSlidesBtn.title = 'Tilføj til Slides';
        addToSlidesBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToSlides(item.emoji, libItem.dataset.displayName || item.name);
        });
        libItem.appendChild(addToSlidesBtn);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'library-item-delete';
        deleteBtn.textContent = '-';
        deleteBtn.title = 'Slet pictogrammet';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeLibraryItemElement(libItem);
        });
        libItem.appendChild(deleteBtn);
        
        libItem.title = item.name + ' (dobbeltklik for at tilføje)'
        libItem.draggable = true;
        libItem.dataset.name = item.name;
        libItem.dataset.displayName = item.name;
        libItem.dataset.emoji = item.emoji;
        libItem.dataset.itemType = 'emoji';
        
        libItem.addEventListener('dragstart', handleLibraryDragStart);
        libItem.addEventListener('dragend', handleDragEnd);
        libItem.addEventListener('dblclick', (e) => {
            if (e.shiftKey) {
                addToSlides(item.emoji, libItem.dataset.displayName || item.name);
            } else {
                addToCanvasQuick(item.emoji, libItem.dataset.displayName || item.name);
            }
        });
        
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
    const itemType = e.target.dataset.itemType || 'emoji';
    
    console.log('Drag start:', { emojiElement, displayName, itemType });
    
    e.dataTransfer.setData('text/plain', emojiElement);
    e.dataTransfer.setData('itemName', displayName);
    e.dataTransfer.setData('itemType', itemType);
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

function setupSlidesListeners() {
    if (slidesListenersSetup) {
        console.log('Slides listeners already set up, skipping');
        return;
    }
    
    const slidesDisplay = document.getElementById('slidesDisplayContent');
    const slidesArea = document.querySelector('.slides-display');
    const slidesThumbs = document.getElementById('slidesThumbs');
    const slidesThumbsContainer = document.querySelector('.slides-thumbs-container');
    
    console.log('Setting up slides listeners. slidesArea:', slidesArea, 'slidesDisplay:', slidesDisplay);
    
    // Setup drop on the thumbnails strip
    if (slidesThumbs && slidesThumbsContainer) {
        slidesThumbsContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            const effect = e.dataTransfer.effectAllowed || '';
            const isMove = effect.includes('move');
            e.dataTransfer.dropEffect = isMove ? 'move' : 'copy';
            if (!isMove) {
                slidesThumbsContainer.classList.add('drag-over');
            }
        });

        slidesThumbsContainer.addEventListener('dragleave', (e) => {
            if (e.target === slidesThumbsContainer) {
                slidesThumbsContainer.classList.remove('drag-over');
            }
        });

        slidesThumbsContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            slidesThumbsContainer.classList.remove('drag-over');

            const effect = e.dataTransfer.effectAllowed || '';
            const isMove = effect.includes('move');
            if (isMove) return;

            const emoji = e.dataTransfer.getData('text/plain');
            const itemName = e.dataTransfer.getData('itemName') || '';
            const itemType = e.dataTransfer.getData('itemType') || 'emoji';

            if (emoji) {
                addToSlides(emoji, itemName, itemType);
            }
        });
    }

    // Setup drop on the entire slides display area
    if (slidesArea) {
        slidesArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            slidesArea.classList.add('drag-over');
            e.dataTransfer.dropEffect = 'copy';
            console.log('Slides dragover');
        });
        
        slidesArea.addEventListener('dragleave', (e) => {
            // Only remove if leaving the slides-display itself
            if (e.target === slidesArea) {
                slidesArea.classList.remove('drag-over');
            }
        });
        
        slidesArea.addEventListener('drop', (e) => {
            e.preventDefault();
            slidesArea.classList.remove('drag-over');
            
            const emoji = e.dataTransfer.getData('text/plain');
            const itemName = e.dataTransfer.getData('itemName') || '';
            const itemType = e.dataTransfer.getData('itemType') || 'emoji';
            
            console.log('Slides drop:', { emoji, itemName, itemType });
            
            if (emoji) {
                addToSlides(emoji, itemName, itemType);
            }
        });
        
        slidesListenersSetup = true;
        console.log('Slides listeners successfully set up');
    } else {
        console.warn('Slides area not found!');
    }
    
    // Also setup on content area for better coverage
    if (slidesDisplay) {
        slidesDisplay.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });
        
        slidesDisplay.addEventListener('drop', (e) => {
            e.preventDefault();
            
            const emoji = e.dataTransfer.getData('text/plain');
            const itemName = e.dataTransfer.getData('itemName') || '';
            const itemType = e.dataTransfer.getData('itemType') || 'emoji';
            
            console.log('Slides display drop:', { emoji, itemName, itemType });
            
            if (emoji) {
                addToSlides(emoji, itemName, itemType);
            }
        });
    }
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
function addToCanvas(content, x, y, itemName = '', type = '') {
    const canvas = document.getElementById('canvas');
    const item = document.createElement('div');
    item.className = 'canvas-item';
    item.dataset.locked = 'false';
    
    // Remove canvas hint when first item is added
    canvas.classList.add('has-items');
    
    // Content holder
    const contentDiv = document.createElement('div');
    contentDiv.className = 'canvas-item-content';
    
    const resolvedType = type || inferRecentType(content);

    // Determine if it's an image (from upload) or emoji
    if (resolvedType === 'image') {
        const img = document.createElement('img');
        img.src = content;
        img.style.width = '100%';
        img.style.height = '100%';
        contentDiv.appendChild(img);
    } else {
        // Emoji
        const emoji = document.createElement('div');
        emoji.className = 'emoji';
        emoji.textContent = content;
        contentDiv.appendChild(emoji);
    }
    
    item.appendChild(contentDiv);

    // Title holder (bottom)
    const titleDiv = document.createElement('div');
    titleDiv.className = 'canvas-item-title';
    titleDiv.textContent = itemName || 'Titel';
    titleDiv.title = 'Klik for at redigere overskrift';
    
    titleDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        editItemTitle(titleDiv, item);
    });
    
    item.appendChild(titleDiv);

    addResizeHandle(item);
    
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
    updateItemRelativePosition(item);
    updateItemContentScale(item);
    // Store initial size in dataset for saving
    item.dataset.savedWidth = item.offsetWidth;
    item.dataset.savedHeight = item.offsetHeight;
}

// Handle mouse down on canvas item for dragging
function handleCanvasItemMouseDown(e) {
    // Support both mouse and touch
    const isTouch = e.type.startsWith('touch');
    if (!isTouch && e.button !== 0) return; // Only left click for mouse
    
    draggedElement = e.currentTarget;
    if (draggedElement && draggedElement.dataset.locked === 'true') {
        return;
    }
    selectItem(draggedElement);
    
    const rect = draggedElement.getBoundingClientRect();
    const canvas = document.getElementById('canvas');
    const canvasRect = canvas.getBoundingClientRect();
    
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;
    
    let autoScrollInterval = null;
    
    function autoScroll(mouseY) {
        const scrollZone = 100; // pixels from edge to trigger scroll
        const scrollSpeed = 10;
        const viewportHeight = window.innerHeight;
        
        if (mouseY < scrollZone) {
            // Scroll up
            window.scrollBy(0, -scrollSpeed);
        } else if (mouseY > viewportHeight - scrollZone) {
            // Scroll down
            window.scrollBy(0, scrollSpeed);
        }
    }
    
    function handleMouseMove(moveEvent) {
        const mouseY = moveEvent.clientY;
        autoScroll(mouseY);
        
        let x = moveEvent.clientX - canvasRect.left - offsetX;
        let y = moveEvent.clientY - canvasRect.top - offsetY;
        
        x = Math.max(0, Math.min(x, canvasRect.width - rect.width));
        y = Math.max(0, Math.min(y, canvasRect.height - rect.height));
        if (snapToGrid) {
            x = snapValue(x, GRID_SIZE);
            y = snapValue(y, GRID_SIZE);
            x = Math.max(0, Math.min(x, canvasRect.width - rect.width));
            y = Math.max(0, Math.min(y, canvasRect.height - rect.height));
        }
        
        draggedElement.style.left = x + 'px';
        draggedElement.style.top = y + 'px';
    }
    
    function handleMouseUp() {
        if (autoScrollInterval) {
            cancelAnimationFrame(autoScrollInterval);
            autoScrollInterval = null;
        }
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
        if (draggedElement) {
            updateItemRelativePosition(draggedElement);
        }
    }
    
    function handleTouchMove(moveEvent) {
        const mouseY = moveEvent.touches[0].clientY;
        autoScroll(mouseY);
        
        let x = moveEvent.touches[0].clientX - canvasRect.left - offsetX;
        let y = moveEvent.touches[0].clientY - canvasRect.top - offsetY;
        
        x = Math.max(0, Math.min(x, canvasRect.width - rect.width));
        y = Math.max(0, Math.min(y, canvasRect.height - rect.height));
        if (snapToGrid) {
            x = snapValue(x, GRID_SIZE);
            y = snapValue(y, GRID_SIZE);
            x = Math.max(0, Math.min(x, canvasRect.width - rect.width));
            y = Math.max(0, Math.min(y, canvasRect.height - rect.height));
        }
        
        draggedElement.style.left = x + 'px';
        draggedElement.style.top = y + 'px';
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

function updateLockMenuLabel() {
    const btn = document.getElementById('lockToggleBtn');
    if (!btn || !selectedItem) return;
    const isLocked = selectedItem.dataset.locked === 'true';
    btn.textContent = isLocked ? 'Lås op' : 'Lås';
}

function toggleLockSelected() {
    if (!selectedItem) return;
    const isLocked = selectedItem.dataset.locked === 'true';
    selectedItem.dataset.locked = isLocked ? 'false' : 'true';
    selectedItem.classList.toggle('locked', !isLocked);
    updateLockMenuLabel();
}

// Show context menu
function showContextMenu(x, y, element) {
    selectItem(element);
    const menu = document.getElementById('contextMenu');
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.classList.add('active');
    updateLockMenuLabel();
    
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

function loadRecentItems() {
    try {
        const stored = localStorage.getItem('recentPictograms');
        recentItems = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(recentItems)) recentItems = [];
    } catch (err) {
        recentItems = [];
    }
}

function saveRecentItems() {
    localStorage.setItem('recentPictograms', JSON.stringify(recentItems));
}

function inferRecentType(content) {
    if (content.startsWith('data:') || content.startsWith('blob:')) return 'image';
    if (content.includes('.')) return 'image';
    return 'emoji';
}

function addRecentItem(content, itemName = '', type = '') {
    if (!content) return;
    const resolvedType = type || inferRecentType(content);
    recentItems = recentItems.filter(item => !(item.content === content && item.type === resolvedType));
    recentItems.unshift({ content, name: itemName || '', type: resolvedType });
    recentItems = recentItems.slice(0, RECENT_LIMIT);
    saveRecentItems();
    renderRecentItems();
}

function renderRecentItems() {
    const container = document.getElementById('recentLibrary');
    if (!container) return;
    container.innerHTML = '';

    if (!recentItems.length) {
        const empty = document.createElement('p');
        empty.className = 'recent-empty';
        empty.textContent = 'Ingen endnu';
        container.appendChild(empty);
        return;
    }

    recentItems.forEach(item => {
        const recent = document.createElement('div');
        recent.className = 'recent-item';
        recent.title = 'Klik for at tilføje';
        recent.draggable = true;

        if (item.type === 'image') {
            const img = document.createElement('img');
            img.src = item.content;
            recent.appendChild(img);
        } else {
            const emoji = document.createElement('div');
            emoji.className = 'emoji';
            emoji.textContent = item.content;
            recent.appendChild(emoji);
        }

        recent.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('text/plain', item.content);
            e.dataTransfer.setData('itemName', item.name || '');
            e.dataTransfer.setData('itemType', item.type || 'emoji');
        });

        recent.addEventListener('click', () => {
            addToCanvasQuick(item.content, item.name, item.type);
        });

        container.appendChild(recent);
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
    item.dataset.itemType = 'image';
    item.id = 'upload-' + Date.now();
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'library-item-delete';
    deleteBtn.textContent = '-';
    deleteBtn.title = 'Slet pictogrammet';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteUploadedItem(item.id);
    };
    item.appendChild(deleteBtn);
    
    // Add to Slides button
    const addToSlidesBtn = document.createElement('button');
    addToSlidesBtn.className = 'library-item-add-slides';
    addToSlidesBtn.innerHTML = '➕';
    addToSlidesBtn.title = 'Tilføj til Slides';
    addToSlidesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToSlides(dataUrl, item.dataset.displayTitle || cleanName, 'image');
    });
    item.appendChild(addToSlidesBtn);
    
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
        e.dataTransfer.setData('itemType', 'image');
        e.dataTransfer.setData('libraryItemId', item.id);
    });
    
    item.addEventListener('dblclick', (e) => {
        if (e.shiftKey) {
            addToSlides(dataUrl, item.dataset.displayTitle || cleanName, 'image');
        } else {
            addToCanvasQuick(dataUrl, item.dataset.displayTitle || cleanName, 'image');
        }
    });
    
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

function removeLibraryItemElement(itemElement) {
    if (!itemElement) return;
    showConfirmModal('Vil du slette dette pictogram?', () => {
        itemElement.remove();
    });
}

// Delete uploaded item from library
function deleteUploadedItem(itemId) {
    showConfirmModal('Vil du slette dette billede?', () => {
        removeUploadedItemById(itemId);
    });
}

function removeUploadedItemById(itemId) {
    const itemElement = document.getElementById(itemId);
    if (itemElement) {
        console.log('Deleting item:', itemId);
        itemElement.remove();
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
                applyAllItemPositions();
            }
        });

        // Set initial size from select if present
        const initial = sizes[select.value] || sizes['medium'];
        if (canvas) {
            canvas.style.width = initial;
            canvas.style.height = initial;
            applyAllItemPositions();
        }
    } else {
        // No select in UI (settings removed) - keep canvas responsive
        applyAllItemPositions();
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
async function saveLayout() {
    const canvas = document.getElementById('canvas');
    const items = [];
    
    document.querySelectorAll('.canvas-item').forEach(item => {
        const titleElement = item.querySelector('.canvas-item-title');
        const rect = item.getBoundingClientRect();
        const savedWidth = parseFloat(item.dataset.savedWidth || '');
        const savedHeight = parseFloat(item.dataset.savedHeight || '');
        const finalWidth = Number.isFinite(savedWidth) ? savedWidth : rect.width;
        const finalHeight = Number.isFinite(savedHeight) ? savedHeight : rect.height;
        console.log('SAVING item:', {
            title: titleElement?.textContent,
            rectWidth: rect.width,
            rectHeight: rect.height,
            datasetWidth: item.dataset.savedWidth,
            datasetHeight: item.dataset.savedHeight,
            finalWidth,
            finalHeight
        });
        
        const itemData = {
            left: item.style.left,
            top: item.style.top,
            zIndex: item.style.zIndex || 'auto',
            title: titleElement?.textContent || 'Titel',
            content: null,
            width: finalWidth,
            height: finalHeight,
            locked: item.dataset.locked === 'true'
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
    
    const defaultName = 'Layout ' + new Date().toLocaleString('da-DK');
    const name = await showNameModal(defaultName);
    if (!name) return;

    const slidesSnapshot = slides.map(slide => ({
        content: slide.content,
        name: slide.name,
        type: slide.type
    }));

    const layout = {
        id: Date.now(),
        name: name,
        items: items,
        slides: slidesSnapshot,
        currentSlideIndex: currentSlideIndex,
        weekly: JSON.parse(JSON.stringify(weeklyData)),
        highlightCurrentDay: highlightCurrentDay,
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
    
    savedLayouts.push(layout);
    localStorage.setItem('pictogramLayouts', JSON.stringify(savedLayouts));
    console.log('Saved layout:', layout.name, layout.id);
    // Ensure the saved layouts panel is visible so user can see it immediately
    const panel = document.getElementById('savedLayoutsPanel');
    if (panel) panel.style.display = 'block';
    loadSavedLayouts();
    alert('Layout gemt!');
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
    if (canvas && sizeSelect) {
        canvas.style.width = sizes[layout.size] || sizes['medium'];
        canvas.style.height = sizes[layout.size] || sizes['medium'];
    }
    
    layout.items.forEach(itemData => {
        const item = document.createElement('div');
        item.className = 'canvas-item';
        item.style.left = itemData.left;
        item.style.top = itemData.top;
        item.style.zIndex = itemData.zIndex;
        const sizeW = parseSizeValue(itemData.width);
        const sizeH = parseSizeValue(itemData.height);
        console.log('LOADING item:', {
            title: itemData.title,
            storedWidth: itemData.width,
            storedHeight: itemData.height,
            parsedW: sizeW,
            parsedH: sizeH
        });
        if (sizeW) {
            item.style.width = sizeW + 'px';
            item.dataset.savedWidth = sizeW;
        }
        if (sizeH) {
            item.style.height = sizeH + 'px';
            item.dataset.savedHeight = sizeH;
        }
        if (itemData.locked) {
            item.dataset.locked = 'true';
            item.classList.add('locked');
        } else {
            item.dataset.locked = 'false';
        }
        
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
            img.style.width = '100%';
            img.style.height = '100%';
            contentDiv.appendChild(img);
        }
        
        item.appendChild(contentDiv);

        // Title holder (bottom)
        const titleDiv = document.createElement('div');
        titleDiv.className = 'canvas-item-title';
        titleDiv.textContent = itemData.title || 'Titel';
        titleDiv.title = 'Klik for at redigere overskrift';
        
        titleDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            editItemTitle(titleDiv, item);
        });
        
        item.appendChild(titleDiv);

        addResizeHandle(item);
        
        // (no bottom label) -- only title on top

        item.addEventListener('mousedown', handleCanvasItemMouseDown);
        item.addEventListener('touchstart', handleCanvasItemMouseDown);
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            selectItem(item);
        });
        
        canvas.appendChild(item);
        updateItemRelativePosition(item);
        updateItemContentScale(item);
        console.log('LOADED item rendered:', {
            title: itemData.title,
            styleWidth: item.style.width,
            styleHeight: item.style.height,
            clientWidth: item.clientWidth,
            clientHeight: item.clientHeight,
            offsetWidth: item.offsetWidth,
            offsetHeight: item.offsetHeight
        });
    });

    slides = Array.isArray(layout.slides)
        ? layout.slides.map(slide => ({
            content: slide.content,
            name: slide.name,
            type: slide.type
        }))
        : [];
    const storedIndex = Number.isFinite(layout.currentSlideIndex)
        ? layout.currentSlideIndex
        : -1;
    currentSlideIndex = slides.length > 0
        ? Math.min(Math.max(storedIndex, 0), slides.length - 1)
        : -1;
    updateSlidesDisplay();
    if (currentSlideIndex >= 0) {
        selectSlide(currentSlideIndex);
    } else {
        renderSlidesEmptyState();
        setSlidesControlsState();
    }
    
    // Restore weekly data
    if (layout.weekly) {
        weeklyData = JSON.parse(JSON.stringify(layout.weekly));
    } else {
        weeklyData = {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
        };
    }
    
    if (typeof layout.highlightCurrentDay === 'boolean') {
        highlightCurrentDay = layout.highlightCurrentDay;
    } else {
        highlightCurrentDay = false;
    }
    
    // Update highlight button if we're in weekly view
    const highlightBtn = document.getElementById('highlightToggleBtn');
    if (highlightBtn) {
        highlightBtn.textContent = '✨ Fremhæv dag: ' + (highlightCurrentDay ? 'Til' : 'Fra');
    }
    
    canvas.classList.add('has-items');
    applyAllItemPositions();
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

function drawImageContain(ctx, img, width, height) {
    const ratio = Math.min(width / img.width, height / img.height);
    const drawWidth = img.width * ratio;
    const drawHeight = img.height * ratio;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;
    ctx.drawImage(img, x, y, drawWidth, drawHeight);
}

function renderSlideToDataUrl(slide, width, height) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = slide.bgColor || '#ffffff';
        ctx.fillRect(0, 0, width, height);

        if (slide.type === 'image') {
            const img = new Image();
            img.onload = () => {
                drawImageContain(ctx, img, width, height);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => {
                resolve(canvas.toDataURL('image/png'));
            };
            img.src = slide.content;
        } else {
            const size = Math.floor(Math.min(width, height) * 0.5);
            ctx.fillStyle = '#000';
            ctx.font = size + 'px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(slide.content, width / 2, height / 2);
            resolve(canvas.toDataURL('image/png'));
        }
    });
}

async function downloadSlidesAsPdf() {
    if (!slides || slides.length === 0) {
        alert('Der er ingen slides at eksportere.');
        return;
    }

    const jspdf = window.jspdf;
    if (!jspdf || !jspdf.jsPDF) {
        alert('PDF-biblioteket er ikke indlæst.');
        return;
    }

    const width = 960;
    const height = 540;
    const pdf = new jspdf.jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [width, height]
    });

    for (let i = 0; i < slides.length; i += 1) {
        const slide = slides[i];
        const dataUrl = await renderSlideToDataUrl(slide, width, height);
        if (i > 0) {
            pdf.addPage([width, height], 'landscape');
        }
        pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
    }

    pdf.save('slides_' + new Date().getTime() + '.pdf');
}

// ===== SLIDES/TEMPLATE FUNCTIONALITY =====

function setView(view) {
    const canvasArea = document.querySelector('.canvas-area');
    const slidesArea = document.getElementById('slidesArea');
    const weeklyArea = document.getElementById('weeklyArea');

    if (view === 'slides') {
        canvasArea.style.display = 'none';
        weeklyArea.style.display = 'none';
        slidesArea.style.display = 'flex';
        setupSlidesListeners();
        updateTemplateSelects('slides');
        return;
    }

    if (view === 'weekly') {
        canvasArea.style.display = 'none';
        slidesArea.style.display = 'none';
        weeklyArea.style.display = 'flex';
        renderWeeklyGrid();
        setupWeeklyListeners();
        updateTemplateSelects('weekly');
        return;
    }

    slidesArea.style.display = 'none';
    weeklyArea.style.display = 'none';
    canvasArea.style.display = 'flex';
    updateTemplateSelects('canvas');
}

// Toggle between Canvas and Slides view
function toggleCanvasView() {
    const slidesArea = document.getElementById('slidesArea');
    const isHidden = slidesArea.style.display === 'none' || slidesArea.style.display === '';
    setView(isHidden ? 'slides' : 'canvas');
}

// Add item to slides
function addToSlides(content, itemName = '', type = 'emoji') {
    const slide = {
        content: content,
        name: itemName,
        type: type
    };
    
    slides.push(slide);
    currentSlideIndex = slides.length - 1;
    updateSlidesDisplay();
    selectSlide(currentSlideIndex);
    
    // Auto-show slides view
    const slidesArea = document.getElementById('slidesArea');
    const canvasArea = document.querySelector('.canvas-area');
    if (slidesArea.style.display === 'none') {
        canvasArea.style.display = 'none';
        slidesArea.style.display = 'flex';
        // Ensure slides listeners are set up
        setupSlidesListeners();
        updateTemplateSelects('slides');
    }
}

// Render slides thumbnails and setup drag-and-drop
function updateSlidesDisplay() {
    const thumbsContainer = document.getElementById('slidesThumbs');
    thumbsContainer.innerHTML = '';
    
    slides.forEach((slide, index) => {
        const thumb = document.createElement('div');
        thumb.className = 'slide-thumb';
        thumb.draggable = true;
        thumb.dataset.index = index;
        
        if (index === currentSlideIndex) {
            thumb.classList.add('active');
        }
        
        // Create content
        const contentEl = document.createElement('div');
        if (slide.type === 'image') {
            const img = document.createElement('img');
            img.src = slide.content;
            contentEl.appendChild(img);
        } else {
            const emoji = document.createElement('div');
            emoji.className = 'emoji';
            emoji.textContent = slide.content;
            contentEl.appendChild(emoji);
        }
        
        thumb.appendChild(contentEl);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'slide-thumb-remove';
        removeBtn.textContent = '-';
        removeBtn.title = 'Fjern slide';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeSlideAt(index);
        });
        thumb.appendChild(removeBtn);
        
        // Click to select
        thumb.addEventListener('click', () => selectSlide(index));
        
        // Drag events for reordering
        thumb.addEventListener('dragstart', (e) => {
            thumb.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('slideIndex', index);
        });
        
        thumb.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            thumb.style.opacity = '0.5';
        });
        
        thumb.addEventListener('dragleave', () => {
            thumb.style.opacity = '1';
        });
        
        thumb.addEventListener('drop', (e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData('slideIndex'));
            const toIndex = index;
            
            if (fromIndex !== toIndex) {
                // Swap slides
                [slides[fromIndex], slides[toIndex]] = [slides[toIndex], slides[fromIndex]];
                if (currentSlideIndex === fromIndex) {
                    currentSlideIndex = toIndex;
                } else if (currentSlideIndex === toIndex) {
                    currentSlideIndex = fromIndex;
                }
                updateSlidesDisplay();
                if (currentSlideIndex >= 0) {
                    selectSlide(currentSlideIndex);
                }
            }
        });
        
        thumb.addEventListener('dragend', () => {
            thumb.classList.remove('dragging');
            thumb.style.opacity = '1';
        });
        
        thumbsContainer.appendChild(thumb);
    });

    setSlidesControlsState();
}

function setSlidesControlsState() {
    const prevBtn = document.getElementById('slidesPrevBtn');
    const nextBtn = document.getElementById('slidesNextBtn');
    const removeBtn = document.getElementById('slidesRemoveBtn');
    const hasSlides = slides.length > 0 && currentSlideIndex >= 0;

    if (prevBtn) prevBtn.disabled = !hasSlides;
    if (nextBtn) nextBtn.disabled = !hasSlides;
    if (removeBtn) removeBtn.disabled = !hasSlides;
}

function renderSlidesEmptyState() {
    const display = document.getElementById('slidesDisplayContent');
    if (!display) return;
    display.innerHTML = '<p style="color: #999; text-align: center; margin-top: 50px;">Ingen slides endnu</p>';
}

// Select slide and show large
function selectSlide(index) {
    if (index < 0 || index >= slides.length) return;
    
    currentSlideIndex = index;
    const slide = slides[index];
    const display =document.getElementById('slidesDisplayContent');
    
    // Update active thumb
    document.querySelectorAll('.slide-thumb').forEach((thumb, i) => {
        if (i === index) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
    
    // Render large display
    display.innerHTML = '';
    if (slide.type === 'image') {
        const img = document.createElement('img');
        img.src = slide.content;
        display.appendChild(img);
    } else {
        const emoji = document.createElement('div');
        emoji.className = 'emoji';
        emoji.textContent = slide.content;
        display.appendChild(emoji);
    }

    setSlidesControlsState();
}

function showPrevSlide() {
    if (slides.length === 0) return;
    if (currentSlideIndex <= 0) {
        selectSlide(slides.length - 1);
    } else {
        selectSlide(currentSlideIndex - 1);
    }
}

function showNextSlide() {
    if (slides.length === 0) return;
    if (currentSlideIndex >= slides.length - 1) {
        selectSlide(0);
    } else {
        selectSlide(currentSlideIndex + 1);
    }
}

function removeSlideAt(index) {
    if (index < 0 || index >= slides.length) return;

    slides.splice(index, 1);

    if (slides.length === 0) {
        currentSlideIndex = -1;
        updateSlidesDisplay();
        renderSlidesEmptyState();
        setSlidesControlsState();
        return;
    }

    if (currentSlideIndex > index) {
        currentSlideIndex -= 1;
    } else if (currentSlideIndex === index) {
        currentSlideIndex = Math.min(index, slides.length - 1);
    }

    updateSlidesDisplay();
    selectSlide(currentSlideIndex);
}

function removeCurrentSlide() {
    if (currentSlideIndex < 0) return;
    removeSlideAt(currentSlideIndex);
}

// Clear all slides
function clearSlides() {
    if (!confirm('Slet alle slides?')) return;
    slides = [];
    currentSlideIndex = -1;
    updateSlidesDisplay();
    renderSlidesEmptyState();
    setSlidesControlsState();
}

// ===== WEEKLY VIEW FUNCTIONALITY =====

let weeklyData = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
};

let highlightCurrentDay = false;
const weeklyDays = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
const weeklyDaysKey = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function getCurrentDayKey() {
    const day = new Date().getDay();
    // JavaScript getDay returns 0 for Sunday, 1 for Monday, etc.
    // We want Monday to be index 0
    const adjustedDay = day === 0 ? 6 : day - 1;
    return weeklyDaysKey[adjustedDay];
}

function toggleWeeklyView() {
    const weeklyArea = document.getElementById('weeklyArea');
    const isHidden = weeklyArea.style.display === 'none' || weeklyArea.style.display === '';
    setView(isHidden ? 'weekly' : 'canvas');
}

function renderWeeklyGrid() {
    const weeklyGrid = document.getElementById('weeklyGrid');
    weeklyGrid.innerHTML = '';
    
    const currentDayKey = getCurrentDayKey();
    
    weeklyDaysKey.forEach((dayKey, index) => {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';
        dayColumn.id = 'day-' + dayKey;
        dayColumn.dataset.day = dayKey;
        
        if (dayKey === currentDayKey && highlightCurrentDay) {
            dayColumn.classList.add('today');
        }
        
        // Day header
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = weeklyDays[index];
        dayColumn.appendChild(dayHeader);
        
        // Items container
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'day-items';
        itemsContainer.dataset.day = dayKey;
        
        // Add existing items
        if (weeklyData[dayKey] && weeklyData[dayKey].length > 0) {
            weeklyData[dayKey].forEach((item, itemIndex) => {
                const dayItem = createDayItem(item, dayKey, itemIndex);
                itemsContainer.appendChild(dayItem);
            });
        }
        
        dayColumn.appendChild(itemsContainer);
        weeklyGrid.appendChild(dayColumn);
    });
}

function createDayItem(item, dayKey, itemIndex) {
    const dayItem = document.createElement('div');
    dayItem.className = 'day-item';
    dayItem.draggable = true;
    dayItem.dataset.day = dayKey;
    dayItem.dataset.index = itemIndex;
    
    // For images, just show the image
    if (item.type === 'image') {
        const img = document.createElement('img');
        img.src = item.content;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        dayItem.appendChild(img);
    } else {
        // For emojis/text items, only show the pictogram
        const emoji = document.createElement('div');
        emoji.className = 'day-item-emoji';
        emoji.textContent = item.content;
        dayItem.appendChild(emoji);
    }

    // Drag out to remove
    dayItem.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('weeklyItem', JSON.stringify({
            fromDay: dayKey,
            index: itemIndex
        }));
    });

    dayItem.addEventListener('dragend', (e) => {
        if (e.dataTransfer.dropEffect === 'none') {
            removeWeeklyItem(dayKey, itemIndex);
        }
    });

    return dayItem;
}

function setupWeeklyListeners() {
    // Drag over day items containers
    document.querySelectorAll('.day-items').forEach(container => {
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            container.classList.add('drag-over');
        });
        
        container.addEventListener('dragleave', (e) => {
            if (e.target === container) {
                container.classList.remove('drag-over');
            }
        });
        
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('drag-over');
            
            const dayKey = container.dataset.day;
            
            const weeklyDataRaw = e.dataTransfer.getData('weeklyItem');
            if (weeklyDataRaw) {
                try {
                    const moved = JSON.parse(weeklyDataRaw);
                    const fromList = weeklyData[moved.fromDay] || [];
                    const movedItem = fromList[moved.index];
                    if (movedItem) {
                        weeklyData[moved.fromDay].splice(moved.index, 1);
                        addToWeeklyDay(dayKey, movedItem);
                        return;
                    }
                } catch (err) {
                    console.log('Could not parse weekly item data');
                }
            }

            // Try to get data from dataTransfer
            const content = e.dataTransfer.getData('text/plain');
            const name = e.dataTransfer.getData('itemName');
            const type = e.dataTransfer.getData('itemType') || 'emoji';
            
            if (content) {
                const item = {
                    content: content,
                    name: name || 'Element',
                    type: type
                };
                addToWeeklyDay(dayKey, item);
            } else {
                // Try JSON format if plain text didn't work
                const jsonData = e.dataTransfer.getData('application/json');
                if (jsonData) {
                    try {
                        const item = JSON.parse(jsonData);
                        addToWeeklyDay(dayKey, item);
                    } catch (err) {
                        console.log('Could not parse drag data');
                    }
                }
            }
        });
    });
}

function addToWeeklyDay(dayKey, item) {
    if (!weeklyData[dayKey]) {
        weeklyData[dayKey] = [];
    }
    
    weeklyData[dayKey].push({
        content: item.content,
        name: item.type === 'image' ? '' : item.name,
        type: item.type
    });
    
    renderWeeklyGrid();
    setupWeeklyListeners();
}

function removeWeeklyItem(dayKey, itemIndex) {
    if (weeklyData[dayKey] && weeklyData[dayKey][itemIndex]) {
        weeklyData[dayKey].splice(itemIndex, 1);
        renderWeeklyGrid();
        setupWeeklyListeners();
    }
}

function toggleDayHighlight() {
    highlightCurrentDay = !highlightCurrentDay;
    const btn = document.getElementById('highlightToggleBtn');
    if (btn) {
        btn.textContent = '✨ Fremhæv dag: ' + (highlightCurrentDay ? 'Til' : 'Fra');
    }
    renderWeeklyGrid();
    setupWeeklyListeners();
}

function clearWeeklyView() {
    if (!confirm('Vil du slette alle elementer fra ugeoversigten?')) return;
    
    weeklyData = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
    };
    
    renderWeeklyGrid();
    setupWeeklyListeners();
}

// Update save/load to include weekly data
const originalSaveLayout = window.saveLayout;
window.saveLayout = function() {
    // Store weekly data in a way that can be serialized
    const dataToSave = {
        ...weeklyData
    };
    
    // Call the original save layout function
    const prevWeekly = weeklyData;
    window.savingWeeklyData = dataToSave;
    originalSaveLayout.call(this);
    window.savingWeeklyData = null;
};

// We'll hook into the actual saveLayout function in the existing code
