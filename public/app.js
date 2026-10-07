const docEntries = [
  { label: 'AIRL Docs', path: 'Documentation/Home.md' },
  { label: 'HPC Cluster', path: 'Documentation/HPC Cluster.md' },
  { label: 'Getting Started Tutorial', path: 'Documentation/Getting Started.md' },
  { label: 'Logging in with SSH via Terminal', path: 'Documentation/Accessing HPC Cluster/Login SSH.md' },
  { label: 'Logging in with web portal', path: 'Documentation/Accessing HPC Cluster/Login Web Portal.md' },
  { label: 'SSH Key Setup', path: 'Documentation/Accessing HPC Cluster/SSH Key Setup.md' },
  { label: 'VS Code Remote SSH', path: 'Documentation/Accessing HPC Cluster/VSCode Remote SSH.md' },
  { label: 'Filesystem and File Transfer', path: 'Documentation/File Transfer.md' },
  { label: 'Running Jobs', path: 'Documentation/Running Jobs.md' },
  { label: 'Slurm Job Recipes', path: 'Documentation/Slurm Jobs.md' },
  { label: 'Publication Acknowledgment', path: 'Documentation/Acknowledgement.md' },
  { label: 'Acceptable Use and Code of Conduct', path: 'Documentation/Code of Conduct.md' },
  { label: 'Getting Help', path: 'Documentation/Getting Help.md' },
  { label: 'Frequently Asked Questions (FAQs)', path: 'Documentation/FAQ.md' }
];

const pageDocs = {
  about: 'About AIRL.md',
  collaborations: 'Collaborations.md',
  resources: 'Resources.md',
  regulations: 'Regulations.md'
};

const docsBase = new URL('../docs/', window.location.href);
const publicBase = new URL('./', document.currentScript.src);
let activeDocPath = '';

function resolveDocsUrl(relativePath) {
  return new URL(relativePath, docsBase).href;
}

async function loadLayoutPartial(fileName, containerId) {
  const response = await fetch(new URL(fileName, publicBase));
  if (!response.ok) throw new Error(`Unable to load ${fileName}: ${response.status}`);
  document.getElementById(containerId).innerHTML = await response.text();
}

async function loadLayout() {
  await Promise.all([
    loadLayoutPartial('header.html', 'site-header'),
    loadLayoutPartial('footer.html', 'site-footer')
  ]);
}

function highlightCurrentNav() {
  const pathname = window.location.pathname;
  const linkMap = {
    '/public/index.html': 'home',
    '/index.html': 'home',
    '/public/about.html': 'about',
    '/about.html': 'about',
    '/public/collaborations.html': 'collaborations',
    '/collaborations.html': 'collaborations',
    '/public/documentation.html': 'documentation',
    '/documentation.html': 'documentation',
    '/public/resources.html': 'resources',
    '/resources.html': 'resources',
    '/public/regulations.html': 'regulations',
    '/regulations.html': 'regulations'
  };

  const currentKey = linkMap[pathname] || document.body.dataset.page || 'home';
  document.querySelectorAll('.nav-link').forEach((link) => {
    const isActive = link.dataset.page === currentKey;
    link.classList.toggle('active', isActive);
  });
}

function rewriteMarkdownUrls(rootNode, sourceUrl) {
  rootNode.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');
    if (!src || /^https?:\/\//i.test(src) || src.startsWith('data:') || src.startsWith('#')) return;
    img.setAttribute('src', new URL(src, sourceUrl).href);
  });

  rootNode.querySelectorAll('a').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || /^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;
    const targetUrl = new URL(href, sourceUrl);
    const docsPath = new URL(docsBase).pathname;
    if (targetUrl.origin === docsBase.origin && targetUrl.pathname.startsWith(docsPath) && targetUrl.pathname.toLowerCase().endsWith('.md')) {
      const docPath = decodeURIComponent(targetUrl.pathname.slice(docsPath.length));
      const pageUrl = new URL('documentation.html', publicBase);
      pageUrl.searchParams.set('doc', docPath);
      pageUrl.hash = targetUrl.hash;
      link.setAttribute('href', pageUrl.href);
      return;
    }
    link.setAttribute('href', targetUrl.href);
  });
}

function setPageContent(html, sourceUrl) {
  const section = document.getElementById('page-content') || document.getElementById('doc-content');
  if (!section) return;

  const article = document.createElement('article');
  article.className = 'markdown-body';
  article.innerHTML = DOMPurify.sanitize(html);
  rewriteMarkdownUrls(article, sourceUrl);

  section.innerHTML = '';
  section.appendChild(article);
}

function loadMarkdown(filePath, targetContainer = 'page-content') {
  const sourceUrl = resolveDocsUrl(filePath);
  return fetch(sourceUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`Markdown request failed: ${response.status}`);
      return response.text();
    })
    .then((text) => {
      const html = marked.parse(text);
      const target = document.getElementById(targetContainer);
      if (!target) return;
      setPageContent(html, sourceUrl);
      return sourceUrl;
    })
    .catch((error) => {
      console.error(error);
      const container = document.getElementById(targetContainer);
      if (container) {
        container.innerHTML = '<p>Unable to load the requested documentation.</p>';
      }
    });
}

function buildDocSidebar() {
  const sidebar = document.getElementById('doc-sidebar-list');
  const content = document.getElementById('doc-content');
  if (!sidebar || !content) return;

  const searchInput = document.getElementById('doc-search');

  const renderItems = (items) => {
    sidebar.innerHTML = '';
    items.forEach((entry) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'doc-item';
      button.textContent = entry.label;
      button.dataset.path = entry.path;
      button.classList.toggle('active', entry.path === activeDocPath);
      button.addEventListener('click', () => {
        openDoc(entry.path, true);
      });
      sidebar.appendChild(button);
    });
  };

  renderItems(docEntries);

  searchInput.addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase();
    const filtered = query
      ? docEntries.filter((entry) => entry.label.toLowerCase().includes(query))
      : docEntries;
    renderItems(filtered);
  });

  const requestedPath = new URLSearchParams(window.location.search).get('doc') || 'Documentation/Home.md';
  if (!docEntries.some((entry) => entry.path === requestedPath)) {
    content.innerHTML = '<p>Unable to load the requested documentation.</p>';
    console.error(new Error(`Unknown documentation page: ${requestedPath}`));
    return;
  }
  openDoc(requestedPath);
  window.addEventListener('popstate', () => {
    const path = new URLSearchParams(window.location.search).get('doc') || 'Documentation/Home.md';
    if (docEntries.some((entry) => entry.path === path)) {
      openDoc(path);
    } else {
      content.innerHTML = '<p>Unable to load the requested documentation.</p>';
      console.error(new Error(`Unknown documentation page: ${path}`));
    }
  });
}

function openDoc(path, updateHistory = false) {
  activeDocPath = path;
  document.querySelectorAll('.doc-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.path === path);
  });
  if (updateHistory) {
    const pageUrl = new URL('documentation.html', publicBase);
    pageUrl.searchParams.set('doc', path);
    window.history.pushState(null, '', pageUrl);
  }
  loadMarkdown(path, 'doc-content');
}

function renderStaticPage(fileName, title) {
  const content = document.getElementById('page-content');
  if (!content) return;

  const sourceUrl = resolveDocsUrl(fileName);
  fetch(sourceUrl)
    .then((response) => {
      if (!response.ok) throw new Error('Unable to load markdown content');
      return response.text();
    })
    .then((text) => {
      const html = marked.parse(text);
      setPageContent(html, sourceUrl);
      document.title = `${title} | AIRL`;
    })
    .catch((error) => {
      console.error(error);
      content.innerHTML = '<p>Unable to load the requested page. Please try again later.</p>';
    });
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadLayout();
  } catch (error) {
    console.error(error);
    return;
  }

  highlightCurrentNav();

  const page = document.body.dataset.page;

  if (page === 'documentation') {
    buildDocSidebar();
  } else if (page === 'about' || page === 'collaborations' || page === 'resources' || page === 'regulations') {
    const labels = {
      about: 'About AIRL',
      collaborations: 'Collaborations',
      resources: 'Resources',
      regulations: 'AIRL Governance'
    };
    renderStaticPage(pageDocs[page], labels[page]);
  }

  if (page === 'home') {
    document.title = 'AIRL | Home';
  }
});
