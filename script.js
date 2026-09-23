/*
Name: script.js
Author: Mennonimo
Date: 15/07/2026
Description: Javascript matriz do site, contendo o core conectando as outras partes do código e alguns controles essenciais
*/

"use strict";
/* ============================================================
  DON'T FORGET — Ficha Interativa v3
============================================================ */

/* Variable Table Context:
--> el = Element

*/
/* ---- Apply soul theme ---- */
function applyTheme() {
    const c = accentColor();
    document.documentElement.style.setProperty('--soul', c);
    document.documentElement.style.setProperty('--soul-glow', c + '44');
    el('soulSwatch').style.background = c;
    ['1', '2', '3'].forEach(n => { const s = el('soulSvg' + n); if (s) s.style.fill = c; });
    // background gradient changes with soul
    document.documentElement.style.setProperty('--soul-grad', c);
}

/* ---- Pager ---- */
function goToPage(n) {
    state.page = n;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    el('page' + n).classList.add('active');
    document.querySelectorAll('.pager-btn').forEach(b => b.classList.toggle('active', +b.dataset.page === n));
    save();
}

document.querySelectorAll('.pager-btn').forEach(b => b.addEventListener('click', () => goToPage(+b.dataset.page)));

/* ---- Photo ---- */
function syncPhotos() {
    ['1', '2', '3'].forEach(n => {
        const img = el('portraitImg' + n),
            svg = el('soulSvg' + n);
        if (state.image) {
            img.src = state.image;
            img.style.display = 'block';
            svg.style.display = 'none';
        } else {
            img.style.display = 'none';
            svg.style.display = 'block';
        }
    });
}

el('photoInput').addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
        state.image = r.result;
        syncPhotos();
        save();
    };
    r.readAsDataURL(f);
});

['portraitBtn1', 'portraitBtn2', 'portraitBtn3'].forEach(id => el(id).addEventListener('click', () => el('photoInput').click()));

/* ---- Header ---- */
function bindHeader() {
    const nome = el('charName');
    const titulo = el('charTitle');

    if (nome) {
        nome.value = state.name;
        nome.addEventListener('input', e => {
            state.name = e.target.value;
            save();
        });
    }

    if (titulo) {
        el('charTitle').value = state.title;
        el('charTitle').addEventListener('input', e => {
            state.title = e.target.value;
            save();
        });
    }

}

/* ---- Dice roller ---- */
function showResult(html) {
    el('diceResult').innerHTML = html;
}

function addLog(text) {
    const log = el('diceLog');
    if (log) {
        const line = document.createElement('div');
        line.textContent = text;
        log.insertBefore(line, log.firstChild);
        while (log.children.length > 8) log.removeChild(log.lastChild);
    }
}

function rollDice(qty, sides, mod, label) {
    const rolls = [];
    for (let i = 0; i < qty; i++) rolls.push(rollDie(sides));
    const sum = rolls.reduce((a, b) => a + b, 0) + (mod || 0);
    showResult(`${label ? '<div>' + label + '</div>' : ''}<div>[${rolls.join(', ')}]${mod ? (mod > 0 ? ' +' + mod : ' ' + mod) : ''}</div><div class="total">${sum}</div>`);
    addLog(`${label || (qty + 'd' + sides)} → ${sum}`);
    return sum;
}

// el('btnRollDano').addEventListener('click', () => {
//   const qty = Math.max(1, num(el('diceQty').value) || 1);
//   const mod = num(el('diceMod').value) || 0;
//   const atk = calcATK();
//   const totalDice = qty;
//   rollDice(totalDice, 8, atk + mod, `Dano ATK (${totalDice}d8 + ATK ${atk}${mod ? '+' + mod : ''})`);
// });

// el('btnRollMag').addEventListener('click', () => {
//   const qty = Math.max(1, num(el('diceQty').value) || 1);
//   const mod = num(el('diceMod').value) || 0;
//   const mag = calcMAG();
//   const totalDice = qty; // 1 + qty
//   rollDice(totalDice, 8, mag + mod, `Dano MAG (${totalDice}d8 + MAG ${mag}${mod ? '+' + mod : ''})`);
// });

/* ---- Info / Alma ---- */
function bindInfo() {
    el('infoAlma').value = state.info.alma;
    el('almaColorPicker').value = state.info.almaCustomColor;
    el('almaColorText').value = state.info.almaCustomColor;
    el('infoClasse').value = state.classe.nome || '';
    el('infoTrilha').value = state.classe.trilha || '';
    el('infoElementoAlma').value = state.info.elementoAlma || '';
    toggleCustomAlma();

    el('infoAlma').addEventListener('change', e => {
        state.info.alma = e.target.value;
        toggleCustomAlma();
        applyTheme();
        renderAttrs();
        renderSkills();
        renderStatus();
        save();
    });

    el('almaColorPicker').addEventListener('input', e => {
        state.info.almaCustomColor = e.target.value;
        el('almaColorText').value = e.target.value;
        applyTheme();
        renderAttrs();
        renderSkills();
        save();
    });

    el('almaColorText').addEventListener('input', e => {
        let v = e.target.value.trim();
        if (!v.startsWith('#')) v = '#' + v;
        if (/^#[0-9a-fA-F]{6}$/.test(v)) {
            state.info.almaCustomColor = v;
            el('almaColorPicker').value = v;
            applyTheme();
            renderAttrs();
            renderSkills();
        }
        save();
    });

    el('infoClasse').addEventListener('input', e => {
        state.classe.nome = e.target.value;
        save();
    });
    el('infoTrilha').addEventListener('input', e => {
        state.classe.trilha = e.target.value;
        save();
    });
    el('infoElementoAlma').addEventListener('input', e => {
        state.info.elementoAlma = e.target.value;
        save();
    });
}

function toggleCustomAlma() {
    el('customAlmaBox').style.display = state.info.alma === 'Personalizada' ? 'flex' : 'none';
    const showElem = ['Monstro', 'Darkner'].includes(state.info.alma);
    el('elementoAlmaBox').style.display = showElem ? 'block' : 'none';
}

/* ---- Notes ---- */
function bindNotes() {
    el('notes1').value = state.notes.n1 || '';
    el('notes2').value = state.notes.n2 || '';
    el('notes1').addEventListener('input', e => {
        state.notes.n1 = e.target.value;
        save();
    });
    el('notes2').addEventListener('input', e => {
        state.notes.n2 = e.target.value;
        save();
    });
}

/* ---- Render All ---- */
function renderAll() {
    applyTheme();
    bindHeader();
    syncPhotos();
    renderLevel();
    renderAttrs();
    renderSkills();
    renderStatus();
    renderItems();
    bindEquip();
    bindInfo();
    renderClassSelects();
    renderAspectos();
    renderHabilidades();
    bindNotes();
    goToPage(state.page || 1);
}

window.addEventListener('DOMContentLoaded', () => {
    renderAll();
    save();
});