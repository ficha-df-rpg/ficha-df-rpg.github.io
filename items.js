/*
Name: items.js
Author: Mennonimo
Date: 15/07/2026
Description: Renderização e tratamento com a parte dos items
*/

/* ---- Items ---- */
function renderItems(){
    const wrap = el("itemsList");
    wrap.innerHTML = "";

    const count = state.items.length;
    for(let i=0;i<count;i++){

        if(typeof state.items[i] === "string"){
            state.items[i]={
                nome:state.items[i],
                desc:""
            };
        }

        const item = state.items[i];

        const card=document.createElement("div");
        card.className="item-card";

        card.innerHTML=`
            <div class="item-title">
                <span>${i+1}</span>
                <input
                    type="text"
                    data-item="${i}"
                    data-field="nome"
                    placeholder="Nome"
                    value="${(item.nome||'').replace(/"/g,'&quot;')}"
                >
                <button class="item-rm-btn no-print" data-rm="${i}" title="Remover slot">×</button>
            </div>

            <textarea
                rows="1"
                data-item="${i}"
                data-field="desc"
                placeholder="Descrição"
            >${item.desc||""}</textarea>
        `;

        wrap.appendChild(card);
    }

    wrap.querySelectorAll("[data-item]").forEach(inp=>{
        inp.addEventListener("input",e=>{
            const i=Number(e.target.dataset.item);
            const f=e.target.dataset.field;
            state.items[i][f]=e.target.value;
            save();
        });
    });
    wrap.querySelectorAll("[data-rm]").forEach(btn=>{
        btn.addEventListener("click",e=>{
            const i=Number(e.target.dataset.rm);
            state.items.splice(i,1);
            renderItems();save();
        });
    });
}
el('btnAddItem').addEventListener('click',()=>{state.items.push({nome:'',desc:''});renderItems();save();});