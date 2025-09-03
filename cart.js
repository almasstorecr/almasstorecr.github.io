// Funcionalidad del Carrito de Compras para Almas Store
class ShoppingCart {
    // Constructor de la clase ShoppingCart
    // Inicializa las propiedades del carrito y llama al método init
    constructor() {
        this.cart = []; // Array que almacena los productos en el carrito
        this.cartIcon = null; // Referencia al ícono del carrito en la barra de navegación
        this.cartSidebar = null; // Referencia al panel lateral del carrito
        this.cartCount = 0; // Contador total de productos en el carrito
        this.init(); // Llama al método de inicialización
    }

    // Método de inicialización que configura el carrito
    // Carga datos del almacenamiento, crea elementos UI y vincula eventos
    init() {
        this.loadCartFromStorage(); // Carga el carrito desde localStorage
        this.createCartIcon(); // Crea el ícono del carrito en la barra de navegación
        this.createCartSidebar(); // Crea el panel lateral del carrito
        this.updateCartDisplay(); // Actualiza la visualización del carrito
        this.bindEvents(); // Vincula los eventos de interacción
    }

    // Cargar carrito desde localStorage
    // Recupera los datos guardados del carrito al cargar la página
    loadCartFromStorage() {
        const savedCart = localStorage.getItem('almasCart'); // Obtiene los datos guardados
        if (savedCart) {
            this.cart = JSON.parse(savedCart); // Convierte de JSON a array
            this.updateCartCount(); // Actualiza el contador de productos
        }
    }

    // Guardar carrito en localStorage
    // Almacena los datos del carrito para persistencia entre sesiones
    saveCartToStorage() {
        localStorage.setItem('almasCart', JSON.stringify(this.cart)); // Convierte a JSON y guarda
    }

    // Crear ícono del carrito para la barra de navegación
    // Agrega un botón con ícono de carrito y contador de productos
    createCartIcon() {
        const navbar = document.querySelector('.navbar .container'); // Busca el contenedor de la navbar
        if (!navbar) return; // Si no encuentra la navbar, sale de la función

        const cartIconHTML = `
            <div class="cart-icon-container">
                <button class="cart-icon-btn" id="cartIcon">
                    <i class="bi bi-cart3"></i>
                    <span class="cart-count" id="cartCount">0</span>
                </button>
            </div>
        `;

        navbar.insertAdjacentHTML('beforeend', cartIconHTML); // Inserta el HTML al final del navbar
        this.cartIcon = document.getElementById('cartIcon'); // Guarda referencia al ícono
    }

    // Crear panel lateral del carrito
    // Genera el HTML para el sidebar del carrito con header, items y footer
    createCartSidebar() {
        const cartSidebarHTML = `
            <div class="cart-sidebar" id="cartSidebar">
                <div class="cart-header">
                    <h3>Carrito de Compras</h3>
                    <button class="cart-close" id="cartClose">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                <div class="cart-items" id="cartItems">
                    <div class="empty-cart">
                        <i class="bi bi-cart3"></i>
                        <p>Tu carrito está vacío</p>
                        <small>Agrega productos para continuar</small>
                    </div>
                </div>
                <div class="cart-footer" id="cartFooter" style="display: none;">
                    <div class="cart-total">
                        <span>Total:</span>
                        <span class="total-amount" id="cartTotal">₡0</span>
                    </div>
                    <div class="cart-shipping-info">
                        <small><i class="bi bi-truck me-1"></i>Envío con costo adicional según ubicación</small>
                    </div>
                    <div class="cart-payment-info">
                        <small><i class="bi bi-credit-card me-1"></i>Pago por SINPE</small>
                    </div>
                    <button class="btn btn-primary w-100" id="checkoutBtn">
                        <i class="bi bi-whatsapp me-2"></i>Finalizar Compra
                    </button>
                </div>
            </div>
            <div class="cart-overlay" id="cartOverlay"></div>
        `;

        document.body.insertAdjacentHTML('beforeend', cartSidebarHTML); // Inserta al final del body
        this.cartSidebar = document.getElementById('cartSidebar'); // Guarda referencia al sidebar
    }

    // Vincular eventos de escucha
    // Configura todos los event listeners para la interacción del usuario
    bindEvents() {
        // Click en el ícono del carrito
        if (this.cartIcon) {
            this.cartIcon.addEventListener('click', () => this.toggleCart()); // Alterna el sidebar
        }

        // Botón de cerrar carrito
        const cartClose = document.getElementById('cartClose');
        if (cartClose) {
            cartClose.addEventListener('click', () => this.closeCart()); // Cierra el sidebar
        }

        // Click en el overlay
        const cartOverlay = document.getElementById('cartOverlay');
        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => this.closeCart()); // Cierra al hacer click fuera
        }

        // Botón de finalizar compra
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout()); // Inicia el proceso de compra
        }

        // Botones de agregar al carrito (evento delegado)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) {
                e.preventDefault(); // Previene comportamiento por defecto
                const button = e.target.classList.contains('add-to-cart-btn') ? e.target : e.target.closest('.add-to-cart-btn');
                this.addToCart(button); // Llama al método para agregar producto
            }
        });

        // Botones de remover item (evento delegado)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
                e.preventDefault(); // Previene comportamiento por defecto
                const button = e.target.classList.contains('remove-item') ? e.target : e.target.closest('.remove-item');
                const itemId = button.dataset.itemId; // Obtiene el ID del item
                this.removeFromCart(itemId); // Remueve el producto del carrito
            }
        });

        // Cambio de cantidad (evento delegado)
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('cart-item-quantity')) {
                const itemId = e.target.dataset.itemId; // Obtiene el ID del item
                const newQuantity = parseInt(e.target.value); // Convierte a número
                this.updateQuantity(itemId, newQuantity); // Actualiza la cantidad
            }
        });

        // Cambio de comentario (evento delegado)
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('cart-item-comment-input')) {
                const itemId = e.target.dataset.itemId; // Obtiene el ID del item
                const comment = e.target.value; // Obtiene el comentario
                this.addComment(itemId, comment); // Actualiza el comentario
            }
        });

        // Cambio de archivo de foto (evento delegado)
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('cart-item-photo-input')) {
                const itemId = e.target.dataset.itemId; // Obtiene el ID del item
                const files = e.target.files; // Obtiene los archivos seleccionados
                if (files && files.length > 0) {
                    Array.from(files).forEach(file => {
                        this.addPhoto(itemId, file); // Agrega cada foto
                    });
                    e.target.value = ''; // Limpia el input para permitir seleccionar la misma imagen nuevamente
                }
            }
        });

        // Botón de remover foto (evento delegado)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-photo-btn') || e.target.closest('.remove-photo-btn')) {
                e.preventDefault(); // Previene comportamiento por defecto
                const button = e.target.classList.contains('remove-photo-btn') ? e.target : e.target.closest('.remove-photo-btn');
                const itemId = button.dataset.itemId; // Obtiene el ID del item
                const photoIndex = parseInt(button.dataset.photoIndex); // Obtiene el índice de la foto
                this.removePhoto(itemId, photoIndex); // Remueve la foto
            }
        });
    }

    // Agregar producto al carrito
    // Extrae la información del producto desde la tarjeta y la agrega al carrito
    addToCart(button) {
        const productCard = button.closest('.product-card-modern') || button.closest('.card-modern'); // Busca la tarjeta del producto
        if (!productCard) return; // Si no encuentra la tarjeta, sale

        const productData = {
            id: Date.now().toString(), // Generación simple de ID único
            title: productCard.querySelector('.product-title, .card-title-modern')?.textContent || 'Producto', // Título del producto
            brand: productCard.querySelector('.product-brand, .card-text-modern')?.textContent || '', // Marca del producto
            price: this.parsePrice(productCard.querySelector('.product-price, .card-price-modern')?.textContent || '₡0'), // Precio parseado
            image: productCard.querySelector('img')?.src || '', // URL de la imagen
            quantity: 1, // Cantidad inicial
            comments: '', // Comentarios del cliente para este producto
            photos: [] // Array de fotos adjuntas (base64)
        };

        // Verificar si el producto ya existe en el carrito
        const existingItem = this.cart.find(item => item.title === productData.title && item.brand === productData.brand);
        if (existingItem) {
            existingItem.quantity += 1; // Incrementa la cantidad si ya existe
        } else {
            this.cart.push(productData); // Agrega el nuevo producto
        }

        this.saveCartToStorage(); // Guarda en localStorage
        this.updateCartDisplay(); // Actualiza la visualización
        this.showAddedNotification(productData.title); // Muestra notificación

        // Animar ícono del carrito
        this.animateCartIcon();
    }

    // Remover producto del carrito
    // Elimina un producto específico del carrito por su ID
    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId); // Filtra el array removiendo el item
        this.saveCartToStorage(); // Guarda cambios
        this.updateCartDisplay(); // Actualiza visualización
    }

    // Actualizar cantidad de producto
    // Modifica la cantidad de un producto específico en el carrito
    updateQuantity(itemId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(itemId); // Si cantidad es 0 o menos, remueve el producto
            return;
        }

        const item = this.cart.find(item => item.id === itemId); // Busca el producto por ID
        if (item) {
            item.quantity = newQuantity; // Actualiza la cantidad
            this.saveCartToStorage(); // Guarda cambios
            this.updateCartDisplay(); // Actualiza visualización
        }
    }

    // Parsear precio desde cadena de texto (ej. "₡6.300" -> 6300)
    // Convierte una cadena de precio con formato costarricense a número
    parsePrice(priceString) {
        const match = priceString.match(/₡([\d,.]+)/); // Busca el patrón de precio
        if (match) {
            return parseFloat(match[1].replace(/[,.]/g, '')) || 0; // Remueve separadores y convierte
        }
        return 0; // Retorna 0 si no hay coincidencia
    }

    // Formatear precio para mostrar
    // Convierte un número a formato de precio costarricense
    formatPrice(price) {
        return `₡${price.toLocaleString('es-CR')}`; // Formatea con separadores locales
    }

    // Actualizar contador del carrito
    // Calcula y muestra el total de productos en el badge del ícono
    updateCartCount() {
        this.cartCount = this.cart.reduce((total, item) => total + item.quantity, 0); // Suma todas las cantidades
        const cartCountElement = document.getElementById('cartCount'); // Obtiene el elemento del contador
        if (cartCountElement) {
            cartCountElement.textContent = this.cartCount; // Actualiza el texto
            cartCountElement.style.display = this.cartCount > 0 ? 'block' : 'none'; // Muestra/oculta según cantidad
        }
    }

    // Actualizar visualización del carrito
    // Renderiza todos los productos en el sidebar y calcula el total
    updateCartDisplay() {
        this.updateCartCount(); // Actualiza el contador primero

        const cartItems = document.getElementById('cartItems'); // Contenedor de items
        const cartFooter = document.getElementById('cartFooter'); // Footer del carrito
        const cartTotal = document.getElementById('cartTotal'); // Elemento del total

        if (!cartItems) return; // Si no encuentra el contenedor, sale

        if (this.cart.length === 0) { // Si el carrito está vacío
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="bi bi-cart3"></i>
                    <p>Tu carrito está vacío</p>
                    <small>Agrega productos para continuar</small>
                </div>
            `;
            if (cartFooter) cartFooter.style.display = 'none'; // Oculta el footer
            return;
        }

        let itemsHTML = ''; // HTML acumulado de los items
        let total = 0; // Total acumulado

        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity; // Total por item
            total += itemTotal; // Suma al total general

            // Generar HTML para fotos adjuntas
            let photosHTML = '';
            if (item.photos && item.photos.length > 0) {
                photosHTML = '<div class="cart-item-photos">';
                item.photos.forEach((photo, index) => {
                    photosHTML += `
                        <div class="cart-photo-container">
                            <img src="${photo}" alt="Foto adjunta ${index + 1}" class="cart-photo-thumbnail" />
                            <button class="remove-photo-btn" data-item-id="${item.id}" data-photo-index="${index}" title="Eliminar foto">
                                <i class="bi bi-x-circle"></i>
                            </button>
                        </div>
                    `;
                });
                photosHTML += '</div>';
            }

            // Generar HTML para comentario
            let commentHTML = '';
            if (item.comments && item.comments.trim() !== '') {
                commentHTML = `
                    <div class="cart-item-comment">
                        <strong>Comentario:</strong>
                        <p>${item.comments}</p>
                    </div>
                `;
            }

            itemsHTML += `
                <div class="cart-item" data-item-id="${item.id}">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.title}" onerror="this.src='imgs/logo.jpg'">
                    </div>
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.title}</h4>
                        <p class="cart-item-brand">${item.brand}</p>
                        <div class="cart-item-price">${this.formatPrice(item.price)}</div>
                        ${commentHTML}
                        ${photosHTML}
                        <div class="cart-item-controls">
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                                <input type="number" class="cart-item-quantity" data-item-id="${item.id}" value="${item.quantity}" min="1">
                                <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                            </div>
                            <button class="remove-item" data-item-id="${item.id}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
<div class="cart-item-extra">
    <textarea class="cart-item-comment-input" data-item-id="${item.id}" placeholder="Agregar comentario...">${item.comments || ''}</textarea>
    <label class="custom-file-upload" for="photo-upload-${item.id}">
        Agregar archivos
    </label>
    <input type="file" id="photo-upload-${item.id}" accept="image/*" class="cart-item-photo-input" data-item-id="${item.id}" multiple style="display:none;" />
</div>
                    </div>
                </div>
            `;
        });

        cartItems.innerHTML = itemsHTML; // Inserta el HTML de los items
        if (cartTotal) cartTotal.textContent = this.formatPrice(total); // Actualiza el total
        if (cartFooter) cartFooter.style.display = 'block'; // Muestra el footer
    }

    // Alternar panel lateral del carrito
    // Muestra/oculta el sidebar del carrito y el overlay
    toggleCart() {
        if (this.cartSidebar) {
            this.cartSidebar.classList.toggle('active'); // Alterna clase 'active' en sidebar
            document.getElementById('cartOverlay').classList.toggle('active'); // Alterna overlay
            document.body.classList.toggle('cart-open'); // Previene scroll del body
        }
    }

    // Cerrar panel lateral del carrito
    // Oculta el sidebar del carrito y el overlay
    closeCart() {
        if (this.cartSidebar) {
            this.cartSidebar.classList.remove('active'); // Remueve clase 'active' del sidebar
            document.getElementById('cartOverlay').classList.remove('active'); // Remueve overlay
            document.body.classList.remove('cart-open'); // Restaura scroll del body
        }
    }

    // Mostrar notificación de producto agregado
    // Crea y muestra una notificación temporal cuando se agrega un producto
    showAddedNotification(productName) {
        const notification = document.createElement('div'); // Crea el elemento de notificación
        notification.className = 'cart-notification'; // Asigna clase CSS
        notification.innerHTML = `
            <i class="bi bi-check-circle"></i>
            <span>${productName} agregado al carrito</span>
        `; // Contenido de la notificación

        document.body.appendChild(notification); // Agrega al DOM

        setTimeout(() => {
            notification.classList.add('show'); // Muestra la notificación con animación
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show'); // Oculta la notificación
            setTimeout(() => {
                document.body.removeChild(notification); // Remueve del DOM
            }, 300);
        }, 3000); // Duración de 3 segundos
    }

    // Animar ícono del carrito
    // Agrega una animación de rebote al ícono del carrito
    animateCartIcon() {
        if (this.cartIcon) {
            this.cartIcon.classList.add('bounce'); // Agrega clase de animación
            setTimeout(() => {
                this.cartIcon.classList.remove('bounce'); // Remueve clase después de 600ms
            }, 600);
        }
    }

    // Agregar comentario a un producto del carrito
    // Permite al cliente agregar instrucciones específicas para un producto
    addComment(itemId, comment) {
        const item = this.cart.find(item => item.id === itemId); // Busca el producto por ID
        if (item) {
            item.comments = comment.trim(); // Actualiza el comentario
            this.saveCartToStorage(); // Guarda cambios
            this.updateCartDisplay(); // Actualiza visualización
        }
    }

    // Agregar foto a un producto del carrito
    // Convierte la imagen a base64 y la almacena en el array de fotos
    addPhoto(itemId, file) {
        const item = this.cart.find(item => item.id === itemId); // Busca el producto por ID
        if (!item || !file) return; // Si no encuentra el item o archivo, sale

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona un archivo de imagen válido.');
            return;
        }

        // Validar tamaño del archivo (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen es demasiado grande. Máximo 5MB permitido.');
            return;
        }

        const reader = new FileReader(); // Crea un FileReader para convertir a base64
        reader.onload = (e) => {
            const base64Image = e.target.result; // Obtiene la imagen en base64
            item.photos.push(base64Image); // Agrega la foto al array
            this.saveCartToStorage(); // Guarda cambios
            this.updateCartDisplay(); // Actualiza visualización
        };
        reader.readAsDataURL(file); // Lee el archivo como URL de datos
    }

    // Remover foto de un producto del carrito
    // Elimina una foto específica del array de fotos
    removePhoto(itemId, photoIndex) {
        const item = this.cart.find(item => item.id === itemId); // Busca el producto por ID
        if (item && item.photos && item.photos[photoIndex]) {
            item.photos.splice(photoIndex, 1); // Remueve la foto del array
            this.saveCartToStorage(); // Guarda cambios
            this.updateCartDisplay(); // Actualiza visualización
        }
    }

    // Proceso de finalizar compra
    // Genera un mensaje para WhatsApp con los productos y abre la aplicación
    checkout() {
        if (this.cart.length === 0) return; // Si el carrito está vacío, sale

        let message = 'Hola! Me gustaría comprar los siguientes productos:\n\n'; // Mensaje inicial
        let total = 0; // Total acumulado

        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity; // Calcula total por item
            total += itemTotal; // Suma al total general
            message += `• ${item.title} (${item.brand}) - Cantidad: ${item.quantity} - ${this.formatPrice(itemTotal)}\n`; // Agrega item al mensaje
        });

        message += `\nTotal: ${this.formatPrice(total)}\n\n`; // Agrega total al mensaje
        message += '💳 *Método de pago:* SINPE\n\n'; // Agrega información de pago
        message += '🚚 *Métodos de envío disponibles:*\n'; // Agrega información de envío
        message += '• Uber Flash (entrega rápida)\n';
        message += '• Correos (envío nacional con seguimiento)\n';
        message += '• Entrega personal en Heredia (envía ubicación para verificar)\n';
        message += '• Retiro en tienda (sin costo adicional)\n\n';
        message += '¿Podrían ayudarme con el proceso de compra y coordinar el envío?'; // Mensaje final

        const whatsappUrl = `https://wa.me/50671073953?text=${encodeURIComponent(message)}`; // URL de WhatsApp
        window.open(whatsappUrl, '_blank'); // Abre WhatsApp en nueva pestaña

        // Limpiar carrito después del checkout
        this.cart = []; // Vacía el array del carrito
        this.saveCartToStorage(); // Guarda cambios en localStorage
        this.updateCartDisplay(); // Actualiza la visualización
        this.closeCart(); // Cierra el sidebar
    }
}

// Inicializar carrito cuando el DOM esté cargado
// Crea una instancia global del carrito de compras
let cart; // Variable global para la instancia del carrito
document.addEventListener('DOMContentLoaded', () => {
    cart = new ShoppingCart(); // Crea nueva instancia del carrito
});

// Hacer el carrito disponible globalmente
// Permite acceder al carrito desde cualquier parte del código
window.cart = cart;
