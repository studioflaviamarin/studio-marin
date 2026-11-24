import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

let db = window.supabaseClient || createClient('https://snelqloaemyrjwysenvk.supabase.co', 'sb_publishable_CDoU_YvY27xZWg9wTzWkdw_a4kXAyou');
let dbProducts = [];
const escDb = value => String(value || '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const moneyDb = value => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const bottleDb = () => '<div class="mini-bottle">SUTIDO</div>';

function renderDatabaseProducts() {
  const grid = document.querySelector('#productGrid');
  if (!grid) return;
  grid.innerHTML = dbProducts.map(product => `<article class="product-card"><div class="product-image">${product.image ? `<img src="${escDb(product.image)}" alt="${escDb(product.name)}">` : bottleDb()}${product.promo ? '<span class="sale-tag">PROMOÇÃO</span>' : ''}<button class="quick-add" data-db-add="${product.id}">Adicionar ao carrinho +</button></div><div class="product-info"><span class="category">${escDb(product.category)}</span><h3>${escDb(product.name)}</h3><p>${escDb(product.description)}</p><div class="price-row"><strong>${moneyDb(product.price)}</strong>${product.old_price ? `<span class="old-price">${moneyDb(product.old_price)}</span>` : ''}</div></div></article>`).join('');
  const empty = document.querySelector('#emptyState');
  if (empty) empty.hidden = dbProducts.length > 0;
  grid.querySelectorAll('[data-db-add]').forEach(button => button.onclick = () => {
    const product = dbProducts.find(item => item.id === button.dataset.dbAdd);
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem('sutido_flavia_marin_cart') || '[]');
    cart.push({ ...product, oldPrice: product.old_price });
    localStorage.setItem('sutido_flavia_marin_cart', JSON.stringify(cart));
    if (window.showToast) window.showToast(`${product.name} adicionado ao carrinho`);
    setTimeout(() => window.location.reload(), 120);
  });
}

async function loadDatabaseProducts() {
  const { data, error } = await db.from('products').select('*').eq('active', true).order('created_at', { ascending: false });
  if (!error) { dbProducts = data || []; renderDatabaseProducts(); }
}

function renderDatabaseAdmin() {
  const list = document.querySelector('#adminProducts');
  const count = document.querySelector('#adminCount');
  if (!list) return;
  if (count) count.textContent = `${dbProducts.length} itens no banco`;
  list.innerHTML = dbProducts.map(product => `<div class="admin-product"><div class="admin-product-thumb">${bottleDb()}</div><div><h5>${escDb(product.name)}</h5><p>${moneyDb(product.price)} · ${escDb(product.category)}</p></div><div class="admin-product-actions"><button data-db-edit="${product.id}">editar</button><button data-db-delete="${product.id}">excluir</button></div></div>`).join('');
  list.querySelectorAll('[data-db-edit]').forEach(button => button.onclick = () => {
    const product = dbProducts.find(item => item.id === button.dataset.dbEdit);
    document.querySelector('#productId').value = product.id; document.querySelector('#productName').value = product.name; document.querySelector('#productCategory').value = product.category; document.querySelector('#productPrice').value = product.price; document.querySelector('#productImage').value = product.image || ''; document.querySelector('#productDescription').value = product.description || ''; document.querySelector('#productPromo').checked = Boolean(product.promo);
  });
  list.querySelectorAll('[data-db-delete]').forEach(button => button.onclick = async () => {
    if (!confirm('Excluir este perfume do banco?')) return;
    const { error } = await db.from('products').delete().eq('id', button.dataset.dbDelete);
    if (error) { alert('Não foi possível excluir o perfume.'); return; }
    await loadDatabaseProducts(); renderDatabaseAdmin();
  });
}

function bindDatabaseForm() {
  const form = document.querySelector('#productForm');
  if (!form || form.dataset.databaseBound) return;
  form.dataset.databaseBound = 'true';
  form.onsubmit = async event => {
    event.preventDefault();
    const id = document.querySelector('#productId').value;
    const product = { name: document.querySelector('#productName').value, category: document.querySelector('#productCategory').value, price: Number(document.querySelector('#productPrice').value), image: document.querySelector('#productImage').value || null, description: document.querySelector('#productDescription').value || 'Uma fragrância especial.', promo: document.querySelector('#productPromo').checked, active: true };
    const result = id ? await db.from('products').update(product).eq('id', id) : await db.from('products').insert(product);
    if (result.error) { console.error('Supabase save error:', result.error); alert(`Não foi possível salvar: ${result.error.message}`); return; }
    form.reset(); document.querySelector('#productId').value = ''; await loadDatabaseProducts(); renderDatabaseAdmin();
    if (window.showToast) window.showToast('Perfume salvo no banco com segurança');
  };
}

window.enableDatabaseAdmin = () => { db = window.supabaseClient || db; renderDatabaseAdmin(); bindDatabaseForm(); };
async function loadDatabaseSettings() {
  const { data } = await db.from('site_settings').select('*').eq('id', 1).maybeSingle();
  if (data) { localStorage.setItem('sutido_flavia_marin_site', JSON.stringify(data)); if (window.applySiteSettings) window.applySiteSettings(); }
}

window.setupSiteSettings = () => {
  if (document.querySelector('#siteSettingsForm')) return;
  const current = JSON.parse(localStorage.getItem('sutido_flavia_marin_site') || '{}');
  document.querySelector('.admin-body').insertAdjacentHTML('afterbegin', `<section class="site-settings"><div class="admin-list-head"><h4>Personalizar o site</h4><span>salvo no banco seguro</span></div><form id="siteSettingsForm"><label>Texto principal da página<textarea id="setHeroCopy" rows="3">${escDb(current.heroCopy || '')}</textarea></label><label>Frase do rodapé<textarea id="setTagline" rows="2">${escDb(current.tagline || '')}</textarea></label><div class="form-row"><label>E-mail<input id="setEmail" type="email" value="${escDb(current.email || '')}"></label><label>Telefone<input id="setPhone" value="${escDb(current.phone || '')}"></label></div><div class="form-row"><label>Instagram<input id="setInstagram" value="${escDb(current.instagram || '')}"></label><label>Facebook<input id="setFacebook" value="${escDb(current.facebook || '')}"></label></div><div class="form-row"><label>TikTok<input id="setTiktok" value="${escDb(current.tiktok || '')}"></label><label>WhatsApp<input id="setWhatsapp" value="${escDb(current.whatsapp || '')}"></label></div><div class="form-row"><label>Endereço<input id="setAddress" value="${escDb(current.address || '')}"></label><label>Cidade / estado<input id="setCity" value="${escDb(current.city || '')}"></label></div><label>Horário de atendimento<input id="setHours" value="${escDb(current.hours || '')}"></label><div class="form-row"><label>Cor de fundo<input id="setPink" type="color" value="${current.pink || '#f7e1e5'}"></label><label>Cor de destaque<input id="setRose" type="color" value="${current.rose || '#a84d64'}"></label></div><button class="btn btn-dark" type="submit">Salvar alterações do site</button></form></section>`);
  document.querySelector('#siteSettingsForm').onsubmit = async event => {
    event.preventDefault();
    const settings = { id: 1, hero_copy: document.querySelector('#setHeroCopy').value, tagline: document.querySelector('#setTagline').value, email: document.querySelector('#setEmail').value, phone: document.querySelector('#setPhone').value, instagram: document.querySelector('#setInstagram').value, facebook: document.querySelector('#setFacebook').value, tiktok: document.querySelector('#setTiktok').value, whatsapp: document.querySelector('#setWhatsapp').value, address: document.querySelector('#setAddress').value, city: document.querySelector('#setCity').value, hours: document.querySelector('#setHours').value, pink: document.querySelector('#setPink').value, rose: document.querySelector('#setRose').value };
    const { error } = await db.from('site_settings').upsert(settings, { onConflict: 'id' });
    if (error) { alert('Não foi possível salvar as configurações.'); return; }
    localStorage.setItem('sutido_flavia_marin_site', JSON.stringify({ ...settings, heroCopy: settings.hero_copy }));
    if (window.applySiteSettings) window.applySiteSettings();
    if (window.showToast) window.showToast('Alterações salvas no banco seguro');
  };
};

document.addEventListener('DOMContentLoaded', () => { loadDatabaseProducts(); loadDatabaseSettings(); });
