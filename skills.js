/*
Name: skills.js
Author: Mennonimo
Date: 15/07/2026
Description: Código responsável pela realização das skills e controle
*/

/* ---- Skills ---- */
function renderSkills() {
    const cap = skillCap(state.level);
    el("skillCapNote").textContent = cap;
    const list = el("skillList");
    list.innerHTML = "";
    const acc = accentColor();

    ATTRS.forEach((a, idx) => {
        const pool = state.attrs[a.key] || 0;
        const used = SKILL_MAP[a.key].reduce(
            (s, sk) => s + (state.skills[sk] || 0),
            0,
        );

        const group = document.createElement("div");
        group.className = "skill-group";
        group.innerHTML = `<div class="group-head" style="color:${a.clr};border-color:${a.clr};">
                        <span>
                          Pts ${used}/${pool}
                        </span>
                      </div>`;

        SKILL_MAP[a.key].forEach((sk, index) => {
            const val = state.skills[sk] || 0;
            const bonus = state.skillBonus[sk] || 0;
            sv = effSkill(sk);
            av = effAttr(a.key);
            const total = sv + av;
            const row = document.createElement("div");
            row.className = "skill-row";
            row.innerHTML = `
        <span class="skill-name" title="Clique para rolar d20+perícia+atributo">${sk}</span>
        <input type="number" class="skill-num-inp" data-sk="${sk}" data-ak="${a.key}" value="${val}" min="0" max="${cap}" style="width:38px;text-align:center;font-size:16px;">
        <div class="skill-dice">
            <div style="display:flex; flex-direction: row; align-items: center; justify-content: space-around; width: 100%;">
                <h1>D20: </h1>
                <span class="skill-roll-result" dice-result></span>
                <h1>+</h1>
                <h1>${total}</h1>
                <span totalmente class="skill-resultado-dice">=&nbsp;${total}</span>
            </div>
            <button class="cancel-dado">Cancelar Dado</button>
        </div>
        <span totalmente class="skill-resultado">=&nbsp;${total}</span>
      `;
            row.querySelector(".skill-name").addEventListener("click", () => {
                const d = rollDie(20);
                const t = total + d;

                row.querySelector("[dice-result]").textContent = d;

                row.querySelectorAll("[totalmente]").forEach(el => {
                    el.innerHTML = `=&nbsp;${t}`;
                });

                addLog(`${sk} → ${t}`);
                showResult(
                    `<div>${sk}</div><div>${d} + ${total}</div><div class="total">${t}</div>`,
                );
            });

            row.querySelector(".skill-num-inp").addEventListener("input", (e) => {
                let v = num(e.target.value);
                if (v < 0) v = 0;
                if (v > cap) v = cap;
                const usedOthers = SKILL_MAP[a.key].reduce(
                    (s, s2) => s + (s2 === sk ? 0 : state.skills[s2] || 0),
                    0,
                );
                if (v > 0 && usedOthers + v > pool) {
                    v = Math.max(0, pool - usedOthers);
                }
                state.skills[sk] = v;
                e.target.value = v;
                renderSkills();
                save();
            });

            row.querySelector(".cancel-dado").addEventListener("click", (e) => {
                e.stopPropagation();

                row.querySelector("[dice-result]").textContent = 0;

                row.querySelectorAll("[totalmente]").forEach(el => {
                    el.innerHTML = `=&nbsp;${total}`;
                });
            });

            group.appendChild(row);
        });
        list.appendChild(group);
    });
}

function setSkill(sk, attrKey, nv) {
    const cap = skillCap(state.level);
    nv = clamp(nv, 0, cap);
    const pool = state.attrs[attrKey] || 0;
    const used =
        SKILL_MAP[attrKey].reduce((s, s2) => s + (state.skills[s2] || 0), 0) -
        (state.skills[sk] || 0) +
        nv;
    if (nv > (state.skills[sk] || 0) && used > pool) return;
    state.skills[sk] = nv;
    renderSkills();
    save();
}

function autoClampSkills(attrKey) {
    const pool = state.attrs[attrKey] || 0;
    const skills = SKILL_MAP[attrKey];

    let used = skills.reduce((acc, sk) => acc + (state.skills[sk] || 0), 0);

    if (used > pool) {
        for (let i = skills.length - 1; i >= 0 && used > pool; i--) {
            const sk = skills[i];
            const currentVal = state.skills[sk] || 0;
            if (currentVal > 0) {
                const excess = used - pool;
                const deduction = Math.min(currentVal, excess);
                state.skills[sk] -= deduction;
                used -= deduction;
            }
        }
    }
}