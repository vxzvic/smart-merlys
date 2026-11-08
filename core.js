/* SMART prototype — core: mock data, state, router, shared UI helpers.
   All data is local mock data kept in localStorage. No payment gateway, no backend. */
'use strict';

/* ---------------- Icons (inline SVG, Lucide-style strokes) ---------------- */
const ICONS = {
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  cart:'<path d="M6 7h12l-1 13H7z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>', x:'<path d="M6 6l12 12M18 6 6 18"/>',
  chevR:'<path d="m9 6 6 6-6 6"/>', chevL:'<path d="m15 6-6 6 6 6"/>', chevD:'<path d="m6 9 6 6 6-6"/>',
  arrowR:'<path d="M5 12h14M13 6l6 6-6 6"/>', arrowL:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
  check:'<path d="m5 12 5 5 9-10"/>', checkC:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  alert:'<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>', info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  xc:'<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>', clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', eyeOff:'<path d="M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3 3.6M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4.4-1"/>',
  bag:'<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>', box:'<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
  shield:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>', grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  archive:'<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9M10 13h4"/>', clipboard:'<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',
  wallet:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>', receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>', userPlus:'<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M19 8v6M16 11h6"/>',
  key:'<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3"/>', chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.5 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 1.8 14H1.5a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 7.5a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V1.5a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1h.1a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
  logout:'<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>', login:'<path d="M9 4H5v16h4M14 8l4 4-4 4M18 12H7"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', minus:'<path d="M5 12h14"/>', edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>', trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  upload:'<path d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4"/>', download:'<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>', image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-9 8"/>',
  truck:'<path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>', home:'<path d="m3 11 9-7 9 7v9H3z"/><path d="M9 20v-6h6v6"/>',
  filter:'<path d="M3 5h18l-7 8v6l-4-2v-4z"/>', bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0"/>', printer:'<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/>',
  refresh:'<path d="M20 11a8 8 0 0 0-14.6-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16M20 20v-4h-4"/>', star:'<path d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1L12 17l-5.5 3 1-6.1L3 9.5l6.3-.9z"/>',
  ban:'<circle cx="12" cy="12" r="9"/><path d="m6 6 12 12"/>', phone:'<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2"/>',
  tag:'<path d="M3 12V3h9l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>', layers:'<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>', store:'<path d="M3 9l2-5h14l2 5M4 9v11h16V9M3 9h18M9 20v-6h6v6"/>',
  wand:'<path d="m4 20 12-12M14 4v3M19 9h3M18 4l2-2M12 2v2"/>', cash:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>', ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
};
const ic = (n, cls='') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]||''}</svg>`;

/* ---------------- Formatting ---------------- */
const peso = n => '₱' + Number(n).toLocaleString('en-PH', {minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2});
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate = iso => new Date(iso).toLocaleDateString('en-PH', {month:'short', day:'numeric', year:'numeric'});
const fmtDT = iso => new Date(iso).toLocaleString('en-PH', {month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit'});
const uid = p => p + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
const initials = n => n.replace(/^(Dr|Dra|Nurse)\.?\s+/,'').split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();

/* ---------------- Catalog seed ---------------- */
const COLORS = {
  'Heritage Olive':'#4E6329','Ceil Blue':'#6E93B8','Navy':'#1F2B4D','Burgundy':'#6B1F2E','Charcoal':'#3B3D3F','Lavender':'#A694C4','Sage Mist':'#A9B89A','White':'#F4F4F0','Royal Blue':'#2F5DA8',
};
const SIZES = ['XS','S','M','L','XL','2XL','3XL'];
function mkVariants(pid, colors, sizes, base, upsize, seed){
  const out = []; let s = seed;
  colors.forEach(c => sizes.forEach(z => {
    s = (s * 9301 + 49297) % 233280; let stock = 6 + Math.floor((s / 233280) * 34);
    if ((s % 17) === 0) stock = 0; else if ((s % 11) === 0) stock = 2 + (s % 3);
    out.push({sku:`${pid}-${c.split(' ').map(w=>w[0]).join('')}-${z}`, color:c, size:z, price: base + ((z==='2XL'||z==='3XL')?upsize:0), stock, active:true});
  }));
  return out;
}
const SEED_PRODUCTS = [
  {id:'P-1001', name:"Merly's Signature Two-Tone Ergonomic Scrubsuit", cat:'Scrub Sets', style:'Asymmetric Wrap', fabric:'72% Poly · 21% Rayon · 7% Spandex, 240 GSM', desc:'Our atelier signature: two-tone heritage cut with an asymmetric wrap neckline, 7 ergonomic pockets and four-way stretch. Autoclave-safe and fluid-repellent.', tags:['Bestseller','Antimicrobial'], rating:4.9, reviews:1800, sold:4200, compareAt:2100, status:'Active', embroidery:true, customizable:true,
    variants: mkVariants('MSS', ['Heritage Olive','Ceil Blue','Navy','Burgundy','Charcoal','Lavender'], SIZES, 1650, 200, 11)},
  {id:'P-1002', name:'Apex Jogger Scrub Set', cat:'Scrub Sets', style:'Jogger', fabric:'Poly-Viscose 4-Way Stretch', desc:'Ultra-stretch waistband, 9 pockets, tapered jogger cuff. Built for 16-hour shifts.', tags:['9 Pockets'], rating:4.9, reviews:312, sold:538, status:'Active', embroidery:true, customizable:true,
    variants: mkVariants('AJS', ['Heritage Olive','Navy','Royal Blue','Burgundy'], SIZES.slice(0,6), 1850, 150, 23)},
  {id:'P-1003', name:'Heritage V-Neck Suit', cat:'Scrub Sets', style:'Classic V-Neck', fabric:'Poly-Rayon Twill', desc:'Classic straight-leg trouser paired with a relaxed V-neck top. Wrinkle-resistant.', tags:['Heritage Cut'], rating:4.9, reviews:189, sold:634, status:'Active', embroidery:true, customizable:true,
    variants: mkVariants('HVS', ['Ceil Blue','Sage Mist','Navy','Burgundy'], SIZES.slice(0,6), 1650, 150, 37)},
  {id:'P-1004', name:'Pro-Flex Mandarin Top', cat:'Tops', style:'Mandarin Collar', fabric:'Poly-Spandex Stretch', desc:'Tailored mandarin-collar top with a hidden pen sleeve and badge loop.', tags:['Slim Fit'], rating:4.8, reviews:94, sold:320, status:'Active', embroidery:true, customizable:true,
    variants: mkVariants('PFM', ['Charcoal','Heritage Olive','Navy'], SIZES.slice(0,6), 980, 100, 51)},
  {id:'P-1005', name:'Aegis Antimicrobial Lab Coat', cat:'Lab Coats', style:'Lab Coat', fabric:'Silvadur™ treated twill', desc:'Fluid-shield lab coat, anti-yellowing treated, tablet-sized lower pockets.', tags:['Fluid Shield'], rating:5.0, reviews:142, sold:448, status:'Active', embroidery:true, customizable:true,
    variants: mkVariants('ALC', ['White'], SIZES.slice(0,6), 2100, 200, 63)},
  {id:'P-1006', name:'Apex 9-Pocket Cargo Jogger', cat:'Trousers', style:'Jogger', fabric:'Poly-Viscose 4-Way Stretch', desc:'Stand-alone cargo jogger with 9 pockets and an elastic + drawcord waist.', tags:[], rating:4.9, reviews:890, sold:890, status:'Active', embroidery:false, customizable:true,
    variants: mkVariants('ACJ', ['Heritage Olive','Navy','Charcoal'], SIZES.slice(0,6), 1250, 100, 77)},
  {id:'P-1007', name:'Reversible OR Mask-Button Cap', cat:'Accessories', style:'Cap', fabric:'100% Cotton', desc:'Reversible surgical cap with mask buttons and an adjustable back tie.', tags:[], rating:4.9, reviews:420, sold:420, status:'Active', embroidery:false, customizable:true,
    variants: mkVariants('ORC', ['Heritage Olive','Ceil Blue','Lavender'], ['One Size'], 380, 0, 83)},
  {id:'P-1008', name:'Micro-Dry Thermal Underscrub', cat:'Base Layer', style:'Underscrub', fabric:'Micro-poly thermal knit', desc:'Long-sleeve base layer for cold OR suites. Moisture-wicking.', tags:['Thermal Layer'], rating:4.8, reviews:218, sold:218, status:'Active', embroidery:false,
    variants: mkVariants('MDU', ['Charcoal','White','Navy'], SIZES.slice(0,6), 650, 0, 97)},
  {id:'P-1009', name:'Clinic Essentials Warm-up Jacket', cat:'Outerwear', style:'Jacket', fabric:'Poly-Spandex Fleece Back', desc:'Snap-front warm-up jacket with knit cuffs. Currently being restocked.', tags:[], rating:4.7, reviews:66, sold:120, status:'Draft', embroidery:true,
    variants: mkVariants('CWJ', ['Navy','Charcoal'], SIZES.slice(0,5), 1450, 100, 101).map(v=>({...v, stock:0}))},
];
// guaranteed demo cases on the signature product
(function(){ const v = SEED_PRODUCTS[0].variants;
  const set=(c,z,s)=>{const x=v.find(a=>a.color===c&&a.size===z); if(x) x.stock=s;};
  set('Heritage Olive','M',28); set('Heritage Olive','S',3); set('Heritage Olive','XS',0); set('Heritage Olive','L',14); set('Heritage Olive','XL',9);
  set('Lavender','M',0); set('Lavender','S',4); set('Ceil Blue','M',22); set('Navy','L',17);
})();

const EMBROIDERY_FEE = 150;
const SHIPPING_FEE = 120, FREE_SHIP_MIN = 2500;
const LOW_STOCK = 5;

/* ---------------- Users ---------------- */
const SEED_USERS = [
  {id:'U-001', role:'admin', name:'Elena Ramos', email:'admin@merlys.ph', password:'Admin@123', phone:'0917 555 0101', status:'Active', created:'2024-01-10'},
  {id:'U-002', role:'staff', name:'Jose Dizon', email:'staff@merlys.ph', password:'Staff@123', phone:'0917 555 0144', status:'Active', created:'2024-03-02', perms:['orders','payments','inventory']},
  {id:'U-003', role:'staff', name:'Liza Manalo', email:'liza.manalo@merlys.ph', password:'Staff@123', phone:'0918 222 3301', status:'Active', created:'2024-06-15', perms:['orders','payments']},
  {id:'U-004', role:'staff', name:'Ramon Cruz', email:'ramon.cruz@merlys.ph', password:'Staff@123', phone:'0919 101 2020', status:'Deactivated', created:'2024-02-20', perms:['inventory']},
  {id:'C-101', role:'customer', name:'Maria Santos', email:'maria.santos@email.com', password:'Customer@123', phone:'0917 123 4567', status:'Active', created:'2025-08-02',
    address:{line:'Unit 12B, Rizal Tower, 125 Ayala Ave.', city:'Makati City', province:'Metro Manila', zip:'1226'}},
  {id:'C-102', role:'customer', name:'Dr. Camille Reyes', email:'camille.reyes@pgh.ph', password:'Customer@123', phone:'0918 444 1212', status:'Active', created:'2025-03-19', address:{line:'45 Taft Ave.', city:'Manila', province:'Metro Manila', zip:'1000'}},
  {id:'C-103', role:'customer', name:'Mark Anthony Bautista', email:'mark.b@stlukes.ph', password:'Customer@123', phone:'0920 555 8888', status:'Active', created:'2025-07-07', address:{line:'32nd St., BGC', city:'Taguig City', province:'Metro Manila', zip:'1634'}},
  {id:'C-104', role:'customer', name:'Patricia Lim', email:'pat.lim@makatimed.ph', password:'Customer@123', phone:'0921 777 0000', status:'Active', created:'2025-11-15', address:{line:'2 Amorsolo St.', city:'Makati City', province:'Metro Manila', zip:'1229'}},
  {id:'C-105', role:'customer', name:'Jun Villanueva', email:'jun.v@gmail.com', password:'Customer@123', phone:'0922 111 2233', status:'Suspended', created:'2026-01-04', address:{line:'Blk 4 Lot 9, Molino', city:'Bacoor', province:'Cavite', zip:'4102'}},
];

/* ---------------- Order / payment model ----------------
 Order status flow (enforced in mis.js):
  Awaiting Payment → Pending Verification → Processing → Ready to Ship → Shipped → Delivered
  (COD orders: Awaiting Payment → Processing [staff confirms] … Delivered + cash recorded)
  Reject payment: Pending Verification → Awaiting Payment (customer may resubmit)
  Cancel allowed only before Processing. Stock is deducted when an order enters Processing. */
const ORDER_FLOW = ['Awaiting Payment','Pending Verification','Processing','Ready to Ship','Shipped','Delivered'];
const PAY_METHODS = {
  gcash:{label:'GCash (manual transfer)', short:'GCash', acct:"Merly's Scrubsuits Co. · 0917 888 2004", needsProof:true},
  bank:{label:'Bank transfer — BDO', short:'BDO Transfer', acct:"Merly's Scrubsuits Co. · BDO 0045-1122-3344", needsProof:true},
  cod:{label:'Cash on Delivery / Pickup', short:'Cash', acct:'Pay in cash upon delivery or atelier pickup', needsProof:false},
};
const STATUS_BADGE = {
  'Awaiting Payment':'b-amber','Pending Verification':'b-blue','Processing':'b-lime','Ready to Ship':'b-lime','Shipped':'b-olive','Delivered':'b-green','Cancelled':'b-neutral',
  'Verified':'b-green','Rejected':'b-red','Not Submitted':'b-neutral','Cash on Delivery':'b-amber','Cash Collected':'b-green',
  'Active':'b-green','Draft':'b-neutral','Archived':'b-neutral','Deactivated':'b-neutral','Suspended':'b-red','In Stock':'b-green','Low Stock':'b-amber','Out of Stock':'b-red',
};
const badge = (s, extra='') => `<span class="badge ${STATUS_BADGE[s]||'b-neutral'} ${extra}">${esc(s)}</span>`;

function seedOrders(products){
  const P = id => products.find(p=>p.id===id);
  const line = (pid, color, size, qty, emb) => { const p=P(pid); const v=p.variants.find(x=>x.color===color&&x.size===size)||p.variants[0];
    return {pid, sku:v.sku, name:p.name, color:v.color, size:v.size, qty, price:v.price, embroidery: emb||null}; };
  const mk = (id, cust, days, items, method, status, pay, extra={}) => {
    const created = new Date(Date.UTC(2026,10,7,3) - days*864e5).toISOString();
    const sub = items.reduce((a,i)=>a+i.qty*(i.price+(i.embroidery?EMBROIDERY_FEE:0)),0);
    const ship = sub >= FREE_SHIP_MIN ? 0 : SHIPPING_FEE;
    const u = SEED_USERS.find(x=>x.id===cust);
    const hist = [{status:'Awaiting Payment', at:created, by:'System', note:'Order placed by customer'}];
    const idx = ORDER_FLOW.indexOf(status);
    const later = (h)=> new Date(new Date(created).getTime()+h*36e5).toISOString();
    if (method!=='cod' && idx>=1) hist.push({status:'Pending Verification', at:later(2), by:u.name, note:'Payment details submitted'});
    if (idx>=2) hist.push({status:'Processing', at:later(20), by:'Jose Dizon', note: method==='cod'?'COD order confirmed for processing':'Payment verified · stock deducted'});
    if (idx>=3) hist.push({status:'Ready to Ship', at:later(44), by:'Jose Dizon', note:'Packed and labelled'});
    if (idx>=4) hist.push({status:'Shipped', at:later(60), by:'Liza Manalo', note:'Handed to courier · LBC 1234 5678 90'});
    if (idx>=5) hist.push({status:'Delivered', at:later(100), by:'Liza Manalo', note:'Received by customer'});
    if (status==='Cancelled') hist.push({status:'Cancelled', at:later(30), by:'Customer', note:'Cancelled before payment'});
    return {id, customerId:cust, customerName:u.name, email:u.email, phone:u.phone, address:u.address, created, items, subtotal:sub, shipping:ship, total:sub+ship,
      method, status, paymentStatus:pay, history:hist, stockDeducted: idx>=2 && status!=='Cancelled', notes:'', ...extra};
  };
  return [
    mk('SO-26-0142','C-101',0.2,[line('P-1001','Heritage Olive','M',1,'Dr. Maria Santos, MD')],'gcash','Pending Verification','Pending Verification'),
    mk('SO-26-0141','C-103',0.6,[line('P-1002','Navy','L',2)],'bank','Pending Verification','Pending Verification'),
    mk('SO-26-0140','C-104',1,[line('P-1004','Charcoal','S',1),line('P-1007','Lavender','One Size',2)],'gcash','Awaiting Payment','Not Submitted'),
    mk('SO-26-0139','C-102',1.4,[line('P-1005','White','M',1)],'cod','Awaiting Payment','Cash on Delivery'),
    mk('SO-26-0138','C-101',3,[line('P-1006','Heritage Olive','M',1)],'gcash','Awaiting Payment','Rejected',{rejectReason:'Reference number does not match any received GCash transfer. Please re-upload the full receipt screenshot.'}),
    mk('SO-26-0137','C-103',4,[line('P-1001','Navy','L',3)],'bank','Processing','Verified'),
    mk('SO-26-0136','C-102',5,[line('P-1003','Ceil Blue','M',2)],'gcash','Ready to Ship','Verified'),
    mk('SO-26-0135','C-104',7,[line('P-1001','Lavender','S',1,'Dra. Patricia Lim')],'gcash','Shipped','Verified'),
    mk('SO-26-0134','C-101',12,[line('P-1003','Navy','M',1),line('P-1007','Heritage Olive','One Size',1)],'bank','Delivered','Verified'),
    mk('SO-26-0133','C-105',14,[line('P-1008','Charcoal','L',2)],'gcash','Cancelled','Not Submitted'),
    mk('SO-26-0132','C-102',18,[line('P-1002','Heritage Olive','M',4)],'cod','Delivered','Cash Collected'),
    mk('SO-26-0131','C-103',22,[line('P-1005','White','L',2)],'bank','Delivered','Verified'),
    mk('SO-26-0130','C-104',26,[line('P-1004','Heritage Olive','M',3)],'gcash','Delivered','Verified'),
    mk('SO-26-0129','C-101',33,[line('P-1001','Ceil Blue','M',1)],'gcash','Delivered','Verified'),
  ];
}
function seedPayments(orders){
  const out=[];
  orders.forEach(o=>{
    if (o.method==='cod'){ if (o.paymentStatus==='Cash Collected') out.push({id:'PAY-'+o.id.slice(-4), orderId:o.id, customerName:o.customerName, method:'cod', amount:o.total, ref:'CASH-'+o.id.slice(-4), submitted:o.history.at(-1).at, status:'Verified', reviewedBy:'Liza Manalo', reviewedAt:o.history.at(-1).at, note:'Cash collected on delivery'}); return; }
    if (o.paymentStatus==='Not Submitted') return;
    const sub = new Date(new Date(o.created).getTime()+2*36e5).toISOString();
    const p = {id:'PAY-'+o.id.slice(-4), orderId:o.id, customerName:o.customerName, method:o.method, amount:o.total, ref:(o.method==='gcash'?'GC':'BDO')+String(7000123400+Number(o.id.slice(-3))*37), payer:o.customerName, paidAt:sub, submitted:sub, proof:'receipt_'+o.id.slice(-4)+'.jpg', status:o.paymentStatus==='Rejected'?'Rejected':(o.paymentStatus==='Verified'?'Verified':'Pending Verification')};
    if (p.status!=='Pending Verification'){ p.reviewedBy='Jose Dizon'; p.reviewedAt=new Date(new Date(sub).getTime()+18*36e5).toISOString(); }
    if (p.status==='Rejected') p.reason=o.rejectReason;
    out.push(p);
  });
  out.push({id:'PAY-0141B', orderId:'SO-26-0141', customerName:'Mark Anthony Bautista', method:'bank', amount:3700, ref:'BDO-WRONG-01', payer:'M. Bautista', paidAt:'2026-11-05T09:00:00Z', submitted:'2026-11-05T09:10:00Z', proof:'bdo_slip.jpg', status:'Rejected', reason:'Amount on slip (₱3,500) is less than the order total.', reviewedBy:'Jose Dizon', reviewedAt:'2026-11-05T12:00:00Z'});
  return out;
}
function seedStockLog(){
  return [
    {id:'ST-0091', at:'2026-11-06T08:12:00Z', sku:'MSS-HO-M', product:"Merly's Signature Two-Tone Ergonomic Scrubsuit", change:+24, before:4, after:28, reason:'Restock — production batch #B-1104', by:'Jose Dizon'},
    {id:'ST-0090', at:'2026-11-05T15:40:00Z', sku:'MSS-N-L', product:"Merly's Signature Two-Tone Ergonomic Scrubsuit", change:-3, before:20, after:17, reason:'Order SO-26-0137 (Processing)', by:'System'},
    {id:'ST-0089', at:'2026-11-04T10:02:00Z', sku:'HVS-CB-M', product:'Heritage V-Neck Suit', change:-2, before:12, after:10, reason:'Order SO-26-0136 (Processing)', by:'System'},
    {id:'ST-0088', at:'2026-11-03T09:30:00Z', sku:'MSS-L-M', product:"Merly's Signature Two-Tone Ergonomic Scrubsuit", change:-1, before:1, after:0, reason:'Damaged — loose seam, pulled from shelf', by:'Jose Dizon'},
  ];
}

/* ---------------- State ---------------- */
const STORE_KEY = 'smart-proto-v2';
let S;
function freshState(){
  const products = JSON.parse(JSON.stringify(SEED_PRODUCTS));
  const orders = seedOrders(products);
  return { products, users: JSON.parse(JSON.stringify(SEED_USERS)), orders, payments: seedPayments(orders), stockLog: seedStockLog(),
    cart: [], session: null, notifications: [], roles: {
      staff:{orders:true, orderStatus:true, payments:true, inventoryView:true, inventoryAdjust:true, transactions:true, products:false, customers:false, staffAccounts:false, reports:false, settings:false},
      admin:{orders:true, orderStatus:true, payments:true, inventoryView:true, inventoryAdjust:true, transactions:true, products:true, customers:true, staffAccounts:true, reports:true, settings:true}},
    settings:{shopName:"Merly's Scrubsuits", lowStock: LOW_STOCK, gcash:PAY_METHODS.gcash.acct, bank:PAY_METHODS.bank.acct} };
}
function load(){ try { S = JSON.parse(localStorage.getItem(STORE_KEY)) || freshState(); } catch { S = freshState(); } }
function save(){ try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch {} }
const SS = { get(k){ try { return SS.get(k); } catch { return MEM[k] ?? null; } }, set(k,v){ try { SS.set(k,v); } catch { MEM[k]=v; } }, del(k){ try { SS.del(k); } catch { delete MEM[k]; } } }; const MEM = {};
function resetDemo(){ try { localStorage.removeItem(STORE_KEY); } catch {} load(); save(); toast('Demo data reset to the original sample records','ok'); go('/'); }
load();

const me = () => S.session ? S.users.find(u=>u.id===S.session.userId) : null;
const product = id => S.products.find(p=>p.id===id);
const variantBySku = sku => { for (const p of S.products){ const v=p.variants.find(x=>x.sku===sku); if (v) return {p,v}; } return null; };
const priceRange = p => { const ps=p.variants.map(v=>v.price); const lo=Math.min(...ps), hi=Math.max(...ps); return lo===hi?peso(lo):`${peso(lo)} – ${peso(hi)}`; };
const totalStock = p => p.variants.reduce((a,v)=>a+v.stock,0);
const stockState = n => n<=0?'Out of Stock':(n<=S.settings.lowStock?'Low Stock':'In Stock');
const cartCount = () => S.cart.reduce((a,i)=>a+i.qty,0);
const lineTotal = i => i.qty*unitPrice(i);
const can = perm => { const u=me(); return !!(u && u.role!=='customer' && S.roles[u.role]?.[perm]); };

/* ---------------- Customization (made-to-order) ----------------
   Customers design their own colourway: body colour, pattern, pattern colour, placement, trim colour.
   Customized items are made to order: no finished-goods stock is reserved; lead time applies. */
const CUSTOM_COLORS = { ...COLORS, 'Teal':'#1F6F6B', 'Wine':'#5A1630', 'Black':'#1E1F1C', 'Sky':'#9CC3E6', 'Mint':'#A8D8C2', 'Blush':'#E7B7B5', 'Mustard':'#D9A53A', 'Gold Thread':'#E7C66B' };
const PATTERNS = {
  solid:{label:'Solid', fee:0}, pinstripe:{label:'Pinstripe', fee:150}, dots:{label:'Polka dot', fee:150}, gingham:{label:'Gingham check', fee:200},
  botanical:{label:'Botanical leaf', fee:250}, geometric:{label:'Geometric', fee:200}, paws:{label:'Paw print (vet)', fee:250}, hearts:{label:'Heartbeat (cardio)', fee:250},
};
const PLACEMENTS = { full:{label:'Whole garment', mult:1}, panels:{label:'Sleeves & side panels', mult:0.7}, pockets:{label:'Pockets & collar accents', mult:0.5} };
const CUSTOM_LEAD = '5–7 business days';
const CUSTOM_MAX_QTY = 20;
const customFee = c => !c ? 0 : (c.pattern==='solid' ? 0 : Math.round(PATTERNS[c.pattern].fee * PLACEMENTS[c.placement].mult / 10) * 10) + (c.trim!==c.body ? 0 : 0);
const customCode = c => 'CST-' + [c.body, c.pattern, c.patColor, c.placement, c.trim].map(x=>String(x).split(' ').map(w=>w[0]).join('').toUpperCase()).join('-');
const customLabel = c => `Custom: ${c.body} body · ${PATTERNS[c.pattern].label}${c.pattern!=='solid'?` in ${c.patColor} (${PLACEMENTS[c.placement].label.toLowerCase()})`:''} · ${c.trim} trim`;
const unitPrice = i => i.price + (i.embroidery?EMBROIDERY_FEE:0) + customFee(i.custom);
const stockItems = o => (o.items||o).filter(i=>!i.custom);

/* ---------------- Product artwork (SVG scrub illustration, colour-true, pattern-capable) ---------------- */
let ART_ID = 0;
function patternShapes(kind, col, x0, y0, x1, y1){
  // expanded (no <pattern> element) so the same SVG imports cleanly into Figma
  let s=''; const step = {pinstripe:9, dots:12, gingham:14, botanical:22, geometric:18, paws:24, hearts:26}[kind] || 12;
  for (let y=y0; y<y1; y+=step) for (let x=x0; x<x1; x+=step){
    const odd = Math.round((y-y0)/step)%2 ? step/2 : 0;
    if (kind==='pinstripe'){ if (y===y0) s+=`<rect x="${x}" y="${y0}" width="1.6" height="${y1-y0}" fill="${col}"/>`; }
    else if (kind==='dots') s+=`<circle cx="${x+odd+3}" cy="${y+3}" r="2.2" fill="${col}"/>`;
    else if (kind==='gingham'){ if (y===y0) s+=`<rect x="${x}" y="${y0}" width="${step/2}" height="${y1-y0}" fill="${col}" opacity=".35"/>`; if (x===x0) s+=`<rect x="${x0}" y="${y}" width="${x1-x0}" height="${step/2}" fill="${col}" opacity=".35"/>`; }
    else if (kind==='botanical') s+=`<path d="M${x+odd+4} ${y+14} q2 -10 10 -12 q-1 9 -10 12z M${x+odd+9} ${y+8} l-4 5" fill="${col}" stroke="${col}" stroke-width=".8"/>`;
    else if (kind==='geometric') s+=`<path d="M${x+odd+6} ${y+1} l5 5 l-5 5 l-5 -5z" fill="none" stroke="${col}" stroke-width="1.4"/>`;
    else if (kind==='paws') s+=`<g fill="${col}"><ellipse cx="${x+odd+8}" cy="${y+11}" rx="3.6" ry="3"/><circle cx="${x+odd+3.5}" cy="${y+6}" r="1.5"/><circle cx="${x+odd+6.5}" cy="${y+3.8}" r="1.5"/><circle cx="${x+odd+9.8}" cy="${y+3.8}" r="1.5"/><circle cx="${x+odd+12.6}" cy="${y+6}" r="1.5"/></g>`;
    else if (kind==='hearts') s+=`<path d="M${x+odd} ${y+10} h5 l2 -5 l3 9 l2 -6 h6" fill="none" stroke="${col}" stroke-width="1.3" stroke-linejoin="round"/>`;
  }
  return s;
}
function art(p, color, size=220, cfg=null){
  const kind = p.cat;
  const c = cfg ? CUSTOM_COLORS[cfg.body] : (COLORS[color] || COLORS['Heritage Olive']);
  const light = cfg ? ['White','Sky','Mint','Blush','Sage Mist'].includes(cfg.body) : color==='White';
  const trim = cfg ? CUSTOM_COLORS[cfg.trim] : (light ? '#C9D3E0' : '#F4F4F0');
  let gp, sleeves=[], pockets=[], details='';
  if (kind==='Lab Coats'){ gp='M70 40 L100 28 L120 50 L140 28 L170 40 L196 70 L184 92 L170 84 L170 204 L70 204 L70 84 L56 92 L44 70 Z';
    sleeves=['M70 40 L44 70 L56 92 L70 84 Z','M170 40 L196 70 L184 92 L170 84 Z']; pockets=[[80,150,28,22],[132,150,28,22]];
    details=`<path d="M120 50 L120 204" stroke="${cfg?trim:'#D5D5CC'}" stroke-width="2"/><path d="M100 28 L120 110 L140 28" fill="none" stroke="${cfg?trim:'#C9C9BF'}" stroke-width="2"/>${pockets.map(r=>`<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" rx="3" fill="none" stroke="${cfg?trim:'#C9C9BF'}" stroke-width="2"/>`).join('')}`; }
  else if (kind==='Trousers'){ gp='M78 34 H162 L170 200 H130 L120 92 L110 200 H70 Z'; sleeves=['M70 120 L78 34 L88 34 L82 200 L70 200 Z','M170 120 L162 34 L152 34 L158 200 L170 200 Z']; pockets=[[74,110,20,26],[146,110,20,26]];
    details=`<rect x="78" y="34" width="84" height="12" fill="${trim}" opacity=".9"/>${pockets.map(r=>`<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" rx="3" fill="none" stroke="${trim}" stroke-width="2"/>`).join('')}`; }
  else if (kind==='Accessories'){ gp='M50 140 Q50 60 120 60 Q190 60 190 140 Z'; sleeves=[gp]; pockets=[[96,70,48,30]];
    details=`<rect x="46" y="132" width="148" height="18" rx="9" fill="${trim}"/><circle cx="64" cy="141" r="4" fill="${c}"/><circle cx="176" cy="141" r="4" fill="${c}"/>`; }
  else { gp='M84 34 L104 28 Q120 60 136 28 L156 34 L196 62 L182 98 L162 88 L162 200 L78 200 L78 88 L58 98 L44 62 Z';
    sleeves=['M84 34 L44 62 L58 98 L78 88 Z','M156 34 L196 62 L182 98 L162 88 Z','M78 120 H90 V200 H78 Z','M150 120 H162 V200 H150 Z']; pockets=[[88,140,26,30],[126,140,26,30],[100,28,40,12]];
    details=`<path d="M104 28 Q120 60 136 28" fill="none" stroke="${trim}" stroke-width="5"/><path d="M58 98 L44 62" stroke="${trim}" stroke-width="5"/><path d="M182 98 L196 62" stroke="${trim}" stroke-width="5"/>
      <rect x="88" y="150" width="26" height="4" fill="${trim}"/><rect x="126" y="150" width="26" height="4" fill="${trim}"/>${kind==='Base Layer'?'':`<path d="M136 78 v14" stroke="${trim}" stroke-width="3"/>`}
      ${p.id==='P-1001'&&!cfg?`<text x="96" y="120" font-size="7" font-family="sans-serif" fill="#E7C66B" font-weight="700">✚ MERLY'S</text>`:''}`; }
  let overlay='';
  if (cfg && cfg.pattern!=='solid'){
    const id = 'clp'+(++ART_ID); const pc = CUSTOM_COLORS[cfg.patColor];
    const clip = cfg.placement==='full' ? `<path d="${gp}"/>` : cfg.placement==='panels' ? sleeves.map(d=>`<path d="${d}"/>`).join('') : pockets.map(r=>`<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" rx="3"/>`).join('');
    overlay = `<defs><clipPath id="${id}">${clip}</clipPath></defs><g clip-path="url(#${id})">${patternShapes(cfg.pattern, pc, 40, 20, 200, 206)}</g>`;
  }
  const label = cfg ? customLabel(cfg) : `${p.name} in ${color}`;
  return `<svg viewBox="0 0 240 230" width="${size}" height="${size*230/240}" role="img" aria-label="${esc(label)}"><path d="${gp}" fill="${c}" ${kind==='Lab Coats'?'stroke="#D5D5CC" stroke-width="2"':''}/>${overlay}${details}</svg>`;
}
function pBg(color, cfg){ const c = cfg ? CUSTOM_COLORS[cfg.body] : (COLORS[color]||'#4E6329'); return `background:linear-gradient(160deg,#F4F3EE,${c}22)`; }

/* ---------------- Router ---------------- */
const routes = [];
const route = (pattern, view, opts={}) => routes.push({re:new RegExp('^'+pattern.replace(/:(\w+)/g,'(?<$1>[^/]+)')+'$'), view, ...opts});
let CUR = {path:'/', params:{}, query:{}};
function parseHash(){ const h = decodeURIComponent(location.hash.slice(1)) || '/'; const [path, qs] = h.split('?'); return {path: path||'/', query:Object.fromEntries(new URLSearchParams(qs||''))}; }
function go(path){ if (location.hash.slice(1)===path) render(); else location.hash = path; }
function qset(patch){ const q = {...CUR.query, ...patch}; Object.keys(q).forEach(k=>{ if (q[k]===''||q[k]==null) delete q[k]; }); const qs = new URLSearchParams(q).toString(); go(CUR.path + (qs?'?'+qs:'')); }
function render(){
  const {path, query} = parseHash();
  closeAllMenus();
  for (const r of routes){ const m = path.match(r.re); if (!m) continue;
    CUR = {path, params:m.groups||{}, query};
    const u = me();
    if (r.auth==='customer' && (!u || u.role!=='customer')){ if (u && u.role!=='customer') return show(unauthorized('This page is for customer accounts.')); SS.set('after-login', path); toast('Please sign in to continue','warn'); return go('/login'); }
    if (r.auth==='mis' && (!u || u.role==='customer')){ if (u) return show(unauthorized('Customer accounts cannot access the MIS.')); SS.set('after-login', path); return go('/portal?role=staff'); }
    if (r.perm && !can(r.perm)) return show(unauthorized(`Your role (${u.role}) does not have permission to open this module.`, true));
    show(r.view(CUR)); window.scrollTo(0,0); return;
  }
  show(notFound());
}
function show(html){ document.getElementById('app').innerHTML = html; afterRender.forEach(f=>f()); afterRender.length=0; document.title = (document.querySelector('[data-title]')?.dataset.title || 'SMART') + " · Merly's Scrubsuits"; }
const afterRender = [];
window.addEventListener('hashchange', render);

/* ---------------- Event delegation ---------------- */
const ACTIONS = {};
const on = (name, fn) => ACTIONS[name] = fn;
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]');
  if (a && !a.disabled && !a.classList.contains('is-disabled')){ e.preventDefault(); ACTIONS[a.dataset.act]?.(a, e); return; }
  if (!e.target.closest('.dropdown')) closeAllMenus();
});
document.addEventListener('submit', e => { const f = e.target.closest('form[data-form]'); if (f){ e.preventDefault(); ACTIONS['form:'+f.dataset.form]?.(f, e); } });
document.addEventListener('change', e => { const a = e.target.closest('[data-change]'); if (a) ACTIONS[a.dataset.change]?.(a, e); });
document.addEventListener('input', e => { const a = e.target.closest('[data-input]'); if (a) ACTIONS[a.dataset.input]?.(a, e); const f=e.target.closest('.field.has-error'); if (f && e.target.value) f.classList.remove('has-error'); });
document.addEventListener('keydown', e => { if (e.key==='Escape'){ closeModal(); closeAllMenus(); } });
on('go', a => go(a.dataset.to));
on('menu', a => { const d=a.closest('.dropdown'); const was=d.classList.contains('open'); closeAllMenus(); if(!was) d.classList.add('open'); });
function closeAllMenus(){ document.querySelectorAll('.dropdown.open').forEach(d=>d.classList.remove('open')); }
on('qset', a => qset(JSON.parse(a.dataset.q)));
on('toggle-pw', a => { const i=a.closest('.input-wrap').querySelector('input'); i.type = i.type==='password'?'text':'password'; a.innerHTML = ic(i.type==='password'?'eye':'eyeOff'); });
on('reset-demo', () => confirmModal({title:'Reset demo data?', body:'All orders, payments, stock changes and accounts created during this demo will be replaced with the original sample records.', ok:'Reset data', danger:true, onOk:resetDemo}));
on('logout', () => { const role = me()?.role; S.session=null; save(); toast('You have been signed out','ok'); go(role==='customer'?'/':'/portal?role='+(role||'staff')); });

/* ---------------- Toast / modal / loading ---------------- */
function toast(msg, kind='ok', action=null){
  let box = document.querySelector('.toasts'); if (!box){ box=document.createElement('div'); box.className='toasts'; box.setAttribute('role','status'); box.setAttribute('aria-live','polite'); document.body.appendChild(box); }
  const t = document.createElement('div'); t.className='toast '+kind; t.innerHTML = ic(kind==='ok'?'checkC':kind==='err'?'xc':kind==='warn'?'alert':'info') + `<div style="flex:1">${msg}${action?`<div class="toast-timer"><i style="animation-duration:${action.ms||10000}ms"></i></div>`:''}</div>`;
  const kill = () => { t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(()=>t.remove(),300); };
  if (action){ const b=document.createElement('button'); b.className='toast-action'; b.textContent=action.label; b.onclick=()=>{ clearTimeout(timer); kill(); action.fn(); }; t.appendChild(b); }
  box.appendChild(t); const timer = setTimeout(()=>{ kill(); action?.onExpire?.(); }, action ? (action.ms||10000) : 3600);
}
let modalCb = {};
function modal(html, {lg=false, focus, ...cbs}={}){ closeModal(); modalCb = cbs; const o=document.createElement('div'); o.className='overlay'; o.innerHTML=`<div class="modal ${lg?'lg':''}" role="dialog" aria-modal="true">${html}</div>`; o.addEventListener('click',e=>{ if(e.target===o) closeModal(); }); document.body.appendChild(o); setTimeout(()=>o.querySelector(focus||'input,textarea,select,.btn-primary,.btn-danger')?.focus(),50); }
function closeModal(){ document.querySelectorAll('.overlay').forEach(o=>o.remove()); }
on('modal-close', closeModal);
on('modal-ok', a => modalCb.onOk?.(a));
function confirmModal({title, body, ok='Confirm', cancel='Cancel', danger=false, icon, onOk, extra=''}){
  modal(`<div class="mh"><div><div class="m-icon" style="background:${danger?'var(--red-bg)':'var(--lime-200)'};color:${danger?'var(--red)':'var(--olive-800)'}">${ic(icon|| (danger?'alert':'info'))}</div><h3>${title}</h3></div><button class="icon-btn" data-act="modal-close" aria-label="Close">${ic('x')}</button></div>
    <div class="mb"><p class="muted">${body}</p>${extra}</div>
    <div class="mf"><button class="btn btn-outline" data-act="modal-close">${cancel}</button><button class="btn ${danger?'btn-danger':'btn-primary'}" data-act="modal-ok">${ok}</button></div>`, {onOk});
}
async function busy(btn, ms=650){ if(!btn) return; btn.dataset.label = btn.innerHTML; btn.classList.add('is-loading'); btn.innerHTML = `<span class="spin"></span> ${btn.dataset.loading||'Please wait…'}`; await new Promise(r=>setTimeout(r,ms)); btn.classList.remove('is-loading'); btn.innerHTML = btn.dataset.label; }

/* ---------------- Validation ---------------- */
function validate(form, rules){
  let ok = true, first=null;
  form.querySelectorAll('.field').forEach(f=>f.classList.remove('has-error'));
  for (const [name, checks] of Object.entries(rules)){
    const el = form.elements[name]; if (!el) continue; const val = (el.type==='checkbox'?el.checked:(el.value||'')).toString().trim?.() ?? el.checked;
    let msg = null;
    for (const [test, m] of checks){ if (!test(val, form)) { msg = m; break; } }
    const field = (el.closest ? el.closest('.field') : el[0]?.closest('.field'));
    if (msg && field){ ok=false; field.classList.add('has-error'); const e=field.querySelector('.err'); if(e) e.textContent=msg; first = first||el; }
  }
  if (first) (first.focus ? first.focus() : first[0]?.focus());
  return ok;
}
const req = m => [v=>v!=='' && v!==false && v!=='false', m];
const isEmail = [v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), 'Enter a valid email address, e.g. name@email.com'];
const isPhone = [v=>/^(09|\+639)\d{9}$/.test(v.replace(/[\s-]/g,'')), 'Enter a valid PH mobile number, e.g. 0917 123 4567'];
const minLen = (n,m) => [v=>v.length>=n, m];
const strongPw = [v=>/[A-Z]/.test(v)&&/\d/.test(v)&&v.length>=8, 'At least 8 characters with one uppercase letter and one number'];

/* ---------------- Shared fragments ---------------- */
function field({name, label, type='text', value='', ph='', required=false, hint='', icon, attrs='', options, textarea=false, trail=''}){
  const id = 'f-'+name+'-'+Math.random().toString(36).slice(2,6);
  let control;
  if (options) control = `<select class="select" id="${id}" name="${name}" ${attrs}>${options.map(o=>{ const [v,l]=Array.isArray(o)?o:[o,o]; return `<option value="${esc(v)}" ${String(v)===String(value)?'selected':''}>${esc(l)}</option>`; }).join('')}</select>`;
  else if (textarea) control = `<textarea class="textarea" id="${id}" name="${name}" placeholder="${esc(ph)}" ${attrs}>${esc(value)}</textarea>`;
  else control = `<input class="input" id="${id}" name="${name}" type="${type}" value="${esc(value)}" placeholder="${esc(ph)}" ${attrs} ${required?'aria-required="true"':''}>`;
  if (icon) control = `<div class="input-wrap">${ic(icon)}${control}${trail?`<span class="trail">${trail}</span>`:''}</div>`;
  return `<div class="field"><label class="label" for="${id}">${label}${required?' <span class="req">*</span>':''}</label>${control}<div class="err" role="alert"></div>${hint?`<div class="hint">${hint}</div>`:''}</div>`;
}
function pager(total, page, per, key='page'){
  const pages = Math.max(1, Math.ceil(total/per)); page = Math.min(Math.max(1,page),pages);
  const from = total? (page-1)*per+1 : 0, to = Math.min(total, page*per);
  let btns = ''; for (let i=1;i<=pages;i++) btns += `<button class="pg ${i===page?'is-active':''}" data-act="qset" data-q='${JSON.stringify({[key]:i})}' aria-label="Page ${i}">${i}</button>`;
  return `<div class="pager"><span class="small muted">Showing ${from}–${to} of ${total}</span><div class="row" style="gap:6px"><button class="pg" ${page<=1?'disabled':''} data-act="qset" data-q='${JSON.stringify({[key]:page-1})}' aria-label="Previous page">‹</button>${btns}<button class="pg" ${page>=pages?'disabled':''} data-act="qset" data-q='${JSON.stringify({[key]:page+1})}' aria-label="Next page">›</button></div></div>`;
}
const paginate = (arr, page, per) => arr.slice((Math.max(1,page)-1)*per, Math.max(1,page)*per);
function emptyState(icon, title, body, cta=''){ return `<div class="empty"><div class="ei">${ic(icon)}</div><h3>${title}</h3><p class="muted" style="max-width:380px">${body}</p>${cta}</div>`; }
function unauthorized(msg, inMis){
  return `<div data-title="Access denied" class="portal" style="max-width:520px;padding-top:80px">${emptyState('lock','Access denied (403)', esc(msg)+' If you think this is a mistake, contact the system administrator.',
   `<div class="row"><button class="btn btn-outline" data-act="go" data-to="${inMis?'/mis':'/'}">${ic('arrowL')} ${inMis?'Back to dashboard':'Back to storefront'}</button>${me()?`<button class="btn btn-ghost" data-act="logout">${ic('logout')} Sign out</button>`:''}</div>`)}</div>`;
}
function notFound(){ return `<div data-title="Not found" class="portal" style="padding-top:80px">${emptyState('search','Page not found (404)','The page you were looking for does not exist or was moved.',`<button class="btn btn-primary" data-act="go" data-to="/">Go to storefront</button>`)}</div>`; }
function demoBar(){
  return `<div class="demo-bar dropdown"><button class="demo-fab" data-act="menu" aria-haspopup="true">${ic('wand')} Demo controls</button>
    <div class="dd-menu" role="menu">
      <div class="small muted" style="padding:6px 10px">Quick sign-in (prototype only)</div>
      <button data-act="demo-login" data-email="maria.santos@email.com">${ic('user')} Customer — Maria Santos</button>
      <button data-act="demo-login" data-email="staff@merlys.ph">${ic('clipboard')} Staff — Jose Dizon</button>
      <button data-act="demo-login" data-email="admin@merlys.ph">${ic('shield')} Admin — Elena Ramos</button>
      <div class="divider" style="margin:6px 0"></div>
      <button data-act="go" data-to="/flows">${ic('layers')} User-flow map</button>
      <button data-act="reset-demo">${ic('refresh')} Reset demo data</button>
    </div></div>`;
}
on('demo-login', a => { const u=S.users.find(x=>x.email===a.dataset.email); S.session={userId:u.id}; save(); toast(`Signed in as ${u.name} (${u.role})`,'ok'); go(u.role==='customer'?'/account':'/mis'); });
function addHistory(o, status, by, note){ o.history.push({status, at:new Date().toISOString(), by, note}); }
function notify(userId, text, link){ S.notifications.unshift({id:uid('N'), userId, text, link, at:new Date().toISOString(), read:false}); }
