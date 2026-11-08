/* SMART prototype — Internal MIS (Staff + Administrator share screens; role permissions gate modules & actions) */
'use strict';

const NAV = [
  {grp:'Operations'},
  {to:'/mis', icon:'grid', label:'Dashboard', perm:null, key:'dash'},
  {to:'/mis/orders', icon:'clipboard', label:'Orders', perm:'orders', key:'orders', count:()=>S.orders.filter(o=>o.status==='Awaiting Payment'&&o.method==='cod'||['Processing','Ready to Ship'].includes(o.status)).length},
  {to:'/mis/payments', icon:'wallet', label:'Payment verification', perm:'payments', key:'payments', count:()=>S.payments.filter(p=>p.status==='Pending Verification').length},
  {to:'/mis/inventory', icon:'archive', label:'Inventory', perm:'inventoryView', key:'inventory', count:()=>S.products.flatMap(p=>p.variants).filter(v=>v.active&&v.stock<=S.settings.lowStock).length},
  {to:'/mis/transactions', icon:'receipt', label:'Transaction records', perm:'transactions', key:'tx'},
  {grp:'Administration', adminOnly:true},
  {to:'/mis/products', icon:'tag', label:'Products & variants', perm:'products', key:'products'},
  {to:'/mis/customers', icon:'users', label:'Customer accounts', perm:'customers', key:'customers'},
  {to:'/mis/staff', icon:'userPlus', label:'Staff accounts', perm:'staffAccounts', key:'staff'},
  {to:'/mis/roles', icon:'key', label:'Roles & permissions', perm:'staffAccounts', key:'roles'},
  {to:'/mis/reports', icon:'chart', label:'Reports & analytics', perm:'reports', key:'reports'},
  {to:'/mis/settings', icon:'settings', label:'System settings', perm:'settings', key:'settings'},
];
function mis(content, active, title){
  const u = me();
  const nav = NAV.filter(n=> n.grp ? (!n.adminOnly || u.role==='admin') : (!n.perm || can(n.perm))).map(n=> n.grp?`<div class="grp">${n.grp}</div>`:
    `<a class="item ${active===n.key?'is-active':''}" href="#${n.to}" ${active===n.key?'aria-current="page"':''}>${ic(n.icon)} ${n.label}${n.count&&n.count()?`<span class="cnt">${n.count()}</span>`:''}</a>`).join('');
  const pendingPay = S.payments.filter(p=>p.status==='Pending Verification').length;
  const low = S.products.flatMap(p=>p.variants).filter(v=>v.active&&v.stock<=S.settings.lowStock&&v.stock>=0).length;
  return `<div class="mis" id="mis" data-title="${esc(title)}">
  <aside class="sb" aria-label="MIS navigation"><div class="brand"><img class="logo-img" src="assets/logo.png" alt="Merly's Scrubsuits logo" width="44" height="44"><div><b>Merly's Atelier</b><div class="xs muted" style="letter-spacing:.08em">SMART · MIS</div></div></div>
    <div class="floor"><span class="row" style="gap:6px"><span style="width:7px;height:7px;border-radius:50%;background:var(--green)"></span>Signed in as</span><span>${u.role.toUpperCase()}</span></div>
    <nav class="col" style="gap:2px">${nav}</nav><div class="spacer"></div>
    <a class="item" href="#/mis/profile">${ic('user')} My profile</a><a class="item" href="#/">${ic('store')} View storefront ${ic('ext','')}</a></aside>
  <div style="min-width:0">
    <div class="topbar"><button class="icon-btn mis-burger" data-act="sb-toggle" aria-label="Open navigation">${ic('menu')}</button>
      <form class="search" data-form="mis-search" role="search"><label class="sr-only" for="ms">Search orders</label>${ic('search')}<input id="ms" name="q" class="input" placeholder="Search order no., customer, payment ref…"></form>
      <div class="spacer"></div>
      ${can('orders')?`<a class="btn btn-outline btn-sm hide-sm" href="#/mis/inventory">${ic('archive')} Inventory</a>`:''}
      <div class="dropdown"><button class="icon-btn" data-act="menu" aria-label="Notifications">${ic('bell')}${pendingPay+low?`<span class="dot-count" style="background:var(--amber)">${pendingPay+low}</span>`:''}</button>
        <div class="dd-menu" style="min-width:300px"><div class="small b" style="padding:8px 10px">Alerts</div>
          ${pendingPay && can('payments')?`<a href="#/mis/payments">${ic('wallet')} ${pendingPay} payment${pendingPay>1?'s':''} awaiting verification</a>`:''}
          ${low && can('inventoryView')?`<a href="#/mis/inventory?filter=low">${ic('alert')} ${low} variant${low>1?'s':''} low or out of stock</a>`:''}
          ${!(pendingPay||low)?'<div class="small muted" style="padding:8px 10px">You\'re all caught up.</div>':''}</div></div>
      <div class="dropdown"><button class="user-chip" data-act="menu" aria-haspopup="true"><div class="hide-sm"><b class="small">${esc(u.name)}</b><div><span class="role-pill">${u.role==='admin'?'ADMINISTRATOR':'STAFF'}</span></div></div><span class="avatar">${initials(u.name)}</span></button>
        <div class="dd-menu"><a href="#/mis/profile">${ic('user')} My profile</a>${u.role==='admin'?`<a href="#/mis/settings">${ic('settings')} System settings</a>`:''}<button data-act="logout">${ic('logout')} Sign out</button></div></div>
    </div>
    <main class="main">${content}</main></div></div>${demoBar()}`;
}
on('sb-toggle', () => document.getElementById('mis').classList.toggle('sb-open'));
document.addEventListener('click', e => { const m=document.getElementById('mis'); if (m?.classList.contains('sb-open') && !e.target.closest('.sb') && !e.target.closest('.mis-burger')) m.classList.remove('sb-open'); });
on('form:mis-search', f => { const q=f.q.value.trim(); if (!q) return; const p=S.payments.find(x=>x.ref.toLowerCase()===q.toLowerCase()); if (p && can('payments')) return go('/mis/payments/'+p.id); go('/mis/orders?q='+encodeURIComponent(q)); });
const pageH = (title, sub, actions='', eyebrow='') => `<div class="page-h"><div>${eyebrow?`<span class="badge b-lime plain" style="margin-bottom:8px">${eyebrow}</span>`:''}<h1>${title}</h1>${sub?`<p class="muted" style="margin-top:4px;max-width:640px">${sub}</p>`:''}</div><div class="row wrap">${actions}</div></div>`;
const kpi = (label, val, icon, foot='', alert=false, link='') => `<${link?'a href="#'+link+'"':'div'} class="kpi ${alert?'alert':''}" style="color:inherit;text-decoration:none"><div class="row between top"><span class="k-label">${label}</span><span class="k-icon">${ic(icon)}</span></div><span class="k-val">${val}</span>${foot?`<div class="k-foot">${foot}</div>`:''}</${link?'a':'div'}>`;

/* ---------------- Dashboard (role-aware) ---------------- */
route('/mis', () => {
  const u = me(); const os = S.orders;
  const sales = os.filter(o=>['Verified','Cash Collected'].includes(o.paymentStatus)).reduce((a,o)=>a+o.total,0);
  const pend = S.payments.filter(p=>p.status==='Pending Verification');
  const lowV = S.products.flatMap(p=>p.variants.map(v=>({...v,p}))).filter(v=>v.active&&v.p.status==='Active'&&v.stock<=S.settings.lowStock).sort((a,b)=>a.stock-b.stock);
  const toProcess = os.filter(o=>['Processing','Ready to Ship'].includes(o.status) || (o.method==='cod'&&o.status==='Awaiting Payment'));
  return mis(`${pageH(`Good day, ${esc(u.name.split(' ')[0])}`, u.role==='admin'?'Business overview across orders, payments, inventory and sales.':'Your queue for today: verify payments, move orders forward and watch stock levels.', `<span class="tag">${fmtDate(new Date().toISOString())}</span>`, u.role==='admin'?'ADMINISTRATOR DASHBOARD':'STAFF DASHBOARD')}
    <div class="grid g4">${kpi('Total orders', os.length, 'clipboard', `${os.filter(o=>o.status==='Delivered').length} completed · ${os.filter(o=>o.status==='Cancelled').length} cancelled`, false, '/mis/orders')}
      ${kpi('Pending verification', pend.length, 'wallet', pend.length?`Oldest: ${fmtDT(pend.map(p=>p.submitted).sort()[0])}`:'Queue is clear', !!pend.length, '/mis/payments')}
      ${kpi('Orders to fulfil', toProcess.length, 'box', `${os.filter(o=>o.status==='Shipped').length} shipped, awaiting delivery`, false, '/mis/orders?tab=active')}
      ${u.role==='admin'?kpi('Verified sales', peso(sales), 'chart', `From ${os.filter(o=>['Verified','Cash Collected'].includes(o.paymentStatus)).length} paid orders`, false, '/mis/reports'):kpi('Low-stock variants', lowV.length, 'alert', `${lowV.filter(v=>v.stock===0).length} out of stock`, !!lowV.length, '/mis/inventory?filter=low')}</div>
    <div class="detail-grid" style="margin-top:16px">
      <div class="col" style="gap:16px">
      ${can('payments')?`<div class="card"><div class="card-h"><h3>Payment verification queue</h3><a class="small b" href="#/mis/payments">Open queue ${ic('arrowR','')}</a></div>${pend.length?`<div class="table-wrap"><table class="t stack" style="min-width:0"><thead><tr><th>Order</th><th>Customer</th><th class="num">Amount</th><th></th></tr></thead><tbody>${pend.slice(0,5).map(p=>`<tr class="clickable" data-act="go" data-to="/mis/payments/${p.id}"><td data-l="Order" class="b">${p.orderId}<div class="xs muted">${fmtDT(p.submitted)}</div></td><td data-l="Customer">${esc(p.customerName)}<div class="xs muted">${PAY_METHODS[p.method].short}</div></td><td data-l="Amount" class="num">${peso(p.amount)}</td><td data-l=""><span class="btn btn-sm btn-primary">Review</span></td></tr>`).join('')}</tbody></table></div>`:emptyState('checkC','No payments waiting','New customer submissions will appear here.')}</div>`:''}
      <div class="card"><div class="card-h"><h3>Recent orders</h3><a class="small b" href="#/mis/orders">All orders ${ic('arrowR','')}</a></div>${misOrderTable(os.slice().sort((a,b)=>b.created.localeCompare(a.created)).slice(0,6), true)}</div>
      ${u.role==='admin'?`<div class="card"><div class="card-h"><div><h3>Sales — last 6 months</h3><p class="xs muted">Verified payments only (₱)</p></div><a class="small b" href="#/mis/reports">Reports ${ic('arrowR','')}</a></div>${barChart(monthlySales())}</div>`:''}
      </div>
      <div class="col" style="gap:16px">
        <div class="card"><div class="card-h"><h3>Order status</h3></div>${donut(statusCounts())}</div>
        ${can('inventoryView')?`<div class="card"><div class="card-h"><h3>Low-stock alerts</h3><a class="small b" href="#/mis/inventory?filter=low">View</a></div>${lowV.length?lowV.slice(0,6).map(v=>`<div class="row" style="padding:8px 0;border-top:1px solid var(--border)"><span class="sw" style="background:${COLORS[v.color]};width:16px;height:16px"></span><div style="flex:1;min-width:0"><div class="small b" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(v.p.name)}</div><div class="xs muted">${esc(v.color)} · ${v.size} · ${v.sku}</div></div>${badge(stockState(v.stock),'')}<b class="small" style="width:24px;text-align:right">${v.stock}</b></div>`).join(''):emptyState('checkC','All stock healthy','')}</div>`:''}
        <div class="card"><h3 style="margin-bottom:10px">Recent activity</h3>${recentActivity().slice(0,6).map(a=>`<div class="row top" style="padding:8px 0;border-top:1px solid var(--border)"><span class="k-icon" style="width:28px;height:28px;border-radius:8px;background:var(--muted);display:grid;place-items:center">${ic(a.icon)}</span><div style="flex:1"><div class="small">${a.text}</div><div class="xs muted">${fmtDT(a.at)} · ${esc(a.by)}</div></div></div>`).join('')}</div>
      </div></div>`, 'dash', 'Dashboard');
}, {auth:'mis'});
function recentActivity(){
  const acts = [];
  S.orders.forEach(o=>o.history.forEach(h=>acts.push({at:h.at, by:h.by, icon:'clipboard', text:`<b>${o.id}</b> → ${h.status}`})));
  S.stockLog.forEach(s=>acts.push({at:s.at, by:s.by, icon:'archive', text:`Stock ${s.change>0?'+':''}${s.change} · ${s.sku}`}));
  return acts.sort((a,b)=>b.at.localeCompare(a.at));
}
const statusCounts = () => ['Awaiting Payment','Pending Verification','Processing','Ready to Ship','Shipped','Delivered','Cancelled'].map(s=>[s,S.orders.filter(o=>o.status===s).length]);
const CHART = ['#33441A','#6B7F3E','#A9C27A','#D3E6AE','#2F6FB3','#F29A2E','#B9B6A9'];
function donut(rows){
  const total = rows.reduce((a,r)=>a+r[1],0)||1; let acc=0; const R=54, C=2*Math.PI*R;
  const segs = rows.map(([l,n],i)=>{ const len=C*n/total; const s=`<circle r="${R}" cx="70" cy="70" fill="none" stroke="${CHART[i%CHART.length]}" stroke-width="20" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-acc}" transform="rotate(-90 70 70)"><title>${l}: ${n}</title></circle>`; acc+=len; return s; }).join('');
  return `<div class="row wrap" style="gap:18px"><svg viewBox="0 0 140 140" width="140" height="140" role="img" aria-label="Order status distribution">${segs}<text x="70" y="68" text-anchor="middle" font-size="22" font-weight="800" fill="#1D2014">${total}</text><text x="70" y="86" text-anchor="middle" font-size="9" fill="#7A7E70">ORDERS</text></svg>
    <div class="col" style="gap:4px;flex:1;min-width:150px">${rows.map(([l,n],i)=>`<div class="row small" style="gap:8px"><i style="width:10px;height:10px;border-radius:3px;background:${CHART[i%CHART.length]}"></i><span style="flex:1">${l}</span><b>${n}</b></div>`).join('')}</div></div>`;
}
function monthlySales(){
  const base = [['Jun',182400,96],['Jul',205900,112],['Aug',231250,128],['Sep',219800,121],['Oct',268300,149]];
  const nov = S.orders.filter(o=>o.created>='2026-11'&&['Verified','Cash Collected'].includes(o.paymentStatus)).reduce((a,o)=>a+o.total,0);
  return [...base, ['Nov*', 96500+nov, 52+S.orders.filter(o=>o.created>='2026-11').length]];
}
function barChart(rows, {h=200, money=true}={}){
  const max = Math.max(...rows.map(r=>r[1]))*1.1; const w=560, bw=46, gap=(w-40-rows.length*bw)/(rows.length-1||1);
  const bars = rows.map(([l,v],i)=>{ const bh=(v/max)*(h-40); const x=30+i*(bw+gap); return `<g><rect x="${x}" y="${h-24-bh}" width="${bw}" height="${bh}" rx="8" fill="${i===rows.length-1?'#A9C27A':'#33441A'}"><title>${l}: ${money?peso(v):v}</title></rect><text x="${x+bw/2}" y="${h-24-bh-6}" text-anchor="middle" font-size="10" font-weight="700" fill="#4A4E42">${money?'₱'+Math.round(v/1000)+'k':v}</text><text x="${x+bw/2}" y="${h-6}" text-anchor="middle" font-size="11" fill="#7A7E70">${l}</text></g>`; }).join('');
  const grid = [0.25,0.5,0.75].map(f=>`<line x1="20" x2="${w}" y1="${(h-24)-(h-40)*f}" y2="${(h-24)-(h-40)*f}" stroke="#E2E0D7" stroke-dasharray="4 4"/>`).join('');
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Bar chart">${grid}${bars}</svg>`;
}

/* ---------------- Orders ---------------- */
function misOrderTable(os, compact){
  if (compact) return os.length?`<div class="table-wrap"><table class="t stack" style="min-width:0"><thead><tr><th>Order</th><th>Customer</th><th class="num">Total</th><th>Status</th></tr></thead><tbody>${os.map(o=>`<tr class="clickable" data-act="go" data-to="/mis/orders/${o.id}"><td data-l="Order" class="b">${o.id}<div class="xs muted">${fmtDate(o.created)}</div></td><td data-l="Customer">${esc(o.customerName)}<div class="xs muted">${PAY_METHODS[o.method].short}</div></td><td data-l="Total" class="num b">${peso(o.total)}</td><td data-l="Status">${badge(o.status)}</td></tr>`).join('')}</tbody></table></div>`:emptyState('clipboard','No orders yet','');
  if (!os.length) return emptyState('clipboard','No orders found','Try a different status tab or clear the search.');
  return `<div class="table-wrap"><table class="t stack"><thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Method</th><th class="num">Total</th><th>Payment</th><th>Status</th></tr></thead><tbody>
  ${os.map(o=>`<tr class="clickable" data-act="go" data-to="/mis/orders/${o.id}"><td data-l="Order" class="b">${o.id}</td><td data-l="Date">${fmtDate(o.created)}</td><td data-l="Customer">${esc(o.customerName)}</td><td data-l="Method">${PAY_METHODS[o.method].short}</td><td data-l="Total" class="num b">${peso(o.total)}</td><td data-l="Payment">${badge(o.paymentStatus)}</td><td data-l="Status">${badge(o.status)}</td></tr>`).join('')}</tbody></table></div>`;
}
route('/mis/orders', ({query:q}) => {
  const tabs = [['all','All'],['active','To fulfil'],['Awaiting Payment','Awaiting payment'],['Pending Verification','Pending verification'],['Processing','Processing'],['Ready to Ship','Ready to ship'],['Shipped','Shipped'],['Delivered','Delivered'],['Cancelled','Cancelled']];
  const t = q.tab||'all';
  const match = (o,k) => k==='all'?true:k==='active'?(['Processing','Ready to Ship'].includes(o.status)||(o.method==='cod'&&o.status==='Awaiting Payment')):o.status===k;
  let os = S.orders.filter(o=>match(o,t));
  if (q.q){ const s=q.q.toLowerCase(); os=os.filter(o=>(o.id+' '+o.customerName+' '+o.email).toLowerCase().includes(s)); }
  if (q.method) os=os.filter(o=>o.method===q.method);
  os.sort((a,b)=> q.sort==='old'?a.created.localeCompare(b.created): q.sort==='total'?b.total-a.total : b.created.localeCompare(a.created));
  const page=Number(q.page||1);
  return mis(`${pageH('Orders', 'Review new orders and move them through the fulfilment workflow. Online-payment orders can only be processed after payment is verified.', `<button class="btn btn-outline btn-sm" data-act="export" data-what="orders">${ic('download')} Export CSV</button>`)}
    <div class="tabs" style="margin-bottom:14px">${tabs.map(([k,l])=>`<button class="tab ${t===k?'is-active':''}" data-act="qset" data-q='${JSON.stringify({tab:k==='all'?'':k,page:''})}'>${l} <span class="badge b-neutral plain" style="height:18px">${S.orders.filter(o=>match(o,k)).length}</span></button>`).join('')}</div>
    <div class="toolbar"><form class="search" data-form="ord-q">${ic('search')}<input class="input" name="q" placeholder="Order no., customer, email" value="${esc(q.q||'')}" aria-label="Search orders"></form>
      <select class="select" data-change="ord-method" aria-label="Payment method"><option value="">All payment methods</option>${Object.entries(PAY_METHODS).map(([k,m])=>`<option value="${k}" ${q.method===k?'selected':''}>${m.short}</option>`).join('')}</select>
      <select class="select" data-change="ord-sort" aria-label="Sort"><option value="">Newest first</option><option value="old" ${q.sort==='old'?'selected':''}>Oldest first</option><option value="total" ${q.sort==='total'?'selected':''}>Highest total</option></select>
      ${q.q||q.method?`<a class="small b" href="#/mis/orders${t!=='all'?'?tab='+t:''}">Clear</a>`:''}</div>
    ${os.length?misOrderTable(paginate(os,page,8))+`<div class="table-wrap" style="border-top:none;border-radius:0 0 16px 16px;margin-top:-1px">${pager(os.length,page,8)}</div>`:`<div class="card">${emptyState('search','No orders found', q.q?`No orders match “${esc(q.q)}”.`:'There are no orders in this status right now.')}</div>`}`, 'orders', 'Orders');
}, {auth:'mis', perm:'orders'});
on('form:ord-q', f => qset({q:f.q.value.trim(), page:''}));
on('ord-method', a => qset({method:a.value, page:''}));
on('ord-sort', a => qset({sort:a.value}));

function nextActions(o){
  // returns allowed transitions for this order (enforces the status flow)
  const A=[];
  if (o.status==='Awaiting Payment' && o.method==='cod') A.push({to:'Processing', label:'Confirm COD order & start processing', icon:'check', primary:true});
  if (o.status==='Awaiting Payment' && o.method!=='cod') A.push({info:'Waiting for the customer to submit payment details.'});
  if (o.status==='Pending Verification') A.push({info:'Verify or reject the submitted payment before processing.', link:`/mis/payments/${S.payments.find(p=>p.orderId===o.id&&p.status==='Pending Verification')?.id}`});
  if (o.status==='Processing') A.push({to:'Ready to Ship', label:'Mark as packed / ready to ship', icon:'box', primary:true});
  if (o.status==='Ready to Ship') A.push({to:'Shipped', label:'Mark as shipped', icon:'truck', primary:true, needs:'tracking'});
  if (o.status==='Shipped') A.push({to:'Delivered', label: o.method==='cod'?'Mark delivered & record cash':'Mark as delivered', icon:'checkC', primary:true, needs:o.method==='cod'?'cash':null});
  if (['Awaiting Payment','Pending Verification'].includes(o.status)) A.push({to:'Cancelled', label:'Cancel order', icon:'ban', danger:true});
  return A;
}
route('/mis/orders/:id', ({params}) => {
  const o = S.orders.find(x=>x.id===params.id);
  if (!o) return mis(`<div class="card">${emptyState('search','Order not found',`No order with ID ${esc(params.id)}.`,`<a class="btn btn-primary" href="#/mis/orders">Back to orders</a>`)}</div>`,'orders','Order');
  const pays = S.payments.filter(p=>p.orderId===o.id).sort((a,b)=>b.submitted.localeCompare(a.submitted));
  const acts = nextActions(o);
  const shortage = stockItems(o).map(i=>{ const r=variantBySku(i.sku); return r && !o.stockDeducted && r.v.stock<i.qty ? `${i.sku}: need ${i.qty}, have ${r.v.stock}`:null; }).filter(Boolean);
  return mis(`<nav class="crumbs" style="padding-top:0"><a href="#/mis/orders">Orders</a>›<b>${o.id}</b></nav>
    ${pageH(`Order ${o.id}`, `Placed ${fmtDT(o.created)} by ${esc(o.customerName)} · ${PAY_METHODS[o.method].label}`, `${badge(o.status)} ${badge(o.paymentStatus)} <button class="btn btn-outline btn-sm" data-act="print">${ic('printer')} Print</button>`)}
    <div class="detail-grid"><div class="col" style="gap:16px">
      <div class="card"><div class="card-h"><h3>Update order status</h3><span class="xs muted">Flow: ${ORDER_FLOW.join(' → ')}</span></div>
        ${progress(o)}
        ${shortage.length && ['Awaiting Payment','Pending Verification'].includes(o.status)?`<div class="notice n-warn" style="margin:12px 0">${ic('alert')}<div><b>Insufficient stock to fulfil:</b> ${shortage.join('; ')}. Restock before processing.</div></div>`:''}
        <div class="row wrap" style="margin-top:14px">${acts.map(a=>a.info?`<div class="notice n-info" style="flex:1">${ic('info')}<div>${a.info} ${a.link&&can('payments')?`<a href="#${a.link}" class="b">Review payment →</a>`:''}</div></div>`
          :`<button class="btn ${a.danger?'btn-danger-outline':a.primary?'btn-primary':'btn-outline'}" data-act="ord-move" data-id="${o.id}" data-to="${a.to}" data-needs="${a.needs||''}" ${!can('orderStatus')?'disabled title="No permission"':''}>${ic(a.icon)} ${a.label}</button>`).join('')}
          ${!acts.length?`<div class="notice n-ok" style="flex:1">${ic('checkC')}<div>This order is ${o.status.toLowerCase()} — no further status changes.</div></div>`:''}</div>
        <p class="xs muted" style="margin-top:10px">Stock is deducted automatically when an order enters <b>Processing</b>. ${o.stockDeducted?'<span class="badge b-green">Stock deducted</span>':'<span class="badge b-neutral">Stock not yet deducted</span>'}</p></div>
      <div class="card"><h3 style="margin-bottom:6px">Items</h3><div class="table-wrap"><table class="t stack"><thead><tr><th>Product</th><th>SKU</th><th class="num">Qty</th><th class="num">On hand</th><th class="num">Line total</th></tr></thead><tbody>${o.items.map(i=>{ const r=variantBySku(i.sku); return `<tr><td data-l="Product"><div class="row" style="gap:10px">${i.custom?`<div class="thumb" style="width:56px;height:56px;${pBg(null,i.custom)}">${art(product(i.pid)||S.products[0],null,48,i.custom)}</div>`:''}<div><b class="small">${esc(i.name)}</b><div class="xs muted">${i.custom?esc(customLabel(i.custom)):esc(i.color)} · ${i.size}${i.embroidery?` · Embroidery “${esc(i.embroidery)}”`:''}</div>${i.custom?`<span class="badge b-olive plain">Made to order</span>`:''}</div></div></td><td data-l="SKU" class="small">${i.custom?customCode(i.custom):i.sku}</td><td data-l="Qty" class="num">${i.qty}</td><td data-l="On hand" class="num">${i.custom?'MTO':(r?r.v.stock:'—')}</td><td data-l="Line total" class="num b">${peso(lineTotal(i))}</td></tr>`; }).join('')}</tbody></table></div>
        <div style="max-width:300px;margin-left:auto;margin-top:12px"><div class="sum-row small"><span class="muted">Subtotal</span><span>${peso(o.subtotal)}</span></div><div class="sum-row small"><span class="muted">Shipping</span><span>${o.shipping?peso(o.shipping):'Free'}</span></div><div class="sum-row total"><span>Total</span><span>${peso(o.total)}</span></div></div></div>
      ${o.items.some(i=>i.custom)?`<div class="card"><div class="card-h"><h3>Production spec — made to order</h3><span class="badge b-olive plain">Lead time ${CUSTOM_LEAD}</span></div>${o.items.filter(i=>i.custom).map(i=>`<div class="row top" style="gap:16px;padding:10px 0;border-top:1px solid var(--border)"><div class="thumb" style="width:110px;height:110px;${pBg(null,i.custom)}">${art(product(i.pid)||S.products[0],null,100,i.custom)}</div><dl class="kv" style="flex:1"><dt>Design code</dt><dd>${customCode(i.custom)}</dd><dt>Body colour</dt><dd><span class="sw" style="display:inline-block;vertical-align:-2px;background:${CUSTOM_COLORS[i.custom.body]}"></span> ${esc(i.custom.body)}</dd><dt>Pattern</dt><dd>${PATTERNS[i.custom.pattern].label}${i.custom.pattern!=='solid'?` · <span class="sw" style="display:inline-block;vertical-align:-2px;background:${CUSTOM_COLORS[i.custom.patColor]}"></span> ${esc(i.custom.patColor)} · ${PLACEMENTS[i.custom.placement].label}`:''}</dd><dt>Trim & piping</dt><dd><span class="sw" style="display:inline-block;vertical-align:-2px;background:${CUSTOM_COLORS[i.custom.trim]}"></span> ${esc(i.custom.trim)}</dd><dt>Size × qty</dt><dd>${i.size} × ${i.qty}${i.embroidery?` · embroidery “${esc(i.embroidery)}”`:''}</dd></dl></div>`).join('')}<p class="xs muted">Made-to-order items don't draw from finished-goods stock. Start production only after the order reaches <b>Processing</b>.</p></div>`:''}
      <div class="card"><h3 style="margin-bottom:12px">Status history</h3><div class="timeline">${[...o.history].reverse().map((h,i)=>`<div class="tl ${h.status==='Cancelled'||h.note?.includes('rejected')?'bad':i===0?'cur':'done'}"><span class="d">${ic(h.status==='Cancelled'?'x':'check')}</span><div><b class="small">${h.status}</b> <span class="xs muted">· ${fmtDT(h.at)} · ${esc(h.by)}</span><div class="xs">${esc(h.note||'')}</div></div></div>`).join('')}</div></div>
    </div><div class="col" style="gap:16px">
      <div class="card"><h3 style="margin-bottom:10px">Customer</h3><dl class="kv"><dt>Name</dt><dd>${esc(o.customerName)}</dd><dt>Email</dt><dd>${esc(o.email)}</dd><dt>Mobile</dt><dd>${esc(o.phone)}</dd><dt>Address</dt><dd>${esc(o.address?.line)}, ${esc(o.address?.city)}, ${esc(o.address?.province)} ${esc(o.address?.zip)}</dd>${o.notes?`<dt>Notes</dt><dd>${esc(o.notes)}</dd>`:''}</dl></div>
      <div class="card"><h3 style="margin-bottom:10px">Payment records</h3>${pays.length?pays.map(p=>`<a href="#/mis/payments/${p.id}" class="row" style="padding:10px 0;border-top:1px solid var(--border);color:var(--ink);text-decoration:none"><div style="flex:1"><b class="small">${esc(p.ref)}</b><div class="xs muted">${fmtDT(p.submitted)} · ${peso(p.amount)}</div></div>${badge(p.status)}</a>`).join(''):`<p class="small muted">${o.method==='cod'?'Cash on Delivery — cash is recorded when the order is marked delivered.':'No payment submitted yet.'}</p>`}</div>
      <div class="card"><h3 style="margin-bottom:10px">Internal note</h3><form data-form="ord-note" data-id="${o.id}" class="col"><textarea class="textarea" name="note" placeholder="Visible to staff only" aria-label="Internal note">${esc(o.staffNote||'')}</textarea><button class="btn btn-outline btn-sm" style="align-self:flex-start" data-loading="Saving…">Save note</button></form></div>
    </div></div>`, 'orders', o.id);
}, {auth:'mis', perm:'orders'});
on('print', () => window.print());
on('form:ord-note', async f => { await busy(f.querySelector('button'),400); S.orders.find(o=>o.id===f.dataset.id).staffNote=f.note.value; save(); toast('Note saved','ok'); });
/* Status updates are deliberately "hard to misclick":
   1) the modal shows FROM → TO and the order summary, 2) Confirm stays disabled until the staff member ticks a
   step-specific acknowledgement (and, for Shipped, re-enters the tracking number; for final steps, types the
   last 4 digits of the order number), 3) Enter never submits, focus starts on Cancel, 4) a 10-second Undo toast
   restores the previous state and records the reversal in the order history. */
const ACK = {
  'Processing': o => o.method==='cod' ? 'I phoned the customer and they confirmed this Cash on Delivery order.' : 'I checked the items and quantities below are correct.',
  'Ready to Ship': () => 'I packed and labelled the parcel and checked it matches the items below.',
  'Shipped': () => 'I handed this parcel to the courier and double-checked the tracking number.',
  'Delivered': o => o.method==='cod' ? 'The courier/customer confirmed receipt and I counted the cash.' : 'The courier or customer confirmed this order was received.',
  'Cancelled': () => 'I understand cancelling cannot be undone after 10 seconds and the customer will be notified.',
};
const FINAL = ['Delivered','Cancelled'];
on('ord-move', a => {
  const o=S.orders.find(x=>x.id===a.dataset.id); const to=a.dataset.to; const needs=a.dataset.needs; const last4=o.id.slice(-4);
  const fields = (needs==='tracking'? field({name:'track', label:'Courier & tracking no.', required:true, ph:'e.g. LBC 1234 5678 90'}) + field({name:'track2', label:'Re-enter tracking no.', required:true, ph:'Type it again to avoid typos', attrs:'autocomplete="off"'}) : '')
    + (needs==='cash' ? field({name:'cash', label:'Cash amount received (₱)', required:true, value:o.total, hint:`Order total: ${peso(o.total)}`}) : '')
    + (to==='Cancelled' ? field({name:'reason', label:'Reason for cancellation', required:true, options:[['','Select a reason…'],'Customer requested','No payment received within 3 days','Duplicate order','Item unavailable','Other']}) : '')
    + (FINAL.includes(to) ? field({name:'code', label:`Type the last 4 digits of the order number (${o.id.slice(0,-4)}••••)`, required:true, ph:'e.g. '+last4.replace(/./g,'0'), attrs:'inputmode="numeric" maxlength="4" autocomplete="off"', hint:'This step is final, so we ask you to type it.'}) : '');
  const consequence = to==='Processing' ? `Stock will be deducted for ${stockItems(o).reduce((s,i)=>s+i.qty,0)} item(s).` : to==='Shipped' ? 'The customer will see “Shipped” and the tracking number in My orders.' : to==='Delivered' ? 'This completes the order. You will have 10 seconds to undo; after that it is final.' : to==='Cancelled' ? 'The order is closed and the customer is told not to pay. You will have 10 seconds to undo; after that it is final.' : 'The customer will see this update in My orders.';
  const danger = to==='Cancelled';
  modal(`<div class="mh"><div><div class="m-icon" style="background:${danger?'var(--red-bg)':'var(--lime-200)'};color:${danger?'var(--red)':'var(--olive-800)'}">${ic(danger?'ban':to==='Shipped'?'truck':'clipboard')}</div><h3>Are you sure?</h3><p class="small muted" style="margin-top:4px">You're about to change the status of <b>${o.id}</b>.</p></div><button class="icon-btn" data-act="modal-close" aria-label="Close">${ic('x')}</button></div>
    <form class="mb col" data-form="ord-move" data-id="${o.id}" data-to="${to}" data-needs="${needs||''}" novalidate style="gap:14px">
      <div class="status-swap"><div><div class="xs muted">Current</div>${badge(o.status)}</div><span class="arrow">${ic('arrowR')}</span><div><div class="xs muted">New</div>${badge(to)}</div></div>
      <div class="card tight flat" style="padding:12px 14px"><div class="row between small"><b>${esc(o.customerName)}</b><b>${peso(o.total)}</b></div><div class="xs muted" style="margin-top:4px">${o.items.map(i=>`${i.qty}× ${esc(i.name)} (${i.custom?'custom':esc(i.color)}, ${i.size})`).join(' · ')}</div></div>
      <p class="small">${consequence}</p>
      ${fields}
      <label class="check ack"><input type="checkbox" name="ack" data-change="ack-toggle"><span class="small">${ACK[to](o)}</span></label>
      <div class="row" style="justify-content:flex-end;gap:10px"><button type="button" class="btn btn-outline" data-act="modal-close" id="ord-cancel">Go back</button><button type="button" class="btn ${danger?'btn-danger':'btn-primary'}" data-act="ord-move-confirm" disabled data-loading="Updating…">${danger?'Yes, cancel order':`Yes, mark as ${to}`}</button></div>
    </form>`, {focus:'#ord-cancel'});
});
on('ack-toggle', a => { a.closest('form').querySelector('[data-act=ord-move-confirm]').disabled = !a.checked; });
on('form:ord-move', () => {}); // Enter key never submits a status change
on('ord-move-confirm', async btn => {
  const f = btn.closest('form'); const o=S.orders.find(x=>x.id===f.dataset.id); const to=f.dataset.to; const needs=f.dataset.needs;
  if (!f.ack.checked) return;
  const ok = validate(f, {
    ...(needs==='tracking' ? {track:[req('Enter the courier and tracking number'), minLen(6,'Tracking number looks too short')], track2:[req('Re-enter the tracking number'), [(v,fm)=>v.replace(/\s/g,'').toUpperCase()===fm.track.value.replace(/\s/g,'').toUpperCase(),'Tracking numbers do not match']]} : {}),
    ...(needs==='cash' ? {cash:[req('Enter the cash received'), [v=>Number(v)>=o.total, `Cash received must be at least ${peso(o.total)}`]]} : {}),
    ...(to==='Cancelled' ? {reason:[req('Select a reason')]} : {}),
    ...(FINAL.includes(to) ? {code:[req('Type the last 4 digits'), [v=>v===o.id.slice(-4), `That doesn't match ${o.id}. Check the order number.`]]} : {}),
  });
  if (!ok) return;
  const val = n => f.elements[n]?.value.trim();
  if (!nextActions(o).some(x=>x.to===to)){ toast(`Invalid status change: ${o.status} → ${to}`,'err'); closeModal(); return; }
  if (to==='Processing' && !o.stockDeducted){
    const short = stockItems(o).filter(i=>{ const r=variantBySku(i.sku); return !r || r.v.stock<i.qty; });
    if (short.length){ closeModal(); confirmModal({title:'Insufficient stock', body:`Cannot start processing — not enough stock for ${short.map(i=>`<b>${i.sku}</b>`).join(', ')}. Inventory cannot go negative. Restock first.`, ok:'Go to inventory', icon:'alert', danger:true, onOk:()=>{ closeModal(); go('/mis/inventory?q='+short[0].sku); }}); return; }
  }
  await busy(btn, 500);
  const snapshot = JSON.stringify({orders:S.orders, products:S.products, payments:S.payments, stockLog:S.stockLog, notifications:S.notifications});
  const from = o.status;
  if (to==='Processing' && !o.stockDeducted){ stockItems(o).forEach(i=>{ const r=variantBySku(i.sku); const before=r.v.stock; r.v.stock-=i.qty; S.stockLog.unshift({id:uid('ST'), at:new Date().toISOString(), sku:i.sku, product:i.name, change:-i.qty, before, after:r.v.stock, reason:`Order ${o.id} (Processing)`, by:'System'}); }); o.stockDeducted=true; }
  const note = to==='Processing'?(o.method==='cod'?'COD order confirmed by phone · stock deducted':'Stock deducted') : to==='Ready to Ship'?'Packed and labelled' : to==='Shipped'?'Handed to courier · '+val('track') : to==='Delivered'?(needs==='cash'?`Delivered · cash ${peso(val('cash'))} collected`:'Delivered to customer') : 'Cancelled: '+val('reason');
  o.status=to; if (to==='Shipped') o.tracking=val('track'); addHistory(o,to,me().name,note);
  if (needs==='cash'){ o.paymentStatus='Cash Collected'; S.payments.unshift({id:uid('PAY'), orderId:o.id, customerName:o.customerName, method:'cod', amount:Number(val('cash')), ref:'CASH-'+o.id.slice(-4), submitted:new Date().toISOString(), status:'Verified', reviewedBy:me().name, reviewedAt:new Date().toISOString(), note:'Cash collected on delivery'}); }
  if (to==='Cancelled' && o.paymentStatus==='Pending Verification'){ S.payments.filter(p=>p.orderId===o.id&&p.status==='Pending Verification').forEach(p=>{p.status='Rejected'; p.reason='Order cancelled: '+val('reason'); p.reviewedBy=me().name; p.reviewedAt=new Date().toISOString();}); o.paymentStatus='Rejected'; }
  notify(o.customerId, `Order ${o.id} is now ${to}.`, '/account/orders/'+o.id);
  save(); closeModal(); render();
  toast(`${o.id} marked as <b>${to}</b>.`, 'ok', {label:'Undo', ms:10000, fn:()=>{
    const snap = JSON.parse(snapshot); Object.assign(S, snap);
    const back = S.orders.find(x=>x.id===o.id); addHistory(back, from, me().name, `Reverted accidental change to ${to} (undo)`);
    save(); render(); toast(`Undone — ${o.id} is back to ${from}. Stock and payments restored.`,'info');
  }});
});

/* ---------------- Payment verification ---------------- */
route('/mis/payments', ({query:q}) => {
  const t = q.tab||'Pending Verification';
  let ps = S.payments.filter(p=>p.method!=='cod' || t!=='Pending Verification');
  if (t!=='all') ps = ps.filter(p=>p.status===t);
  if (q.q){ const s=q.q.toLowerCase(); ps=ps.filter(p=>(p.ref+' '+p.orderId+' '+p.customerName).toLowerCase().includes(s)); }
  ps.sort((a,b)=> t==='Pending Verification'?a.submitted.localeCompare(b.submitted):b.submitted.localeCompare(a.submitted));
  const page=Number(q.page||1);
  return mis(`${pageH('Payment verification', 'Compare each submission against the GCash / BDO statement before verifying. Submissions are never verified automatically.')}
    <div class="tabs" style="margin-bottom:14px">${[['Pending Verification','Pending'],['Verified','Verified'],['Rejected','Rejected'],['all','All records']].map(([k,l])=>`<button class="tab ${t===k?'is-active':''}" data-act="qset" data-q='${JSON.stringify({tab:k==='Pending Verification'?'':k,page:''})}'>${l} <span class="badge ${k==='Pending Verification'?'b-amber':'b-neutral'} plain" style="height:18px">${k==='all'?S.payments.length:S.payments.filter(p=>p.status===k).length}</span></button>`).join('')}</div>
    <div class="toolbar"><form class="search" data-form="pay-q">${ic('search')}<input class="input" name="q" placeholder="Reference no., order, customer" value="${esc(q.q||'')}" aria-label="Search payments"></form>${t==='Pending Verification'?'<span class="small muted">Oldest submissions first</span>':''}</div>
    ${ps.length?`<div class="table-wrap"><table class="t stack"><thead><tr><th>Submitted</th><th>Order</th><th>Customer</th><th>Method</th><th>Reference</th><th class="num">Amount</th><th class="num">Order total</th><th>Status</th><th></th></tr></thead><tbody>${paginate(ps,page,8).map(p=>{ const o=S.orders.find(x=>x.id===p.orderId); const mismatch=o&&p.amount!==o.total; return `<tr class="clickable" data-act="go" data-to="/mis/payments/${p.id}"><td data-l="Submitted">${fmtDT(p.submitted)}</td><td data-l="Order" class="b">${p.orderId}</td><td data-l="Customer">${esc(p.customerName)}</td><td data-l="Method">${PAY_METHODS[p.method].short}</td><td data-l="Reference" class="small">${esc(p.ref)}</td><td data-l="Amount" class="num ${mismatch?'':''}" style="${mismatch?'color:var(--red);font-weight:700':''}">${peso(p.amount)}</td><td data-l="Order total" class="num">${o?peso(o.total):'—'}</td><td data-l="Status">${badge(p.status)}</td><td data-l="">${p.status==='Pending Verification'?'<span class="btn btn-sm btn-primary">Review</span>':ic('chevR')}</td></tr>`; }).join('')}</tbody></table></div><div class="table-wrap" style="border-top:none;border-radius:0 0 16px 16px;margin-top:-1px">${pager(ps.length,page,8)}</div>`
      :`<div class="card">${emptyState(t==='Pending Verification'?'checkC':'search', t==='Pending Verification'?'No payments awaiting verification':'No records found', t==='Pending Verification'?'Great work — the queue is clear. New submissions from customers will appear here.':'Try a different tab or search term.')}</div>`}`, 'payments', 'Payments');
}, {auth:'mis', perm:'payments'});
on('form:pay-q', f => qset({q:f.q.value.trim(), page:''}));
route('/mis/payments/:id', ({params}) => {
  const p = S.payments.find(x=>x.id===params.id);
  if (!p) return mis(`<div class="card">${emptyState('search','Payment record not found','',`<a class="btn btn-primary" href="#/mis/payments">Back to queue</a>`)}</div>`,'payments','Payment');
  const o = S.orders.find(x=>x.id===p.orderId);
  const checks = [['Amount matches order total', p.amount===o.total, `${peso(p.amount)} vs ${peso(o.total)}`],['Reference number provided', !!p.ref && p.ref.length>=6, p.ref],['Receipt attached', !!p.proof || p.method==='cod', p.proof||'—'],['Sender name matches customer', (p.payer||'').toLowerCase().includes(o.customerName.split(' ').slice(-1)[0].toLowerCase()), p.payer||'—']];
  const prev = S.payments.filter(x=>x.orderId===o.id && x.id!==p.id);
  return mis(`<nav class="crumbs" style="padding-top:0"><a href="#/mis/payments">Payment verification</a>›<b>${esc(p.ref)}</b></nav>
    ${pageH(`Review payment`, `${PAY_METHODS[p.method].label} for order <a href="#/mis/orders/${o.id}" class="b">${o.id}</a> · submitted ${fmtDT(p.submitted)}`, badge(p.status))}
    <div class="detail-grid"><div class="col" style="gap:16px">
      <div class="card"><h3 style="margin-bottom:12px">Submitted proof</h3><div class="row top wrap" style="gap:18px"><div style="width:200px;height:300px;border-radius:14px;border:1px solid var(--border);background:linear-gradient(180deg,${p.method==='gcash'?'#0A5BD3':'#0F3B7A'} 0 22%,#fff 22%);padding:18px;color:#fff;font-size:12px;position:relative" aria-label="Receipt preview (mock)"><b>${p.method==='gcash'?'GCash':'BDO Online'}</b><div style="opacity:.8">Express Send</div><div style="color:#1D2014;margin-top:44px;font-size:11px;line-height:1.9"><div class="muted">Amount</div><b style="font-size:20px">${peso(p.amount)}</b><div class="muted" style="margin-top:6px">Ref No.</div><b>${esc(p.ref)}</b><div class="muted" style="margin-top:6px">Sent by</div><b>${esc(p.payer||p.customerName)}</b><div class="muted" style="margin-top:6px">Date</div><b>${p.paidAt?fmtDate(p.paidAt):'—'}</b></div></div>
        <dl class="kv" style="flex:1;min-width:240px"><dt>Reference no.</dt><dd>${esc(p.ref)}</dd><dt>Amount sent</dt><dd>${peso(p.amount)}</dd><dt>Order total</dt><dd>${peso(o.total)}</dd><dt>Sender</dt><dd>${esc(p.payer||'—')}</dd><dt>Transfer date</dt><dd>${p.paidAt?fmtDate(p.paidAt):'—'}</dd><dt>File</dt><dd>${esc(p.proof||'—')}</dd><dt>Customer note</dt><dd>${esc(p.note||'—')}</dd>${p.reviewedBy?`<dt>Reviewed by</dt><dd>${esc(p.reviewedBy)} · ${fmtDT(p.reviewedAt)}</dd>`:''}${p.reason?`<dt>Reject reason</dt><dd style="color:var(--red)">${esc(p.reason)}</dd>`:''}</dl></div></div>
      <div class="card"><h3 style="margin-bottom:10px">Verification checklist</h3>${checks.map(([l,ok,d])=>`<div class="row" style="padding:8px 0;border-top:1px solid var(--border)"><span style="color:${ok?'var(--green)':'var(--red)'}">${ic(ok?'checkC':'xc')}</span><span class="small" style="flex:1">${l}</span><span class="xs muted">${esc(d)}</span></div>`).join('')}
        <div class="notice n-info small" style="margin-top:10px">${ic('info')}<div>Automated checks only help. You must confirm the transfer appears in the ${p.method==='gcash'?'GCash merchant':'BDO'} statement before verifying.</div></div></div>
    </div><div class="col" style="gap:16px">
      <div class="card"><h3 style="margin-bottom:12px">Decision</h3>${p.status==='Pending Verification'?`
        <label class="check" style="margin-bottom:14px"><input type="checkbox" id="seen-stmt"><span class="small">I confirmed this transfer in the official ${p.method==='gcash'?'GCash':'BDO'} statement.</span></label>
        <div class="col"><button class="btn btn-primary btn-lg" data-act="pay-verify" data-id="${p.id}">${ic('checkC')} Verify payment</button><button class="btn btn-danger-outline btn-lg" data-act="pay-reject" data-id="${p.id}">${ic('xc')} Reject payment</button></div>
        <p class="xs muted" style="margin-top:10px">Verifying moves the order to <b>Processing</b> and deducts stock. Rejecting returns it to <b>Awaiting Payment</b> so the customer can re-submit.</p>`
        : `<div class="notice ${p.status==='Verified'?'n-ok':'n-err'}">${ic(p.status==='Verified'?'checkC':'xc')}<div>This payment was <b>${p.status.toLowerCase()}</b>${p.reviewedBy?` by ${esc(p.reviewedBy)}`:''}. Decisions are final and kept in the transaction records.</div></div>`}</div>
      <div class="card"><h3 style="margin-bottom:10px">Order summary</h3><dl class="kv"><dt>Order</dt><dd><a href="#/mis/orders/${o.id}">${o.id}</a></dd><dt>Status</dt><dd>${badge(o.status)}</dd><dt>Customer</dt><dd>${esc(o.customerName)}</dd><dt>Items</dt><dd>${o.items.map(i=>`${i.qty}× ${esc(i.sku)}`).join('<br>')}</dd></dl></div>
      ${prev.length?`<div class="card"><h3 style="margin-bottom:10px">Previous submissions</h3>${prev.map(x=>`<a href="#/mis/payments/${x.id}" class="row" style="padding:8px 0;border-top:1px solid var(--border);color:var(--ink);text-decoration:none"><span class="small" style="flex:1">${esc(x.ref)}<div class="xs muted">${fmtDT(x.submitted)}</div></span>${badge(x.status)}</a>`).join('')}</div>`:''}
    </div></div>`, 'payments', 'Review payment');
}, {auth:'mis', perm:'payments'});
on('pay-verify', a => {
  const p=S.payments.find(x=>x.id===a.dataset.id); const o=S.orders.find(x=>x.id===p.orderId);
  if (!document.getElementById('seen-stmt').checked){ toast('Tick the confirmation that you checked the official statement','warn'); document.getElementById('seen-stmt').focus(); return; }
  const short = stockItems(o).filter(i=>{ const r=variantBySku(i.sku); return !r || r.v.stock<i.qty; });
  confirmModal({title:'Verify this payment?', icon:'checkC', body:`Mark <b>${esc(p.ref)}</b> (${peso(p.amount)}) as <b>Verified</b>. Order ${o.id} will move to <b>Processing</b> and stock will be deducted.${p.amount<o.total?`<br><br><span style="color:var(--red)"><b>Warning:</b> amount is ${peso(o.total-p.amount)} less than the order total.</span>`:''}${short.length?`<br><br><span style="color:var(--red)"><b>Insufficient stock</b> for ${short.map(i=>i.sku).join(', ')} — order will be verified but stays in Pending until restocked.</span>`:''}`, ok:'Verify payment', onOk: async btn => {
    await busy(btn,700);
    p.status='Verified'; p.reviewedBy=me().name; p.reviewedAt=new Date().toISOString(); o.paymentStatus='Verified';
    addHistory(o,'Pending Verification',me().name,`Payment ${p.ref} verified`);
    if (!short.length){ stockItems(o).forEach(i=>{ const r=variantBySku(i.sku); const before=r.v.stock; r.v.stock-=i.qty; S.stockLog.unshift({id:uid('ST'), at:new Date().toISOString(), sku:i.sku, product:i.name, change:-i.qty, before, after:r.v.stock, reason:`Order ${o.id} (Processing)`, by:'System'}); }); o.stockDeducted=true; o.status='Processing'; addHistory(o,'Processing',me().name,'Payment verified · stock deducted'); }
    notify(o.customerId, `Your payment for ${o.id} was verified. Your order is now being processed.`, '/account/orders/'+o.id);
    save(); closeModal(); toast(`Payment verified — ${o.id} ${short.length?'awaiting restock':'moved to Processing'}`,'ok'); go('/mis/payments/'+p.id); }});
});
on('pay-reject', a => {
  const p=S.payments.find(x=>x.id===a.dataset.id); const o=S.orders.find(x=>x.id===p.orderId);
  confirmModal({title:'Reject this payment?', danger:true, icon:'xc', body:`The customer will see your reason and can re-submit payment for ${o.id}.`, ok:'Reject payment',
    extra:`<div class="col" style="margin-top:12px">${field({name:'reason', label:'Reason', required:true, options:[['','Select a reason…'],['ref','Reference number not found in statement'],['amount','Amount is less than the order total'],['blurry','Receipt is unreadable / cropped'],['dup','Duplicate of an earlier submission'],['other','Other']]})}${field({name:'detail', label:'Message to customer', textarea:true, ph:'Explain what the customer should do next'})}</div>`,
    onOk: async btn => { const m=btn.closest('.modal'); const r=m.querySelector('[name=reason]'); const d=m.querySelector('[name=detail]');
      if (!r.value){ r.closest('.field').classList.add('has-error'); r.closest('.field').querySelector('.err').textContent='Select a reason for rejecting'; return; }
      if (r.value==='other' && !d.value.trim()){ d.closest('.field').classList.add('has-error'); d.closest('.field').querySelector('.err').textContent='Describe the reason'; return; }
      await busy(btn,600);
      const label = r.options[r.selectedIndex].text; p.status='Rejected'; p.reason = label + (d.value.trim()?' — '+d.value.trim():''); p.reviewedBy=me().name; p.reviewedAt=new Date().toISOString();
      o.paymentStatus='Rejected'; o.status='Awaiting Payment'; addHistory(o,'Awaiting Payment',me().name,'Payment rejected: '+p.reason);
      notify(o.customerId, `Your payment for ${o.id} was rejected: ${p.reason}. Please re-submit.`, '/pay/'+o.id);
      save(); closeModal(); toast(`Payment rejected — customer notified to re-submit`,'ok'); go('/mis/payments/'+p.id); }});
});

/* ---------------- Inventory ---------------- */
route('/mis/inventory', ({query:q}) => {
  let rows = S.products.flatMap(p=>p.variants.map(v=>({p,v})));
  if (q.q){ const s=q.q.toLowerCase(); rows=rows.filter(({p,v})=>(p.name+' '+v.sku+' '+v.color+' '+v.size).toLowerCase().includes(s)); }
  if (q.cat) rows=rows.filter(r=>r.p.cat===q.cat);
  if (q.filter==='low') rows=rows.filter(r=>r.v.stock<=S.settings.lowStock && r.v.stock>0); else if (q.filter==='out') rows=rows.filter(r=>r.v.stock<=0); else if (q.filter==='ok') rows=rows.filter(r=>r.v.stock>S.settings.lowStock);
  rows.sort((a,b)=> q.sort==='stock'?a.v.stock-b.v.stock : q.sort==='-stock'?b.v.stock-a.v.stock : 0);
  const all = S.products.flatMap(p=>p.variants);
  const page = Number(q.page||1);
  return mis(`${pageH('Inventory', `Stock per product variant (colour × size). Low-stock threshold: ${S.settings.lowStock} units.`, `${can('inventoryAdjust')?`<button class="btn btn-primary btn-sm" data-act="stock-adj">${ic('plus')} Record stock update</button>`:''}<button class="btn btn-outline btn-sm" data-act="export" data-what="inventory">${ic('download')} Export</button>`)}
    <div class="grid g4" style="margin-bottom:16px">${kpi('Variants tracked', all.length, 'layers')}${kpi('Units on hand', all.reduce((a,v)=>a+Math.max(0,v.stock),0).toLocaleString(), 'archive')}${kpi('Low stock', all.filter(v=>v.stock>0&&v.stock<=S.settings.lowStock).length, 'alert', 'At or below threshold', true, '/mis/inventory?filter=low')}${kpi('Out of stock', all.filter(v=>v.stock<=0).length, 'ban', 'Hidden from size picker', true, '/mis/inventory?filter=out')}</div>
    <div class="toolbar"><form class="search" data-form="inv-q">${ic('search')}<input class="input" name="q" placeholder="SKU, product, colour, size" value="${esc(q.q||'')}" aria-label="Search inventory"></form>
      <div class="row" style="gap:6px">${[['','All'],['ok','In stock'],['low','Low stock'],['out','Out of stock']].map(([k,l])=>`<button class="chip ${(q.filter||'')===k?'is-active':''}" data-act="qset" data-q='${JSON.stringify({filter:k,page:''})}'>${l}</button>`).join('')}</div>
      <select class="select" data-change="inv-cat" aria-label="Category"><option value="">All categories</option>${[...new Set(S.products.map(p=>p.cat))].map(c=>`<option ${q.cat===c?'selected':''}>${c}</option>`).join('')}</select>
      <select class="select" data-change="inv-sort" aria-label="Sort"><option value="">Default order</option><option value="stock" ${q.sort==='stock'?'selected':''}>Stock: low → high</option><option value="-stock" ${q.sort==='-stock'?'selected':''}>Stock: high → low</option></select></div>
    ${rows.length?`<div class="table-wrap"><table class="t stack"><thead><tr><th>SKU</th><th>Product</th><th>Variant</th><th class="num">Price</th><th class="num">On hand</th><th>Status</th>${can('inventoryAdjust')?'<th></th>':''}</tr></thead><tbody>${paginate(rows,page,12).map(({p,v})=>`<tr class="${v.stock<=S.settings.lowStock?'low':''}"><td data-l="SKU" class="small b">${v.sku}</td><td data-l="Product" class="small">${esc(p.name)}${p.status!=='Active'?' <span class="badge b-neutral">'+p.status+'</span>':''}</td><td data-l="Variant"><span class="row" style="gap:6px"><span class="sw" style="background:${COLORS[v.color]}"></span><span class="small">${esc(v.color)} · ${v.size}</span></span></td><td data-l="Price" class="num small">${peso(v.price)}</td><td data-l="On hand" class="num b">${v.stock}</td><td data-l="Status">${badge(stockState(v.stock))}</td>${can('inventoryAdjust')?`<td data-l=""><button class="btn btn-outline btn-sm" data-act="stock-adj" data-sku="${v.sku}">${ic('edit')} Adjust</button></td>`:''}</tr>`).join('')}</tbody></table></div><div class="table-wrap" style="border-top:none;border-radius:0 0 16px 16px;margin-top:-1px">${pager(rows.length,page,12)}</div>`
     :`<div class="card">${emptyState('search','No variants match','Try clearing the search or filter.',`<a class="btn btn-outline" href="#/mis/inventory">Clear filters</a>`)}</div>`}
    ${!can('inventoryAdjust')?`<div class="notice n-info" style="margin-top:12px">${ic('lock')}<div>Your role can view inventory but not change stock. Ask an administrator for the “Adjust stock” permission.</div></div>`:''}`, 'inventory', 'Inventory');
}, {auth:'mis', perm:'inventoryView'});
on('form:inv-q', f => qset({q:f.q.value.trim(), page:''}));
on('inv-cat', a => qset({cat:a.value, page:''}));
on('inv-sort', a => qset({sort:a.value}));
on('stock-adj', a => {
  if (!can('inventoryAdjust')){ toast('You do not have permission to adjust stock','err'); return; }
  const sku = a.dataset.sku;
  const opts = S.products.flatMap(p=>p.variants.map(v=>[v.sku, `${v.sku} — ${p.name.slice(0,28)} (${v.color}, ${v.size}) · ${v.stock} on hand`]));
  modal(`<div class="mh"><div><div class="m-icon" style="background:var(--lime-200);color:var(--olive-800)">${ic('archive')}</div><h3>Record stock update</h3><p class="small muted">Every change is logged with your name and reason.</p></div><button class="icon-btn" data-act="modal-close" aria-label="Close">${ic('x')}</button></div>
  <form class="mb col" data-form="stock" novalidate style="gap:14px">${field({name:'sku', label:'Variant (SKU)', required:true, value:sku||'', options:[['','Select a variant…'],...opts], attrs:'data-change="adj-preview"'})}
    <div class="grid g2">${field({name:'type', label:'Type', required:true, options:[['in','Stock in (+)'],['out','Stock out (−)'],['set','Set exact count (stocktake)']], attrs:'data-change="adj-preview"'})}${field({name:'qty', label:'Quantity', type:'number', required:true, attrs:'min="0" data-input="adj-preview"'})}</div>
    ${field({name:'reason', label:'Reason', required:true, options:[['','Select…'],'Restock — production batch','Customer return','Damaged / defective','Stocktake correction','Transferred to showroom','Other']})}
    <div id="adj-prev" class="notice n-lime small">${ic('info')}<div>Select a variant and quantity to preview the new stock level.</div></div>
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn btn-outline" data-act="modal-close">Cancel</button><button class="btn btn-primary" data-loading="Saving…">Save stock update</button></div></form>`);
});
function adjCalc(f){ const r=variantBySku(f.sku.value); const n=parseInt(f.qty.value); if(!r||isNaN(n)) return null; const before=r.v.stock; const after = f.type.value==='in'?before+n : f.type.value==='out'?before-n : n; return {r,before,after,n}; }
on('adj-preview', a => { const f=a.closest('form'); const c=adjCalc(f); const box=document.getElementById('adj-prev'); if(!c) return;
  box.className = 'notice small '+(c.after<0?'n-err':c.after<=S.settings.lowStock?'n-warn':'n-ok');
  box.innerHTML = ic(c.after<0?'xc':'info') + `<div>${c.after<0?`<b>Not allowed:</b> stock cannot go below zero (only ${c.before} on hand).`:`${c.r.v.sku}: <b>${c.before}</b> → <b>${c.after}</b> units${c.after<=S.settings.lowStock?' · will be flagged low stock':''}`}</div>`; });
on('form:stock', async f => {
  if (!validate(f, {sku:[req('Select a variant')], qty:[req('Enter a quantity'), [v=>/^\d+$/.test(v),'Enter a whole number'], [(v,fm)=>fm.type.value==='set'||Number(v)>0,'Quantity must be greater than zero']], reason:[req('Select a reason')]})) return;
  const c = adjCalc(f);
  if (c.after<0){ const fl=f.qty.closest('.field'); fl.classList.add('has-error'); fl.querySelector('.err').textContent=`Cannot remove ${c.n} — only ${c.before} on hand. Inventory cannot be negative.`; return; }
  await busy(f.querySelector('.btn-primary'),600);
  c.r.v.stock = c.after; S.stockLog.unshift({id:uid('ST'), at:new Date().toISOString(), sku:c.r.v.sku, product:c.r.p.name, change:c.after-c.before, before:c.before, after:c.after, reason:f.reason.value, by:me().name});
  save(); closeModal(); toast(`Stock updated: ${c.r.v.sku} ${c.before} → ${c.after}`,'ok'); render();
});

/* ---------------- Transaction records ---------------- */
route('/mis/transactions', ({query:q}) => {
  const t = q.tab||'payments'; const page=Number(q.page||1);
  let body='';
  if (t==='payments'){ let ps=[...S.payments].sort((a,b)=>b.submitted.localeCompare(a.submitted)); if(q.q){const s=q.q.toLowerCase(); ps=ps.filter(p=>(p.ref+p.orderId+p.customerName).toLowerCase().includes(s));}
    body = ps.length?`<div class="table-wrap"><table class="t stack"><thead><tr><th>Date</th><th>Record</th><th>Order</th><th>Customer</th><th>Method</th><th>Reference</th><th class="num">Amount</th><th>Result</th><th>Reviewed by</th></tr></thead><tbody>${paginate(ps,page,10).map(p=>`<tr class="clickable" data-act="go" data-to="/mis/payments/${p.id}"><td data-l="Date">${fmtDT(p.submitted)}</td><td data-l="Record" class="small">${p.id}</td><td data-l="Order" class="b">${p.orderId}</td><td data-l="Customer">${esc(p.customerName)}</td><td data-l="Method">${PAY_METHODS[p.method].short}</td><td data-l="Reference" class="small">${esc(p.ref)}</td><td data-l="Amount" class="num">${peso(p.amount)}</td><td data-l="Result">${badge(p.status)}</td><td data-l="Reviewed by" class="small">${esc(p.reviewedBy||'—')}</td></tr>`).join('')}</tbody></table></div><div class="table-wrap" style="border-top:none;border-radius:0 0 16px 16px;margin-top:-1px">${pager(ps.length,page,10)}</div>`:`<div class="card">${emptyState('search','No records found','')}</div>`; }
  else { let ls=[...S.stockLog]; if(q.q){const s=q.q.toLowerCase(); ls=ls.filter(l=>(l.sku+l.product+l.reason+l.by).toLowerCase().includes(s));}
    body = ls.length?`<div class="table-wrap"><table class="t stack"><thead><tr><th>Date</th><th>SKU</th><th>Product</th><th class="num">Change</th><th class="num">Before → After</th><th>Reason</th><th>By</th></tr></thead><tbody>${paginate(ls,page,10).map(l=>`<tr><td data-l="Date">${fmtDT(l.at)}</td><td data-l="SKU" class="small b">${l.sku}</td><td data-l="Product" class="small">${esc(l.product)}</td><td data-l="Change" class="num b" style="color:${l.change<0?'var(--red)':'var(--green)'}">${l.change>0?'+':''}${l.change}</td><td data-l="Before → After" class="num">${l.before} → ${l.after}</td><td data-l="Reason" class="small">${esc(l.reason)}</td><td data-l="By" class="small">${esc(l.by)}</td></tr>`).join('')}</tbody></table></div><div class="table-wrap" style="border-top:none;border-radius:0 0 16px 16px;margin-top:-1px">${pager(ls.length,page,10)}</div>`:`<div class="card">${emptyState('search','No stock movements found','')}</div>`; }
  return mis(`${pageH('Transaction records', 'Read-only audit trail of payment decisions and stock movements.', `<button class="btn btn-outline btn-sm" data-act="export" data-what="transactions">${ic('download')} Export CSV</button>`)}
    <div class="tabs" style="margin-bottom:14px"><button class="tab ${t==='payments'?'is-active':''}" data-act="qset" data-q='{"tab":"","page":""}'>Payment records</button><button class="tab ${t==='stock'?'is-active':''}" data-act="qset" data-q='{"tab":"stock","page":""}'>Stock movements</button></div>
    <div class="toolbar"><form class="search" data-form="tx-q">${ic('search')}<input class="input" name="q" placeholder="Search records" value="${esc(q.q||'')}" aria-label="Search records"></form></div>${body}`, 'tx', 'Transactions');
}, {auth:'mis', perm:'transactions'});
on('form:tx-q', f => qset({q:f.q.value.trim(), page:''}));
on('export', a => toast(`Prototype: ${a.dataset.what} CSV would download here (${a.dataset.what==='orders'?S.orders.length:a.dataset.what==='inventory'?S.products.flatMap(p=>p.variants).length:S.payments.length} rows)`,'info'));

/* ---------------- Products (admin) ---------------- */
route('/mis/products', ({query:q}) => {
  let ps = [...S.products]; if (q.q){ const s=q.q.toLowerCase(); ps=ps.filter(p=>(p.name+p.id+p.cat).toLowerCase().includes(s)); } if (q.status) ps=ps.filter(p=>p.status===q.status);
  return mis(`${pageH('Products & variants', 'Manage the catalog shown on the storefront. Draft and archived products are hidden from customers.', `<a class="btn btn-primary btn-sm" href="#/mis/products/new">${ic('plus')} Add product</a>`)}
    <div class="toolbar"><form class="search" data-form="prod-q">${ic('search')}<input class="input" name="q" placeholder="Product name, ID, category" value="${esc(q.q||'')}" aria-label="Search products"></form>
      <div class="row" style="gap:6px">${['','Active','Draft','Archived'].map(s=>`<button class="chip ${(q.status||'')===s?'is-active':''}" data-act="qset" data-q='${JSON.stringify({status:s})}'>${s||'All'} <span class="xs">${s?S.products.filter(p=>p.status===s).length:S.products.length}</span></button>`).join('')}</div></div>
    ${ps.length?`<div class="table-wrap"><table class="t stack"><thead><tr><th>Product</th><th>Category</th><th class="num">Price range</th><th class="num">Variants</th><th class="num">Stock</th><th>Status</th><th></th></tr></thead><tbody>${ps.map(p=>{ const st=totalStock(p); return `<tr class="clickable" data-act="go" data-to="/mis/products/${p.id}"><td data-l="Product"><div class="row"><div class="thumb" style="width:44px;height:44px;${pBg(p.variants[0].color)}">${art(p,p.variants[0].color,40)}</div><div><b class="small">${esc(p.name)}</b><div class="xs muted">${p.id}</div></div></div></td><td data-l="Category" class="small">${esc(p.cat)}</td><td data-l="Price range" class="num small">${priceRange(p)}</td><td data-l="Variants" class="num">${p.variants.length}</td><td data-l="Stock" class="num ${st===0?'':''}"><b>${st}</b> ${p.variants.some(v=>v.stock<=S.settings.lowStock)?`<span class="badge b-amber plain" title="Has low/out-of-stock variants">!</span>`:''}</td><td data-l="Status">${badge(p.status)}</td><td data-l="">${ic('chevR')}</td></tr>`; }).join('')}</tbody></table></div>`:`<div class="card">${emptyState('tag','No products found','',`<a class="btn btn-primary" href="#/mis/products/new">Add product</a>`)}</div>`}`, 'products', 'Products');
}, {auth:'mis', perm:'products'});
on('form:prod-q', f => qset({q:f.q.value.trim()}));
let PE = null;
route('/mis/products/:id', ({params}) => {
  const isNew = params.id==='new'; const src = isNew ? null : product(params.id);
  if (!isNew && !src) return mis(`<div class="card">${emptyState('search','Product not found','',`<a class="btn btn-primary" href="#/mis/products">Back</a>`)}</div>`,'products','Product');
  if (!PE || PE.id !== params.id) PE = { id:params.id, tab:'details', p: isNew ? {id:'P-'+(1001+S.products.length), name:'', cat:'Scrub Sets', style:'', fabric:'', desc:'', tags:[], rating:0, reviews:0, sold:0, status:'Draft', embroidery:true, variants:[]} : JSON.parse(JSON.stringify(src)), dirty:false };
  const p = PE.p;
  const used = !isNew && S.orders.some(o=>o.items.some(i=>i.pid===p.id));
  return mis(`<nav class="crumbs" style="padding-top:0"><a href="#/mis/products">Products</a>›<b>${isNew?'New product':esc(p.name)}</b></nav>
    ${pageH(isNew?'Add product':'Edit product', isNew?'Create the product, then add its colour × size variants with prices and opening stock.':`${p.id} · ${p.variants.length} variants · ${totalStock(p)} units`, `${!isNew?badge(p.status):''}${!isNew?`<a class="btn btn-outline btn-sm" href="#/product/${p.id}">${ic('eye')} Preview</a>`:''}`)}
    <div class="tabs" style="margin-bottom:16px">${[['details','Details'],['variants',`Variants (${p.variants.length})`]].map(([k,l])=>`<button class="tab ${PE.tab===k?'is-active':''}" data-act="pe-tab" data-t="${k}">${l}</button>`).join('')}</div>
    ${PE.tab==='details'?`<form data-form="pe-details" novalidate class="detail-grid"><div class="card col" style="gap:14px">
        ${field({name:'name', label:'Product name', required:true, value:p.name, ph:'e.g. Heritage V-Neck Suit'})}
        <div class="grid g2">${field({name:'cat', label:'Category', required:true, value:p.cat, options:['Scrub Sets','Tops','Trousers','Lab Coats','Outerwear','Accessories','Base Layer']})}${field({name:'style', label:'Style / cut', required:true, value:p.style, ph:'e.g. Classic V-Neck'})}</div>
        ${field({name:'fabric', label:'Fabric composition', value:p.fabric, ph:'e.g. 72% Poly · 21% Rayon · 7% Spandex'})}
        ${field({name:'desc', label:'Description', required:true, value:p.desc, textarea:true})}
        ${field({name:'tags', label:'Badges (comma-separated)', value:p.tags.join(', '), hint:'Shown on product cards, e.g. Bestseller, Antimicrobial'})}
      </div><div class="col" style="gap:16px"><div class="card col" style="gap:14px"><h3>Publishing</h3>${field({name:'status', label:'Status', value:p.status, options:['Draft','Active','Archived'], hint:'Only Active products appear on the storefront.'})}
        <label class="check"><input type="checkbox" name="embroidery" ${p.embroidery?'checked':''}><span class="small">Offer name embroidery add-on (+${peso(EMBROIDERY_FEE)})</span></label>
        <label class="check"><input type="checkbox" name="customizable" ${p.customizable?'checked':''}><span class="small">Allow customer customization (colours, patterns, trim — made to order, ${CUSTOM_LEAD})</span></label></div>
        <div class="card col"><button class="btn btn-primary btn-lg" data-loading="Saving…">${ic('check')} ${isNew?'Create product':'Save changes'}</button><a class="btn btn-ghost" href="#/mis/products" data-act="pe-cancel">Cancel</a>
        ${!isNew?`<div class="divider"></div><button type="button" class="btn btn-danger-outline" data-act="pe-archive">${ic(used?'archive':'trash')} ${used?'Archive product':'Delete product'}</button><p class="xs muted">${used?'This product appears in past orders, so it can be archived but not deleted.':'Deleting removes the product and all its variants.'}</p>`:''}</div></div></form>`
    : `<div class="card"><div class="card-h"><div><h3>Variants</h3><p class="xs muted">Each colour × size combination has its own SKU, price and stock.</p></div><div class="row"><button class="btn btn-outline btn-sm" data-act="pe-bulk">${ic('layers')} Generate variants</button><button class="btn btn-primary btn-sm" data-act="pe-var">${ic('plus')} Add variant</button></div></div>
      ${p.variants.length?`<div class="table-wrap"><table class="t stack"><thead><tr><th>SKU</th><th>Colour</th><th>Size</th><th class="num">Price</th><th class="num">Stock</th><th>Visible</th><th></th></tr></thead><tbody>${p.variants.map((v,i)=>`<tr><td data-l="SKU" class="small b">${v.sku}</td><td data-l="Colour"><span class="row" style="gap:6px"><span class="sw" style="background:${COLORS[v.color]}"></span>${esc(v.color)}</span></td><td data-l="Size">${v.size}</td><td data-l="Price" class="num">${peso(v.price)}</td><td data-l="Stock" class="num">${v.stock} ${v.stock<=S.settings.lowStock?badge(stockState(v.stock)):''}</td><td data-l="Visible"><label class="check"><input type="checkbox" data-change="pe-vis" data-i="${i}" ${v.active?'checked':''}><span class="xs">${v.active?'Shown':'Hidden'}</span></label></td><td data-l=""><button class="btn btn-ghost btn-sm" data-act="pe-var" data-i="${i}">${ic('edit')} Edit</button></td></tr>`).join('')}</tbody></table></div>`
      : emptyState('layers','No variants yet','Add at least one colour × size variant before publishing this product.',`<button class="btn btn-primary" data-act="pe-bulk">${ic('layers')} Generate variants</button>`)}
      <div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn btn-primary" data-act="pe-save-vars">${ic('check')} Save variants</button></div>
      <p class="xs muted">Stock for existing variants is changed via <a href="#/mis/inventory">Inventory → Record stock update</a> so that every change is logged.</p></div>`}`, 'products', isNew?'New product':p.name);
}, {auth:'mis', perm:'products'});
on('pe-tab', a => { if (PE.tab==='details'){ const f=document.querySelector('form[data-form=pe-details]'); if (f) readPE(f); } PE.tab=a.dataset.t; render(); });
on('pe-cancel', () => { PE=null; go('/mis/products'); });
function readPE(f){ const p=PE.p; p.name=f.name.value.trim(); p.cat=f.cat.value; p.style=f.style.value.trim(); p.fabric=f.fabric.value.trim(); p.desc=f.desc.value.trim(); p.tags=f.tags.value.split(',').map(s=>s.trim()).filter(Boolean); p.status=f.status.value; p.embroidery=f.embroidery.checked; p.customizable=f.customizable.checked; }
function commitPE(){ const i=S.products.findIndex(x=>x.id===PE.p.id); if (i>=0) S.products[i]=JSON.parse(JSON.stringify(PE.p)); else S.products.push(JSON.parse(JSON.stringify(PE.p))); save(); }
on('form:pe-details', async f => {
  if (!validate(f,{name:[req('Product name is required'), [v=>!S.products.some(x=>x.name.toLowerCase()===v.toLowerCase()&&x.id!==PE.p.id),'Another product already uses this name']], style:[req('Style is required')], desc:[req('Add a short description')], status:[[(v)=>v!=='Active'||PE.p.variants.length>0,'Add at least one variant before setting the product Active']]})) return;
  readPE(f); await busy(f.querySelector('.btn-primary'),600); const isNew = !S.products.some(x=>x.id===PE.p.id); commitPE();
  toast(isNew?`Product created as ${PE.p.status}. Now add variants.`:'Product saved','ok'); if (isNew){ PE.tab='variants'; go('/mis/products/'+PE.p.id); PE.id=PE.p.id; } else render();
});
on('pe-vis', a => { PE.p.variants[a.dataset.i].active = a.checked; render(); });
on('pe-save-vars', async a => { if (!S.products.some(x=>x.id===PE.p.id)){ toast('Save the product details first','warn'); PE.tab='details'; render(); return; } await busy(a,500); commitPE(); toast('Variants saved','ok'); render(); });
on('pe-var', a => {
  const i = a.dataset.i; const v = i!=null ? PE.p.variants[i] : null; const isNew=!v;
  modal(`<div class="mh"><h3>${isNew?'Add variant':'Edit variant '+v.sku}</h3><button class="icon-btn" data-act="modal-close" aria-label="Close">${ic('x')}</button></div>
  <form class="mb col" data-form="pe-var" data-i="${i??''}" novalidate style="gap:14px"><div class="grid g2">${field({name:'color', label:'Colour', required:true, value:v?.color||'', options:[['','Select…'],...Object.keys(COLORS)], attrs:isNew?'':'disabled'})}${field({name:'size', label:'Size', required:true, value:v?.size||'', options:[['','Select…'],...SIZES,'One Size'], attrs:isNew?'':'disabled'})}</div>
  <div class="grid g2">${field({name:'price', label:'Price (₱)', required:true, type:'number', value:v?.price||'', attrs:'min="1"'})}${field({name:'stock', label:isNew?'Opening stock':'Stock (edit in Inventory)', type:'number', value:v?.stock??0, attrs:isNew?'min="0"':'disabled'})}</div>
  <div class="row" style="justify-content:space-between">${!isNew?`<button type="button" class="btn btn-danger-outline" data-act="pe-var-del" data-i="${i}">${ic('trash')} Remove</button>`:'<span></span>'}<div class="row"><button type="button" class="btn btn-outline" data-act="modal-close">Cancel</button><button class="btn btn-primary">${isNew?'Add variant':'Update'}</button></div></div></form>`);
});
on('form:pe-var', f => { const i=f.dataset.i; const isNew = i==='';
  if (!validate(f, isNew?{color:[req('Select a colour')], size:[req('Select a size')], price:[req('Enter a price'),[v=>Number(v)>0,'Price must be greater than 0']], stock:[[v=>v===''||Number(v)>=0,'Stock cannot be negative']]}:{price:[req('Enter a price'),[v=>Number(v)>0,'Price must be greater than 0']]})) return;
  if (isNew){ if (PE.p.variants.some(v=>v.color===f.color.value&&v.size===f.size.value)){ const fl=f.size.closest('.field'); fl.classList.add('has-error'); fl.querySelector('.err').textContent='This colour × size variant already exists'; return; }
    const pre = PE.p.name.split(/\s+/).filter(w=>/^[A-Za-z]/.test(w)).map(w=>w[0]).join('').slice(0,3).toUpperCase()||'NEW';
    PE.p.variants.push({sku:`${pre}-${f.color.value.split(' ').map(w=>w[0]).join('')}-${f.size.value.replace(' ','')}`, color:f.color.value, size:f.size.value, price:Number(f.price.value), stock:Number(f.stock.value||0), active:true}); }
  else PE.p.variants[i].price = Number(f.price.value);
  closeModal(); toast(isNew?'Variant added — remember to save':'Variant updated — remember to save','ok'); render(); });
on('pe-var-del', a => { const v=PE.p.variants[a.dataset.i]; const used=S.orders.some(o=>o.items.some(i=>i.sku===v.sku));
  if (used){ toast('This variant appears in orders — hide it instead of removing','warn'); return; } PE.p.variants.splice(a.dataset.i,1); closeModal(); render(); });
on('pe-bulk', () => modal(`<div class="mh"><div><h3>Generate variants</h3><p class="small muted">Creates every colour × size combination that doesn't exist yet.</p></div><button class="icon-btn" data-act="modal-close" aria-label="Close">${ic('x')}</button></div>
  <form class="mb col" data-form="pe-bulk" novalidate style="gap:14px"><div class="field"><span class="label">Colours <span class="req">*</span></span><div class="row wrap">${Object.keys(COLORS).map(c=>`<label class="chip"><input type="checkbox" name="c" value="${c}" style="accent-color:var(--olive-800)"><span class="sw" style="background:${COLORS[c]}"></span>${c}</label>`).join('')}</div><div class="err"></div></div>
  <div class="field"><span class="label">Sizes <span class="req">*</span></span><div class="row wrap">${SIZES.map(z=>`<label class="chip"><input type="checkbox" name="z" value="${z}" checked style="accent-color:var(--olive-800)">${z}</label>`).join('')}</div><div class="err"></div></div>
  <div class="grid g3">${field({name:'price', label:'Base price (₱)', required:true, type:'number', value:1650})}${field({name:'up', label:'2XL–3XL surcharge', type:'number', value:150})}${field({name:'stock', label:'Opening stock each', type:'number', value:10})}</div>
  <div class="row" style="justify-content:flex-end"><button type="button" class="btn btn-outline" data-act="modal-close">Cancel</button><button class="btn btn-primary">Generate</button></div></form>`, {lg:true}));
on('form:pe-bulk', f => { const cs=[...f.querySelectorAll('[name=c]:checked')].map(x=>x.value), zs=[...f.querySelectorAll('[name=z]:checked')].map(x=>x.value);
  const fc=f.querySelectorAll('.field')[0], fz=f.querySelectorAll('.field')[1]; fc.classList.toggle('has-error',!cs.length); fc.querySelector('.err').textContent='Pick at least one colour'; fz.classList.toggle('has-error',!zs.length); fz.querySelector('.err').textContent='Pick at least one size';
  if (!cs.length||!zs.length||!validate(f,{price:[req('Enter a base price'),[v=>Number(v)>0,'Must be greater than 0']]})) return;
  const pre = (PE.p.name||'NEW').split(/\s+/).filter(w=>/^[A-Za-z]/.test(w)).map(w=>w[0]).join('').slice(0,3).toUpperCase(); let n=0;
  cs.forEach(c=>zs.forEach(z=>{ if (PE.p.variants.some(v=>v.color===c&&v.size===z)) return; n++; PE.p.variants.push({sku:`${pre}-${c.split(' ').map(w=>w[0]).join('')}-${z}`, color:c, size:z, price:Number(f.price.value)+((z==='2XL'||z==='3XL')?Number(f.up.value||0):0), stock:Number(f.stock.value||0), active:true}); }));
  closeModal(); toast(`${n} variant${n===1?'':'s'} generated — click “Save variants”`,'ok'); render(); });
on('pe-archive', () => { const p=PE.p; const used=S.orders.some(o=>o.items.some(i=>i.pid===p.id));
  confirmModal({title:used?'Archive product?':'Delete product?', danger:true, body:used?`<b>${esc(p.name)}</b> will be hidden from the storefront. Past orders keep their records.`:`<b>${esc(p.name)}</b> and its ${p.variants.length} variants will be permanently deleted.`, ok:used?'Archive':'Delete', onOk:()=>{ if (used){ product(p.id).status='Archived'; } else S.products=S.products.filter(x=>x.id!==p.id); save(); PE=null; closeModal(); toast(used?'Product archived':'Product deleted','ok'); go('/mis/products'); }}); });

/* ---------------- Customers (admin) ---------------- */
route('/mis/customers', ({query:q}) => {
  let cs = S.users.filter(u=>u.role==='customer'); if (q.q){ const s=q.q.toLowerCase(); cs=cs.filter(c=>(c.name+c.email+c.phone).toLowerCase().includes(s)); } if (q.status) cs=cs.filter(c=>c.status===q.status);
  return mis(`${pageH('Customer accounts', 'Registered storefront customers. Customers create their own accounts; administrators can view, suspend or reactivate them.')}
    <div class="toolbar"><form class="search" data-form="cust-q">${ic('search')}<input class="input" name="q" placeholder="Name, email, mobile" value="${esc(q.q||'')}" aria-label="Search customers"></form>${['','Active','Suspended'].map(s=>`<button class="chip ${(q.status||'')===s?'is-active':''}" data-act="qset" data-q='${JSON.stringify({status:s})}'>${s||'All'}</button>`).join('')}</div>
    ${cs.length?`<div class="table-wrap"><table class="t stack"><thead><tr><th>Customer</th><th>Mobile</th><th>Joined</th><th class="num">Orders</th><th class="num">Verified spend</th><th>Status</th><th></th></tr></thead><tbody>${cs.map(c=>{ const os=S.orders.filter(o=>o.customerId===c.id); return `<tr><td data-l="Customer"><div class="row"><span class="avatar light" style="width:32px;height:32px;font-size:11px">${initials(c.name)}</span><div><b class="small">${esc(c.name)}</b><div class="xs muted">${esc(c.email)}</div></div></div></td><td data-l="Mobile" class="small">${esc(c.phone)}</td><td data-l="Joined" class="small">${fmtDate(c.created)}</td><td data-l="Orders" class="num">${os.length}</td><td data-l="Verified spend" class="num">${peso(os.filter(o=>['Verified','Cash Collected'].includes(o.paymentStatus)).reduce((a,o)=>a+o.total,0))}</td><td data-l="Status">${badge(c.status)}</td><td data-l=""><div class="row" style="gap:4px"><a class="btn btn-ghost btn-sm" href="#/mis/orders?q=${encodeURIComponent(c.email)}">Orders</a><button class="btn btn-outline btn-sm" data-act="cust-status" data-id="${c.id}">${c.status==='Active'?'Suspend':'Reactivate'}</button></div></td></tr>`; }).join('')}</tbody></table></div>`:`<div class="card">${emptyState('users','No customers found','')}</div>`}`, 'customers', 'Customers');
}, {auth:'mis', perm:'customers'});
on('form:cust-q', f => qset({q:f.q.value.trim()}));
on('cust-status', a => { const c=S.users.find(u=>u.id===a.dataset.id); const sus=c.status==='Active';
  confirmModal({title:sus?'Suspend customer?':'Reactivate customer?', danger:sus, body:sus?`<b>${esc(c.name)}</b> will not be able to sign in or place orders. Existing orders are unaffected.`:`<b>${esc(c.name)}</b> will be able to sign in again.`, ok:sus?'Suspend':'Reactivate', onOk:()=>{ c.status=sus?'Suspended':'Active'; save(); closeModal(); toast(`${c.name} ${sus?'suspended':'reactivated'}`,'ok'); render(); }}); });

/* ---------------- Staff accounts (admin) ---------------- */
route('/mis/staff', () => {
  const st = S.users.filter(u=>u.role!=='customer');
  return mis(`${pageH('Staff accounts', 'Internal users are created here by an administrator — never through public registration.', `<a class="btn btn-primary btn-sm" href="#/mis/staff/new">${ic('userPlus')} Create staff account</a>`)}
    <div class="table-wrap"><table class="t stack"><thead><tr><th>Name</th><th>Role</th><th>Module access</th><th>Created</th><th>Status</th><th></th></tr></thead><tbody>${st.map(u=>`<tr><td data-l="Name"><div class="row"><span class="avatar" style="width:32px;height:32px;font-size:11px">${initials(u.name)}</span><div><b class="small">${esc(u.name)}${u.id===me().id?' <span class="badge b-lime plain">You</span>':''}</b><div class="xs muted">${esc(u.email)}</div></div></div></td><td data-l="Role">${u.role==='admin'?'<span class="badge b-olive plain">Administrator</span>':'<span class="badge b-neutral plain">Staff</span>'}</td><td data-l="Module access" class="small">${u.role==='admin'?'All modules':Object.entries(S.roles.staff).filter(([,v])=>v).length+' staff permissions'}</td><td data-l="Created" class="small">${fmtDate(u.created)}</td><td data-l="Status">${badge(u.status)}</td><td data-l="">${u.id===me().id?'':`<div class="row" style="gap:4px"><button class="btn btn-ghost btn-sm" data-act="staff-reset" data-id="${u.id}">${ic('key')} Reset password</button><button class="btn btn-outline btn-sm" data-act="staff-status" data-id="${u.id}">${u.status==='Active'?'Deactivate':'Activate'}</button></div>`}</td></tr>`).join('')}</tbody></table></div>
    <div class="notice n-info" style="margin-top:12px">${ic('info')}<div>Deactivated staff cannot sign in. Their past actions remain in the transaction records.</div></div>`, 'staff', 'Staff accounts');
}, {auth:'mis', perm:'staffAccounts'});
route('/mis/staff/new', () => mis(`<nav class="crumbs" style="padding-top:0"><a href="#/mis/staff">Staff accounts</a>›<b>Create</b></nav>${pageH('Create staff account', 'The new user receives a temporary password and must change it at first sign-in.')}
  <form class="detail-grid" data-form="staff-new" novalidate><div class="card col" style="gap:14px">
    <div class="grid g2">${field({name:'name', label:'Full name', required:true, ph:'e.g. Ana Reyes'})}${field({name:'phone', label:'Mobile number', required:true, ph:'0917 123 4567'})}</div>
    ${field({name:'email', label:'Work email', type:'email', required:true, ph:'name@merlys.ph', hint:'Must be a @merlys.ph address'})}
    ${field({name:'role', label:'Role', required:true, options:[['staff','Staff — orders, payments, inventory'],['admin','Administrator — full access']]})}
    <div class="grid g2">${field({name:'password', label:'Temporary password', type:'text', required:true, value:'Merlys@'+Math.floor(1000+Math.random()*9000), hint:'Share securely with the employee'})}</div>
  </div><div class="card col"><h3>Access summary</h3><p class="small muted">Staff permissions are managed in <a href="#/mis/roles">Roles & permissions</a>.</p>
    <ul class="small" style="margin:0;padding-left:18px;line-height:1.9">${Object.entries(PERM_LABELS).map(([k,l])=>`<li>${S.roles.staff[k]?'✓':'✕'} ${l}</li>`).join('')}</ul>
    <button class="btn btn-primary btn-lg" data-loading="Creating…">${ic('userPlus')} Create account</button><a class="btn btn-ghost" href="#/mis/staff">Cancel</a></div></form>`, 'staff', 'Create staff'), {auth:'mis', perm:'staffAccounts'});
on('form:staff-new', async f => {
  if (!validate(f,{name:[req('Full name is required')], phone:[req('Mobile number is required'), isPhone], email:[req('Email is required'), isEmail, [v=>/@merlys\.ph$/i.test(v),'Use a @merlys.ph work email'], [v=>!S.users.some(u=>u.email.toLowerCase()===v.toLowerCase()),'This email is already in use']], password:[req('Set a temporary password'), strongPw]})) return;
  await busy(f.querySelector('.btn-primary'),700);
  const u={id:uid('U'), role:f.role.value, name:f.name.value.trim(), email:f.email.value.trim(), phone:f.phone.value.trim(), password:f.password.value, status:'Active', created:new Date().toISOString().slice(0,10)}; S.users.push(u); save();
  modal(`<div class="mh"><div><div class="m-icon" style="background:var(--green-bg);color:var(--green)">${ic('checkC')}</div><h3>Account created</h3></div></div><div class="mb"><dl class="kv"><dt>Name</dt><dd>${esc(u.name)}</dd><dt>Role</dt><dd>${u.role}</dd><dt>Sign-in email</dt><dd>${esc(u.email)}</dd><dt>Temp password</dt><dd><code>${esc(u.password)}</code></dd></dl><p class="xs muted" style="margin-top:10px">They sign in from the ${u.role==='admin'?'Admin':'Staff'} tab of the portal.</p></div><div class="mf"><button class="btn btn-primary" data-act="staff-done">Done</button></div>`);
});
on('staff-done', () => { closeModal(); go('/mis/staff'); });
on('staff-status', a => { const u=S.users.find(x=>x.id===a.dataset.id); const off=u.status==='Active';
  if (off && u.role==='admin' && S.users.filter(x=>x.role==='admin'&&x.status==='Active').length<=1){ toast('At least one active administrator is required','err'); return; }
  confirmModal({title:off?'Deactivate account?':'Activate account?', danger:off, body:`${esc(u.name)} ${off?'will be signed out and unable to sign in.':'will be able to sign in again.'}`, ok:off?'Deactivate':'Activate', onOk:()=>{ u.status=off?'Deactivated':'Active'; save(); closeModal(); toast(`${u.name} ${off?'deactivated':'activated'}`,'ok'); render(); }}); });
on('staff-reset', a => { const u=S.users.find(x=>x.id===a.dataset.id); confirmModal({title:'Reset password?', icon:'key', body:`Generate a new temporary password for <b>${esc(u.name)}</b>?`, ok:'Reset', onOk:()=>{ u.password='Merlys@'+Math.floor(1000+Math.random()*9000); save(); closeModal(); modal(`<div class="mh"><h3>New temporary password</h3></div><div class="mb"><p class="small">Share securely with ${esc(u.name)}:</p><p style="font-size:20px;font-weight:800;margin-top:8px"><code>${u.password}</code></p></div><div class="mf"><button class="btn btn-primary" data-act="modal-close">Done</button></div>`); }}); });

/* ---------------- Roles & permissions (admin) ---------------- */
const PERM_LABELS = {orders:'View orders', orderStatus:'Update order status', payments:'Verify / reject payments', inventoryView:'View inventory', inventoryAdjust:'Adjust stock', transactions:'View transaction records', products:'Manage products & variants', customers:'Manage customer accounts', staffAccounts:'Manage staff accounts & roles', reports:'View sales & inventory reports', settings:'System settings'};
const ADMIN_ONLY = ['products','customers','staffAccounts','reports','settings'];
route('/mis/roles', () => mis(`${pageH('Roles & permissions', 'SMART has three roles. Customers have no MIS access. Staff permissions can be narrowed; administrator-only modules cannot be granted to staff.')}
  <form class="card" data-form="roles"><div class="table-wrap"><table class="t perm-table"><thead><tr><th>Permission</th><th>Customer</th><th>Staff</th><th>Administrator</th></tr></thead><tbody>
  ${Object.entries(PERM_LABELS).map(([k,l])=>`<tr><td class="small b">${l}${ADMIN_ONLY.includes(k)?' <span class="badge b-neutral plain">Admin only</span>':''}</td><td>${ic('x','')}</td><td><input type="checkbox" name="${k}" ${S.roles.staff[k]?'checked':''} ${ADMIN_ONLY.includes(k)?'disabled':''} aria-label="Staff: ${l}" style="width:18px;height:18px;accent-color:var(--olive-800)"></td><td><input type="checkbox" checked disabled aria-label="Admin: ${l}" style="width:18px;height:18px;accent-color:var(--olive-800)"></td></tr>`).join('')}
  <tr><td class="small b">Shop, cart, checkout, own orders</td><td>${ic('check','')}</td><td>—</td><td>—</td></tr></tbody></table></div>
  <div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn btn-primary" data-loading="Saving…">${ic('check')} Save staff permissions</button></div></form>`, 'roles', 'Roles'), {auth:'mis', perm:'staffAccounts'});
on('form:roles', async f => { const next={...S.roles.staff}; Object.keys(PERM_LABELS).forEach(k=>{ if(!ADMIN_ONLY.includes(k)) next[k]=f[k].checked; });
  if (next.orderStatus && !next.orders){ toast('“Update order status” requires “View orders”','warn'); return; } if (next.inventoryAdjust && !next.inventoryView){ toast('“Adjust stock” requires “View inventory”','warn'); return; }
  await busy(f.querySelector('.btn-primary'),500); S.roles.staff=next; save(); toast('Staff permissions updated','ok'); render(); });

/* ---------------- Reports (admin) ---------------- */
route('/mis/reports', ({query:q}) => {
  const t=q.tab||'sales'; const range=q.range||'6m';
  const paid = S.orders.filter(o=>['Verified','Cash Collected'].includes(o.paymentStatus));
  const ms = monthlySales(); const rows = range==='3m'?ms.slice(-3):ms;
  let body='';
  if (t==='sales'){
    const byProd = {}; paid.forEach(o=>o.items.forEach(i=>{ byProd[i.name]=byProd[i.name]||{q:0,r:0}; byProd[i.name].q+=i.qty; byProd[i.name].r+=lineTotal(i); }));
    const byMethod = Object.keys(PAY_METHODS).map(k=>[PAY_METHODS[k].short, paid.filter(o=>o.method===k).reduce((a,o)=>a+o.total,0)]);
    body = `<div class="grid g4" style="margin-bottom:16px">${kpi('Gross sales (period)', peso(rows.reduce((a,r)=>a+r[1],0)), 'chart', '+14.2% vs previous period')}${kpi('Orders (period)', rows.reduce((a,r)=>a+r[2],0), 'clipboard')}${kpi('Avg. order value', peso(Math.round(rows.reduce((a,r)=>a+r[1],0)/rows.reduce((a,r)=>a+r[2],0))), 'tag')}${kpi('Verified in system', peso(paid.reduce((a,o)=>a+o.total,0)), 'checkC', `${paid.length} orders`)}</div>
      <div class="detail-grid"><div class="card"><div class="card-h"><div><h3>Monthly sales</h3><p class="xs muted">Verified payments · *Nov to date</p></div></div>${barChart(rows.map(r=>[r[0],r[1]]))}</div>
      <div class="card"><h3 style="margin-bottom:12px">By payment method</h3>${donut(byMethod)}</div></div>
      <div class="card" style="margin-top:16px"><h3 style="margin-bottom:12px">Top products (verified orders in system)</h3><div class="table-wrap"><table class="t stack"><thead><tr><th>Product</th><th class="num">Units</th><th class="num">Revenue</th></tr></thead><tbody>${Object.entries(byProd).sort((a,b)=>b[1].r-a[1].r).map(([n,v])=>`<tr><td data-l="Product" class="small b">${esc(n)}</td><td data-l="Units" class="num">${v.q}</td><td data-l="Revenue" class="num">${peso(v.r)}</td></tr>`).join('')}</tbody></table></div></div>`;
  } else if (t==='inventory'){
    const byCat = {}; S.products.forEach(p=>{ byCat[p.cat]=(byCat[p.cat]||0)+totalStock(p); });
    const vals = S.products.flatMap(p=>p.variants); const value = vals.reduce((a,v)=>a+Math.max(0,v.stock)*v.price,0);
    body = `<div class="grid g4" style="margin-bottom:16px">${kpi('Units on hand', vals.reduce((a,v)=>a+Math.max(0,v.stock),0), 'archive')}${kpi('Stock value (retail)', peso(value), 'tag')}${kpi('Low stock', vals.filter(v=>v.stock>0&&v.stock<=S.settings.lowStock).length, 'alert', '', true)}${kpi('Out of stock', vals.filter(v=>v.stock<=0).length, 'ban', '', true)}</div>
      <div class="detail-grid"><div class="card"><h3 style="margin-bottom:12px">Units by category</h3>${barChart(Object.entries(byCat), {money:false})}</div><div class="card"><h3 style="margin-bottom:12px">Stock health</h3>${donut([['In stock',vals.filter(v=>v.stock>S.settings.lowStock).length],['Low stock',vals.filter(v=>v.stock>0&&v.stock<=S.settings.lowStock).length],['Out of stock',vals.filter(v=>v.stock<=0).length]])}</div></div>
      <div class="card" style="margin-top:16px"><h3 style="margin-bottom:12px">Stock by product</h3><div class="table-wrap"><table class="t stack"><thead><tr><th>Product</th><th class="num">Variants</th><th class="num">Units</th><th class="num">Low / out</th><th class="num">Retail value</th></tr></thead><tbody>${S.products.map(p=>`<tr><td data-l="Product" class="small b">${esc(p.name)}</td><td data-l="Variants" class="num">${p.variants.length}</td><td data-l="Units" class="num">${totalStock(p)}</td><td data-l="Low / out" class="num">${p.variants.filter(v=>v.stock>0&&v.stock<=S.settings.lowStock).length} / ${p.variants.filter(v=>v.stock<=0).length}</td><td data-l="Retail value" class="num">${peso(p.variants.reduce((a,v)=>a+Math.max(0,v.stock)*v.price,0))}</td></tr>`).join('')}</tbody></table></div></div>`;
  } else {
    const sc = statusCounts(); const done=S.orders.filter(o=>o.status==='Delivered').length;
    body = `<div class="grid g4" style="margin-bottom:16px">${kpi('Orders in system', S.orders.length,'clipboard')}${kpi('Completed', done, 'checkC', Math.round(done/S.orders.length*100)+'% completion')}${kpi('Cancelled', S.orders.filter(o=>o.status==='Cancelled').length, 'ban')}${kpi('Payment rejection rate', Math.round(S.payments.filter(p=>p.status==='Rejected').length/Math.max(1,S.payments.length)*100)+'%', 'xc')}</div>
      <div class="detail-grid"><div class="card"><h3 style="margin-bottom:12px">Orders per month</h3>${barChart(rows.map(r=>[r[0],r[2]]),{money:false})}</div><div class="card"><h3 style="margin-bottom:12px">Current status</h3>${donut(sc)}</div></div>`;
  }
  return mis(`${pageH('Reports & analytics', 'Sales, inventory and order statistics. Figures for Jun–Oct are historical sample data; November combines sample data with orders recorded in this prototype.', `<select class="select" style="height:38px" data-change="rep-range" aria-label="Date range"><option value="6m" ${range==='6m'?'selected':''}>Last 6 months</option><option value="3m" ${range==='3m'?'selected':''}>Last 3 months</option></select><button class="btn btn-outline btn-sm" data-act="print">${ic('printer')} Print / PDF</button><button class="btn btn-outline btn-sm" data-act="export" data-what="report">${ic('download')} CSV</button>`, 'AUDITED SALES REPORTING')}
    <div class="tabs" style="margin-bottom:16px">${[['sales','Sales report'],['inventory','Inventory report'],['orders','Order statistics']].map(([k,l])=>`<button class="tab ${t===k?'is-active':''}" data-act="qset" data-q='${JSON.stringify({tab:k==='sales'?'':k})}'>${l}</button>`).join('')}</div>${body}`, 'reports', 'Reports');
}, {auth:'mis', perm:'reports'});
on('rep-range', a => qset({range:a.value}));

/* ---------------- Settings (admin) & profile (all MIS) ---------------- */
route('/mis/settings', () => mis(`${pageH('System settings', 'Shop-wide configuration used by the storefront and MIS.')}
  <form class="card col" data-form="settings" novalidate style="gap:14px;max-width:720px">
    ${field({name:'shopName', label:'Shop name', required:true, value:S.settings.shopName})}
    ${field({name:'gcash', label:'GCash account shown to customers', required:true, value:S.settings.gcash})}
    ${field({name:'bank', label:'Bank account shown to customers', required:true, value:S.settings.bank})}
    ${field({name:'lowStock', label:'Low-stock threshold (units)', type:'number', required:true, value:S.settings.lowStock, hint:'Variants at or below this level are flagged in inventory and dashboards.'})}
    <div class="row"><button class="btn btn-primary" data-loading="Saving…">Save settings</button></div></form>`, 'settings', 'Settings'), {auth:'mis', perm:'settings'});
on('form:settings', async f => { if (!validate(f,{shopName:[req('Required')], gcash:[req('Required')], bank:[req('Required')], lowStock:[req('Required'),[v=>Number(v)>=0&&Number(v)<=100,'Enter 0–100']]})) return; await busy(f.querySelector('button'),500);
  Object.assign(S.settings,{shopName:f.shopName.value.trim(), gcash:f.gcash.value.trim(), bank:f.bank.value.trim(), lowStock:Number(f.lowStock.value)}); save(); toast('Settings saved','ok'); render(); });
route('/mis/profile', () => { const u=me(); return mis(`${pageH('My profile', `${u.role==='admin'?'Administrator':'Staff'} account · created ${fmtDate(u.created)}`)}
  <div class="detail-grid"><form class="card col" data-form="mis-profile" novalidate style="gap:14px"><h3>Account information</h3><div class="grid g2">${field({name:'name', label:'Full name', required:true, value:u.name})}${field({name:'phone', label:'Mobile', required:true, value:u.phone})}</div>${field({name:'email', label:'Work email', value:u.email, attrs:'disabled', hint:'Only an administrator can change sign-in emails.'})}<div><button class="btn btn-primary" data-loading="Saving…">Save</button></div></form>
  <form class="card col" data-form="chpw" novalidate style="gap:14px"><h3>Change password</h3>${field({name:'cur', label:'Current password', type:'password', required:true})}${field({name:'password', label:'New password', type:'password', required:true, hint:'8+ chars, 1 uppercase, 1 number'})}${field({name:'confirm', label:'Confirm', type:'password', required:true})}<div><button class="btn btn-outline" data-loading="Updating…">Update password</button></div></form></div>
  <div class="card" style="margin-top:16px"><h3 style="margin-bottom:10px">Your permissions</h3><div class="row wrap">${Object.entries(PERM_LABELS).map(([k,l])=>`<span class="badge ${can(k)?'b-green':'b-neutral'}">${l}</span>`).join('')}</div></div>`, '', 'Profile'); }, {auth:'mis'});
on('form:mis-profile', async f => { if (!validate(f,{name:[req('Required')], phone:[req('Required'), isPhone]})) return; await busy(f.querySelector('button'),500); me().name=f.name.value.trim(); me().phone=f.phone.value.trim(); save(); toast('Profile saved','ok'); render(); });

/* ---------------- Flow map (presentation aid) ---------------- */
route('/flows', () => {
  const lane = (title, color, steps) => `<div class="card"><div class="row" style="margin-bottom:14px"><span class="badge plain" style="background:${color};color:#fff">${title}</span></div><div class="row wrap" style="gap:8px;align-items:stretch">${steps.map(([l,h],i)=>`${i?`<span style="align-self:center;color:var(--ink-3)">${ic('arrowR','')}</span>`:''}<a href="#${h}" class="card tight" style="padding:10px 12px;min-width:120px;flex:0 0 auto;color:var(--ink);text-decoration:none"><div class="xs muted">${String(i+1).padStart(2,'0')}</div><b class="small">${l}</b></a>`).join('')}</div></div>`;
  return `<div data-title="User flows" class="container" style="padding:28px 24px 80px"><div class="row between wrap" style="margin-bottom:18px"><div><div class="eyebrow">SMART · UX flow map</div><h1>User journeys</h1><p class="muted">Every box opens the live screen. Use “Demo controls” to switch roles.</p></div><a class="btn btn-outline" href="#/">${ic('store')} Storefront</a></div>
  <div class="col" style="gap:16px">
   ${lane('CUSTOMER','#33441A',[['Home','/'],['Catalog + search','/catalog'],['Product & variant','/product/P-1001'],['Cart','/cart'],['Sign in / Register','/login'],['Checkout','/checkout'],['Order placed + instructions','/account/orders'],['Submit payment proof','/account/orders'],['Pending verification','/account/payments'],['Track order','/account/orders/SO-26-0135']])}
   ${lane('STAFF','#6B7F3E',[['Staff sign-in','/portal?role=staff'],['Dashboard','/mis'],['Orders','/mis/orders'],['Payment queue','/mis/payments'],['Review & verify/reject','/mis/payments/PAY-0142'],['Update order status','/mis/orders/SO-26-0136'],['Inventory & low stock','/mis/inventory?filter=low'],['Record stock update','/mis/inventory'],['Transaction records','/mis/transactions'],['Profile','/mis/profile']])}
   ${lane('ADMINISTRATOR','#2F6FB3',[['Admin sign-in','/portal?role=admin'],['Dashboard','/mis'],['Products','/mis/products'],['Add/edit + variants','/mis/products/P-1001'],['Inventory','/mis/inventory'],['Orders','/mis/orders'],['Payments','/mis/payments'],['Customers','/mis/customers'],['Staff accounts','/mis/staff'],['Roles','/mis/roles'],['Reports','/mis/reports'],['Settings','/mis/settings']])}
   <div class="card"><h3 style="margin-bottom:10px">Order & payment state machine</h3><div class="row wrap small" style="gap:8px">${['Awaiting Payment','Pending Verification','Processing','Ready to Ship','Shipped','Delivered'].map((s,i)=>`${i?ic('arrowR',''):''}${badge(s)}`).join('')}</div>
   <ul class="small muted" style="margin:12px 0 0;padding-left:18px;line-height:1.9"><li>Reject payment → back to <b>Awaiting Payment</b>; customer re-submits.</li><li>COD: staff confirms by phone → <b>Processing</b>; cash recorded when marked <b>Delivered</b>.</li><li>Cancel only before Processing. Stock deducted on entering Processing; cannot go negative.</li></ul></div>
  </div></div>${demoBar()}`;
});
