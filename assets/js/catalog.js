
let data=[];

const products=document.getElementById('products');
const q=document.getElementById('q');
const category=document.getElementById('category');
const brand=document.getElementById('brand');
const count=document.getElementById('count');

fetch('data/products.json')
.then(r=>r.json())
.then(d=>{
 data=d;
 [...new Set(data.map(x=>x.category))].forEach(x=>category.innerHTML+=`<option>${x}</option>`);
 [...new Set(data.map(x=>x.brand))].forEach(x=>brand.innerHTML+=`<option>${x}</option>`);
 draw();
});

function draw(){
 let z=q.value.toLowerCase();
 let arr=data.filter(x=>
 (!z || JSON.stringify(x).toLowerCase().includes(z)) &&
 (!category.value || x.category===category.value) &&
 (!brand.value || x.brand===brand.value)
 );

 count.innerText='Найдено моделей: '+arr.length;

 products.innerHTML=arr.map(x=>`
 <div class="card">
 <div class="brand">${x.brand}</div>
 <h2>${x.model}</h2>
 <b>${x.category}</b>
 <p>${x.group||''}</p>
 <p>${x.description}</p>
 </div>`).join('');
}

[q,category,brand].forEach(x=>x.addEventListener('input',draw));
