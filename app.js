const TYPES = ['Malware', 'Brute Force', 'Network Scan', 'Phishing', 'Unauthorized', 'Bot'];
const BMAP = { Malware: 'bm', 'Brute Force': 'bb', 'Network Scan': 'bs', Phishing: 'bp', Unauthorized: 'bu', Bot: 'bt' };
const SEVS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const SCLS = { CRITICAL: 'sc1', HIGH: 'sc2', MEDIUM: 'sc3', LOW: 'sc4' };
const CTRS = ['CN', 'RU', 'US', 'KR', 'DE', 'BR', 'IR', 'UA', 'IN', 'NL'];
const PAYS = {
  Malware: ['ransomware.exe dropper', 'rootkit injection', 'trojan loader C2', 'worm propagation', 'keylogger install'],
  'Brute Force': ['SSH dict attack', 'RDP password spray', 'FTP login flood', 'Admin panel flood', 'WP-login brute'],
  'Network Scan': ['Nmap SYN scan', 'Masscan full range', 'OS fingerprint probe', 'Vuln probe TCP', 'ICMP sweep'],
  Phishing: ['Fake login portal', 'Credential harvest page', 'OAuth token steal', 'Spear phish email', 'Clone login form'],
  Unauthorized: ['Admin bypass attempt', 'JWT token forge', 'Privilege escalation', 'Config file access', 'API key extraction'],
  Bot: ['Scraper bot flood', 'CAPTCHA bypass', 'Form submit spam', 'HTTP DDoS flood', 'Credential stuffing']
};
const PORTS = [22, 80, 443, 3389, 21, 8080, 25, 3306, 6379, 23, 445, 1433];
const COLORS = [
  'rgba(255,51,102,.8)', 'rgba(255,140,0,.8)', 'rgba(0,245,255,.8)',
  'rgba(255,215,0,.8)', 'rgba(191,95,255,.8)', 'rgba(0,255,136,.8)'
];

const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const rEl = a => a[rnd(0, a.length - 1)];
const rIP = () => `${rnd(1,254)}.${rnd(0,255)}.${rnd(0,255)}.${rnd(1,254)}`;

function genDS(n = 50) {
  const now = Date.now();
  return Array.from({ length: n }, (_, i) => {
    const t = rEl(TYPES);
    return {
      id: `ATK-${String(i + 1).padStart(4, '0')}`,
      ts: new Date(now - rnd(0, 7 * 86400000)),
      type: t, ip: rIP(), country: rEl(CTRS),
      port: rEl(PORTS), sev: rEl(SEVS),
      payload: rEl(PAYS[t]),
      status: Math.random() > .3 ? 'BLOCKED' : 'LOGGED'
    };
  }).sort((a, b) => b.ts - a.ts);
}

let DS = genDS(50), filtered = [...DS], alertsArr = [];

// AUTH
function doLogin() {
  const u = document.getElementById('au').value.trim();
  const p = document.getElementById('ap').value;
  document.getElementById('eu').textContent = '';
  document.getElementById('ep').textContent = '';
  document.getElementById('aerr').textContent = '';
  let ok = true;
  if (!u) { document.getElementById('eu').textContent = '▸ Username required'; ok = false; }
  if (!p) { document.getElementById('ep').textContent = '▸ Password required'; ok = false; }
  if (!ok) return;
  if (u !== 'admin' || p !== 'honey123') {
    document.getElementById('aerr').textContent = '⛔ INVALID CREDENTIALS — ACCESS DENIED';
    document.getElementById('au').classList.add('err');
    document.getElementById('ap').classList.add('err');
    return;
  }
  const o = document.getElementById('auth');
  o.classList.add('fade');
  setTimeout(() => {
    o.style.display = 'none';
    document.getElementById('app').style.display = 'block';
    initApp();
  }, 600);
}

function doLogout() {
  document.getElementById('app').style.display = 'none';
  const o = document.getElementById('auth');
  o.style.display = 'flex';
  o.style.opacity = '1';
  o.classList.remove('fade');
  document.getElementById('au').value = '';
  document.getElementById('ap').value = '';
  document.getElementById('aerr').textContent = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('auth').style.display !== 'none') doLogin();
});

// NAV
function nav(name, el) {
  document.querySelectorAll('.sec').forEach(s => s.classList.remove('on'));
  document.querySelectorAll('.ni').forEach(n => n.classList.remove('on'));
  document.getElementById('s-' + name).classList.add('on');
  el.classList.add('on');
  if (name === 'timeline' && !window.tInit) { initTimeCharts(); window.tInit = true; }
  if (name === 'analytics' && !window.aInit) { initAnalytics(); window.aInit = true; }
  if (name === 'errors' && !window.eInit) { initErrors(); window.eInit = true; }
}

// CLOCK
setInterval(() => {
  const n = new Date();
  document.getElementById('clk').textContent =
    n.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) +
    '  ' + n.toTimeString().slice(0, 8) + ' IST';
}, 1000);

// INIT
function initApp() {
  renderTBars();
  renderIPList();
  renderFeed();
  renderTable(filtered);
  renderAlertList();
  renderAnoms();
  initDashCharts();
  setTimeout(() => showAlert('⚠ CRITICAL: Mass brute force detected from 45.33.32.156', 3000), 2500);
  startLive();
}

// DASH CHARTS
function initDashCharts() {
  const hrs = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}h`);
  const hd = hrs.map(() => rnd(10, 120));
  new Chart(document.getElementById('ch-hourly'), {
    type: 'bar',
    data: {
      labels: hrs,
      datasets: [{
        data: hd,
        backgroundColor: hd.map(v => v > 80 ? 'rgba(255,51,102,.7)' : v > 50 ? 'rgba(255,140,0,.7)' : 'rgba(0,245,255,.5)'),
        borderColor: hd.map(v => v > 80 ? '#ff3366' : v > 50 ? '#ff8c00' : '#00f5ff'),
        borderWidth: 1, borderRadius: 2
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: cTip() },
      scales: { x: cX({ maxTicksLimit: 8, maxRotation: 0 }), y: cY() }
    }
  });
  new Chart(document.getElementById('ch-donut'), {
    type: 'doughnut',
    data: {
      labels: TYPES,
      datasets: [{ data: [483, 671, 592, 284, 443, 374], backgroundColor: COLORS, borderColor: '#020810', borderWidth: 3 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '65%',
      plugins: {
        legend: { position: 'right', labels: { color: '#6a8aaa', font: { family: 'Share Tech Mono', size: 10 }, padding: 10, boxWidth: 12 } },
        tooltip: cTip()
      }
    }
  });
}

const cTip = () => ({ backgroundColor: '#0a1628', titleColor: '#00f5ff', bodyColor: '#e0f0ff', borderColor: '#1a4a7a', borderWidth: 1 });
const cX = (extra = {}) => ({ grid: { color: 'rgba(13,37,64,.5)' }, ticks: { color: '#6a8aaa', font: { family: 'Share Tech Mono', size: 9 }, ...extra } });
const cY = () => ({ grid: { color: 'rgba(13,37,64,.5)' }, ticks: { color: '#6a8aaa', font: { family: 'Share Tech Mono', size: 9 } } });
const cOpts = () => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#6a8aaa', font: { family: 'Share Tech Mono', size: 9 }, boxWidth: 10 } }, tooltip: cTip() },
  scales: { x: cX(), y: cY() }
});

// THREAT BARS
function renderTBars() {
  const d = [
    { n: 'Brute Force', p: 78, c: 'var(--orange)' },
    { n: 'Network Scan', p: 65, c: 'var(--cyan)' },
    { n: 'Malware', p: 54, c: 'var(--red)' },
    { n: 'Bot Attacks', p: 43, c: 'var(--green)' },
    { n: 'Phishing', p: 31, c: 'var(--yellow)' },
    { n: 'Unauth', p: 25, c: 'var(--purple)' }
  ];
  document.getElementById('tbars').innerHTML = d.map(x => `
    <div class="tbar-item">
      <div class="tbar-hdr"><span style="color:${x.c}">${x.n}</span><span style="color:var(--text2)">${x.p}%</span></div>
      <div class="tbar-track"><div class="tbar-fill" style="width:${x.p}%;background:${x.c}"></div></div>
    </div>`).join('');
}

// IP LIST
function renderIPList() {
  const ips = [
    { ip: '45.33.32.156', c: 'RU', n: 147 },
    { ip: '192.241.135.95', c: 'CN', n: 98 },
    { ip: '89.248.167.131', c: 'NL', n: 84 },
    { ip: '185.220.101.34', c: 'DE', n: 71 },
    { ip: '103.94.20.175', c: 'KR', n: 63 },
    { ip: '77.72.82.44', c: 'UA', n: 58 }
  ];
  document.getElementById('iplist').innerHTML = ips.map(x => `
    <div class="ipi">
      <span style="color:var(--cyan)">${x.ip}</span>
      <span style="color:var(--text2)">${x.c}</span>
      <span style="color:var(--orange)">${x.n}</span>
    </div>`).join('');
}

// LIVE FEED
function renderFeed() {
  document.getElementById('livefeed').innerHTML = DS.slice(0, 8).map((d, i) => `
    <div class="tli ${i === 0 ? 'new' : ''}">
      <div class="tlt">${d.ts.toTimeString().slice(0, 8)}</div>
      <div class="tlc">
        <div class="tlh">${d.type} — <span class="${SCLS[d.sev]}">${d.sev}</span></div>
        <div class="tld">${d.ip} → :${d.port}</div>
      </div>
    </div>`).join('');
}

// ATTACK TABLE
function renderTable(data) {
  document.getElementById('atkcnt').textContent = data.length;
  document.getElementById('atktbody').innerHTML = data.map(d => `
    <tr>
      <td style="color:var(--textd)">${d.id}</td>
      <td>${d.ts.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
      <td><span class="bdg ${BMAP[d.type]}">${d.type}</span></td>
      <td style="color:var(--cyan)">${d.ip}</td>
      <td style="color:var(--text2)">${d.country}</td>
      <td style="color:var(--orange)">${d.port}</td>
      <td class="${SCLS[d.sev]}">${d.sev}</td>
      <td style="color:var(--text2);max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${d.payload}">${d.payload}</td>
      <td style="color:${d.status === 'BLOCKED' ? 'var(--green)' : 'var(--yellow)'}">${d.status}</td>
    </tr>`).join('');
}

function filterTbl() {
  const t = document.getElementById('ft').value;
  const s = document.getElementById('fs').value;
  filtered = DS.filter(d => (!t || d.type === t) && (!s || d.sev === s));
  renderTable(filtered);
}

// TIME CHARTS
function initTimeCharts() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  new Chart(document.getElementById('ch-hour'), {
    type: 'line',
    data: {
      labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}h`),
      datasets: [{
        label: 'Attacks',
        data: Array.from({ length: 24 }, () => rnd(5, 150)),
        borderColor: '#00f5ff', backgroundColor: 'rgba(0,245,255,.1)',
        tension: .4, fill: true, pointRadius: 3, pointBackgroundColor: '#00f5ff'
      }]
    },
    options: cOpts()
  });
  new Chart(document.getElementById('ch-day'), {
    type: 'bar',
    data: {
      labels: days,
      datasets: [{ label: 'Total', data: [312, 289, 445, 398, 521, 187, 143], backgroundColor: COLORS, borderRadius: 3 }]
    },
    options: { ...cOpts(), plugins: { legend: { display: false }, tooltip: cTip() } }
  });
  new Chart(document.getElementById('ch-trend'), {
    type: 'line',
    data: {
      labels: days,
      datasets: TYPES.map((t, i) => ({
        label: t,
        data: days.map(() => rnd(10, 80)),
        borderColor: COLORS[i].replace('.8', '1'),
        backgroundColor: 'transparent',
        tension: .3, pointRadius: 2, borderWidth: 1.5
      }))
    },
    options: cOpts()
  });
  new Chart(document.getElementById('ch-vel'), {
    type: 'bar',
    data: {
      labels: Array.from({ length: 60 }, (_, i) => `${i}m`),
      datasets: [{
        data: Array.from({ length: 60 }, () => rnd(0, 25)),
        backgroundColor: 'rgba(255,51,102,.6)', borderColor: '#ff3366',
        borderWidth: 1, borderRadius: 1
      }]
    },
    options: { ...cOpts(), plugins: { legend: { display: false }, tooltip: cTip() } }
  });
}

// ANALYTICS
function initAnalytics() {
  new Chart(document.getElementById('ch-vec'), {
    type: 'radar',
    data: {
      labels: ['Direct', 'Proxy', 'VPN', 'TOR', 'Botnet', 'CDN'],
      datasets: [{
        data: [65, 80, 45, 30, 90, 20],
        backgroundColor: 'rgba(0,245,255,.15)', borderColor: '#00f5ff',
        pointBackgroundColor: '#00f5ff', pointRadius: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          grid: { color: 'rgba(13,37,64,.5)' },
          ticks: { color: '#6a8aaa', backdropColor: 'transparent', font: { size: 9 } },
          pointLabels: { color: '#6a8aaa', font: { family: 'Share Tech Mono', size: 9 } }
        }
      }
    }
  });
  new Chart(document.getElementById('ch-port'), {
    type: 'bar',
    data: {
      labels: ['22', '80', '443', '3389', '21', '8080', '25', '3306'],
      datasets: [{
        data: [284, 198, 167, 145, 98, 87, 43, 38],
        backgroundColor: 'rgba(255,140,0,.7)', borderColor: '#ff8c00',
        borderWidth: 1, borderRadius: 2
      }]
    },
    options: { ...cOpts(), plugins: { legend: { display: false }, tooltip: cTip() } }
  });
  new Chart(document.getElementById('ch-sev'), {
    type: 'doughnut',
    data: {
      labels: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      datasets: [{
        data: [234, 487, 671, 312],
        backgroundColor: ['rgba(255,51,102,.8)', 'rgba(255,140,0,.8)', 'rgba(255,215,0,.7)', 'rgba(0,255,136,.7)'],
        borderColor: '#020810', borderWidth: 2
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: '#6a8aaa', font: { family: 'Share Tech Mono', size: 9 }, boxWidth: 10 } } }
    }
  });
  buildMatrix();
}

function buildMatrix() {
  const lbls = ['Malware', 'Brute', 'Scan', 'Phish', 'Unauth', 'Bot'];
  const m = document.getElementById('cmat');
  m.innerHTML = '';
  m.appendChild(Object.assign(document.createElement('div'), { style: 'padding:4px' }));
  lbls.forEach(l => {
    const e = document.createElement('div');
    e.style.cssText = 'font-family:Share Tech Mono;font-size:8px;color:#6a8aaa;text-align:center;padding:4px;writing-mode:vertical-lr;transform:rotate(180deg);height:70px;display:flex;align-items:center;justify-content:center';
    e.textContent = l;
    m.appendChild(e);
  });
  lbls.forEach(row => {
    const lbl = document.createElement('div');
    lbl.style.cssText = 'font-family:Share Tech Mono;font-size:8px;color:#6a8aaa;display:flex;align-items:center;padding:0 4px;white-space:nowrap';
    lbl.textContent = row;
    m.appendChild(lbl);
    lbls.forEach(col => {
      const v = row === col ? 1.0 : +(Math.random()).toFixed(2);
      const cell = document.createElement('div');
      cell.style.cssText = `background:rgba(0,${Math.round(v*200)},${Math.round(v*180)},${v*.8});border:1px solid rgba(0,245,255,.1);display:flex;align-items:center;justify-content:center;font-family:Share Tech Mono;font-size:9px;color:rgba(255,255,255,.7);cursor:default;transition:transform .15s`;
      cell.textContent = v.toFixed(2);
      cell.title = `${row}↔${col}: ${v.toFixed(2)}`;
      cell.onmouseenter = () => cell.style.transform = 'scale(1.1)';
      cell.onmouseleave = () => cell.style.transform = 'scale(1)';
      m.appendChild(cell);
    });
  });
}

// ERROR CHARTS
function initErrors() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  new Chart(document.getElementById('ch-err'), {
    type: 'line',
    data: {
      labels: days,
      datasets: [
        { label: '401', data: days.map(() => rnd(20, 80)), borderColor: '#ff3366', tension: .4, fill: false, pointRadius: 3 },
        { label: '403', data: days.map(() => rnd(10, 60)), borderColor: '#ff8c00', tension: .4, fill: false, pointRadius: 3 },
        { label: '404', data: days.map(() => rnd(40, 120)), borderColor: '#ffd700', tension: .4, fill: false, pointRadius: 3 },
        { label: '500', data: days.map(() => rnd(2, 20)), borderColor: '#00f5ff', tension: .4, fill: false, pointRadius: 3 },
      ]
    },
    options: cOpts()
  });
}

// ANOMALY TABLE
const ANOMS = [
  { t: '14:32:11', a: 'Auth failure spike', s: .94 },
  { t: '13:18:44', a: 'Port sweep detected', s: .87 },
  { t: '12:05:02', a: 'High payload entropy', s: .82 },
  { t: '11:47:38', a: 'Zero reputation IP', s: .79 },
  { t: '10:23:19', a: 'Geo anomaly detect', s: .73 },
  { t: '09:11:55', a: 'Unusual port combo', s: .67 }
];

function renderAnoms() {
  document.getElementById('anomtb').innerHTML = ANOMS.map(a => `
    <tr>
      <td style="color:var(--text2)">${a.t}</td>
      <td style="color:var(--text1)">${a.a}</td>
      <td><span style="color:${a.s > .85 ? 'var(--red)' : a.s > .7 ? 'var(--orange)' : 'var(--yellow)'}">${a.s.toFixed(2)}</span></td>
      <td style="color:${a.s > .85 ? 'var(--red)' : 'var(--orange)'}">FLAGGED</td>
    </tr>`).join('');
}

// ALERTS DATA
const DALERTS = [
  { type: 'Brute Force', sev: 'critical', ip: '45.33.32.156', desc: 'SSH brute force: 1200 attempts in 60s', t: '14:32' },
  { type: 'Malware', sev: 'critical', ip: '192.241.135.95', desc: 'Ransomware dropper upload detected', t: '13:47' },
  { type: 'Network Scan', sev: 'high', ip: '89.248.167.131', desc: 'Full port range Nmap sweep detected', t: '12:15' },
];

function renderAlertList() {
  alertsArr = [...DALERTS];
  document.getElementById('alist').innerHTML = alertsArr.map((a, i) => aHtml(a, i)).join('');
  document.getElementById('nbalr').textContent = alertsArr.length;
}

function aHtml(a, i) {
  return `<div class="aitem ${a.sev}" id="al${i}">
    <div class="asev">${a.sev.toUpperCase()}</div>
    <div class="abody">
      <div class="attl">${a.type}: ${a.desc}</div>
      <div class="ameta">Source: ${a.ip} | ${a.t}</div>
    </div>
    <button class="btnd" onclick="dimAlert(${i})">DISMISS</button>
  </div>`;
}

function dimAlert(i) {
  const e = document.getElementById('al' + i);
  if (e) {
    e.style.transition = 'opacity .3s';
    e.style.opacity = '0';
    setTimeout(() => e.remove(), 300);
  }
}

function addAlertRand() {
  const a = { type: rEl(TYPES), sev: rEl(['critical', 'high', 'medium']), ip: rIP(), desc: 'Auto-generated alert', t: new Date().toTimeString().slice(0, 5) };
  const idx = alertsArr.push(a) - 1;
  const list = document.getElementById('alist');
  const tmp = document.createElement('div');
  tmp.innerHTML = aHtml(a, idx);
  list.prepend(tmp.firstElementChild);
  document.getElementById('nbalr').textContent = alertsArr.length;
}

function createAlert() {
  const a = {
    type: document.getElementById('altype').value,
    sev: document.getElementById('alsev').value.toLowerCase(),
    ip: document.getElementById('alip').value || rIP(),
    desc: document.getElementById('aldesc').value || 'Custom alert',
    t: new Date().toTimeString().slice(0, 5)
  };
  const idx = alertsArr.push(a) - 1;
  const tmp = document.createElement('div');
  tmp.innerHTML = aHtml(a, idx);
  document.getElementById('alist').prepend(tmp.firstElementChild);
  document.getElementById('nbalr').textContent = alertsArr.length;
  showAlert(`NEW: ${a.type} alert from ${a.ip}`, 0);
}

// ALERT BANNER
function showAlert(msg, delay = 0) {
  setTimeout(() => {
    document.getElementById('atxt').textContent = msg;
    document.getElementById('abar').style.display = 'block';
    setTimeout(closeAlert, 8000);
  }, delay);
}

function closeAlert() {
  const b = document.getElementById('abar');
  b.style.transition = 'opacity .3s';
  b.style.opacity = '0';
  setTimeout(() => { b.style.display = 'none'; b.style.opacity = '1'; }, 300);
}

// SIMULATE
function simAttack() {
  const type = rEl(TYPES), sev = rEl(['CRITICAL', 'HIGH', 'HIGH', 'MEDIUM']);
  const atk = {
    id: `ATK-${String(DS.length + 1).padStart(4, '0')}`,
    ts: new Date(), type, ip: rIP(), country: rEl(CTRS),
    port: rEl(PORTS), sev, payload: rEl(PAYS[type]), status: 'LOGGED'
  };
  DS.unshift(atk);
  filtered = [...DS];
  renderTable(filtered.slice(0, 50));
  renderFeed();
  const tot = +document.getElementById('sv-tot').textContent.replace(',', '') + 1;
  document.getElementById('sv-tot').textContent = tot.toLocaleString();
  const el = document.getElementById('sv-tot');
  el.style.color = 'var(--red)';
  setTimeout(() => el.style.color = 'var(--cyan)', 600);
  showAlert(`${sev}: ${type} from ${atk.ip} on :${atk.port}`, 0);
  document.getElementById('nbatk').textContent = rnd(10, 30);
}

// LIVE SIMULATION
function startLive() {
  setInterval(() => {
    if (Math.random() > .55) {
      const t = rEl(TYPES), s = rEl(SEVS);
      const feed = document.getElementById('livefeed');
      if (!feed) return;
      const el = document.createElement('div');
      el.className = 'tli new';
      el.innerHTML = `
        <div class="tlt">${new Date().toTimeString().slice(0, 8)}</div>
        <div class="tlc">
          <div class="tlh">${t} — <span class="${SCLS[s]}">${s}</span></div>
          <div class="tld">${rIP()} → :${rEl(PORTS)}</div>
        </div>`;
      feed.prepend(el);
      if (feed.children.length > 10) feed.removeChild(feed.lastChild);
    }
  }, 4000);
}

// FORM VALIDATION
const VMAP = {
  id: v => /^INC-\d{4}$/.test(v) ? '' : 'Format: INC-XXXX (e.g. INC-0042)',
  ip: v => /^(\d{1,3}\.){3}\d{1,3}$/.test(v) && v.split('.').every(n => +n <= 255) ? '' : 'Valid IPv4 required',
  port: v => v && +v >= 0 && +v <= 65535 ? '' : 'Port: 0–65535',
  time: v => v ? '' : 'Detection time required',
  payload: v => v && v.length >= 10 ? '' : 'Min 10 characters required',
};

function vf(el, key) {
  const err = VMAP[key] ? VMAP[key](el.value) : '';
  const e = document.getElementById('e' + key.slice(0, 2));
  if (e) e.textContent = err;
  el.classList.toggle('valid', !err && el.value.length > 0);
  el.classList.toggle('invalid', !!err);
  return !err;
}

function submitRep() {
  let ok = true;
  ['fi', 'fip', 'fport', 'ftime', 'fpay'].forEach(id => {
    const el = document.getElementById(id);
    const key = { fi: 'id', fip: 'ip', fport: 'port', ftime: 'time', fpay: 'payload' }[id];
    if (!vf(el, key)) ok = false;
  });
  if (!document.getElementById('ftype').value) {
    document.getElementById('etype').textContent = '▸ Select attack type'; ok = false;
  } else {
    document.getElementById('etype').textContent = '';
  }
  if (!document.getElementById('fsev').value) {
    document.getElementById('esev').textContent = '▸ Select severity'; ok = false;
  } else {
    document.getElementById('esev').textContent = '';
  }
  if (!ok) return;
  const id = document.getElementById('fi').value;
  document.getElementById('sucid').textContent = id;
  const s = document.getElementById('fsuc');
  s.style.display = 'block';
  DS.unshift({
    id,
    ts: new Date(document.getElementById('ftime').value),
    type: document.getElementById('ftype').value,
    ip: document.getElementById('fip').value,
    country: 'XX',
    port: +document.getElementById('fport').value,
    sev: document.getElementById('fsev').value,
    payload: document.getElementById('fpay').value,
    status: 'LOGGED'
  });
  clearForm();
  showAlert(`Incident logged: ${document.getElementById('ftype').value || 'Unknown'} — ID: ${id}`, 500);
  setTimeout(() => s.style.display = 'none', 4000);
}

function clearForm() {
  ['fi', 'fip', 'fport', 'ftime', 'fpay'].forEach(id => {
    const e = document.getElementById(id);
    e.value = '';
    e.classList.remove('valid', 'invalid');
  });
  document.getElementById('ftype').value = '';
  document.getElementById('fsev').value = '';
  ['ei', 'eip', 'eport', 'etime', 'epay', 'etype', 'esev'].forEach(id => document.getElementById(id).textContent = '');
  document.getElementById('fsuc').style.display = 'none';
}
