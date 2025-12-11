// Wait for the deviceready event before using any of Cordova's device APIs.
// If running in a browser (no Cordova), initialise when DOM is ready.

// API Configuration
const API_BASE_URL = 'https://api.spaceflightnewsapi.net/v4';
let allArticles = [];
let tabsInstance = null;

function initMaterialize() {
  console.log('========== INICIALIZANDO APLICACIÓN ==========');
  
  // Inicializar solo sidenav
  try {
    var sidenavEls = document.querySelectorAll('.sidenav');
    M.Sidenav.init(sidenavEls);
    console.log('Sidenav inicializado');
  } catch (e) {
    console.warn('Error inicializando sidenav', e);
  }

  // Vincular enlaces del sidenav a los tabs
  document.querySelectorAll('.sidenav a[href^="#tab"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var target = this.getAttribute('href').replace('#', '');
      activateTab(target);
      // cerrar sidenav
      var sidenav = document.querySelector('.sidenav');
      var sidenavInstance = sidenav && M.Sidenav.getInstance(sidenav);
      if (sidenavInstance) sidenavInstance.close();
      ev.preventDefault();
    });
  });

  // Vincular botón de cargar noticias
  const loadBtn = document.getElementById('loadNewsBtn');
  if (loadBtn) {
    loadBtn.addEventListener('click', loadArticles);
    console.log('Botón de carga vinculado correctamente');
  } else {
    console.error('No se encontró el botón loadNewsBtn');
  }

  // Vincular event listeners de tabs - NUESTRA LÓGICA PERSONALIZADA
  document.querySelectorAll('.tabs a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const tabId = this.getAttribute('href').replace('#', '');
      console.log('Click en tab link:', tabId);
      activateTab(tabId);
    });
  });

  console.log('Mostrando tab inicial (tab1)');
  activateTab('tab1');
}

// Función para activar un tab manualmente - LÓGICA PERSONALIZADA SIN MATERIALIZE
function activateTab(tabId) {
  console.log('🔄 Activando tab:', tabId);
  
  // Obtener todos los tabs
  const allTabs = document.querySelectorAll('.tab-pane');
  const allTabLinks = document.querySelectorAll('.tabs a');
  
  console.log('Total tabs encontrados:', allTabs.length);
  console.log('Total links encontrados:', allTabLinks.length);
  
  // PASO 1: Ocultar todos los tabs (remover la clase active)
  allTabs.forEach(tab => {
    if (tab.classList.contains('active')) {
      console.log('Ocultando:', tab.id);
      tab.classList.remove('active');
    }
  });
  
  // PASO 2: Desmarcar todos los links
  allTabLinks.forEach(link => {
    if (link.classList.contains('active')) {
      link.classList.remove('active');
    }
  });
  
  // PASO 3: Mostrar el tab solicitado
  const targetTab = document.getElementById(tabId);
  if (targetTab) {
    console.log('✅ Mostrando tab:', tabId);
    targetTab.classList.add('active');
  } else {
    console.error('❌ Tab no encontrado:', tabId);
    return;
  }
  
  // PASO 4: Marcar el link correspondiente como activo
  const targetLink = document.querySelector(`.tabs a[href="#${tabId}"]`);
  if (targetLink) {
    console.log('✅ Link marcado como activo');
    targetLink.classList.add('active');
  } else {
    console.error('❌ Link no encontrado para:', tabId);
  }
  
  // PASO 5: Scroll al top del contenido nuevo
  setTimeout(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  }, 50);
  
  console.log('✅ Tab activado completamente:', tabId);
}

// ==================== API Functions ====================

async function loadArticles() {
  try {
    const btn = document.getElementById('loadNewsBtn');
    console.log('Iniciando carga de artículos...');
    
    btn.disabled = true;
    btn.innerHTML = '<i class="material-icons left">hourglass_empty</i>Cargando...';

    console.log('Haciendo fetch a:', `${API_BASE_URL}/articles/?limit=20`);
    const response = await fetch(`${API_BASE_URL}/articles/?limit=20`);
    
    console.log('Respuesta recibida:', response.status);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Datos recibidos:', data);
    
    allArticles = data.results || [];
    console.log('Artículos cargados:', allArticles.length);

    if (allArticles.length > 0) {
      // Mostrar noticias en Tab1 (lista)
      displayArticlesList(allArticles);
      
      // Mostrar noticias en Tab3 (grid)
      displayArticlesGrid(allArticles);
    } else {
      alert('No se encontraron noticias.');
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="material-icons left">cloud_download</i>Cargar Noticias';

  } catch (error) {
    console.error('Error cargando noticias:', error);
    alert('Error al cargar las noticias:\n' + error.message);
    const btn = document.getElementById('loadNewsBtn');
    btn.disabled = false;
    btn.innerHTML = '<i class="material-icons left">cloud_download</i>Cargar Noticias';
  }
}

// Mostrar lista de noticias en Tab1 (Collection)
function displayArticlesList(articles) {
  const newsCollection = document.getElementById('newsCollection');
  newsCollection.innerHTML = '';

  articles.forEach(article => {
    const li = document.createElement('li');
    li.className = 'collection-item';
    li.setAttribute('data-title', article.title.toLowerCase());
    li.innerHTML = `
      <a href="#" class="news-link" data-id="${article.id}" style="color: #1976d2; cursor: pointer;">
        ${article.title}
      </a>
    `;
    newsCollection.appendChild(li);

    // Añadir event listener
    li.querySelector('.news-link').addEventListener('click', function(e) {
      e.preventDefault();
      const articleId = this.getAttribute('data-id');
      // Cambiar al Tab2 PRIMERO para que esté visible
      activateTab('tab2');
      // LUEGO cargar y mostrar el contenido
      displayArticleDetail(articleId);
    });
  });

  // Inicializar o actualizar el buscador
  setupSearchNews();
}

// Mostrar detalle de una noticia en Tab2
function displayArticleDetail(articleId) {
  console.log('📄 displayArticleDetail - Buscando artículo ID:', articleId);
  
  const article = allArticles.find(a => a.id == articleId);
  
  if (!article) {
    console.error('❌ Artículo no encontrado con ID:', articleId);
    document.getElementById('newsDetail').innerHTML = '<p>Noticia no encontrada.</p>';
    return;
  }

  console.log('✅ Artículo encontrado:', article.title);

  const detailHTML = `
    <div class="card">
      <div class="card-image">
        ${article.image_url ? `<img src="${article.image_url}" alt="${article.title}" style="max-height: 300px; object-fit: cover;">` : '<p class="grey-text">Sin imagen</p>'}
      </div>
      <div class="card-content">
        <span class="card-title"><strong>${article.title}</strong></span>
        <p><strong>Fuente:</strong> ${article.news_site || 'Desconocida'}</p>
        <p><strong>Fecha:</strong> ${new Date(article.published_at).toLocaleDateString('es-ES')}</p>
        <hr>
        <p>${article.summary || 'Sin resumen disponible.'}</p>
        <hr>
        <a href="${article.url}" target="_blank" class="waves-effect waves-light btn blue darken-1">
          <i class="material-icons left">open_in_new</i>Leer Noticia Original
        </a>
      </div>
    </div>
  `;

  const newsDetailDiv = document.getElementById('newsDetail');
  if (newsDetailDiv) {
    newsDetailDiv.innerHTML = detailHTML;
    console.log('✅ Contenido renderizado en newsDetail');
  } else {
    console.error('❌ No se encontró elemento newsDetail');
  }
}

// Mostrar noticias en grid (Tab3) con Cards
function displayArticlesGrid(articles) {
  const newsGrid = document.getElementById('newsGrid');
  newsGrid.innerHTML = '';

  articles.forEach(article => {
    const colDiv = document.createElement('div');
    colDiv.className = 'col s12 m6 l4';
    
    const cardHTML = `
      <div class="card">
        <div class="card-image">
          ${article.image_url ? `<img src="${article.image_url}" alt="${article.title}" style="height: 200px; object-fit: cover;">` : '<div style="height: 200px; background: #e0e0e0; display: flex; align-items: center;"><p class="grey-text">Sin imagen</p></div>'}
          <span class="card-title" style="background: rgba(0,0,0,0.6);">${article.title.substring(0, 30)}...</span>
        </div>
        <div class="card-content">
          <p><small><strong>${article.news_site || 'Desconocida'}</strong></small></p>
          <p><small>${new Date(article.published_at).toLocaleDateString('es-ES')}</small></p>
          <p class="grey-text">${article.summary ? article.summary.substring(0, 100) + '...' : 'Sin resumen'}</p>
        </div>
        <div class="card-action">
          <a href="#" class="news-detail-link" data-id="${article.id}" style="color: #1976d2;">Ver Detalles</a>
          <a href="${article.url}" target="_blank" style="color: #2196f3;">Original</a>
        </div>
      </div>
    `;
    
    colDiv.innerHTML = cardHTML;
    newsGrid.appendChild(colDiv);

    // Event listener para ver detalles
    colDiv.querySelector('.news-detail-link').addEventListener('click', function(e) {
      e.preventDefault();
      const articleId = this.getAttribute('data-id');
      // Cambiar al Tab2 PRIMERO para que esté visible
      activateTab('tab2');
      // LUEGO cargar y mostrar el contenido
      displayArticleDetail(articleId);
      activateTab('tab2');
    });
  });
}

// Función para buscar noticias
function setupSearchNews() {
  const searchInput = document.getElementById('searchNews');
  
  if (!searchInput) return;
  
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const items = document.querySelectorAll('.collection-item');
    let visibleCount = 0;
    
    items.forEach(item => {
      const title = item.getAttribute('data-title') || '';
      
      if (title.includes(searchTerm)) {
        item.classList.remove('hidden');
        item.style.display = '';
        visibleCount++;
      } else {
        item.classList.add('hidden');
        item.style.display = 'none';
      }
    });
    
    console.log('Búsqueda:', searchTerm, '- Resultados:', visibleCount);
  });
}

function onDeviceReady() {
  console.log('Running cordova-' + (window.cordova && cordova.platformId) + '@' + (window.cordova && cordova.version));
  initMaterialize();
}

// Cordova deviceready
if (window.cordova) {
  document.addEventListener('deviceready', onDeviceReady, false);
} else {
  // Fallback para navegador: inicializar cuando DOM cargue
  document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM cargado (navegador). Inicializando Materialize.');
    initMaterialize();
  });
}
