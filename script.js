"use strict";
// App logic (uses FOODS from data.js)
const KEY="food_cart_v1";
let cart={},cat="All",query="";
const $=s=>document.querySelector(s);
const money=n=>"₹"+n.toFixed(2);
function load(){try{cart=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){cart={}}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(cart))}catch(e){}}
function renderChips(){
  const cats=["All",...new Set(FOODS.map(f=>f.cat))];
  $("#chips").innerHTML=cats.map(c=>`<button class="chip" aria-pressed="${c===cat}" data-cat="${c}">${c}</button>`).join("");
}
function renderMenu(){
  const list=FOODS.filter(f=>(cat==="All"||f.cat===cat)&&f.name.toLowerCase().includes(query.toLowerCase()));
  $("#menu").innerHTML=list.map(f=>`<article class="card"><div class="pic" aria-hidden="true">${f.img}</div><span class="cat">${f.cat}</span><h3>${f.name}</h3><p>${f.desc}</p><div class="row"><span class="price">${money(f.price)}</span><button class="btn" data-add="${f.id}">Add to cart</button></div></article>`).join("");
  $("#noResults").classList.toggle("hidden",list.length>0);
}
function renderCart(){
  const ids=Object.keys(cart);
  let total=0;
  if(!ids.length){
    $("#cart").innerHTML='<p class="empty">Your cart is empty. Add a dish from the menu.</p>';
    $("#checkout").classList.add("hidden");return;
  }
  $("#cart").innerHTML=ids.map(id=>{
    const f=FOODS.find(x=>x.id==id),q=cart[id],sub=f.price*q;total+=sub;
    return `<div class="item"><strong>${f.name}</strong><button class="btn ghost" data-del="${id}" aria-label="Remove ${f.name}">Remove</button><div class="qty"><button data-dec="${id}" aria-label="Decrease quantity">−</button><span aria-live="polite">${q}</span><button data-inc="${id}" aria-label="Increase quantity">+</button><span class="sub">${money(sub)}</span></div></div>`;
  }).join("");
  $("#total").textContent=money(total);
  $("#checkout").classList.remove("hidden");
}
function update(){save();renderCart()}
document.addEventListener("click",e=>{
  const t=e.target.closest("button");if(!t)return;
  const d=t.dataset;
  if(d.cat){cat=d.cat;renderChips();renderMenu();return}
  if(d.add){cart[d.add]=(cart[d.add]||0)+1;$("#msg").innerHTML="";update()}
  if(d.inc){cart[d.inc]++;update()}
  if(d.dec){cart[d.dec]--;if(cart[d.dec]<=0)delete cart[d.dec];update()}
  if(d.del){delete cart[d.del];update()}
  if(t.id==="clear"){cart={};update()}
});
$("#search").addEventListener("input",e=>{query=e.target.value.trim();renderMenu()});
$("#form").addEventListener("submit",e=>{
  e.preventDefault();
  const f=e.target,v=n=>f.elements[n].value.trim();
  const rules={name:v("name").length>=2?"":"Enter your full name.",phone:/^[6-9]\d{9}$/.test(v("phone"))?"":"Enter a valid 10-digit mobile number.",address:v("address").length>=8?"":"Enter a complete delivery address."};
  let bad=false;
  ["name","phone","address"].forEach(n=>{f.elements[n].nextElementSibling.textContent=rules[n];if(rules[n])bad=true});
  if(bad)return;
  const lines=Object.keys(cart).map(id=>{const x=FOODS.find(y=>y.id==id);return `${cart[id]} × ${x.name} – ${money(x.price*cart[id])}`});
  const total=Object.keys(cart).reduce((s,id)=>s+FOODS.find(y=>y.id==id).price*cart[id],0);
  cart={};save();renderCart();f.reset();
  $("#msg").innerHTML=`<div class="ok" role="status"><strong>Order placed. Thank you!</strong><br>${lines.join("<br>")}<br>Total: ${money(total)}</div>`;
});
load();renderChips();renderMenu();renderCart();
