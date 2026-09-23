/*
Name: levels.js
Author: Mennonimo
Date: 15/07/2026
Description: renderização de levels
*/

/* ---- Level ---- */
function renderLevel() {
    el('lvlVal').textContent = state.level;
}

function setLevel(n) {
    state.level = clamp(n, 1, 7);
    const max = attrMax(state.level);
    ATTRS.forEach(a => { if (state.attrs[a.key] > max) state.attrs[a.key] = max; });
    // clamp skills
    const sc = skillCap(state.level);
    ALL_SKILLS.forEach(s => { if (state.skills[s] > sc) state.skills[s] = sc; });
    ATTRS.forEach(a => autoClampSkills(a.key));
    renderLevel();
    renderAttrs();
    renderSkills();
    renderStatus();
    save();
}
el('lvlMinus').addEventListener('click', () => setLevel(state.level - 1));
el('lvlPlus').addEventListener('click', () => setLevel(state.level + 1));