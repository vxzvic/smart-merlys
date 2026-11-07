/* SMART prototype — Customer storefront + customer account */
'use strict';

/* ---------------- Shell ---------------- */
function shop(content, {title='Storefront', active=''}={}){
  const u = me(); const isCust = u && u.role==='customer';
  const navs = [['/','Storefront','home'],['/catalog','Catalog','catalog'],['/catalog?cat=Scrub Sets','Scrub Sets','sets'],['/catalog?cat=Lab Coats','Lab Coats','coats'],['/catalog?cat=Accessories','Accessories','acc']];
  const navHtml = navs.map(([h,l,k])=>`<a href="#${h}" class="${active===k?'is-active':''}">${l}</a>`).join('');
  const unread = isCust ? S.notifications.filter(n=>n.userId===u.id && !n.read).length : 0;
  return `<div data-title="${esc(title)}">
  <div class="promo"><div class="container"><span class="badge b-lime plain">PROMO</span><span>Free nationwide delivery on orders over ${peso(FREE_SHIP_MIN)}</span><span class="hide-sm">·</span><span class="hide-sm">Payments are verified manually by our atelier team within 1 business day</span></div></div>
  <header class="hdr"><div class="container">
    <button class="icon-btn menu-btn" data-act="mnav" aria-label="Open menu">${ic('menu')}</button>
    <a href="#/" class="logo" aria-label="Merly's Scrubsuits home"><img class="logo-img" src="assets/logo.png" alt="Merly's Scrubsuits logo" width="48" height="48"><span>MERLY'S SCRUBSUITS<small>MEDICAL APPAREL · EST. 2004</small></span></a>
    <nav class="nav" aria-label="Main">${navHtml}</nav>
    <div class="spacer"></div>
    <form class="search" data-form="search" role="search"><label class="sr-only" for="hs">Search products</label>${ic('search')}<input id="hs" name="q" class="input" placeholder="Search scrubs, sizes, fabric" value="${esc(CUR.query.q||'')}"></form>
    ${isCust ? `<div class="dropdown"><button class="icon-btn" data-act="menu" aria-label="Account menu">${ic('user')}${unread?`<span class="dot-count">${unread}</span>`:''}</button>
        <div class="dd-menu"><div style="padding:8px 10px"><b>${esc(u.name)}</b><div class="small muted">${esc(u.email)}</div></div>
        <a href="#/account">${ic('grid')} My account</a><a href="#/account/orders">${ic('bag')} My orders</a><a href="#/account/payments">${ic('wallet')} Payments</a><a href="#/account/profile">${ic('settings')} Profile & settings</a>
        <button data-act="logout">${ic('logout')} Sign out</button></div></div>`
      : `<a class="btn btn-outline btn-sm" href="#/login">${ic('user')} Sign in</a>`}
    <a class="icon-btn" href="#/cart" aria-label="Cart, ${cartCount()} items">${ic('cart')}${cartCount()?`<span class="dot-count">${cartCount()}</span>`:''}</a>
  </div>
  <nav class="mobile-nav" id="mnav" aria-label="Mobile">${navHtml}<a href="#/cart">Cart (${cartCount()})</a>${isCust?'<a href="#/account">My account</a>':'<a href="#/login">Sign in / Register</a>'}<a href="#/portal?role=staff">Staff & Admin portal</a></nav>
  </header>
  <main>${content}</main>
  <footer class="ftr"><div class="container">
    <div class="cols">
      <div><a class="logo" href="#/"><img class="logo-img" src="assets/logo.png" alt="Merly's Scrubsuits logo" width="64" height="64"><span>MERLY'S SCRUBSUITS<small>MEDICAL APPAREL · EST. 2004</small></span></a><p class="muted small" style="margin-top:10px;max-width:320px">Pioneering ergonomic medical tailoring since 2004. Handcrafted in the Philippines for everyday healthcare comfort.</p></div>
      <div><h4>Shop</h4><a href="#/catalog?cat=Scrub Sets">Scrub sets</a><a href="#/catalog?cat=Tops">Tops</a><a href="#/catalog?cat=Trousers">Trousers</a><a href="#/catalog?cat=Lab Coats">Lab coats</a></div>
      <div><h4>Help</h4><a href="#/help/payments">How payment works</a><a href="#/help/sizes">Size guide</a><a href="#/account/orders">Track an order</a></div>
      <div><h4>Portal</h4><a href="#/login">Customer sign in</a><a href="#/portal?role=staff">Staff sign in</a><a href="#/portal?role=admin">Admin sign in</a></div>
    </div>
    <div class="bottom"><span>© 2004–2026 Merly's Scrubsuits Co. · SMART Capstone Prototype</span><span>Metro Manila Atelier & Showroom</span></div>
  </div></footer>
  ${demoBar()}</div>`;
}
on('mnav', () => document.getElementById('mnav').classList.toggle('open'));
on('form:search', f => go('/catalog?q='+encodeURIComponent(f.q.value.trim())));

function pcard(p){
  const colors = [...new Set(p.variants.map(v=>v.color))];
  const out = totalStock(p)===0;
  return `<a class="pcard" href="#/product/${p.id}">
    <div class="pimg" style="${pBg(colors[0])}">${p.tags[0]?`<span class="badge b-olive plain">${esc(p.tags[0])}</span>`:''}${out?'<span class="badge b-red" style="left:auto;right:10px">Sold out</span>':''}${art(p, colors[0], 170)}</div>
    <div class="pbody"><div class="row between"><span class="xs muted">${esc(p.cat)} · ${esc(p.style)}</span><span class="xs"><span class="stars">★</span> ${p.rating} (${p.reviews})</span></div>
    <h3 style="font-size:15px">${esc(p.name)}</h3>${p.customizable?'<span class="xs" style="color:var(--olive-600);font-weight:600">✦ Customizable colours & patterns</span>':''}
    <div class="row between" style="margin-top:auto"><span class="price">${priceRange(p)}</span><span class="swatches">${colors.slice(0,5).map(c=>`<span class="sw" style="background:${COLORS[c]}" title="${esc(c)}"></span>`).join('')}</span></div></div></a>`;
}
const visibleProducts = () => S.products.filter(p=>p.status==='Active');

/* ---------------- Home ---------------- */
route('/', () => {
  const best = visibleProducts().slice(0,4);
  return shop(`<div class="container">
    <section class="hero">
      <div class="col" style="gap:18px">
        <span class="tag" style="align-self:flex-start">${ic('shield','')} Philippine Healthcare Tailoring Pioneers · Est. 2004</span>
        <h1>Engineered for Caregivers,<br>Crafted for 16-Hour Endurance.</h1>
        <p class="muted" style="font-size:16px;max-width:520px">Four-way stretch antimicrobial scrubs, autoclave-durable and tailored for Philippine hospital workflows. Browse freely — sign in only when you're ready to order.</p>
        <div class="row wrap"><a class="btn btn-primary btn-lg" href="#/catalog">Shop the catalog ${ic('arrowR')}</a><a class="btn btn-outline btn-lg" href="#/help/payments">${ic('wallet')} How payment works</a></div>
        <div class="trust"><div><span class="ti">${ic('shield')}</span><div><b class="small">Antimicrobial</b><div class="xs muted">Silvadur™ treated</div></div></div><div><span class="ti">${ic('star')}</span><div><b class="small">4.9 / 5 rating</b><div class="xs muted">From verified buyers</div></div></div><div><span class="ti">${ic('truck')}</span><div><b class="small">Nationwide delivery</b><div class="xs muted">Free over ${peso(FREE_SHIP_MIN)}</div></div></div></div>
      </div>
      <div class="hero-art"><img class="hero-photo" src="assets/team.webp" alt="The Merly's Scrubsuits team wearing Ceil Blue classic V-neck scrub sets" width="1400" height="1095"><div class="floating"><span class="avatar light">${ic('shield')}</span><div><b class="small">BioShield™ Fabric Coating</b><div class="xs muted">99.8% fluid & blood resistance</div></div><span class="spacer"></span><span class="tag">ISO 20743</span></div></div>
    </section>
    <div class="filters" style="margin-bottom:24px">${['All','Scrub Sets','Tops','Trousers','Lab Coats','Accessories','Base Layer'].map(c=>`<a class="chip ${c==='All'?'is-active':''}" href="#/catalog${c==='All'?'':'?cat='+c}">${c}</a>`).join('')}</div>
    <div class="row between" style="margin-bottom:16px"><div><div class="eyebrow">Precision-cut garments</div><h2>Signature Scrub Sets & Outerwear</h2></div><a href="#/catalog" class="semi">View all styles ${ic('arrowR','')}</a></div>
    <div class="grid g4">${best.map(pcard).join('')}</div>
    <section class="card team" style="margin-top:40px">
      <div class="col" style="gap:14px"><span class="badge b-lime plain" style="align-self:flex-start">MEET THE MERLY'S FAMILY</span><h2>Family-run, tailored in the Philippines since 2004</h2>
        <p class="muted">Every set is cut, sewn and checked by our small atelier team. That's them in our Ceil Blue classic V-neck — the same fabric that goes through 500+ hospital washes without losing its shape.</p>
        <div class="row wrap" style="gap:18px"><div><b style="font-size:22px">20+</b><div class="xs muted">years tailoring</div></div><div><b style="font-size:22px">50,000+</b><div class="xs muted">clinicians dressed</div></div><div><b style="font-size:22px">4.9★</b><div class="xs muted">average rating</div></div></div>
        <div class="row wrap"><a class="btn btn-primary" href="#/catalog?cat=Scrub Sets">Shop scrub sets ${ic('arrowR')}</a></div></div>
      <img class="team-photo" src="assets/team.webp" alt="Five members of the Merly's team smiling in matching Ceil Blue scrubs" loading="lazy" width="1400" height="1095">
    </section>
    <section class="card" style="margin-top:20px;display:grid;grid-template-columns:1fr 1.2fr;gap:28px;align-items:center">
      <div class="row" style="gap:10px;justify-content:center;flex-wrap:wrap">${PRESETS.slice(1).map(pr=>`<div class="thumb" style="width:120px;height:120px;${pBg(null,pr.cfg)}">${art(S.products[0],null,104,pr.cfg)}</div>`).join('')}</div>
      <div class="col"><span class="badge b-lime plain" style="align-self:flex-start">NEW · MADE TO ORDER</span><h2>Design your own scrubsuit</h2>
        <p class="muted">Pick the body colour, a pattern (botanical, paw print, heartbeat and more), the pattern colour and where it goes, and the trim colour. See it live before you order — made in our atelier in ${CUSTOM_LEAD}.</p>
        <div class="row wrap"><a class="btn btn-primary" href="#/product/P-1001?customize=1">${ic('wand')} Start designing</a><a class="btn btn-ghost" href="#/catalog">Browse ready-made</a></div></div>
    </section>
    <section class="card" style="margin-top:20px;background:var(--olive-800);color:#fff;border:none;display:grid;grid-template-columns:1.3fr 1fr;gap:24px" >
      <div class="col"><span class="badge b-lime plain" style="align-self:flex-start">HOW ORDERING WORKS</span><h2 style="color:#fff">Order online, pay by GCash, bank transfer or cash — verified by real people.</h2><p style="opacity:.85">SMART does not auto-charge cards. After you place an order you'll see payment instructions, submit your reference number and receipt, and our staff verifies it manually.</p></div>
      <ol class="col small" style="margin:0;padding-left:18px;opacity:.95"><li>Browse & add sizes/colours to cart</li><li>Sign in or create an account at checkout</li><li>Place order → follow payment instructions</li><li>Submit payment reference & proof</li><li>Staff verifies → order is processed & shipped</li><li>Track status in <b>My orders</b></li></ol>
    </section>
  </div>`, {title:'Storefront', active:'home'});
});

/* ---------------- Catalog (search / filter / sort / paginate) ---------------- */
route('/catalog', ({query:q}) => {
  const cats = ['Scrub Sets','Tops','Trousers','Lab Coats','Accessories','Base Layer'];
  const allColors = Object.keys(COLORS);
  let list = visibleProducts();
  if (q.q) { const t=q.q.toLowerCase(); list = list.filter(p=>(p.name+' '+p.cat+' '+p.style+' '+p.fabric+' '+p.variants.map(v=>v.color+' '+v.size).join(' ')).toLowerCase().includes(t)); }
  if (q.cat) list = list.filter(p=>p.cat===q.cat);
  if (q.color) list = list.filter(p=>p.variants.some(v=>v.color===q.color));
  if (q.size) list = list.filter(p=>p.variants.some(v=>v.size===q.size && v.stock>0));
  if (q.stock==='1') list = list.filter(p=>totalStock(p)>0);
  if (q.max) list = list.filter(p=>Math.min(...p.variants.map(v=>v.price))<=Number(q.max));
  const minP = p=>Math.min(...p.variants.map(v=>v.price));
  if (q.sort==='low') list.sort((a,b)=>minP(a)-minP(b)); else if (q.sort==='high') list.sort((a,b)=>minP(b)-minP(a)); else if (q.sort==='rating') list.sort((a,b)=>b.rating-a.rating); else list.sort((a,b)=>b.sold-a.sold);
  const per=6, page=Number(q.page||1); const shown = paginate(list,page,per);
  const active = ['q','cat','color','size','stock','max'].filter(k=>q[k]);
  const chipQ = (k,v) => `data-act="qset" data-q='${JSON.stringify({[k]:q[k]===String(v)?'':v, page:''})}'`;
  return shop(`<div class="container">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a>›<b>Catalog</b>${q.cat?`›<b>${esc(q.cat)}</b>`:''}</nav>
    <div class="row between wrap" style="margin-bottom:18px"><div><h1>${q.q?`Results for “${esc(q.q)}”`:esc(q.cat||'All scrubsuits')}</h1><p class="muted">${list.length} product${list.length===1?'':'s'} · browse freely, no account needed</p></div>
      <div class="row"><button class="btn btn-outline btn-sm" data-act="toggle-filters" style="display:none" id="ftoggle">${ic('filter')} Filters</button>
      <label class="small muted" for="sort">Sort</label><select id="sort" class="select" style="height:38px;width:auto" data-change="sort">${[['popular','Most popular'],['low','Price: low to high'],['high','Price: high to low'],['rating','Top rated']].map(([v,l])=>`<option value="${v}" ${q.sort===v?'selected':''}>${l}</option>`).join('')}</select></div></div>
    ${active.length?`<div class="row wrap" style="margin-bottom:16px">${active.map(k=>`<button class="chip" data-act="qset" data-q='${JSON.stringify({[k]:'',page:''})}'>${k==='stock'?'In stock only':k==='max'?'Up to '+peso(q.max):esc(q[k])} ${ic('x','')}</button>`).join('')}<a href="#/catalog" class="small semi">Clear all</a></div>`:''}
    <div class="shop-layout" style="display:grid;grid-template-columns:230px 1fr;gap:28px;align-items:start">
      <aside class="side-filter card tight" id="filters" aria-label="Filters">
        <div><h4>Category</h4><div class="col" style="gap:4px">${cats.map(c=>`<button class="chip ${q.cat===c?'is-active':''}" style="justify-content:space-between" ${chipQ('cat',c)}>${c}<span class="xs">${visibleProducts().filter(p=>p.cat===c).length}</span></button>`).join('')}</div></div>
        <div><h4>Colour</h4><div class="row wrap" style="gap:8px">${allColors.map(c=>`<button title="${c}" aria-label="${c}" aria-pressed="${q.color===c}" ${chipQ('color',c)} style="width:28px;height:28px;border-radius:50%;background:${COLORS[c]};border:2px solid #fff;box-shadow:0 0 0 ${q.color===c?'2px var(--olive-800)':'1px var(--border)'};cursor:pointer"></button>`).join('')}</div></div>
        <div><h4>Size in stock</h4><div class="row wrap" style="gap:6px">${SIZES.map(z=>`<button class="chip ${q.size===z?'is-active':''}" style="height:30px;padding:0 10px" ${chipQ('size',z)}>${z}</button>`).join('')}</div></div>
        <div><h4>Max price</h4><select class="select" style="height:38px" data-change="maxp"><option value="">Any price</option>${[500,1000,1500,2000].map(v=>`<option value="${v}" ${q.max==v?'selected':''}>Up to ${peso(v)}</option>`).join('')}</select></div>
        <label class="check"><input type="checkbox" data-change="instock" ${q.stock==='1'?'checked':''}> <span class="small semi">In-stock items only</span></label>
      </aside>
      <div>${shown.length? `<div class="grid g3">${shown.map(pcard).join('')}</div><div class="card tight" style="padding:0;margin-top:20px;overflow:hidden">${pager(list.length,page,per)}</div>`
        : `<div class="card">${emptyState('search','No products match your search', q.q?`We couldn't find anything for “${esc(q.q)}”. Check the spelling, or try a broader term like “jogger” or “navy”.`:'Try removing a filter to see more styles.', `<a class="btn btn-primary" href="#/catalog">Clear search & filters</a>`)}</div>`}</div>
    </div></div>`, {title:'Catalog', active: q.cat==='Scrub Sets'?'sets':q.cat==='Lab Coats'?'coats':q.cat==='Accessories'?'acc':'catalog'});
});
on('sort', a => qset({sort:a.value, page:''}));
on('maxp', a => qset({max:a.value, page:''}));
on('instock', a => qset({stock:a.checked?'1':'', page:''}));
afterRender.push(()=>{});
window.addEventListener('resize', ()=>{ const t=document.getElementById('ftoggle'); if(t) t.style.display = innerWidth<=820?'inline-flex':'none'; });
on('toggle-filters', () => document.getElementById('filters').classList.toggle('open'));

/* ---------------- Product detail ---------------- */
let PD = {};
route('/product/:id', ({params}) => {
  const p = product(params.id);
  if (!p || p.status!=='Active') return shop(`<div class="container">${emptyState('box','This product is unavailable','It may have been removed from the catalog or is not yet published.',`<a class="btn btn-primary" href="#/catalog">Back to catalog</a>`)}</div>`);
  if (PD.id!==p.id) PD = {id:p.id, color:p.variants.find(v=>v.stock>0)?.color || p.variants[0].color, size:null, qty:1, emb:false, embText:'', mode:'ready', cfg:{body:'Heritage Olive', pattern:'solid', patColor:'White', placement:'full', trim:'White'}};
  if (CUR.query.customize==='1' && p.customizable && PD.mode!=='custom'){ PD.mode='custom'; PD.size=null; }
  return shop(`<div class="container" id="pd-root">${pdInner(p)}</div>`, {title:p.name, active:'catalog'});
});
function pdInner(p){
  const colors = [...new Set(p.variants.map(v=>v.color))];
  const sizes = [...new Set(p.variants.map(v=>v.size))];
  if (PD.mode==='custom') return pdCustom(p, colors, sizes);
  const v = PD.size ? p.variants.find(x=>x.color===PD.color && x.size===PD.size) : null;
  const colorStock = c => p.variants.filter(x=>x.color===c).reduce((a,x)=>a+x.stock,0);
  const inCart = v ? (S.cart.find(i=>i.sku===v.sku && !!i.embroidery===PD.emb)?.qty||0) : 0;
  const maxQty = v ? Math.max(0, v.stock - inCart) : 0;
  const unit = v ? v.price + (PD.emb?EMBROIDERY_FEE:0) : null;
  let stockMsg = '<span class="stock-note" style="color:var(--ink-3)">Select a size to see availability</span>';
  if (v) stockMsg = v.stock<=0 ? '<span class="stock-note" style="color:var(--red)">Out of stock in this size & colour</span>' : v.stock<=S.settings.lowStock ? `<span class="stock-note" style="color:var(--amber-ink)">Only ${v.stock} left — order soon</span>` : `<span class="stock-note" style="color:var(--green)">${v.stock} in stock · ready for dispatch</span>`;
  const canAdd = v && v.stock>0 && maxQty>0 && PD.qty<=maxQty && (!PD.emb || PD.embText.trim());
  return `<nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a>›<a href="#/catalog">Catalog</a>›<a href="#/catalog?cat=${encodeURIComponent(p.cat)}">${esc(p.cat)}</a>›<b>${esc(p.name)}</b></nav>
  <div class="card"><div class="pd">
    <div><div class="gallery" style="${pBg(PD.color)}"><span class="tag" style="position:absolute;top:14px;left:14px">${esc(PD.color)}${PD.size?' · '+PD.size:''}</span>${art(p, PD.color, 340)}</div>
      <div class="thumbs">${colors.slice(0,4).map(c=>`<button class="${c===PD.color?'is-active':''}" data-act="pd-color" data-v="${esc(c)}" aria-label="${esc(c)}" style="${pBg(c)}">${art(p,c,70)}</button>`).join('')}</div>
      <div class="grid g3" style="margin-top:12px">${[['shield','Silvadur™','Antimicrobial'],['refresh','500+ washes','Autoclave-safe'],['check','ISO 9001','Atelier tailored']].map(([i,a,b])=>`<div class="card tight flat row" style="gap:8px">${ic(i,'')}<div><b class="xs">${a}</b><div class="xs muted">${b}</div></div></div>`).join('')}</div>
    </div>
    <div class="col" style="gap:18px">
      <div class="row wrap">${p.tags.map(t=>`<span class="badge b-olive plain">${esc(t)}</span>`).join('')}<span class="badge b-lime plain">100% Authentic Atelier Guarantee</span></div>
      <h1 style="font-size:28px">${esc(p.name)}</h1>
      <div class="row small"><b>${p.rating}</b><span class="stars">★★★★★</span><span class="muted">| ${p.reviews.toLocaleString()} ratings | ${p.sold.toLocaleString()} sold</span></div>
      <div class="price-box">${p.compareAt?`<s class="muted">${peso(p.compareAt)}</s>`:''}<span class="now">${unit?peso(unit):priceRange(p)}</span>${p.compareAt?'<span class="badge b-red plain">18% OFF</span>':''}<span class="spacer"></span><span class="badge b-lime plain">${ic('truck','')} Free shipping over ${peso(FREE_SHIP_MIN)}</span></div>
      ${modeSwitch(p)}
      <div class="col" style="gap:10px"><div class="step"><span class="n">1</span>Colour: <span class="val">${esc(PD.color)}</span></div>
        <div class="row wrap" role="radiogroup" aria-label="Colour">${colors.map(c=>{ const out=colorStock(c)===0; return `<button class="color-opt ${c===PD.color?'is-active':''}" role="radio" aria-checked="${c===PD.color}" data-act="pd-color" data-v="${esc(c)}" ${out?'disabled title="Sold out in all sizes"':''}><span class="sw" style="background:${COLORS[c]}"></span>${esc(c)}${out?'<span class="xs" style="color:var(--red)">Sold out</span>':''}</button>`; }).join('')}</div></div>
      <div class="col" style="gap:10px"><div class="row between"><div class="step"><span class="n">2</span>Size: <span class="val">${PD.size||'Select a size'}</span></div><a href="#/help/sizes" class="small semi">Size guide</a></div>
        <div class="row wrap" role="radiogroup" aria-label="Size">${sizes.map(z=>{ const x=p.variants.find(a=>a.color===PD.color&&a.size===z); const s=x?x.stock:0; return `<button class="size-opt ${PD.size===z?'is-active':''} ${s<=0?'oos':s<=S.settings.lowStock?'low':''}" role="radio" aria-checked="${PD.size===z}" ${s<=0?'aria-disabled="true" title="Out of stock"':''} data-act="pd-size" data-v="${z}">${z}</button>`; }).join('')}</div>
        <div class="xs muted">Crossed-out sizes are out of stock · <span style="color:var(--amber)">●</span> low stock · 2XL–3XL +${peso(p.variants.find(v=>v.size==='2XL')?.price - p.variants.find(v=>v.size==='M')?.price || 0)}</div></div>
      ${p.embroidery?`<div class="col" style="gap:10px"><div class="step"><span class="n">3</span>Name embroidery <span class="muted" style="text-transform:none;font-weight:500">(optional, +${peso(EMBROIDERY_FEE)})</span></div>
        <label class="check"><input type="checkbox" data-change="pd-emb" ${PD.emb?'checked':''}><span class="small">Add name & title embroidery on left chest (standard gold thread, max 28 characters)</span></label>
        ${PD.emb?`<div class="field ${PD.emb && !PD.embText.trim() && PD.touched?'has-error':''}"><input class="input" maxlength="28" placeholder="e.g. Dr. Maria Santos, MD" value="${esc(PD.embText)}" data-input="pd-embtext" aria-label="Embroidery text"><div class="err">Enter the name to embroider, or untick embroidery.</div><div class="hint"><span id="embc">${PD.embText.length}</span>/28 characters</div></div>`:''}</div>`:''}
      <div class="row wrap" style="gap:18px"><span class="small semi">Quantity</span><div class="qty"><button data-act="pd-qty" data-d="-1" aria-label="Decrease" ${PD.qty<=1?'disabled':''}>−</button><input value="${PD.qty}" aria-label="Quantity" data-change="pd-qtyin" inputmode="numeric"><button data-act="pd-qty" data-d="1" aria-label="Increase" ${!v||PD.qty>=maxQty?'disabled':''}>+</button></div>${stockMsg}</div>
      ${v && inCart && v.stock>0 ? `<div class="notice n-info">${ic('info')}<div>You already have ${inCart} of this variant in your cart. ${maxQty?`You can add up to ${maxQty} more.`:'No more stock is available to add.'}</div></div>`:''}
      <div class="grid g2"><button class="btn btn-secondary btn-lg" data-act="pd-add" ${canAdd?'':'aria-disabled="true"'} id="addbtn">${ic('cart')} ${!PD.size?'Select a size':v&&v.stock<=0?'Out of stock':`Add to cart · ${peso(unit*PD.qty)}`}</button>
      <button class="btn btn-primary btn-lg" data-act="pd-buy" ${canAdd?'':'aria-disabled="true"'}>Buy now ${ic('arrowR')}</button></div>
      <p class="xs muted">Prices include VAT. Payment is by GCash, BDO transfer or cash on delivery, verified manually by our staff — no card details are collected.</p>
    </div></div></div>
  ${pdTail(p, colors, sizes)}`;
}
function reviewsBlock(p){
  const rv = [
    ['Dr. Camille R., MD','Verified PGH Resident','Oct 24, 2025','Heritage Olive / Size M / With embroidery','The two-tone heritage olive looks so elegant during ward rounds! Fluid-repellent fabric actually works. Embroidery held up after 4 autoclave cycles.'],
    ['Nurse Mark Anthony B., RN',"St. Luke's BGC",'Nov 02, 2025','Navy / Size L','Super comfortable 4-way stretch, doesn\'t wrinkle even after a 16-hour ICU shift. Deep cargo pockets fit my pulse ox and iPad mini.'],
    ['Dra. Patricia L.','Makati Med Practitioner','Nov 15, 2025','Lavender / Size S','Fits true to size and the rayon blend feels premium. Arrived neatly wrapped with a handwritten card.']];
  const dist=[[5,1620],[4,152],[3,21],[2,3],[1,4]];
  return `<div class="card" style="margin-top:20px"><div class="row between wrap"><div><h2>Product Ratings & Clinician Reviews</h2><p class="small muted">Reviews from verified buyers</p></div></div>
  <div class="card flat row wrap" style="margin-top:16px;gap:28px"><div style="text-align:center"><div><b style="font-size:34px">${p.rating}</b> <span class="muted">out of 5.0</span></div><div class="stars">★★★★★</div><div class="xs muted">${p.reviews.toLocaleString()} verified reviews</div></div>
    <div class="col" style="gap:4px;flex:1;min-width:220px">${dist.map(([s,n])=>`<div class="row small" style="gap:10px"><span style="width:44px">${s} Star</span><span class="bar"><i style="width:${n/16.2}%"></i></span><span style="width:44px;text-align:right">${n}</span></div>`).join('')}</div></div>
  ${rv.map(([n,b,d,var_,t],i)=>`<div class="review"><div class="row between top"><div class="row"><span class="avatar ${i===1?'light':''}">${initials(n)}</span><div><div class="row"><b>${n}</b><span class="badge b-lime plain">${b}</span></div><div class="xs muted">Reviewed on ${d} · Verified buyer</div></div></div><span class="stars">★★★★★</span></div><span class="tag" style="margin:10px 0">Variation: ${var_}</span><p class="small">${t}</p></div>`).join('')}</div>`;
}
function pdTail(p, colors, sizes){
  return `  <div class="card" style="margin-top:20px"><div class="tabs" role="tablist">${['Product details','Fabric & care','Shipping & payment'].map((t,i)=>`<button class="tab ${(PD.tab||0)===i?'is-active':''}" role="tab" aria-selected="${(PD.tab||0)===i}" data-act="pd-tab" data-i="${i}">${t}</button>`).join('')}</div>
    <div style="padding-top:18px">${[
      `<p>${esc(p.desc)}</p><dl class="kv" style="margin-top:14px"><dt>Style</dt><dd>${esc(p.style)}</dd><dt>Category</dt><dd>${esc(p.cat)}</dd><dt>Available sizes</dt><dd>${sizes.join(', ')}</dd><dt>Colours</dt><dd>${colors.join(', ')}</dd></dl>`,
      `<dl class="kv"><dt>Fabric</dt><dd>${esc(p.fabric)}</dd><dt>Care</dt><dd>Machine wash up to 70°C · autoclave safe · do not bleach</dd></dl>`,
      `<ul class="small" style="margin:0;padding-left:18px;line-height:1.9"><li>Metro Manila 2–3 business days, provincial 4–7 business days after payment is verified.</li><li>Shipping ${peso(SHIPPING_FEE)}, free on orders over ${peso(FREE_SHIP_MIN)}.</li><li>Orders are processed only after staff verify your GCash/BDO payment. COD orders are confirmed by phone.</li></ul>`][PD.tab||0]}</div></div>
  ${reviewsBlock(p)}`;
}

function modeSwitch(p){
  if (!p.customizable) return '';
  return `<div class="col" style="gap:8px"><div class="seg" role="tablist" aria-label="How do you want it?">
    <button role="tab" aria-selected="${PD.mode==='ready'}" class="${PD.mode==='ready'?'is-active':''}" data-act="pd-mode" data-v="ready">${ic('box')} Ready-made · in stock</button>
    <button role="tab" aria-selected="${PD.mode==='custom'}" class="${PD.mode==='custom'?'is-active':''}" data-act="pd-mode" data-v="custom">${ic('wand')} Customize · made to order</button></div>
    <span class="xs muted">${PD.mode==='custom'?`Design your own colours and pattern. Made to order in our Metro Manila atelier — ships in ${CUSTOM_LEAD} after payment is verified.`:'Choose from our standard colourways, ready for dispatch. Want your own colours or a pattern? Switch to <b>Customize</b>.'}</span></div>`;
}
const swatchBtn = (act, name, active, extra='') => `<button class="cswatch ${active?'is-active':''}" data-act="${act}" data-v="${esc(name)}" role="radio" aria-checked="${active}" aria-label="${esc(name)}" title="${esc(name)}" ${extra}><span style="background:${CUSTOM_COLORS[name]}"></span></button>`;
function patTile(k, c){ const body=CUSTOM_COLORS[c.body], col=CUSTOM_COLORS[k==='solid'?c.body:c.patColor];
  return `<button class="pat-opt ${c.pattern===k?'is-active':''}" data-act="pd-pat" data-v="${k}" role="radio" aria-checked="${c.pattern===k}"><svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true"><rect width="44" height="44" rx="10" fill="${body}"/>${k==='solid'?'':patternShapes(k,col,0,0,44,44)}</svg><span>${PATTERNS[k].label}</span><span class="xs muted">${PATTERNS[k].fee?'+'+peso(PATTERNS[k].fee):'Included'}</span></button>`; }
const PRESETS = [
  {name:'Classic Olive', cfg:{body:'Heritage Olive', pattern:'solid', patColor:'White', placement:'full', trim:'White'}},
  {name:'Paediatric Botanical', cfg:{body:'Mint', pattern:'botanical', patColor:'Heritage Olive', placement:'panels', trim:'Heritage Olive'}},
  {name:'Cardio Navy', cfg:{body:'Navy', pattern:'hearts', patColor:'Ceil Blue', placement:'full', trim:'Ceil Blue'}},
  {name:'Vet Wine', cfg:{body:'Wine', pattern:'paws', patColor:'Blush', placement:'pockets', trim:'Blush'}},
];
function pdCustom(p, colors, sizes){
  const c = PD.cfg; const all = Object.keys(CUSTOM_COLORS).filter(k=>k!=='Gold Thread');
  const sizeBase = z => Math.min(...p.variants.filter(v=>v.size===z).map(v=>v.price));
  const fee = customFee(c); const base = PD.size ? sizeBase(PD.size) : Math.min(...p.variants.map(v=>v.price));
  const unit = base + fee + (PD.emb?EMBROIDERY_FEE:0);
  const lowContrast = c.pattern!=='solid' && c.patColor===c.body;
  const canAdd = PD.size && !lowContrast && (!PD.emb || PD.embText.trim());
  const solid = c.pattern==='solid';
  return `<nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a>›<a href="#/catalog">Catalog</a>›<a href="#/product/${p.id}">${esc(p.name)}</a>›<b>Customize</b></nav>
  <div class="card"><div class="pd">
    <div><div class="gallery" style="${pBg(null,c)}"><span class="tag" style="position:absolute;top:14px;left:14px">${ic('wand','')} Live preview</span><span class="tag" style="position:absolute;top:14px;right:14px">${customCode(c)}</span>${art(p, null, 340, c)}</div>
      <div class="small semi" style="margin:14px 0 8px">Start from a popular design</div>
      <div class="thumbs">${PRESETS.map((pr,i)=>`<button data-act="pd-preset" data-i="${i}" title="${pr.name}" aria-label="Apply preset ${pr.name}" style="${pBg(null,pr.cfg)};flex-direction:column">${art(p,null,64,pr.cfg)}<span class="xs" style="margin-top:2px">${pr.name}</span></button>`).join('')}</div>
      <div class="notice n-lime small" style="margin-top:12px">${ic('info')}<div>The preview is a guide. Printed and dyed fabric colours may vary slightly from your screen. Our atelier sends a photo of your fabric swatch if anything needs to change before cutting.</div></div>
    </div>
    <div class="col" style="gap:18px">
      <div class="row wrap"><span class="badge b-olive plain">Made to order</span><span class="badge b-lime plain">Ships in ${CUSTOM_LEAD}</span></div>
      <h1 style="font-size:28px">${esc(p.name)}</h1>
      <div class="price-box"><span class="now">${peso(unit)}</span><span class="small muted">${PD.size?'':'from · '}base ${peso(base)}${fee?` + pattern ${peso(fee)}`:''}${PD.emb?` + embroidery ${peso(EMBROIDERY_FEE)}`:''}</span></div>
      ${modeSwitch(p)}
      <div class="col" style="gap:10px"><div class="step"><span class="n">1</span>Body colour: <span class="val">${esc(c.body)}</span></div>
        <div class="row wrap" role="radiogroup" aria-label="Body colour">${all.map(n=>swatchBtn('pd-body',n,c.body===n)).join('')}</div></div>
      <div class="col" style="gap:10px"><div class="step"><span class="n">2</span>Pattern: <span class="val">${PATTERNS[c.pattern].label}</span></div>
        <div class="pat-grid" role="radiogroup" aria-label="Pattern">${Object.keys(PATTERNS).map(k=>patTile(k,c)).join('')}</div></div>
      <div class="col" style="gap:10px;${solid?'opacity:.45':''}" ${solid?'aria-disabled="true"':''}><div class="step"><span class="n">3</span>Pattern colour & placement ${solid?'<span class="muted" style="text-transform:none;font-weight:500">(choose a pattern first)</span>':`: <span class="val">${esc(c.patColor)}</span>`}</div>
        <div class="row wrap" role="radiogroup" aria-label="Pattern colour">${[...all,'Gold Thread'].map(n=>swatchBtn('pd-patcol',n,c.patColor===n, solid?'disabled':'')).join('')}</div>
        <div class="row wrap" role="radiogroup" aria-label="Pattern placement">${Object.entries(PLACEMENTS).map(([k,pl])=>`<button class="chip ${c.placement===k?'is-active':''}" data-act="pd-place" data-v="${k}" ${solid?'disabled':''}>${pl.label}${!solid?` · +${peso(Math.round(PATTERNS[c.pattern].fee*pl.mult/10)*10)}`:''}</button>`).join('')}</div>
        ${lowContrast?`<div class="notice n-warn small">${ic('alert')}<div>The pattern colour is the same as the body colour, so the pattern won't show. Pick a different pattern colour.</div></div>`:''}</div>
      <div class="col" style="gap:10px"><div class="step"><span class="n">4</span>Trim & piping: <span class="val">${esc(c.trim)}</span></div>
        <div class="row wrap" role="radiogroup" aria-label="Trim colour">${all.map(n=>swatchBtn('pd-trim',n,c.trim===n)).join('')}</div></div>
      <div class="col" style="gap:10px"><div class="row between"><div class="step"><span class="n">5</span>Size: <span class="val">${PD.size||'Select a size'}</span></div><a href="#/help/sizes" class="small semi">Size guide</a></div>
        <div class="row wrap" role="radiogroup" aria-label="Size">${sizes.map(z=>`<button class="size-opt ${PD.size===z?'is-active':''}" role="radio" aria-checked="${PD.size===z}" data-act="pd-size" data-v="${z}">${z}</button>`).join('')}</div>
        <div class="xs muted">All sizes can be made to order · 2XL–3XL priced higher</div></div>
      ${p.embroidery?`<div class="col" style="gap:10px"><div class="step"><span class="n">6</span>Name embroidery <span class="muted" style="text-transform:none;font-weight:500">(optional, +${peso(EMBROIDERY_FEE)})</span></div>
        <label class="check"><input type="checkbox" data-change="pd-emb" ${PD.emb?'checked':''}><span class="small">Add name & title embroidery on left chest (max 28 characters)</span></label>
        ${PD.emb?`<div class="field ${!PD.embText.trim() && PD.touched?'has-error':''}"><input class="input" maxlength="28" placeholder="e.g. Dr. Maria Santos, MD" value="${esc(PD.embText)}" data-input="pd-embtext" aria-label="Embroidery text"><div class="err">Enter the name to embroider, or untick embroidery.</div><div class="hint"><span id="embc">${PD.embText.length}</span>/28 characters</div></div>`:''}</div>`:''}
      <div class="row wrap" style="gap:18px"><span class="small semi">Quantity</span><div class="qty"><button data-act="pd-qty" data-d="-1" aria-label="Decrease" ${PD.qty<=1?'disabled':''}>−</button><input value="${PD.qty}" aria-label="Quantity" data-change="pd-qtyin" inputmode="numeric"><button data-act="pd-qty" data-d="1" aria-label="Increase" ${PD.qty>=CUSTOM_MAX_QTY?'disabled':''}>+</button></div><span class="stock-note" style="color:var(--olive-600)">Made to order · up to ${CUSTOM_MAX_QTY} per design</span></div>
      <div class="grid g2"><button class="btn btn-secondary btn-lg" data-act="pd-add" ${canAdd?'':'aria-disabled="true"'}>${ic('cart')} ${!PD.size?'Select a size':`Add design · ${peso(unit*PD.qty)}`}</button>
      <button class="btn btn-primary btn-lg" data-act="pd-buy" ${canAdd?'':'aria-disabled="true"'}>Buy now ${ic('arrowR')}</button></div>
      <p class="xs muted">Customized items are made after your payment is verified and cannot be returned for change of mind. Payment is by GCash, BDO transfer or cash on delivery, verified manually by our staff.</p>
    </div></div></div>
  ${pdTail(p, colors, sizes)}`;
}
on('pd-mode', a => { PD.mode=a.dataset.v; PD.size=null; PD.qty=1; pdRefresh(); });
on('pd-body', a => { PD.cfg.body=a.dataset.v; pdRefresh(); });
on('pd-pat', a => { PD.cfg.pattern=a.dataset.v; if (PD.cfg.pattern!=='solid' && PD.cfg.patColor===PD.cfg.body) PD.cfg.patColor = PD.cfg.body==='White'?'Navy':'White'; pdRefresh(); });
on('pd-patcol', a => { PD.cfg.patColor=a.dataset.v; pdRefresh(); });
on('pd-place', a => { PD.cfg.placement=a.dataset.v; pdRefresh(); });
on('pd-trim', a => { PD.cfg.trim=a.dataset.v; pdRefresh(); });
on('pd-preset', a => { PD.cfg={...PRESETS[a.dataset.i].cfg}; toast(`Applied “${PRESETS[a.dataset.i].name}” — adjust any option`,'ok'); pdRefresh(); });
const pdRefresh = () => { const p=product(PD.id); document.getElementById('pd-root').innerHTML = pdInner(p); };
on('pd-color', a => { PD.color=a.dataset.v; const p=product(PD.id); const x=p.variants.find(v=>v.color===PD.color&&v.size===PD.size); if (x && x.stock<=0) { toast(`${PD.size} is out of stock in ${PD.color} — please choose another size`,'warn'); PD.size=null; } PD.qty=1; pdRefresh(); });
on('pd-size', a => { if (PD.mode==='custom'){ PD.size=a.dataset.v; pdRefresh(); return; } const p=product(PD.id); const x=p.variants.find(v=>v.color===PD.color&&v.size===a.dataset.v); if (!x || x.stock<=0){ toast(`Size ${a.dataset.v} is out of stock in ${PD.color}`,'warn'); return; } PD.size=a.dataset.v; PD.qty=Math.min(PD.qty, x.stock)||1; pdRefresh(); });
on('pd-qty', a => { PD.qty=Math.min(PD.mode==='custom'?CUSTOM_MAX_QTY:999, Math.max(1,PD.qty+Number(a.dataset.d))); pdRefresh(); });
on('pd-qtyin', a => { if (PD.mode==='custom'){ let n=parseInt(a.value)||1; if(n>CUSTOM_MAX_QTY){ toast(`Up to ${CUSTOM_MAX_QTY} pieces per design. For larger ward orders contact the atelier.`,'warn'); n=CUSTOM_MAX_QTY; } PD.qty=Math.max(1,n); pdRefresh(); return; } const p=product(PD.id); const x=PD.size&&p.variants.find(v=>v.color===PD.color&&v.size===PD.size); let n=parseInt(a.value)||1; if (x && n>x.stock){ toast(`Insufficient stock — only ${x.stock} available`,'warn'); n=x.stock; } PD.qty=Math.max(1,n); pdRefresh(); });
on('pd-emb', a => { PD.emb=a.checked; PD.touched=false; pdRefresh(); });
on('pd-embtext', a => { PD.embText=a.value; const c=document.getElementById('embc'); if(c) c.textContent=a.value.length; });
on('pd-tab', a => { PD.tab=Number(a.dataset.i); pdRefresh(); });
function pdAdd(){
  const p=product(PD.id);
  if (!PD.size){ toast('Please select a size first','warn'); document.querySelector('.size-opt')?.focus(); return false; }
  if (PD.mode==='custom'){
    const c=PD.cfg; if (c.pattern!=='solid' && c.patColor===c.body){ toast('Pick a pattern colour that differs from the body colour','warn'); return false; }
    if (PD.emb && !PD.embText.trim()){ PD.touched=true; pdRefresh(); toast('Enter the embroidery text or untick the option','warn'); return false; }
    const price = Math.min(...p.variants.filter(v=>v.size===PD.size).map(v=>v.price));
    const sku = `${p.id}-${customCode(c)}-${PD.size}`; const emb = PD.emb?PD.embText.trim():null;
    const ex = S.cart.find(i=>i.sku===sku && (i.embroidery||'')===(emb||''));
    if (ex){ if (ex.qty+PD.qty>CUSTOM_MAX_QTY){ toast(`Up to ${CUSTOM_MAX_QTY} pieces per design`,'warn'); return false; } ex.qty+=PD.qty; }
    else S.cart.push({sku, pid:p.id, name:p.name, color:'Custom design', size:PD.size, price, qty:PD.qty, embroidery:emb, custom:{...c}});
    save(); return true;
  }
  const v=p.variants.find(x=>x.color===PD.color&&x.size===PD.size);
  if (v.stock<=0){ toast('This variant is out of stock','err'); return false; }
  if (PD.emb && !PD.embText.trim()){ PD.touched=true; pdRefresh(); toast('Enter the embroidery text or untick the option','warn'); return false; }
  const ex=S.cart.find(i=>i.sku===v.sku && (i.embroidery||'')===(PD.emb?PD.embText.trim():''));
  const have = S.cart.filter(i=>i.sku===v.sku).reduce((a,i)=>a+i.qty,0);
  if (have+PD.qty>v.stock){ toast(`Insufficient stock — only ${v.stock} available and you already have ${have} in your cart`,'err'); return false; }
  if (ex) ex.qty+=PD.qty; else S.cart.push({sku:v.sku, pid:p.id, name:p.name, color:v.color, size:v.size, price:v.price, qty:PD.qty, embroidery:PD.emb?PD.embText.trim():null});
  save(); return true;
}
on('pd-add', async a => { if (a.getAttribute('aria-disabled')==='true' && !PD.size){ toast('Please select a size first','warn'); return; } if (!pdAdd()) return; await busy(a,400);
  modal(`<div class="mh"><div><div class="m-icon" style="background:var(--green-bg);color:var(--green)">${ic('checkC')}</div><h3>Added to your cart</h3></div><button class="icon-btn" data-act="modal-close" aria-label="Close">${ic('x')}</button></div>
  <div class="mb"><div class="row"><div class="thumb" style="${pBg(PD.color, PD.mode==='custom'?PD.cfg:null)}">${art(product(PD.id),PD.color,70, PD.mode==='custom'?PD.cfg:null)}</div><div><b>${esc(product(PD.id).name)}</b><div class="small muted">${PD.mode==='custom'?esc(customLabel(PD.cfg)):esc(PD.color)} · ${PD.size} · Qty ${PD.qty}${PD.emb?' · Embroidery':''}</div></div></div></div>
  <div class="mf"><button class="btn btn-outline" data-act="modal-close">Continue shopping</button><button class="btn btn-primary" data-act="go-cart">View cart (${cartCount()}) ${ic('arrowR')}</button></div>`);
  PD.qty=1; pdRefresh(); });
on('go-cart', () => { closeModal(); go('/cart'); });
on('pd-buy', a => { if (a.getAttribute('aria-disabled')==='true' && PD.size){ toast('Fix the highlighted options first','warn'); return; } if (!PD.size){ toast('Please select a size first','warn'); return; } if (pdAdd()) go('/checkout'); });

/* ---------------- Cart ---------------- */
const lineThumb = (i, sz) => `<div class="thumb" style="width:${sz+8}px;height:${sz+8}px;${pBg(i.color, i.custom)}">${art(product(i.pid)||S.products[0], i.color, sz, i.custom)}</div>`;
const lineDesc = i => i.custom ? `${esc(customLabel(i.custom))} · Size ${i.size}` : `${esc(i.color)} · Size ${i.size}`;
route('/cart', () => {
  if (!S.cart.length) return shop(`<div class="container" style="max-width:760px"><nav class="crumbs"><a href="#/">Home</a>›<b>Cart</b></nav><div class="card">${emptyState('cart','Your cart is empty','Browse our catalog and add a scrubsuit in your size and colour. Your cart is saved on this device.',`<a class="btn btn-primary" href="#/catalog">Browse catalog ${ic('arrowR')}</a>`)}</div></div>`, {title:'Cart'});
  const sub = S.cart.reduce((a,i)=>a+lineTotal(i),0); const ship = sub>=FREE_SHIP_MIN?0:SHIPPING_FEE;
  const issues = S.cart.map(i=>{ if (i.custom) return product(i.pid)?.status==='Active'?null:'unavailable'; const r=variantBySku(i.sku); return !r||r.p.status!=='Active'?'unavailable':r.v.stock<=0?'oos':i.qty>r.v.stock?'insufficient':null; });
  const blocked = issues.some(Boolean);
  return shop(`<div class="container"><nav class="crumbs"><a href="#/">Home</a>›<b>Cart</b></nav>
    <h1 style="margin-bottom:18px">Shopping cart <span class="muted" style="font-size:18px">(${cartCount()} item${cartCount()===1?'':'s'})</span></h1>
    <div class="cart-layout" style="display:grid;grid-template-columns:1.6fr 1fr;gap:24px;align-items:start">
      <div class="card" style="padding-top:8px">${blocked?`<div class="notice n-err" style="margin:12px 0">${ic('alert')}<div><b>Some items need your attention.</b> Adjust quantities or remove unavailable items before checkout.</div></div>`:''}
      ${S.cart.map((i,ix)=>{ const r=variantBySku(i.sku); const st=i.custom?CUSTOM_MAX_QTY:(r?r.v.stock:0); const iss=issues[ix];
        return `<div class="cart-line">${lineThumb(i,76)}
          <div class="col" style="gap:4px"><a href="#/product/${i.pid}" class="b" style="color:var(--ink)">${esc(i.name)}</a><div class="small muted">${lineDesc(i)} · ${peso(unitPrice(i))} each${i.embroidery?` · Embroidery “${esc(i.embroidery)}”`:''}</div>${i.custom?`<span class="badge b-olive plain" style="align-self:flex-start">Made to order · ships in ${CUSTOM_LEAD}</span>`:''}
            ${iss==='oos'?'<span class="small" style="color:var(--red);font-weight:600">Out of stock — please remove</span>':iss==='insufficient'?`<span class="small" style="color:var(--red);font-weight:600">Only ${st} left — reduce quantity</span>`:iss==='unavailable'?'<span class="small" style="color:var(--red);font-weight:600">No longer available</span>':!i.custom&&st<=S.settings.lowStock?`<span class="small" style="color:var(--amber-ink);font-weight:600">Only ${st} left</span>`:''}
            <div class="row line-actions" style="margin-top:6px"><div class="qty"><button data-act="cart-qty" data-i="${ix}" data-d="-1" aria-label="Decrease" ${i.qty<=1?'disabled':''}>−</button><input value="${i.qty}" aria-label="Quantity" readonly><button data-act="cart-qty" data-i="${ix}" data-d="1" aria-label="Increase" ${i.qty>=st?'disabled':''}>+</button></div><button class="btn btn-ghost btn-sm" data-act="cart-rm" data-i="${ix}">${ic('trash')} Remove</button></div></div>
          <b>${peso(lineTotal(i))}</b></div>`; }).join('')}</div>
      <div class="card summary"><h3>Order summary</h3><div class="divider"></div>
        <div class="sum-row"><span class="muted">Subtotal</span><span>${peso(sub)}</span></div><div class="sum-row"><span class="muted">Shipping</span><span>${ship?peso(ship):'Free'}</span></div>
        ${ship?`<div class="notice n-lime small" style="margin:8px 0">${ic('truck')}<div>Add ${peso(FREE_SHIP_MIN-sub)} more for free delivery.</div></div>`:''}
        <div class="sum-row total"><span>Total</span><span>${peso(sub+ship)}</span></div>
        <button class="btn btn-primary btn-lg btn-block" style="margin-top:16px" data-act="to-checkout" ${blocked?'disabled':''}>Proceed to checkout ${ic('arrowR')}</button>
        <a class="btn btn-ghost btn-block" href="#/catalog" style="margin-top:6px">Continue shopping</a>
        <p class="xs muted" style="margin-top:10px">${me()?.role==='customer'?'You\'re signed in — next you\'ll confirm delivery and payment method.':'You\'ll be asked to sign in or create an account before placing the order.'}</p></div>
    </div></div>`, {title:'Cart'});
});
on('cart-qty', a => { const i=S.cart[a.dataset.i]; const n=i.qty+Number(a.dataset.d); if (i.custom){ if (n>CUSTOM_MAX_QTY){ toast(`Up to ${CUSTOM_MAX_QTY} pieces per design`,'warn'); return; } } else { const r=variantBySku(i.sku); if (n>r.v.stock){ toast(`Insufficient stock — only ${r.v.stock} available`,'warn'); return; } } i.qty=Math.max(1,n); save(); render(); });
on('cart-rm', a => { const i=S.cart[a.dataset.i]; confirmModal({title:'Remove item?', body:`Remove <b>${esc(i.name)}</b> (${esc(i.color)}, ${i.size}) from your cart?`, ok:'Remove', danger:true, icon:'trash', onOk:()=>{ S.cart.splice(a.dataset.i,1); save(); closeModal(); toast('Item removed from cart','ok'); render(); }}); });
on('to-checkout', () => { if (me()?.role!=='customer'){ SS.set('after-login','/checkout'); toast('Sign in or create an account to place your order','warn'); go('/login?next=checkout'); } else go('/checkout'); });

/* ---------------- Portal: login / register / forgot (shared with staff/admin role tabs) ---------------- */
function portal(inner, roleTab){
  return `<div data-title="Sign in"><div class="portal">
    <div style="text-align:center;margin-bottom:22px"><img class="seal-img" src="assets/logo.png" alt="Merly's Scrubsuits logo" width="112" height="112">
    <div class="eyebrow" style="margin-top:18px">Tailored Medical Workwear</div><h1 style="margin:6px 0">Merly's Portal</h1><p class="muted">Ergonomic scrubs built for frontline healthcare champions.</p></div>
    <div class="card"><div class="seg" role="tablist" aria-label="Account type">${[['customer','bag','Customer'],['staff','archive','Staff'],['admin','shield','Admin']].map(([r,i,l])=>`<button role="tab" aria-selected="${roleTab===r}" class="${roleTab===r?'is-active':''}" data-act="go" data-to="${r==='customer'?'/login':'/portal?role='+r}">${ic(i)} ${l}</button>`).join('')}</div>
    <div style="margin-top:16px">${inner}</div></div>
    <div class="row" style="justify-content:center;margin-top:20px;gap:10px"><a class="btn btn-ghost btn-sm" href="#/">${ic('arrowL')} Back to storefront</a></div>
  </div>${demoBar()}</div>`;
}
route('/login', ({query}) => portal(`
  <div class="seg" style="background:var(--muted)"><button class="is-active">${ic('login')} Sign in</button><button data-act="go" data-to="/register">${ic('userPlus')} Create customer account</button></div>
  ${query.next==='checkout'?`<div class="notice n-info" style="margin-top:14px">${ic('cart')}<div>Your cart is saved. Sign in or create an account to complete your order.</div></div>`:''}
  <div class="role-note" style="margin-top:14px">${ic('wand')}<div style="flex:1"><b class="small">E-commerce shopper</b><div class="small muted">No MIS access. Browse, buy and track orders.</div></div><button class="btn btn-outline btn-sm" data-act="fill-demo" data-email="maria.santos@email.com" data-pw="Customer@123">${ic('wand')} Demo preset</button></div>
  ${loginForm('customer')}
  <div class="divider"></div><p class="small" style="text-align:center">New to Merly's? <a href="#/register" class="b">Create customer account</a></p>`, 'customer'));
route('/portal', ({query}) => { const r = query.role==='admin'?'admin':'staff';
  return portal(`<div class="role-note">${ic(r==='admin'?'shield':'archive')}<div style="flex:1"><b class="small">${r==='admin'?'Administrator':'Atelier staff'}</b><div class="small muted">${r==='admin'?'Full MIS: products, users, roles, reports.':'Orders, payment verification and inventory.'}</div></div><button class="btn btn-outline btn-sm" data-act="fill-demo" data-email="${r==='admin'?'admin@merlys.ph':'staff@merlys.ph'}" data-pw="${r==='admin'?'Admin@123':'Staff@123'}">${ic('wand')} Demo preset</button></div>
    ${loginForm(r)}
    <div class="notice n-lime small" style="margin-top:14px">${ic('info')}<div>${r==='admin'?'Administrator':'Staff'} accounts are provisioned by the system administrator. There is no public registration for internal accounts.</div></div>`, r); });
function loginForm(role){
  return `<form data-form="login" data-role="${role}" novalidate class="col" style="gap:14px;margin-top:16px">
    ${field({name:'email', label:role==='customer'?'Registered email':'Work email', type:'email', icon:'user', ph:role==='customer'?'e.g. maria.santos@email.com':'name@merlys.ph', required:true, attrs:'autocomplete="email"'})}
    <div class="field"><div class="row between"><label class="label" for="pw">Password <span class="req">*</span></label>${role==='customer'?'<a href="#/forgot" class="xs b">Forgot?</a>':'<span class="xs muted">Forgot? Ask your administrator</span>'}</div>
      <div class="input-wrap">${ic('lock')}<input class="input" id="pw" name="password" type="password" placeholder="Enter your account password" autocomplete="current-password"><span class="trail"><button type="button" class="btn btn-ghost btn-sm" data-act="toggle-pw" aria-label="Show password">${ic('eye')}</button></span></div><div class="err" role="alert"></div></div>
    <div id="login-err"></div>
    <button class="btn btn-primary btn-lg btn-block" type="submit" data-loading="Signing in…">Sign in${role==='customer'?' to account':' to MIS'} ${ic('arrowR')}</button></form>`;
}
on('fill-demo', a => { const f=document.querySelector('form[data-form=login]'); f.email.value=a.dataset.email; f.password.value=a.dataset.pw; toast('Demo credentials filled — press Sign in','ok'); });
on('form:login', async f => {
  const role = f.dataset.role;
  if (!validate(f, {email:[req('Email is required'), isEmail], password:[req('Password is required')]})) return;
  const btn=f.querySelector('button[type=submit]'); await busy(btn, 700);
  const u = S.users.find(x=>x.email.toLowerCase()===f.email.value.trim().toLowerCase());
  const errBox = f.querySelector('#login-err');
  const fail = msg => { errBox.innerHTML = `<div class="notice n-err">${ic('xc')}<div>${msg}</div></div>`; };
  if (!u || u.password!==f.password.value) return fail('Incorrect email or password. Please check your details and try again.');
  if (role==='customer' && u.role!=='customer') return fail(`This is a ${u.role} account. Use the <a href="#/portal?role=${u.role}">${u.role==='admin'?'Admin':'Staff'} tab</a> to sign in.`);
  if (role!=='customer' && u.role==='customer') return fail('Customer accounts cannot sign in to the MIS. Use the Customer tab.');
  if (role==='staff' && u.role==='admin') return fail('This is an administrator account. Use the <a href="#/portal?role=admin">Admin tab</a>.');
  if (role==='admin' && u.role==='staff') return fail('Staff accounts do not have administrator access. Use the <a href="#/portal?role=staff">Staff tab</a>.');
  if (u.status!=='Active') return fail(`This account is ${u.status.toLowerCase()}. Contact ${u.role==='customer'?'customer support at (02) 8890-MERLY':'your administrator'}.`);
  S.session={userId:u.id}; save(); toast(`Welcome back, ${u.name.split(' ')[0]}!`,'ok');
  const next = SS.get('after-login'); SS.del('after-login');
  go(next && ((u.role==='customer') === !next.startsWith('/mis')) ? next : (u.role==='customer'?'/account':'/mis'));
});
route('/register', () => portal(`
  <div class="seg"><button data-act="go" data-to="/login">${ic('login')} Sign in</button><button class="is-active">${ic('userPlus')} Create customer account</button></div>
  <form data-form="register" novalidate class="col" style="gap:14px;margin-top:16px">
    <div class="grid g2">${field({name:'first', label:'First name', required:true, ph:'Maria'})}${field({name:'last', label:'Last name', required:true, ph:'Santos'})}</div>
    ${field({name:'email', label:'Email', type:'email', required:true, icon:'mail', ph:'you@email.com'})}
    ${field({name:'phone', label:'Mobile number', required:true, icon:'phone', ph:'0917 123 4567', hint:'Used by our staff to confirm COD orders.'})}
    <div class="grid g2">${field({name:'password', label:'Password', type:'password', required:true, ph:'••••••••', hint:'8+ chars, 1 uppercase, 1 number'})}${field({name:'confirm', label:'Confirm password', type:'password', required:true, ph:'••••••••'})}</div>
    <div class="field"><label class="check"><input type="checkbox" name="terms"> <span class="small">I agree to the Terms of Service and the Data Privacy Act (RA 10173) notice.</span></label><div class="err"></div></div>
    <button class="btn btn-primary btn-lg btn-block" type="submit" data-loading="Creating account…">Create account ${ic('arrowR')}</button>
    <p class="xs muted" style="text-align:center">Staff and administrator accounts cannot be created here.</p></form>`, 'customer'));
on('form:register', async f => {
  const ok = validate(f, {first:[req('First name is required')], last:[req('Last name is required')], email:[req('Email is required'), isEmail, [v=>!S.users.some(u=>u.email.toLowerCase()===v.toLowerCase()), 'An account with this email already exists. Sign in instead.']],
    phone:[req('Mobile number is required'), isPhone], password:[req('Create a password'), strongPw], confirm:[req('Confirm your password'), [(v,fm)=>v===fm.password.value,'Passwords do not match']], terms:[[()=>f.terms.checked,'You must agree before creating an account']]});
  if (!ok) return; await busy(f.querySelector('button[type=submit]'), 800);
  const u = {id:uid('C'), role:'customer', name:f.first.value.trim()+' '+f.last.value.trim(), email:f.email.value.trim(), phone:f.phone.value.trim(), password:f.password.value, status:'Active', created:new Date().toISOString().slice(0,10), address:null};
  S.users.push(u); S.session={userId:u.id}; save();
  toast('Account created — welcome to Merly\'s!','ok');
  const next = SS.get('after-login'); SS.del('after-login'); go(next||'/account');
});
route('/forgot', ({query}) => portal(query.sent ? `<div class="empty" style="padding:20px">${'<div class="ei">'+ic('mail')+'</div>'}<h3>Check your email</h3><p class="muted small">If an account exists for <b>${esc(query.sent)}</b>, we've sent a password reset link. It expires in 30 minutes.</p><p class="xs muted">(Prototype: no email is actually sent.)</p><div class="row"><a class="btn btn-outline" href="#/login">Back to sign in</a><a class="btn btn-ghost" href="#/reset">Open reset link (demo)</a></div></div>`
  : `<h3>Reset your password</h3><p class="small muted" style="margin:6px 0 14px">Enter the email you registered with and we'll send you a reset link.</p>
  <form data-form="forgot" novalidate class="col" style="gap:14px">${field({name:'email', label:'Registered email', type:'email', icon:'mail', required:true, ph:'you@email.com'})}
  <button class="btn btn-primary btn-lg btn-block" data-loading="Sending…">Send reset link</button><a class="btn btn-ghost btn-block" href="#/login">${ic('arrowL')} Back to sign in</a></form>`, 'customer'));
on('form:forgot', async f => { if (!validate(f,{email:[req('Email is required'), isEmail]})) return; await busy(f.querySelector('button'),700); SS.set('reset-email', f.email.value.trim()); go('/forgot?sent='+encodeURIComponent(f.email.value.trim())); });
route('/reset', () => portal(`<h3>Set a new password</h3><p class="small muted" style="margin:6px 0 14px">For ${esc(SS.get('reset-email')||'your account')}</p>
  <form data-form="reset" novalidate class="col" style="gap:14px">${field({name:'password', label:'New password', type:'password', required:true, hint:'8+ chars, 1 uppercase, 1 number'})}${field({name:'confirm', label:'Confirm new password', type:'password', required:true})}<button class="btn btn-primary btn-lg btn-block" data-loading="Saving…">Update password</button></form>`, 'customer'));
on('form:reset', async f => { if (!validate(f,{password:[req('Enter a new password'), strongPw], confirm:[req('Confirm the password'), [(v,fm)=>v===fm.password.value,'Passwords do not match']]})) return; await busy(f.querySelector('button'),700);
  const u=S.users.find(x=>x.email===SS.get('reset-email')); if(u){ u.password=f.password.value; save(); } toast('Password updated — you can now sign in','ok'); go('/login'); });

/* ---------------- Checkout ---------------- */
let CO = {};
route('/checkout', () => {
  if (!S.cart.length) return shop(`<div class="container" style="max-width:760px"><div class="card" style="margin-top:24px">${emptyState('cart','Nothing to check out','Your cart is empty. Add products before checking out.',`<a class="btn btn-primary" href="#/catalog">Browse catalog</a>`)}</div></div>`,{title:'Checkout'});
  const u = me();
  const sub = S.cart.reduce((a,i)=>a+lineTotal(i),0), ship = sub>=FREE_SHIP_MIN?0:SHIPPING_FEE;
  CO.method = CO.method || 'gcash';
  const a = u.address || {};
  return shop(`<div class="container"><nav class="crumbs"><a href="#/cart">Cart</a>›<b>Checkout</b></nav>
    <div class="stepper"><div class="s done"><span class="n">${ic('check')}</span>Cart</div><span class="line"></span><div class="s done"><span class="n">${ic('check')}</span>Account</div><span class="line"></span><div class="s cur"><span class="n">3</span>Delivery & payment</div><span class="line"></span><div class="s"><span class="n">4</span>Pay & verify</div></div>
    <form data-form="checkout" novalidate class="checkout-layout" style="display:grid;grid-template-columns:1.5fr 1fr;gap:24px;align-items:start">
    <div class="col" style="gap:20px">
      <div class="card"><div class="card-h"><h3>1. Contact</h3><span class="small muted">Signed in as ${esc(u.email)}</span></div>
        <div class="grid g2">${field({name:'name', label:'Full name', required:true, value:u.name})}${field({name:'phone', label:'Mobile number', required:true, value:u.phone||'', ph:'0917 123 4567'})}</div></div>
      <div class="card"><div class="card-h"><h3>2. Delivery address</h3>${u.address?'<span class="badge b-lime plain">Saved address</span>':''}</div>
        <div class="col">${field({name:'line', label:'House / unit, street, barangay', required:true, value:a.line||'', ph:'Unit 12B, 125 Ayala Ave., Bel-Air'})}
        <div class="grid g3">${field({name:'city', label:'City / municipality', required:true, value:a.city||''})}${field({name:'province', label:'Province', required:true, value:a.province||'', options:[['','Select…'],'Metro Manila','Cavite','Laguna','Bulacan','Rizal','Cebu','Davao del Sur','Other']})}${field({name:'zip', label:'ZIP', required:true, value:a.zip||'', ph:'1226', attrs:'inputmode="numeric" maxlength="4"'})}</div>
        <label class="check"><input type="checkbox" name="saveAddr" checked><span class="small">Save this address to my account</span></label></div></div>
      <div class="card"><div class="card-h"><h3>3. Payment method</h3><a class="small b" href="#/help/payments">How verification works</a></div>
        <div class="col" role="radiogroup">${Object.entries(PAY_METHODS).map(([k,m])=>`<label class="pay-opt ${CO.method===k?'is-active':''}"><input type="radio" name="method" value="${k}" ${CO.method===k?'checked':''} data-change="co-method"><div style="flex:1"><b>${m.label}</b><div class="small muted">${k==='cod'?'Pay in cash when your order arrives or at atelier pickup. Our staff will call to confirm before processing.':'Transfer the exact amount, then submit your reference number and receipt screenshot. Staff verify payments manually (usually within 1 business day).'}</div></div>${k!=='cod'?'<span class="badge b-blue plain">Manual verification</span>':'<span class="badge b-amber plain">Phone confirmation</span>'}</label>`).join('')}</div>
        ${field({name:'notes', label:'Order notes (optional)', textarea:true, ph:'e.g. Deliver to hospital lobby, 2nd floor nurses station'})}</div>
    </div>
    <div class="card summary"><h3>Review your order</h3><div class="divider"></div>
      ${S.cart.map(i=>`<div class="row top" style="margin-bottom:12px">${lineThumb(i,48)}<div style="flex:1"><div class="small b">${esc(i.name)}</div><div class="xs muted">${lineDesc(i)} · Qty ${i.qty}${i.embroidery?' · Embroidery':''}</div></div><span class="small b">${peso(lineTotal(i))}</span></div>`).join('')}
      <div class="divider"></div><div class="sum-row"><span class="muted">Subtotal</span><span>${peso(sub)}</span></div><div class="sum-row"><span class="muted">Shipping</span><span>${ship?peso(ship):'Free'}</span></div><div class="sum-row total"><span>Total</span><span>${peso(sub+ship)}</span></div>
      <div id="co-err"></div>
      <button class="btn btn-primary btn-lg btn-block" type="submit" style="margin-top:14px" data-loading="Placing order…">Place order · ${peso(sub+ship)}</button>
      ${S.cart.some(i=>i.custom)?`<div class="notice n-lime small" style="margin-top:12px">${ic('wand')}<div>Your order includes made-to-order designs. Production starts after payment is verified and takes ${CUSTOM_LEAD}.</div></div>`:''}<p class="xs muted" style="margin-top:10px">Placing the order does <b>not</b> charge you. Your order is reserved as <b>Awaiting Payment</b> until you submit payment details and our staff verify them.</p>
      <a class="btn btn-ghost btn-block btn-sm" href="#/cart">${ic('arrowL')} Edit cart</a></div>
    </form></div>`, {title:'Checkout'});
}, {auth:'customer'});
on('co-method', a => { CO.method=a.value; document.querySelectorAll('.pay-opt').forEach(l=>l.classList.toggle('is-active', l.querySelector('input').checked)); });
on('form:checkout', async f => {
  const ok = validate(f, {name:[req('Full name is required')], phone:[req('Mobile number is required'), isPhone], line:[req('Street address is required')], city:[req('City is required')], province:[req('Select a province')], zip:[req('ZIP code is required'), [v=>/^\d{4}$/.test(v),'ZIP must be 4 digits']]});
  if (!ok){ f.querySelector('#co-err').innerHTML = `<div class="notice n-err" style="margin-top:12px">${ic('alert')}<div>Some required delivery information is missing. Please check the highlighted fields.</div></div>`; return; }
  // re-check stock at submit time
  for (const i of S.cart){ if (i.custom) continue; const r=variantBySku(i.sku); const have=S.cart.filter(x=>x.sku===i.sku).reduce((a,x)=>a+x.qty,0); if (!r || r.v.stock<have){ f.querySelector('#co-err').innerHTML = `<div class="notice n-err" style="margin-top:12px">${ic('alert')}<div><b>Insufficient stock</b> for ${esc(i.name)} (${esc(i.color)}, ${i.size}). Only ${r?r.v.stock:0} left. <a href="#/cart">Update your cart</a>.</div></div>`; return; } }
  await busy(f.querySelector('button[type=submit]'), 900);
  const u = me(); const address={line:f.line.value.trim(), city:f.city.value.trim(), province:f.province.value, zip:f.zip.value.trim()};
  if (f.saveAddr.checked){ u.address=address; u.phone=f.phone.value.trim(); }
  const sub = S.cart.reduce((a,i)=>a+lineTotal(i),0), ship = sub>=FREE_SHIP_MIN?0:SHIPPING_FEE;
  const n = 143 + S.orders.filter(o=>!o.id.startsWith('SO-26-01')||Number(o.id.slice(-3))>142).length;
  const id = 'SO-26-0'+String(n).padStart(3,'0');
  const method = f.method.value;
  const o = {id, customerId:u.id, customerName:f.name.value.trim(), email:u.email, phone:f.phone.value.trim(), address, created:new Date().toISOString(), items:S.cart.map(i=>({...i})), subtotal:sub, shipping:ship, total:sub+ship, method,
    status:'Awaiting Payment', paymentStatus: method==='cod'?'Cash on Delivery':'Not Submitted', history:[{status:'Awaiting Payment', at:new Date().toISOString(), by:'System', note:'Order placed by customer'}], stockDeducted:false, notes:f.notes.value.trim()};
  S.orders.unshift(o); S.cart=[]; CO={}; save();
  go('/order-placed/'+id);
});

/* ---------------- Order confirmation + payment instructions ---------------- */
function payInstructions(o){
  const m = PAY_METHODS[o.method];
  if (o.method==='cod') return `<div class="notice n-warn">${ic('phone')}<div><b>Cash on Delivery</b> — no online payment needed. Our staff will call ${esc(o.phone)} to confirm your order before it is processed. Prepare <b>${peso(o.total)}</b> in cash for the courier or atelier pickup.</div></div>`;
  return `<div class="col" style="gap:12px"><div class="card flat tight"><div class="small muted">Send exactly</div><div style="font-size:28px;font-weight:800">${peso(o.total)}</div><div class="small">to <b>${esc(o.method==='gcash'?S.settings.gcash:S.settings.bank)}</b></div><div class="small muted" style="margin-top:6px">Put <b>${o.id}</b> in the message / remarks field.</div></div>
  <ol class="small" style="margin:0;padding-left:18px;line-height:1.9"><li>Open ${o.method==='gcash'?'the GCash app → Send Money':'your bank app or visit a BDO branch'}.</li><li>Transfer the exact amount above.</li><li>Screenshot the receipt showing the reference number.</li><li>Submit the reference number and receipt below. Staff will verify it manually — usually within 1 business day.</li></ol></div>`;
}
route('/order-placed/:id', ({params}) => {
  const o = S.orders.find(x=>x.id===params.id && x.customerId===me().id); if (!o) return shop(notFound());
  return shop(`<div class="container" style="max-width:820px">
    <div class="stepper" style="margin-top:20px"><div class="s done"><span class="n">${ic('check')}</span>Cart</div><span class="line"></span><div class="s done"><span class="n">${ic('check')}</span>Account</div><span class="line"></span><div class="s done"><span class="n">${ic('check')}</span>Delivery & payment</div><span class="line"></span><div class="s cur"><span class="n">4</span>Pay & verify</div></div>
    <div class="card" style="text-align:center"><div class="ei" style="width:72px;height:72px;border-radius:50%;background:var(--green-bg);color:var(--green);display:grid;place-items:center;margin:0 auto 12px">${ic('checkC')}</div>
      <h1>Order placed!</h1><p class="muted" style="margin-top:6px">Order <b>${o.id}</b> · ${fmtDT(o.created)} · ${peso(o.total)}</p>
      <div class="row" style="justify-content:center;margin-top:10px">${badge(o.status)}${badge(o.paymentStatus)}</div>
      <p class="small muted" style="margin-top:10px">A confirmation was sent to ${esc(o.email)}. ${o.method==='cod'?'We will call you to confirm.':'Your order will be processed after your payment is verified.'}</p></div>
    <div class="card" style="margin-top:18px"><h3 style="margin-bottom:14px">${o.method==='cod'?'What happens next':'Payment instructions'}</h3>${payInstructions(o)}
      <div class="row wrap" style="margin-top:18px">${o.method!=='cod'?`<a class="btn btn-primary btn-lg" href="#/pay/${o.id}">${ic('upload')} Submit payment details</a>`:''}<a class="btn btn-outline btn-lg" href="#/account/orders/${o.id}">View order status</a><a class="btn btn-ghost" href="#/catalog">Continue shopping</a></div></div>
  </div>`, {title:'Order placed'});
}, {auth:'customer'});

/* ---------------- Payment submission (manual — never auto-verified) ---------------- */
let PROOF = null;
route('/pay/:id', ({params}) => {
  const o = S.orders.find(x=>x.id===params.id && x.customerId===me().id); if (!o) return shop(notFound());
  const last = S.payments.filter(p=>p.orderId===o.id).sort((a,b)=>b.submitted.localeCompare(a.submitted))[0];
  if (o.method==='cod') return shop(`<div class="container" style="max-width:720px"><div class="card" style="margin-top:24px">${emptyState('cash','No online payment needed','This is a Cash on Delivery order. Payment is recorded by our staff when cash is collected.',`<a class="btn btn-primary" href="#/account/orders/${o.id}">View order</a>`)}</div></div>`);
  if (o.paymentStatus==='Pending Verification' || o.paymentStatus==='Verified') return shop(`<div class="container" style="max-width:720px"><div class="card" style="margin-top:24px">${paymentStatusCard(o,last)}<div class="row" style="margin-top:16px"><a class="btn btn-primary" href="#/account/orders/${o.id}">Track order</a></div></div></div>`, {title:'Payment status'});
  if (o.status==='Cancelled') return shop(`<div class="container" style="max-width:720px"><div class="card" style="margin-top:24px">${emptyState('ban','Order cancelled','Payments can no longer be submitted for this order.')}</div></div>`);
  PROOF = null;
  return shop(`<div class="container" style="max-width:980px"><nav class="crumbs"><a href="#/account">My account</a>›<a href="#/account/orders/${o.id}">${o.id}</a>›<b>Submit payment</b></nav>
    <div class="grid" style="grid-template-columns:1.3fr 1fr;align-items:start" id="pay-grid">
    <form class="card col" data-form="pay" data-id="${o.id}" novalidate style="gap:16px">
      <div><h2>Submit payment details</h2><p class="small muted">Order ${o.id} · ${PAY_METHODS[o.method].label}</p></div>
      ${o.paymentStatus==='Rejected' && last?.reason?`<div class="notice n-err">${ic('xc')}<div><b>Your previous payment was rejected.</b><br>Reason: ${esc(last.reason)}<br><span class="xs">Please re-submit with the correct details.</span></div></div>`:''}
      <div class="grid g2">${field({name:'ref', label:'Reference number', required:true, ph:o.method==='gcash'?'13-digit GCash ref no.':'Bank transaction ref.', icon:'receipt'})}${field({name:'amount', label:'Amount sent (₱)', required:true, value:o.total, attrs:'inputmode="decimal"'})}</div>
      <div class="grid g2">${field({name:'payer', label:'Sender name / account', required:true, value:o.customerName})}${field({name:'paidAt', label:'Date of transfer', type:'date', required:true, value:new Date().toISOString().slice(0,10)})}</div>
      <div class="field"><span class="label">Receipt screenshot <span class="req">*</span></span>
        <div id="proof-area"><label class="dropzone" tabindex="0"><input type="file" accept="image/*,application/pdf" class="sr-only" data-change="proof">${ic('upload','')}<div class="b" style="margin-top:6px">Click to upload or drag & drop</div><div class="xs muted">JPG, PNG or PDF · max 5 MB</div></label></div><div class="err" id="proof-err">Upload a screenshot of your transfer receipt.</div></div>
      ${field({name:'note', label:'Note to staff (optional)', textarea:true, ph:'Anything we should know about this payment'})}
      <div class="notice n-info small">${ic('info')}<div>Submitting does <b>not</b> mark your order as paid. It will show <b>Pending Verification</b> until a staff member checks it against our ${o.method==='gcash'?'GCash':'BDO'} records.</div></div>
      <button class="btn btn-primary btn-lg" data-loading="Uploading…">${ic('upload')} Submit for verification</button>
    </form>
    <div class="card"><h3 style="margin-bottom:12px">Payment instructions</h3>${payInstructions(o)}</div></div></div>`, {title:'Submit payment'});
}, {auth:'customer'});
on('proof', a => { const file=a.files[0]; if (!file) return;
  if (file.size > 5*1024*1024){ document.getElementById('proof-err').closest('.field').classList.add('has-error'); document.getElementById('proof-err').textContent='File is larger than 5 MB. Please upload a smaller image.'; return; }
  PROOF = file.name; document.getElementById('proof-err').closest('.field').classList.remove('has-error');
  document.getElementById('proof-area').innerHTML = `<div class="proof-prev"><div class="proof-img">GCash</div><div style="flex:1"><b class="small">${esc(file.name)}</b><div class="xs muted">${Math.max(1,Math.round(file.size/1024))} KB · ready to submit</div></div><button type="button" class="btn btn-ghost btn-sm" data-act="proof-rm">${ic('trash')} Remove</button></div>`; });
on('proof-rm', () => { PROOF=null; render(); });
on('form:pay', async f => {
  const o = S.orders.find(x=>x.id===f.dataset.id);
  let ok = validate(f, {ref:[req('Reference number is required'), minLen(6,'Reference number looks too short')], amount:[req('Enter the amount you sent'), [v=>Number(v)>0,'Enter a valid amount']], payer:[req('Sender name is required')], paidAt:[req('Select the transfer date')]});
  if (!PROOF){ document.getElementById('proof-err').closest('.field').classList.add('has-error'); ok=false; }
  if (!ok) return;
  if (Number(f.amount.value) < o.total){ confirmModal({title:'Amount is less than the order total', body:`You entered ${peso(f.amount.value)} but the order total is <b>${peso(o.total)}</b>. Staff may reject an underpayment. Submit anyway?`, ok:'Submit anyway', icon:'alert', onOk:()=>{ closeModal(); submitPay(f,o); }}); return; }
  submitPay(f,o);
});
async function submitPay(f,o){
  await busy(f.querySelector('button.btn-primary'), 1000);
  const p = {id:uid('PAY'), orderId:o.id, customerName:o.customerName, method:o.method, amount:Number(f.amount.value), ref:f.ref.value.trim(), payer:f.payer.value.trim(), paidAt:new Date(f.paidAt.value).toISOString(), submitted:new Date().toISOString(), proof:PROOF, note:f.note.value.trim(), status:'Pending Verification'};
  S.payments.unshift(p); o.paymentStatus='Pending Verification'; o.status='Pending Verification'; addHistory(o,'Pending Verification',o.customerName, o.history.some(h=>h.note?.includes('rejected'))?'Payment re-submitted':'Payment details submitted'); save();
  PROOF=null; go('/payment-submitted/'+o.id);
}
route('/payment-submitted/:id', ({params}) => { const o=S.orders.find(x=>x.id===params.id && x.customerId===me().id); if(!o) return shop(notFound());
  const p = S.payments.find(x=>x.orderId===o.id && x.status==='Pending Verification');
  return shop(`<div class="container" style="max-width:720px"><div class="card" style="margin-top:28px;text-align:center">
    <div style="width:72px;height:72px;border-radius:50%;background:var(--blue-bg);color:var(--blue);display:grid;place-items:center;margin:0 auto 12px">${ic('clock')}</div>
    <h1>Payment submitted</h1><p class="muted" style="margin:6px 0 12px">We received your ${PAY_METHODS[o.method].short} details for order <b>${o.id}</b>.</p>${badge('Pending Verification')}
    <div class="card flat tight" style="text-align:left;margin-top:18px"><dl class="kv"><dt>Reference no.</dt><dd>${esc(p?.ref)}</dd><dt>Amount</dt><dd>${peso(p?.amount||0)}</dd><dt>Receipt</dt><dd>${esc(p?.proof)}</dd><dt>Submitted</dt><dd>${fmtDT(p?.submitted)}</dd></dl></div>
    <p class="small muted" style="margin-top:14px">Our staff will check this against our ${o.method==='gcash'?'GCash':'bank'} records, usually within 1 business day. You'll see the result in <b>My orders</b> and <b>Payments</b>.</p>
    <div class="row" style="justify-content:center;margin-top:18px"><a class="btn btn-primary" href="#/account/orders/${o.id}">Track this order</a><a class="btn btn-outline" href="#/account/payments">View payment history</a></div></div></div>`, {title:'Payment submitted'}); }, {auth:'customer'});
function paymentStatusCard(o, p){
  if (!p) return `<div class="notice n-warn">${ic('alert')}<div>No payment submitted yet.</div></div>`;
  const map = {'Pending Verification':['n-info','clock','Awaiting staff verification','We are checking your transfer against our records.'],'Verified':['n-ok','checkC','Payment verified',`Verified by ${esc(p.reviewedBy||'staff')} on ${p.reviewedAt?fmtDT(p.reviewedAt):''}.`],'Rejected':['n-err','xc','Payment rejected','Reason: '+esc(p.reason||'')]};
  const [c,i,t,d] = map[p.status];
  return `<div class="notice ${c}">${ic(i)}<div><b>${t}</b><div class="small">${d}</div><div class="xs" style="margin-top:4px">Ref ${esc(p.ref)} · ${peso(p.amount)} · submitted ${fmtDT(p.submitted)}</div></div></div>`;
}

/* ---------------- Customer account ---------------- */
function acct(content, active, title){
  const items=[['/account','grid','Overview','ov'],['/account/orders','bag','My orders','or'],['/account/payments','wallet','Payments','pa'],['/account/profile','settings','Profile & settings','pr']];
  return shop(`<div class="container"><nav class="crumbs"><a href="#/">Home</a>›<a href="#/account">My account</a>${active!=='ov'?`›<b>${title}</b>`:''}</nav>
    <div style="display:grid;grid-template-columns:220px 1fr;gap:24px;align-items:start" class="cart-layout">
    <aside class="card tight col" style="gap:4px"><div class="row" style="padding:6px 6px 12px"><span class="avatar">${initials(me().name)}</span><div><b class="small">${esc(me().name)}</b><div class="xs muted">Customer</div></div></div>
      ${items.map(([h,i,l,k])=>`<a href="#${h}" class="btn ${active===k?'btn-secondary':'btn-ghost'}" style="justify-content:flex-start">${ic(i)} ${l}</a>`).join('')}
      <button class="btn btn-ghost" style="justify-content:flex-start" data-act="logout">${ic('logout')} Sign out</button></aside>
    <div class="col" style="gap:18px;min-width:0">${content}</div></div></div>`, {title});
}
const myOrders = () => S.orders.filter(o=>o.customerId===me().id).sort((a,b)=>b.created.localeCompare(a.created));
route('/account', () => {
  const os = myOrders(); const needPay = os.filter(o=>o.status==='Awaiting Payment' && o.method!=='cod');
  const notes = S.notifications.filter(n=>n.userId===me().id).slice(0,5);
  S.notifications.filter(n=>n.userId===me().id).forEach(n=>n.read=true); save();
  return acct(`<div><h1>Hello, ${esc(me().name.split(' ')[0])} 👋</h1><p class="muted">Here's what's happening with your orders.</p></div>
    ${needPay.map(o=>`<div class="notice ${o.paymentStatus==='Rejected'?'n-err':'n-warn'}">${ic(o.paymentStatus==='Rejected'?'xc':'alert')}<div style="flex:1"><b>${o.id}</b> ${o.paymentStatus==='Rejected'?'— payment was rejected. Please re-submit.':'is awaiting your payment.'}</div><a class="btn btn-sm btn-primary" href="#/pay/${o.id}">${o.paymentStatus==='Rejected'?'Re-submit':'Submit payment'}</a></div>`).join('')}
    <div class="grid g4">${[['Total orders',os.length,'bag'],['Awaiting payment',os.filter(o=>o.status==='Awaiting Payment').length,'wallet'],['Being verified',os.filter(o=>o.status==='Pending Verification').length,'clock'],['In progress',os.filter(o=>['Processing','Ready to Ship','Shipped'].includes(o.status)).length,'truck']].map(([l,v,i])=>`<div class="kpi"><div class="row between"><span class="k-label">${l}</span><span class="k-icon">${ic(i)}</span></div><span class="k-val">${v}</span></div>`).join('')}</div>
    <div class="card"><div class="card-h"><h3>Recent orders</h3><a href="#/account/orders" class="small b">View all</a></div>${os.length?orderTable(os.slice(0,4)):emptyState('bag','No orders yet','When you place an order it will appear here.',`<a class="btn btn-primary" href="#/catalog">Start shopping</a>`)}</div>
    ${notes.length?`<div class="card"><h3 style="margin-bottom:10px">Updates</h3>${notes.map(n=>`<a href="#${n.link}" class="row" style="padding:10px 0;border-top:1px solid var(--border);color:var(--ink)">${ic('bell')}<span class="small" style="flex:1">${esc(n.text)}</span><span class="xs muted">${fmtDT(n.at)}</span></a>`).join('')}</div>`:''}`, 'ov', 'Overview');
}, {auth:'customer'});
function orderTable(os){
  return `<div class="table-wrap"><table class="t stack"><thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th></th></tr></thead><tbody>
    ${os.map(o=>`<tr class="clickable" data-act="go" data-to="/account/orders/${o.id}"><td data-l="Order" class="b">${o.id}</td><td data-l="Date">${fmtDate(o.created)}</td><td data-l="Items">${o.items.reduce((a,i)=>a+i.qty,0)}</td><td data-l="Total" class="num b">${peso(o.total)}</td><td data-l="Payment">${badge(o.paymentStatus)}</td><td data-l="Status">${badge(o.status)}</td><td data-l="" class="num">${ic('chevR','')}</td></tr>`).join('')}</tbody></table></div>`;
}
route('/account/orders', ({query:q}) => {
  const tabs = ['All','Awaiting Payment','Pending Verification','Processing','Shipped','Delivered','Cancelled'];
  const t = q.tab||'All'; let os = myOrders();
  if (t!=='All') os = os.filter(o=> t==='Processing'?['Processing','Ready to Ship'].includes(o.status):o.status===t);
  const page=Number(q.page||1);
  return acct(`<div><h1>My orders</h1><p class="muted small">Track each order through its recorded status updates.</p></div>
    <div class="filters">${tabs.map(x=>`<button class="chip ${t===x?'is-active':''}" data-act="qset" data-q='${JSON.stringify({tab:x==='All'?'':x,page:''})}'>${x} <span class="xs">${x==='All'?myOrders().length:myOrders().filter(o=>x==='Processing'?['Processing','Ready to Ship'].includes(o.status):o.status===x).length}</span></button>`).join('')}</div>
    ${os.length?`${orderTable(paginate(os,page,6))}<div class="table-wrap" style="border-top:none;border-radius:0 0 16px 16px;margin-top:-17px">${pager(os.length,page,6)}</div>`:`<div class="card">${emptyState('bag','No orders in this status',t==='All'?'You haven\'t placed any orders yet.':`You have no orders that are “${t}”.`,`<a class="btn btn-primary" href="#/catalog">Browse catalog</a>`)}</div>`}`, 'or', 'My orders');
}, {auth:'customer'});
function progress(o){
  const steps=['Order placed','Payment verified','Processing','Shipped','Delivered'];
  const map={'Awaiting Payment':0,'Pending Verification':0,'Processing':2,'Ready to Ship':2,'Shipped':3,'Delivered':4};
  let cur=map[o.status]; if (o.method==='cod' && o.status==='Processing') cur=2;
  if (o.paymentStatus==='Verified'||o.paymentStatus==='Cash Collected') cur=Math.max(cur,1);
  return `<div class="progress-h">${steps.map((s,i)=>`<div class="ph ${i<cur?'done':''} ${i===cur?'cur':''}">${o.method==='cod'&&i===1?'Order confirmed':s}</div>`).join('')}</div>`;
}
route('/account/orders/:id', ({params}) => {
  const o = S.orders.find(x=>x.id===params.id && x.customerId===me().id);
  if (!o) return acct(`<div class="card">${emptyState('search','Order not found','This order does not exist or belongs to another account.',`<a class="btn btn-primary" href="#/account/orders">Back to my orders</a>`)}</div>`,'or','Order');
  const pays = S.payments.filter(p=>p.orderId===o.id).sort((a,b)=>b.submitted.localeCompare(a.submitted));
  const canCancel = ['Awaiting Payment'].includes(o.status);
  return acct(`<div class="row between wrap"><div><a href="#/account/orders" class="small b">${ic('arrowL','')} All orders</a><h1 style="margin-top:6px">Order ${o.id}</h1><p class="small muted">Placed ${fmtDT(o.created)} · ${PAY_METHODS[o.method].label}</p></div><div class="row">${badge(o.status)}${badge(o.paymentStatus)}</div></div>
    ${o.status==='Cancelled'?`<div class="notice n-err">${ic('ban')}<div>This order was cancelled. ${esc(o.history.at(-1).note||'')}</div></div>`:`<div class="card">${progress(o)}</div>`}
    ${o.status==='Awaiting Payment' && o.method!=='cod'?`<div class="notice ${o.paymentStatus==='Rejected'?'n-err':'n-warn'}">${ic('wallet')}<div style="flex:1">${o.paymentStatus==='Rejected'?`<b>Payment rejected:</b> ${esc(pays[0]?.reason||'')}`:`<b>Awaiting payment.</b> Send ${peso(o.total)} via ${PAY_METHODS[o.method].short} and submit your reference.`}</div><a class="btn btn-sm btn-primary" href="#/pay/${o.id}">${o.paymentStatus==='Rejected'?'Re-submit payment':'Pay & submit details'}</a></div>`:''}
    ${o.method==='cod'&&o.status==='Awaiting Payment'?`<div class="notice n-warn">${ic('phone')}<div>Cash on Delivery — our staff will call ${esc(o.phone)} to confirm before processing.</div></div>`:''}
    <div class="detail-grid"><div class="card"><h3 style="margin-bottom:8px">Items</h3>${o.items.map(i=>`<div class="cart-line" style="grid-template-columns:64px 1fr auto">${lineThumb(i,56)}<div><b class="small">${esc(i.name)}</b><div class="xs muted">${lineDesc(i)} · Qty ${i.qty}${i.embroidery?` · “${esc(i.embroidery)}”`:''}</div>${i.custom?`<span class="badge b-olive plain">Made to order</span>`:''}</div><b class="small">${peso(lineTotal(i))}</b></div>`).join('')}
      <div class="divider"></div><div class="sum-row small"><span class="muted">Subtotal</span><span>${peso(o.subtotal)}</span></div><div class="sum-row small"><span class="muted">Shipping</span><span>${o.shipping?peso(o.shipping):'Free'}</span></div><div class="sum-row total"><span>Total</span><span>${peso(o.total)}</span></div></div>
      <div class="col" style="gap:16px"><div class="card"><h3 style="margin-bottom:12px">Status history</h3><div class="timeline">${[...o.history].reverse().map((h,i)=>`<div class="tl ${h.status==='Cancelled'||h.note?.includes('rejected')?'bad':i===0?'cur':'done'}"><span class="d">${ic(h.status==='Cancelled'?'x':h.note?.includes('rejected')?'xc':'check')}</span><div><b class="small">${h.status}</b><div class="xs muted">${fmtDT(h.at)}</div><div class="xs">${esc(h.note||'')}</div></div></div>`).join('')}</div>
        <p class="xs muted">Statuses are updated by Merly's staff. Real-time courier tracking is not available.</p></div>
      <div class="card"><h3 style="margin-bottom:10px">Delivery</h3><p class="small">${esc(o.customerName)}<br>${esc(o.phone)}<br>${esc(o.address?.line)}, ${esc(o.address?.city)}, ${esc(o.address?.province)} ${esc(o.address?.zip)}</p></div>
      <div class="card"><h3 style="margin-bottom:10px">Payments</h3>${pays.length?pays.map(p=>`<div style="margin-bottom:10px">${paymentStatusCard(o,p)}</div>`).join(''):`<p class="small muted">${o.method==='cod'?'Cash will be recorded upon delivery.':'No payment submitted yet.'}</p>`}</div>
      ${canCancel?`<button class="btn btn-danger-outline" data-act="cust-cancel" data-id="${o.id}">${ic('ban')} Cancel order</button>`:''}</div></div>`, 'or', o.id);
}, {auth:'customer'});
on('cust-cancel', a => { const o=S.orders.find(x=>x.id===a.dataset.id); confirmModal({title:'Cancel this order?', body:`Order <b>${o.id}</b> (${peso(o.total)}) will be cancelled. This can't be undone. Do not send payment for a cancelled order.`, ok:'Cancel order', cancel:'Keep order', danger:true, onOk:()=>{ if (o.status!=='Awaiting Payment'){ toast('This order can no longer be cancelled','err'); closeModal(); return; } o.status='Cancelled'; addHistory(o,'Cancelled',o.customerName,'Cancelled by customer before payment'); save(); closeModal(); toast('Order cancelled','ok'); render(); }}); });
route('/account/payments', () => {
  const ids = myOrders().map(o=>o.id); const ps = S.payments.filter(p=>ids.includes(p.orderId)).sort((a,b)=>b.submitted.localeCompare(a.submitted));
  return acct(`<div><h1>Payment history</h1><p class="muted small">Each submission and its verification result.</p></div>
    ${ps.length?`<div class="table-wrap"><table class="t stack"><thead><tr><th>Submitted</th><th>Order</th><th>Method</th><th>Reference</th><th class="num">Amount</th><th>Status</th></tr></thead><tbody>${ps.map(p=>`<tr class="clickable" data-act="go" data-to="/account/orders/${p.orderId}"><td data-l="Submitted">${fmtDT(p.submitted)}</td><td data-l="Order" class="b">${p.orderId}</td><td data-l="Method">${PAY_METHODS[p.method].short}</td><td data-l="Reference">${esc(p.ref)}</td><td data-l="Amount" class="num">${peso(p.amount)}</td><td data-l="Status">${badge(p.status)}${p.status==='Rejected'?`<div class="xs" style="color:var(--red);max-width:240px;white-space:normal">${esc(p.reason)}</div>`:''}</td></tr>`).join('')}</tbody></table></div>`
    :`<div class="card">${emptyState('wallet','No payments yet','Payments you submit for your orders will be listed here with their verification status.')}</div>`}`, 'pa', 'Payments');
}, {auth:'customer'});
route('/account/profile', () => { const u=me(); const a=u.address||{};
  return acct(`<div><h1>Profile & settings</h1></div>
    <form class="card col" data-form="profile" novalidate style="gap:14px"><h3>Personal information</h3>
      <div class="grid g2">${field({name:'name', label:'Full name', required:true, value:u.name})}${field({name:'phone', label:'Mobile number', required:true, value:u.phone})}</div>
      ${field({name:'email', label:'Email', value:u.email, attrs:'disabled', hint:'Contact support to change your login email.'})}
      <h3 style="margin-top:6px">Default delivery address</h3>${field({name:'line', label:'Street address', value:a.line||''})}
      <div class="grid g3">${field({name:'city', label:'City', value:a.city||''})}${field({name:'province', label:'Province', value:a.province||''})}${field({name:'zip', label:'ZIP', value:a.zip||''})}</div>
      <div class="row"><button class="btn btn-primary" data-loading="Saving…">Save changes</button><button type="reset" class="btn btn-ghost">Discard</button></div></form>
    <form class="card col" data-form="chpw" novalidate style="gap:14px"><h3>Change password</h3>${field({name:'cur', label:'Current password', type:'password', required:true})}<div class="grid g2">${field({name:'password', label:'New password', type:'password', required:true, hint:'8+ chars, 1 uppercase, 1 number'})}${field({name:'confirm', label:'Confirm new password', type:'password', required:true})}</div><div><button class="btn btn-outline" data-loading="Updating…">Update password</button></div></form>`, 'pr', 'Profile');
}, {auth:'customer'});
on('form:profile', async f => { if (!validate(f,{name:[req('Name is required')], phone:[req('Mobile number is required'), isPhone]})) return; await busy(f.querySelector('.btn-primary'),600); const u=me(); u.name=f.name.value.trim(); u.phone=f.phone.value.trim(); u.address={line:f.line.value.trim(), city:f.city.value.trim(), province:f.province.value.trim(), zip:f.zip.value.trim()}; save(); toast('Profile updated','ok'); render(); });
on('form:chpw', async f => { if (!validate(f,{cur:[req('Enter your current password'), [v=>v===me().password,'Current password is incorrect']], password:[req('Enter a new password'), strongPw], confirm:[req('Confirm the password'), [(v,fm)=>v===fm.password.value,'Passwords do not match']]})) return; await busy(f.querySelector('button'),600); me().password=f.password.value; save(); f.reset(); toast('Password updated','ok'); });

/* ---------------- Help pages ---------------- */
route('/help/payments', () => shop(`<div class="container" style="max-width:820px"><nav class="crumbs"><a href="#/">Home</a>›<b>How payment works</b></nav><div class="card col" style="gap:16px"><h1>How payment works</h1>
  <p class="muted">SMART does not connect to an automated payment gateway. Every online transfer is checked by a person.</p>
  <div class="grid g3">${Object.entries(PAY_METHODS).map(([k,m])=>`<div class="card tight flat"><b>${m.label}</b><p class="small muted" style="margin-top:6px">${esc(m.acct)}</p></div>`).join('')}</div>
  <div class="timeline">${[['Place your order','Status: Awaiting Payment'],['Send the exact amount','GCash or BDO, include your order number'],['Submit reference & receipt','Status: Pending Verification'],['Staff verify manually','Verified → Processing, or Rejected with a reason (you can re-submit)'],['Packed, shipped, delivered','Status updates appear in My orders']].map(([a,b],i)=>`<div class="tl ${i<4?'done':'cur'}"><span class="d">${ic('check')}</span><div><b class="small">${a}</b><div class="xs muted">${b}</div></div></div>`).join('')}</div></div></div>`, {title:'How payment works'}));
route('/help/sizes', () => shop(`<div class="container" style="max-width:820px"><nav class="crumbs"><a href="#/">Home</a>›<b>Size guide</b></nav><div class="card"><h1 style="margin-bottom:14px">Size guide (cm)</h1><div class="table-wrap"><table class="t"><thead><tr><th>Size</th><th class="num">Chest</th><th class="num">Waist</th><th class="num">Hip</th><th class="num">Inseam</th></tr></thead><tbody>${SIZES.map((z,i)=>`<tr><td class="b">${z}</td><td class="num">${82+i*6}</td><td class="num">${66+i*6}</td><td class="num">${88+i*6}</td><td class="num">${74+Math.min(i,4)}</td></tr>`).join('')}</tbody></table></div></div></div>`, {title:'Size guide'}));
