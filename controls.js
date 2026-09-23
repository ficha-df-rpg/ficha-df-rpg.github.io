/*
Name: controls.js
Author: Mennonimo
Date: 15/07/2026
Description: controles em geral da ficha, classe, habilidades 
*/

/* ---- Equip ---- */
function bindEquip() {
    [
        ["eqArmaNome", "arma", "nome"],
        ["eqArmaCategoria", "arma", "categoria"],
        ["eqArmaTipo", "arma", "tipo"],
        ["eqArmaduraNome", "armadura", "nome"],
        ["eqAmuletoNome", "amuleto", "nome"],
    ].forEach(([id, g, f]) => {
        const input = el(id);
        if (!input) return;
        input.value = state.equip[g][f] || "";
        input.addEventListener("input", (e) => {
            state.equip[g][f] = e.target.value;
            save();
        });
    });
}

/* ---- Class selects ---- */
function renderClassSelects() {
    if (!el("classAtrUp") || !el("classAtrDown") || !el("classPericiaBonus")) return;

    [el("classAtrUp"), el("classAtrDown")].forEach((sel) => {
        sel.innerHTML =
            '<option value="">— nenhum —</option>' +
            ATTRS.map((a) => `<option value="${a.key}">${a.key}</option>`).join("");
    });

    el("classPericiaBonus").innerHTML =
        '<option value="">— nenhuma —</option>' +
        ALL_SKILLS.map((s) => `<option value="${s}">${s}</option>`).join("");

    el("classAtrUp").value = state.classe.atrUp || "";
    el("classAtrDown").value = state.classe.atrDown || "";
    el("classPericiaBonus").value = state.classe.periciaBonus || "";

    el("classAtrUp").addEventListener("change", (e) => {
        state.classe.atrUp = e.target.value;
        renderAttrs();
        renderStatus();
        save();
    });
    el("classAtrDown").addEventListener("change", (e) => {
        state.classe.atrDown = e.target.value;
        renderAttrs();
        renderStatus();
        save();
    });
    el("classPericiaBonus").addEventListener("change", (e) => {
        state.classe.periciaBonus = e.target.value;
        renderSkills();
        save();
    });
}

/* ---- Trava de segurança para Aspectos ---- */
function renderAspectos() {
    // Mantém a função declarada para evitar ReferenceError no script.js
    const wrap = el("aspectosList");
    if (!wrap) return;
    wrap.innerHTML = "";
}

/* ---- Magias e Habilidades Dinâmicas ---- */
let habDragIdx = null;

function renderHabilidades() {
    const wrap = el("habilidadesList");
    if (!wrap) return;
    wrap.innerHTML = "";

    if (!state.habilidades) state.habilidades = [];

    state.habilidades.forEach((h, idx) => {
        const card = document.createElement("div");
        card.className = "hab-card";
        card.setAttribute("draggable", "true");
        card.dataset.idx = idx;

        card.innerHTML = `
            <span class="hab-drag-handle no-print" title="Arrastar para reordenar">⠿</span>
            <button class="remove no-print" data-rm-hab="${idx}">×</button>
            
            <div class="hab-top-row">
                <div>
                    <label class="f">Nome</label>
                    <input type="text" data-h="${idx}" data-f="nome" value="${(h.nome || "").replace(/"/g, "&quot;")}">
                </div>
                <div>
                    <label class="f">Custo</label>
                    <input type="text" data-h="${idx}" data-f="custo" value="${(h.custo || "").replace(/"/g, "&quot;")}">
                </div>
                <div>
                    <label class="f">Elemento</label>
                    <input type="text" data-h="${idx}" data-f="elemento" value="${(h.elemento || "").replace(/"/g, "&quot;")}">
                </div>
            </div>

            <div class="hab-desc-wrap">
                <label class="f">Descrição</label>
                <textarea data-h="${idx}" data-f="descricao">${h.descricao || ""}</textarea>
            </div>
        `;

        // Eventos Drag & Drop
        card.addEventListener("dragstart", (e) => {
            habDragIdx = idx;
            setTimeout(() => card.classList.add("dragging"), 0);
            e.dataTransfer.effectAllowed = "move";
        });

        card.addEventListener("dragend", () => {
            card.classList.remove("dragging");
            document.querySelectorAll(".hab-card").forEach((c) => c.classList.remove("drag-over"));
        });

        card.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            card.classList.add("drag-over");
        });

        card.addEventListener("dragleave", () => {
            card.classList.remove("drag-over");
        });

        card.addEventListener("drop", (e) => {
            e.preventDefault();
            card.classList.remove("drag-over");
            const toIdx = idx;
            if (habDragIdx === null || habDragIdx === toIdx) return;

            const moved = state.habilidades.splice(habDragIdx, 1)[0];
            state.habilidades.splice(toIdx, 0, moved);
            habDragIdx = null;

            renderHabilidades();
            save();
        });

        wrap.appendChild(card);
    });

    wrap.querySelectorAll("[data-h]").forEach((inp) => {
        inp.addEventListener("input", (e) => {
            const i = num(e.target.dataset.h);
            state.habilidades[i][e.target.dataset.f] = e.target.value;
            save();
        });
    });

    wrap.querySelectorAll("[data-rm-hab]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            state.habilidades.splice(num(e.target.dataset.rmHab), 1);
            renderHabilidades();
            save();
        });
    });
}

// Inicialização do botão Adicionar
const btnAddHab = el("btnAddHab");
if (btnAddHab) {
    btnAddHab.addEventListener("click", () => {
        if (!state.habilidades) state.habilidades = [];
        if (state.habilidades.lenght >=5) {
            return;
        }
        state.habilidades.push({ nome: "", custo: "", elemento: "", descricao: "" });
        renderHabilidades();
        save();
    });
}

/* ---- Global controls ---- */
el("btnPrint").addEventListener("click", () => window.print());
el("btnReset").addEventListener("click", () => {
    if (confirm("Isso vai apagar todos os dados. Continuar?")) {
        state = defaultState();
        renderAll();
        save();
    }
});
el("btnExport").addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
        new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }),
    );
    a.download = (state.name || "personagem") + ".json";
    a.click();
});
el("btnImport").addEventListener("click", () => el("importFile").click());
el("importFile").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
        try {
            state = JSON.parse(r.result);
            save();
            renderAll();
            alert("Ficha importada!");
        } catch (err) {
            alert("Arquivo inválido.");
        }
    };
    r.readAsText(f);
});

/* ---- Salvar Ficha Para Simulador de Batalha ---- */
const btnSim = el("btnSimulador");
if (btnSim) {
    btnSim.addEventListener("click", () => {
        // 1. Monta o objeto simplificado apenas com os dados processados de luta
        const dadosSimulador = {
            personagem: {
                nome: state.name || "Sem Nome",
                nivel: state.level || 1,
                alma: state.info.alma,
                cor: accentColor()
            },
            combate: {
                hp: state.status.hpCur ?? calcHPMax(),
                hpMax: calcHPMax(),
                hope: state.status.hopeCur ?? calcHopeMax(),
                hopeMax: calcHopeMax(),
                love: state.status.love || 0,
                karma: state.status.karma || 0,
                atk: calcATK(),
                def: calcDEF(),
                mag: calcMAG()
            },
            atributos: {
                GRR: effAttr('GRR'),
                FRM: effAttr('FRM'),
                RPZ: effAttr('RPZ'),
                ESP: effAttr('ESP'),
                CHM: effAttr('CHM'),
                MRL: effAttr('MRL')
            },
            equipamentos: state.equip,
            habilidades: (state.habilidades || []).filter(h => h.nome && h.nome.trim() !== "")
        };

        const jsonTexto = JSON.stringify(dadosSimulador, null, 2);

        // 2. Copia para a área de transferência
        navigator.clipboard.writeText(jsonTexto).then(() => {
            const note = el("storageNote");
            if (note) {
                note.textContent = "⚔️ Dados de combate copiados (Ctrl+V no simulador)!";
                setTimeout(() => { note.textContent = "Salvo automaticamente."; }, 3000);
            }
        }).catch(() => {
            // Fallback caso o navegador restrinja permissão de clipboard: baixa o arquivo
            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([jsonTexto], { type: "application/json" }));
            a.download = (state.name || "personagem") + "_simulador.json";
            a.click();
        });
    });
}