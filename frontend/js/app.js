// This is app.js File

// ── API Configuration ─────────────────────────────────
const API_BASE = 'http://localhost:5000/api';

async function api(path, options = {}) {
  const token = localStorage.getItem('hostel_token');
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function getUser()  { return JSON.parse(localStorage.getItem('hostel_user') || 'null'); }
function getToken() { return localStorage.getItem('hostel_token'); }
function setAuth(token, user) {
  localStorage.setItem('hostel_token', token);
  localStorage.setItem('hostel_user', JSON.stringify(user));
}
function clearAuth() {
  localStorage.removeItem('hostel_token');
  localStorage.removeItem('hostel_user');
}
function requireAuth(allowedRoles) {
  const user = getUser();
  if (!user || !getToken()) { window.location.href = '../index.html'; return null; }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    window.location.href = `../${user.role}.html`;
    return null;
  }
  return user;
}

const STATUS_COLORS = {
  paid:'#68d391', due:'#fc8181', partial:'#f6c35a',
  resolved:'#68d391', 'in progress':'#63b3ed', pending:'#f6c35a', escalated:'#fc8181',
  critical:'#fc8181', high:'#f6c35a', medium:'#63b3ed', low:'#94a3b8',
  available:'#68d391', occupied:'#63b3ed', maintenance:'#f6c35a',
  completed:'#68d391', inside:'#4fd1c5', denied:'#fc8181',
  normal:'#63b3ed', urgent:'#fc8181',
};
function statusColor(s) { return STATUS_COLORS[s?.toLowerCase()] || '#94a3b8'; }
function badge(label, color) {
  const c = color || statusColor(label);
  return `<span class="badge" style="background:${c}22;color:${c};">${label}</span>`;
}
function chip(label) { return `<span class="chip">${label}</span>`; }
function avatar(initials, color, size = 32) {
  return `<div class="avatar" style="width:${size}px;height:${size}px;background:${color}33;border:1.5px solid ${color}55;font-size:${size*.34}px;color:${color};">${initials}</div>`;
}

const ICONS = {
  home:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  users:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  bed:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`,
  alert:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  dollar:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  bell:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  eye:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  check:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  chart:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  search:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  menu:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  logout:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  plus:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  shield:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  building:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="22" x2="9" y2="12"/><line x1="15" y1="22" x2="15" y2="12"/><rect x="9" y="7" width="6" height="5"/></svg>`,
  user:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  edit:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  pin:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"/></svg>`,
  download:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  x:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  trend_up:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  trend_dn:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`,
  chevron_right:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
};
function icon(name, size=16, color='currentColor') {
  return `<div style="width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;color:${color};">${ICONS[name]||''}</div>`;
}

function toast(message, type = 'success') {
  const el = document.createElement('div');
  const color = type === 'success' ? '#68d391' : type === 'error' ? '#fc8181' : '#f6c35a';
  el.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;padding:12px 20px;border-radius:12px;background:rgba(8,18,42,0.95);border:1px solid ${color}44;color:${color};font-size:13px;font-weight:600;font-family:'Outfit',sans-serif;box-shadow:0 8px 32px rgba(0,0,0,.4);animation:fadeUp .3s ease;backdrop-filter:blur(12px);`;
  el.textContent = (type === 'success' ? '✓ ' : type === 'error' ? '✗ ' : '⚠ ') + message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PK', { day:'numeric', month:'short', year:'numeric' });
}
function formatTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('en-PK', { hour:'2-digit', minute:'2-digit' });
}
function formatCurrency(n) { return 'Rs ' + Number(n).toLocaleString('en-PK'); }
function initials(name) { return name?.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() || 'U'; }

function logout() {
  clearAuth();
  window.location.href = '../index.html';
}

// ── NOTIFICATION SYSTEM (Real — Announcements se) ─────
let _notifData = [];

let _pageUserId = null; // Page load pe lock hoga — dusra tab change nahi kar sakta

function _getNotifKey() {
  return 'hostel_notif_' + (_pageUserId || 'guest');
}
function getReadNotifs() {
  return JSON.parse(localStorage.getItem(_getNotifKey()) || '[]');
}
function markNotifRead(id) {
  const key  = _getNotifKey();
  const read = JSON.parse(localStorage.getItem(key) || '[]');
  if (!read.includes(id)) {
    read.push(id);
    localStorage.setItem(key, JSON.stringify(read));
  }
  updateNotifDot();
}
function markAllRead() {
  const key    = _getNotifKey();
  const allIds = _notifData.map(n => n._id || n.id);
  localStorage.setItem(key, JSON.stringify(allIds));
  updateNotifDot();
  renderNotifPanel();
}
function getUnreadCount() {
  const read = getReadNotifs();
  return _notifData.filter(n => !read.includes(n._id || n.id)).length;
}
function updateSidebarBadge() {
  const count   = getUnreadCount();
  const navItem = document.querySelector(
    '#sidebar-nav [data-key="announcements"], #sidebar-nav [data-key="notices"]'
  );
  if (!navItem) return;
  let badge = navItem.querySelector('.sidebar-notif-badge');
  if (count > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className  = 'sidebar-notif-badge';
      badge.style.cssText = `margin-left:auto;min-width:18px;height:18px;padding:0 5px;
        border-radius:20px;background:#fc8181;font-size:10px;font-weight:700;color:#fff;
        display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;
        box-shadow:0 0 8px rgba(252,129,129,.5);`;
      navItem.appendChild(badge);
    }
    badge.textContent = count > 9 ? '9+' : String(count);
  } else {
    if (badge) badge.remove();
  }
}

function updateNotifDot() {
  const dot = document.querySelector('.notif-dot');
  if (!dot) return;
  const count = getUnreadCount();
  if (count > 0) {
    dot.style.display = 'flex';
    dot.textContent   = count > 9 ? '9+' : String(count);
  } else {
    dot.style.display = 'none';
    dot.textContent   = '';
  }
  updateSidebarBadge();
  if (document.getElementById('notif-panel')?.classList.contains('open')) {
    renderNotifPanel();
  }
}
async function loadNotifications() {
  try {
    const r = await api('/announcements');
    const priColor = { urgent:'#fc8181', high:'#f6c35a', normal:'#63b3ed' };
    _notifData = (r.data || []).map(a => ({
      ...a,
      id:      a._id,
      title:   a.title,
      body:    (a.content||'').substring(0, 65) + ((a.content||'').length > 65 ? '…' : ''),
      color:   priColor[a.priority] || '#63b3ed',
      section: 'announcements',
      time:    a.createdAt,
    }));
  } catch { _notifData = []; }
  updateNotifDot();
  if (document.getElementById('notif-panel')?.classList.contains('open')) {
    renderNotifPanel();
  }
}

function renderNotifPanel() {
  const read = getReadNotifs();
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  const unread   = _notifData.filter(n => !read.includes(n._id || n.id));
  const readList = _notifData.filter(n =>  read.includes(n._id || n.id));

  panel.innerHTML = `
    <div style="padding:14px 16px;border-bottom:1px solid var(--divider);display:flex;justify-content:space-between;align-items:center;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:13px;font-weight:700;color:var(--text);">Notifications</span>
        ${unread.length > 0 ? `<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;background:#fc818122;color:#fc8181;">${unread.length} new</span>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        ${unread.length > 0 ? `<span onclick="markAllRead();renderNotifPanel();" style="font-size:11px;color:var(--blue);cursor:pointer;font-weight:600;">Mark all read</span>` : ''}
        <div style="cursor:pointer;" onclick="document.getElementById('notif-panel').classList.remove('open')">${icon('x',16,'var(--text-sec)')}</div>
      </div>
    </div>

    ${unread.length === 0 && readList.length === 0 ? `
      <div style="padding:30px;text-align:center;">
        <div style="font-size:32px;margin-bottom:8px;">🔔</div>
        <div style="font-size:13px;color:var(--text-muted);">No notifications</div>
      </div>` : ''}

    ${unread.length > 0 ? `
      <div style="padding:8px 14px 4px;font-size:10px;font-weight:700;color:var(--text-muted);letter-spacing:.5px;text-transform:uppercase;">New</div>
      ${unread.map(n => `
        <div class="notif-item" onclick="handleNotifClick('${n.section}','${n._id||n.id}')"
          style="cursor:pointer;background:${n.color}08;border-left:2px solid ${n.color};">
          <div class="notif-dot-item" style="background:${n.color};"></div>
          <div style="flex:1;">
            <div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:2px;">${n.title}</div>
            <div style="font-size:11px;color:var(--text-sec);">${n.body}</div>
            <div style="display:flex;justify-content:space-between;margin-top:3px;">
              <span style="font-size:10px;color:var(--text-muted);">Tap to view →</span>
              <span style="font-size:10px;color:var(--text-muted);">${n.time ? formatDate(n.time) : ''}</span>
            </div>
          </div>
        </div>`).join('')}
    ` : ''}

    ${readList.length > 0 ? `
      <div style="padding:8px 14px 4px;font-size:10px;font-weight:700;color:var(--text-muted);letter-spacing:.5px;text-transform:uppercase;">Earlier</div>
      ${readList.map(n => `
        <div class="notif-item" onclick="handleNotifClick('${n.section}','${n._id||n.id}')"
          style="cursor:pointer;opacity:0.6;">
          <div class="notif-dot-item" style="background:var(--divider);"></div>
          <div style="flex:1;">
            <div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:2px;">${n.title}</div>
            <div style="font-size:11px;color:var(--text-sec);">${n.body}</div>
          </div>
          <div style="font-size:10px;color:var(--text-muted);">✓ Read</div>
        </div>`).join('')}
    ` : ''}
  `;
}

// ── Sidebar setup ─────────────────────────────────────
function setupSidebar(user, navItems, activePage) {
  const sidebar = document.getElementById('sidebar');
  const roleColor = { admin:'#7f9cf5', warden:'#4fd1c5', student:'#f687b3' }[user.role];
  const roleIcon  = { admin:'shield', warden:'building', student:'user' }[user.role];

  document.getElementById('sidebar-logo').innerHTML = `
    <div class="sidebar-logo">
      <div class="logo-icon">${icon('building',18,'#fff')}</div>
      <div class="logo-text">
        <div class="logo-title">SmartHostel</div>
        <div class="logo-sub">ERP Platform</div>
      </div>
    </div>
    <div class="role-badge" style="background:${roleColor}18;border:1px solid ${roleColor}33;">
      ${icon(roleIcon, 14, roleColor)}
      <div>
        <div style="font-size:11px;font-weight:700;color:${roleColor};text-transform:uppercase;letter-spacing:.5px;">${user.role}</div>
        <div style="font-size:11px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:130px;">${user.name}</div>
      </div>
    </div>
  `;

  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = navItems.map(item => `
    <a href="${item.href}" class="nav-item ${activePage === item.key ? 'active' : ''}" style="${activePage===item.key?`color:var(--text);`:''}">
      <div style="width:17px;height:17px;flex-shrink:0;color:${activePage===item.key?roleColor:'var(--text-sec)'};">${ICONS[item.icon]||''}</div>
      <span class="nav-label">${item.label}</span>
      ${activePage === item.key ? '<div class="nav-dot"></div>' : ''}
    </a>
  `).join('');

  document.getElementById('sidebar-bottom').innerHTML = `
    <div class="collapse-btn" id="collapse-btn" title="Toggle sidebar">
      ${icon('menu', 17, 'var(--text-sec)')}
      <span class="nav-label" style="font-size:12px;">Collapse</span>
    </div>
    <div class="nav-item" onclick="logout()" style="margin-top:6px;cursor:pointer;
      background:rgba(252,129,129,0.1);border:1px solid rgba(252,129,129,0.25);">
      <div style="width:17px;height:17px;flex-shrink:0;color:#fc8181;">${ICONS['logout']}</div>
      <span class="nav-label" style="color:#fc8181;font-weight:600;">Sign Out</span>
    </div>
  `;

  document.getElementById('collapse-btn').addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });
}

// ── Topbar setup ──────────────────────────────────────
function setupTopbar(user, pageTitle) {
  _pageUserId = user.email || String(user._id || user.id || 'guest');
  const roleColor = { admin:'#7f9cf5', warden:'#4fd1c5', student:'#f687b3' }[user.role];
  const av = initials(user.name);

  document.getElementById('topbar').innerHTML = `
    <div class="topbar-title">
      <h2>${pageTitle}</h2>
      <p>${new Date().toLocaleDateString('en-PK',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
    </div>

    <div class="search-wrap" style="position:relative;">
      <div style="position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none;">${icon('search',14,'var(--text-muted)')}</div>
      <input class="search-input" placeholder="Search..." id="global-search" autocomplete="off"/>
    </div>

    
    <div class="icon-btn" id="notif-btn" onclick="toggleNotifPanel()" style="position:relative;">
      ${icon('bell',16,'var(--text-sec)')}
      <div class="notif-dot" style="position:absolute;top:-5px;right:-5px;min-width:16px;height:16px;padding:0 4px;border-radius:20px;background:#fc8181;border:2px solid var(--sidebar);font-size:9px;display:none;align-items:center;justify-content:center;font-weight:700;color:#fff;line-height:1;"></div>
    </div>

    <div class="user-avatar" style="background:${roleColor}33;border:1.5px solid ${roleColor}55;color:${roleColor};font-size:13px;font-weight:700;cursor:pointer;" title="${user.name}">${av}</div>

    <div id="user-dropdown" style="display:none;position:absolute;top:58px;right:16px;
      background:var(--sidebar);border:1px solid var(--card-border);border-radius:14px;
      min-width:200px;z-index:300;box-shadow:0 12px 40px rgba(0,0,0,.4);overflow:hidden;">
      <div style="padding:14px 16px;border-bottom:1px solid var(--divider);">
        <div style="font-size:13px;font-weight:700;color:var(--text);">${user.name}</div>
        <div style="font-size:11px;color:var(--text-muted);">${user.email||''}</div>
        <span class="badge" style="margin-top:6px;display:inline-block;background:${roleColor}22;color:${roleColor};">${user.role}</span>
      </div>
      <div onclick="logout()" style="padding:12px 16px;display:flex;align-items:center;gap:10px;cursor:pointer;transition:background .15s;"
        onmouseenter="this.style.background='rgba(252,129,129,0.1)'"
        onmouseleave="this.style.background='transparent'">
        <div style="width:16px;height:16px;color:#fc8181;">${ICONS['logout']}</div>
        <span style="font-size:13px;font-weight:600;color:#fc8181;">Sign Out</span>
      </div>
    </div>
  `;

  // Avatar dropdown
  document.querySelector('.user-avatar').addEventListener('click', () => {
    const dd = document.getElementById('user-dropdown');
    dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
  });

   // Notif panel render
  loadColorTheme();
  initColorThemePicker();
  loadNotifications();

  // Search init
  setTimeout(() => initSearch(), 500);
}

// ── Toggle Notif Panel ────────────────────────────────
function toggleNotifPanel() {
  const panel = document.getElementById('notif-panel');
  const isOpen = panel.classList.contains('open');
  if (isOpen) {
    panel.classList.remove('open');
  } else {
    panel.classList.add('open');
    renderNotifPanel(); // Refresh when opened
  }
}

// ── Close dropdowns on outside click ─────────────────
document.addEventListener('click', (e) => {
  const panel = document.getElementById('notif-panel');
  if (panel && !panel.contains(e.target) && !e.target.closest('#notif-btn')) {
    panel.classList.remove('open');
  }
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown && !e.target.closest('.user-avatar') && !e.target.closest('#user-dropdown')) {
    dropdown.style.display = 'none';
  }
  const searchBox = document.getElementById('search-results');
  if (searchBox && !e.target.closest('.search-wrap') && !e.target.closest('#search-results')) {
    searchBox.style.display = 'none';
  }
});

// ── SEARCH FUNCTIONALITY ──────────────────────────────
function initSearch() {
  const searchInput = document.getElementById('global-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', function() {
    const query = this.value.trim().toLowerCase();

    let resultsBox = document.getElementById('search-results');
    if (!resultsBox) {
      resultsBox = document.createElement('div');
      resultsBox.id = 'search-results';
      resultsBox.style.cssText = `position:absolute;top:62px;right:80px;width:320px;background:var(--sidebar);border:1px solid var(--card-border);border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.5);z-index:500;max-height:380px;overflow-y:auto;display:none;`;
      document.getElementById('topbar').appendChild(resultsBox);
    }

    if (!query || query.length < 2) { resultsBox.style.display = 'none'; return; }

    const results = [];
    const activeSection = document.querySelector('.page-section.active') || document.body;

    activeSection.querySelectorAll('#my-complaints > div, #complaints-full-tbody tr, #complaints-dash > div').forEach(el => {
      const text = (el.textContent || '').toLowerCase();
      if (text.includes(query)) {
        const clean = el.textContent.split('\n').map(l=>l.trim()).filter(Boolean)[0] || '';
        if (clean.length > 2) results.push({ type:'Complaint', icon:'⚠️', text:clean.substring(0,60), color:'#f6c35a', action:()=>{ if(typeof showSection==='function') showSection('complaints'); } });
      }
    });

    activeSection.querySelectorAll('#ann-dash > div, #ann-full > div, #announcements-list > div').forEach(el => {
      const text = (el.textContent || '').toLowerCase();
      if (text.includes(query)) {
        const lines = el.textContent.split('\n').map(l=>l.trim()).filter(Boolean);
        const title = lines.find(l=>l.length>5&&l.length<60)||lines[0]||'';
        if (title.length > 2) results.push({ type:'Announcement', icon:'📢', text:title.substring(0,60), color:'#63b3ed', action:()=>{ if(typeof showSection==='function') showSection('announcements'); } });
      }
    });

    activeSection.querySelectorAll('#room-details-dash > div, #room-details-full > div').forEach(el => {
      const text = (el.textContent || '').toLowerCase();
      if (text.includes(query)) results.push({ type:'Room Info', icon:'🛏️', text:el.textContent.trim().substring(0,60), color:'#4fd1c5', action:()=>{ if(typeof showSection==='function') showSection('room'); } });
    });

    activeSection.querySelectorAll('#fee-tbody tr, #fee-details-dash > div').forEach(el => {
      const text = (el.textContent || '').toLowerCase();
      if (text.includes(query)) {
        const clean = el.textContent.split('\n').map(l=>l.trim()).filter(Boolean)[0]||'';
        if (clean.length > 2) results.push({ type:'Fee Record', icon:'💰', text:clean.substring(0,60), color:'#68d391', action:()=>{ if(typeof showSection==='function') showSection('fees'); } });
      }
    });

    activeSection.querySelectorAll('#att-log > div').forEach(el => {
      const text = (el.textContent || '').toLowerCase();
      if (text.includes(query)) results.push({ type:'Attendance', icon:'📅', text:el.textContent.trim().substring(0,60), color:'#b794f4', action:()=>{ if(typeof showSection==='function') showSection('attendance'); } });
    });

    activeSection.querySelectorAll('tbody tr').forEach(el => {
      const text = (el.textContent || '').toLowerCase();
      if (text.includes(query)) {
        const clean = el.textContent.split('\n').map(l=>l.trim()).filter(Boolean)[0]||'';
        if (clean.length>2 && !results.find(r=>r.text.includes(clean.substring(0,20)))) {
          results.push({ type:'Record', icon:'📋', text:clean.substring(0,60), color:'#b794f4', action:null });
        }
      }
    });

    const unique = results.filter((r,i,arr)=>arr.findIndex(x=>x.text===r.text)===i).slice(0,8);
    resultsBox.style.display = 'block';

    if (unique.length === 0) {
      resultsBox.innerHTML = `<div style="padding:24px;text-align:center;"><div style="font-size:28px;margin-bottom:8px;">🔍</div><div style="font-size:13px;color:var(--text-muted);">No results for</div><div style="font-size:13px;font-weight:700;color:var(--text);">"${query}"</div></div>`;
      return;
    }

    resultsBox.innerHTML = `
      <div style="padding:10px 14px;border-bottom:1px solid var(--divider);font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:.5px;">
        ${unique.length} RESULT${unique.length>1?'S':''} FOR "${query.toUpperCase()}"
      </div>
      ${unique.map((r,i)=>`
        <div data-idx="${i}" style="padding:12px 14px;border-bottom:1px solid var(--divider);cursor:${r.action?'pointer':'default'};display:flex;align-items:flex-start;gap:10px;transition:background .12s;"
          onmouseenter="this.style.background='var(--hover)'"
          onmouseleave="this.style.background='transparent'"
          onclick="handleSearchClick(${i})">
          <span style="font-size:18px;flex-shrink:0;margin-top:1px;">${r.icon}</span>
          <div style="min-width:0;flex:1;">
            <div style="font-size:10px;font-weight:700;color:${r.color};margin-bottom:3px;text-transform:uppercase;letter-spacing:.4px;">${r.type}</div>
            <div style="font-size:12px;color:var(--text);line-height:1.5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.text}</div>
            ${r.action?'<div style="font-size:10px;color:var(--text-muted);margin-top:2px;">Click to go there →</div>':''}
          </div>
        </div>`).join('')}
    `;
    window._searchResults = unique;
  });

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const box = document.getElementById('search-results');
      if (box) box.style.display = 'none';
      searchInput.value = '';
    }
  });
}

function handleSearchClick(idx) {
  const result = (window._searchResults||[])[idx];
  if (!result) return;
  const box = document.getElementById('search-results');
  if (box) box.style.display = 'none';
  const input = document.getElementById('global-search');
  if (input) input.value = '';
  if (result.action) result.action();
}

// ── Notification Click Handler ────────────────────────
function handleNotifClick(section, notifId) {
  // Notification read mark karo
  if (notifId) markNotifRead(notifId);

  // Panel band karo
  document.getElementById('notif-panel').classList.remove('open');

  // Student page
  if (typeof showSection === 'function') {
    showSection(section);
    return;
  }

  // Admin/Warden pages
  const pageMap = {
    fees:          'fees.html',
    complaints:    'complaints.html',
    visitors:      'visitors.html',
    announcements: 'announcements.html',
    rooms:         'rooms.html',
    students:      'students.html',
    attendance:    'attendance.html',
    dashboard:     'admin.html',
  };
  const page = pageMap[section];
  if (page) window.location.href = page;
}

// ── MULTI COLOR THEMES ─────────────────────────────────
const COLOR_THEMES = [
  { name: 'Dark',   class: '',        icon: '🌙', color: '#63b3ed' },
  { name: 'Light',  class: 'light',   icon: '☀️', color: '#f6c35a' },
  { name: 'Ocean',  class: 'theme-ocean', icon: '🌊', color: '#3b82f6' },
  { name: 'Sunset', class: 'theme-sunset', icon: '🌅', color: '#f97316' },
  { name: 'Forest', class: 'theme-forest', icon: '🌲', color: '#48bb78' },
];

function setColorTheme(themeName) {
  const theme = COLOR_THEMES.find(t => t.name === themeName);
  if (!theme) return;
  // Remove all theme classes
  document.body.classList.remove('light', 'theme-ocean', 'theme-sunset', 'theme-forest');
  if (theme.class) document.body.classList.add(theme.class);
  localStorage.setItem('hostel_color_theme', themeName);
  // Update the theme button icon
  const themeBtnIcon = document.getElementById('color-theme-icon');
  if (themeBtnIcon) themeBtnIcon.textContent = theme.icon;
}

function loadColorTheme() {
  const saved = localStorage.getItem('hostel_color_theme');
  if (saved && COLOR_THEMES.some(t => t.name === saved)) {
    setColorTheme(saved);
  } else {
    setColorTheme('Dark');
  }
}

// Add theme selector dropdown to topbar
function initColorThemePicker() {
  const container = document.createElement('div');
  container.style.position = 'relative';
  container.innerHTML = `
    <div class="icon-btn" id="color-theme-btn" style="cursor:pointer;">
      <span id="color-theme-icon">🌙</span>
    </div>
    <div id="color-theme-menu" style="display:none; position:absolute; top:50px; right:0; background:var(--sidebar); border:1px solid var(--card-border); border-radius:14px; padding:8px; min-width:140px; z-index:300; box-shadow:0 12px 28px rgba(0,0,0,0.3);">
      ${COLOR_THEMES.map(theme => `
        <div data-theme="${theme.name}" style="padding:8px 12px; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:10px; transition:background 0.1s;"
          onmouseenter="this.style.background='var(--hover)'" onmouseleave="this.style.background='transparent'"
          onclick="setColorTheme('${theme.name}'); document.getElementById('color-theme-menu').style.display='none';">
          <span style="font-size:16px;">${theme.icon}</span>
          <span style="font-size:12px; font-weight:500; color:var(--text);">${theme.name}</span>
          <span style="width:8px; height:8px; border-radius:50%; background:${theme.color}; margin-left:auto;"></span>
        </div>
      `).join('')}
    </div>
  `;
  const topbar = document.getElementById('topbar');
  const notifBtn = document.getElementById('notif-btn');
  if (notifBtn && topbar) {
    topbar.insertBefore(container, notifBtn);
  } else if (topbar) {
    topbar.appendChild(container);
  }

  document.getElementById('color-theme-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = document.getElementById('color-theme-menu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  });

  document.addEventListener('click', (e) => {
    const menu = document.getElementById('color-theme-menu');
    if (menu && !menu.contains(e.target) && !e.target.closest('#color-theme-btn')) {
      menu.style.display = 'none';
    }
  });
}