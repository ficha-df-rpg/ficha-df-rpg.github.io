/*
Name: status.js
Author: Mennonimo
Date: 15/07/2026
Description: Javascript responsável pela parte da renderização de status, o HP e LOVE
*/

/* ---- Status ---- */
function renderStatus() {
    const atk = calcATK(),
        def = calcDEF(),
        mag = calcMAG();
    el('statAtk').textContent = atk;
    el('statDef').textContent = def;
    el('statMag').textContent = mag;
    el('atkBonus').value = state.status.atkBonus || 0;
    el('defBonus').value = state.status.defBonus || 0;
    el('magBonus').value = state.status.magBonus || 0;

    const hpMax = calcHPMax();
    if (state.status.hpCur === null || state.status.hpCur === undefined) state.status.hpCur = hpMax;
    state.status.hpCur = clamp(state.status.hpCur, 0, hpMax);
    el('hpDefBase').value = calcDEFbase();
    el('hpClassBonus').value = state.status.hpClassBonus || 0;
    el('hpManualBonus').value = state.status.hpManualBonus || 0;
    buildBar('hpBar', 'hpBarLabel', state.status.hpCur, hpMax);

    const hopeMax = calcHopeMax();
    if (state.status.hopeCur === null || state.status.hopeCur === undefined) state.status.hopeCur = hopeMax;
    state.status.hopeCur = clamp(state.status.hopeCur, 0, hopeMax);
    el('hopeMaxNote').textContent = '/' + hopeMax;
    el('hopeManualBonus').value = state.status.hopeManualBonus || 0;
    buildBar('hopeBar', 'hopeBarLabel', state.status.hopeCur, hopeMax);

    const love = clamp(state.status.love || 0, 0, 20);
    buildBar('loveBar', 'loveBarLabel', love, 20);

    const karma = clamp(state.status.karma || 0, -50, 50);
    el('karmaVal').textContent = karma;
    // bidirectional: center=0, negative=red left, positive=green right
    const kpct = Math.abs(karma) / 50 * 50; // percentage from center
    const kfill = el('karmaFill');
    if (karma >= 0) {
        kfill.style.left = '50%';
        kfill.style.right = 'auto';
        kfill.style.width = kpct + '%';
        kfill.style.background = 'var(--green)';
    } else {
        kfill.style.right = '50%';
        kfill.style.left = 'auto';
        kfill.style.width = kpct + '%';
        kfill.style.background = 'var(--red)';
    }
    el('karmaLabelInside').textContent = karma + ' / 50';
}

function buildBar(barId, labelId, cur, max) {
    const pct = max > 0 ? clamp(cur / max * 100, 0, 100) : 0;
    el(barId).style.width = pct + '%';
    el(labelId).textContent = cur + ' / ' + max;
}

/* click on bar to adjust value */
function barClickHandler(barWrapId, getCur, getMax, setter) {
    el(barWrapId).addEventListener('click', e => {
        const rect = el(barWrapId).getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        const max = getMax();
        setter(Math.round(pct * max));
        renderStatus();
        save();
    });
}
barClickHandler('hpBarWrap', () => state.status.hpCur, calcHPMax, v => { state.status.hpCur = clamp(v, 0, calcHPMax()); });
barClickHandler('hopeBarWrap', () => state.status.hopeCur, calcHopeMax, v => { state.status.hopeCur = clamp(v, 0, calcHopeMax()); });
barClickHandler('loveBarWrap', () => state.status.love, () => 20, v => {
    state.status.love = clamp(v, 0, 20);
    renderStatus();
    save();
});
el('karmaTrack').addEventListener('click', e => {
    const rect = el('karmaTrack').getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    // center = 0, left = -50, right = +50
    state.status.karma = clamp(Math.round((pct * 2 - 1) * 50), -50, 50);
    renderStatus();
    save();
});

/* stat bonus inputs — mínimo 0 */
['atk', 'def', 'mag'].forEach(k => {
    el(k + 'Bonus').addEventListener('input', e => {
        const v = Math.max(0, num(e.target.value));
        e.target.value = v;
        state.status[k + 'Bonus'] = v;
        renderStatus();
        save();
    });
});
el('hpClassBonus').addEventListener('input', e => {
    const v = Math.max(0, num(e.target.value));
    e.target.value = v;
    state.status.hpClassBonus = v;
    renderStatus();
    save();
});
el('hpManualBonus').addEventListener('input', e => {
    const v = Math.max(0, num(e.target.value));
    e.target.value = v;
    state.status.hpManualBonus = v;
    renderStatus();
    save();
});
el('hopeManualBonus').addEventListener('input', e => {
    const v = Math.max(0, num(e.target.value));
    e.target.value = v;
    state.status.hopeManualBonus = v;
    renderStatus();
    save();
});

/* HP / HOPE / LOVE / KARMA etc. Botões de adição e menos*/
el('manualHopeMinus').addEventListener('click', () => {
    state.status.hopeManualBonus = Math.max(0, (state.status.hopeManualBonus || 0) - 1);
    renderStatus();
    save();
});

el('manualHopePlus').addEventListener('click', () => {
    state.status.hopeManualBonus = Math.max(0, (state.status.hopeManualBonus || 0) + 1);
    renderStatus();
    save();
});

el('karmaMinus').addEventListener('click', () => {
    state.status.karma = clamp((state.status.karma || 0) - 1, -50, 50);
    renderStatus();
    save();
});
el('karmaPlus').addEventListener('click', () => {
    state.status.karma = clamp((state.status.karma || 0) + 1, -50, 50);
    renderStatus();
    save();
});

el('hpMinus').addEventListener('click', () => {
    state.status.hpCur = clamp((state.status.hpCur || 0) - 1, 0, calcHPMax());
    renderStatus();
    save();
});
el('hpPlus').addEventListener('click', () => {
    state.status.hpCur = clamp((state.status.hpCur || 0) + 1, 0, calcHPMax());
    renderStatus();
    save();
});
el('hpFull').addEventListener('click', () => {
    state.status.hpCur = calcHPMax();
    renderStatus();
    save();
});
el('hopeMinus').addEventListener('click', () => {
    state.status.hopeCur = clamp((state.status.hopeCur || 0) - 1, 0, calcHopeMax());
    renderStatus();
    save();
});
el('hopePlus').addEventListener('click', () => {
    state.status.hopeCur = clamp((state.status.hopeCur || 0) + 1, 0, calcHopeMax());
    renderStatus();
    save();
});
el('loveMinus').addEventListener('click', () => {
    state.status.love = clamp((state.status.love || 0) - 1, 0, 20);
    renderStatus();
    save();
});
el('lovePlus').addEventListener('click', () => {
    state.status.love = clamp((state.status.love || 0) + 1, 0, 20);
    renderStatus();
    save();
});

/* Pop-Ups de valores para Hp e Hope */
el('popUpHp').addEventListener('blur', e => {
    const sep = e.target.value.trim();
    if (!sep) return;

    let cur = state.status.hpCur;
    let numero;

    if (sep.startsWith("+") || sep.startsWith("-")) {
        numero = cur + num(sep);
    } else {
        numero = num(sep);
    }

    state.status.hpCur = clamp(numero, 0, calcHPMax());
    e.target.value = "";
    renderStatus();
    save();
});
el('popUpHp').addEventListener('keydown', e => {
    if (e.key == "Enter") {
        e.target.blur();
    }
});


el('popUpHope').addEventListener('blur', e => {
    const sep = e.target.value.trim();
    if (!sep) return;

    let cur = state.status.hopeCur;
    let numero;

    if (sep.startsWith("+") || sep.startsWith("-")) {
        numero = cur + num(sep);
    } else {
        numero = num(sep);
    }

    state.status.hopeCur = clamp(numero, 0, calcHopeMax());
    e.target.value = ""
    renderStatus();
    save();
});
el('popUpHope').addEventListener('keydown', e => {
    if (e.key == "Enter") {
        e.target.blur();
    }
});


el('popUpKarma').addEventListener('blur', e => {
    const sep = e.target.value.trim();
    if (!sep) return;

    let cur = state.status.karma;
    let numero;

    if (sep.startsWith("+") || sep.startsWith("-")) {
        numero = cur + num(sep);
    } else {
        numero = num(sep);
    }

    state.status.karma = clamp(numero, -50, 50);
    e.target.value = "";
    renderStatus();
    save();
});
el('popUpKarma').addEventListener('keydown', e => {
    if (e.key == "Enter") {
        e.target.blur();
    }
});
