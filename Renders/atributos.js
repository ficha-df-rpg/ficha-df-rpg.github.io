/*
Name: atributos.js
Author: Mennonimo
Date: 15/07/2026
Description: Código para lidar com renderização e modificação de atributos
*/

/* ---- Attributes ---- */
function renderAttrs() {
    const max = attrMax(state.level),
        total = poolTotal(state.level);
    const used = ATTRS.reduce((s, a) => s + (state.attrs[a.key] || 0), 0);
    const note = el("attrPointsNote");
    note.classList.toggle("over", used > total);
    note.innerHTML = `Pontos: <span class="hi">${used}/${total}</span> · Máx/atrib: <span class="hi" id="attrMaxNote">${max}</span>`;
    const list = el("attrList");
    list.innerHTML = "";
    const acc = accentColor();
    ATTRS.forEach((a) => {
        const val = state.attrs[a.key] || 0;
        const bonus = state.attrBonus[a.key] || 0;
        const eff = effAttr(a.key);
        const row = document.createElement("div");
        row.className = "attr-row";
        // name is clickable to roll d20+attr
        row.innerHTML = `
      <img class="iconeAtt" src="assets/${a.img}">  
      <div class="attr-tag" style="color: var(--text);cursor:pointer;" data-rollattr="${a.key}" title="Clique para rolar d20+${a.key}">${a.key}</div>
      <span class="attr-name-click" style="flex:0 0 78px;font-size:11px;color:var(--text-dim);cursor:pointer;white-space:nowrap;" </span>
      <input type="number" class="attr-num-inp" data-attr="${a.key}" value="${val}" min="0" max="${max}" style="width:44px;text-align:center;font-size: 18px">
      <span style="display:inline-block;min-width:28px;margin-left:4px;font-size:11px;color:var(--text-dim);">/ ${max}</span>
      <span style="font-size:16px;color:var(--text-dim);margin-left:4px;">bônus:</span>
      <input type="number" class="attr-bonus-inp" data-bonus="${a.key}" value="${bonus}" style="width:38px;text-align:center;">
      <span style="font-size:16px;font-weight:bold;color:${acc};margin-left:6px;min-width:24px;text-align:right;">=&nbsp;${eff}</span>
    `;
        row.querySelectorAll("[data-rollattr]").forEach((el2) => {
            el2.addEventListener("click", () => {
                const d = rollDie(20),
                    t = d + effAttr(a.key);
                addLog(`${a.key} → d20(${d})+${effAttr(a.key)}=${t}`);
                showResult(
                    `<div>${a.name} (d20+${a.key})</div><div>[${d}] + ${effAttr(a.key)}</div><div class="total">${t}</div>`,
                );
            });
        });
        row.querySelector(".attr-num-inp").addEventListener("input", (e) => {
            let v = num(e.target.value);
            if (v < 0) v = 0;
            if (v > max) v = max;
            const prevVal = state.attrs[a.key] || 0;
            const usedOthers = ATTRS.reduce(
                (s, x) => s + (x.key === a.key ? 0 : state.attrs[x.key] || 0),
                0,
            );
            if (v > prevVal && usedOthers + v > total) {
                v = total - usedOthers;
            }
            if (v < 0) v = 0;
            state.attrs[a.key] = v;
            e.target.value = v;
            const sc = skillCap(state.level);
            (SKILL_MAP[a.key] || []).forEach((s) => {
                if (state.skills[s] > sc) state.skills[s] = sc;
            });

            autoClampSkills(a.key);
            renderAttrs();
            renderSkills();
            renderStatus();
            save();
        });
        row.querySelector("[data-bonus]").addEventListener("input", (e) => {
            state.attrBonus[a.key] = num(e.target.value);
            renderAttrs();
            renderSkills();
            renderStatus();
            save();
        });
        list.appendChild(row);
    });
}

function setAttr(key, nv) {
    const max = attrMax(state.level);
    nv = clamp(nv, 0, max);
    const used =
        ATTRS.reduce(
            (s, a) => s + (a.key === key ? 0 : state.attrs[a.key] || 0),
            0,
        ) + nv;
    if (nv > (state.attrs[key] || 0) && used > poolTotal(state.level)) return;
    state.attrs[key] = nv;
    const sc = skillCap(state.level);
    (SKILL_MAP[key] || []).forEach((s) => {
        if (state.skills[s] > sc) state.skills[s] = sc;
    });
    renderAttrs();
    renderSkills();
    renderStatus();
    save();
}
