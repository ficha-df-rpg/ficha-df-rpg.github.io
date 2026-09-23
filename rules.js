/*
Name: rules.js
author: Mennonimo
Date: 15/7/2026
Description: Código para guardar as configurações das constantes e estruturas, banco de dados local, utilitários e fórmulas
*/

/* ---- Storage ---- */
const MEM = {};
let usingMem = false;
const LS = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { usingMem = true; return MEM[k] ?? null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { usingMem = true; MEM[k] = v; } }
};
const STORAGE_KEY = 'dontforget_v3';

/* ---- Data constants ---- */
const ATTRS = [
  { key: 'GRR', name: 'Garra', clr: 'var(--red)', img: 'Garra.png' },
  { key: 'FRM', name: 'Firmeza', clr: 'var(--orange)', img: 'Firmeza.png' },
  { key: 'RPZ', name: 'Rapidez', clr: 'var(--yellow)', img: 'Rapidez.png' },
  { key: 'ESP', name: 'Esperteza', clr: 'var(--purple)', img: 'Garra.png' },
  { key: 'CHM', name: 'Charme', clr: 'var(--green)', img: 'Esperteza.png' },
  { key: 'MRL', name: 'Moral', clr: 'var(--blue)', img: 'Moral.png' },
];
const SKILL_MAP = {
  GRR: ['Atletismo', 'Briga', 'Intimidação'],
  FRM: ['Bloqueio', 'Vigor', 'Escalada'],
  RPZ: ['Disparo', 'Esquiva', 'Furtividade'],
  ESP: ['Foco', 'História', 'Percepção'],
  CHM: ['Enganação', 'Exibição', 'Persuasão'],
  MRL: ['Vontade', 'Intuição', 'Inspiração'],
};
const ALL_SKILLS = Object.values(SKILL_MAP).flat();
const SOUL_COLORS = {
  'Determinação': '#cd0b22', 'Bravura': '#fd7b1e', 'Justiça': '#ffb422',
  'Perseverança': '#a348a3', 'Bondade': '#23b04b', 'Integridade': '#236bf2',
  'Monstro': '#ffffff', 'Darkner': '#412576', 'Paciência': '#00daef', 'Personalizada': '#ff66ff',
};
const SOUL_FONT_COLOR = {
  'Monstro': '#000000', 'Darkner': '#ffffff',
};

/* ---- Formulas ---- */
function attrMax(lvl) { return 5 + 2 * (Math.max(1, Math.min(7, lvl)) - 1); }
function poolTotal(lvl) {
  lvl = Math.max(1, Math.min(7, lvl));
  let b = 12 + 3 * (lvl - 1); if (lvl >= 7) b += 3; return b;
}
function skillCap(lvl) { return Math.floor(attrMax(lvl) / 2); }

/* ---- Default state ---- */
function defaultState() {
  const attrs = {}, attrBonus = {};
  ATTRS.forEach(a => { attrs[a.key] = 0; attrBonus[a.key] = 0; });
  const skills = {}, skillBonus = {};
  ALL_SKILLS.forEach(s => { skills[s] = 0; skillBonus[s] = 0; });
  return {
    name: '', title: '', level: 1, image: null, page: 1,
    attrs, attrBonus, skills, skillBonus,
    equip: { arma: { nome: '', desc: '', categoria: '', tipo: '' }, armadura: { nome: '', desc: '' }, amuleto: { nome: '', desc: '' } },
    items: Array.from({ length: 10 }, () => ({
      nome: '',
      desc: ''
    })),
    status: { hpCur: null, hpClassBonus: 0, hpManualBonus: 0, hopeCur: null, hopeManualBonus: 0, love: 0, karma: 0, atkBonus: 0, defBonus: 0, magBonus: 0 },
    info: { alma: 'Determinação', almaCustomColor: '#ff66ff' },
    classe: { nome: '', trilha: '', atrUp: '', atrDown: '', periciaBonus: '' },
    aspectos: [
    { nome: "", descricao: "", efeito: "" },
    { nome: "", descricao: "", efeito: "" },
    { nome: "", descricao: "", efeito: "" },
    { nome: "", descricao: "", efeito: "" },
    { nome: "", descricao: "", efeito: "" }
    ],
    habilidades: Array.from({ length: 8 }, () => ({ nome: "", custo: "", elemento: "", acao: "", descricao: "" })),
    habilidadesExtras: "",
    notes: { n1: '', n2: '' },
  };
}

let state = defaultState();
try {
  const r = LS.get(STORAGE_KEY); if (r) {
    const p = JSON.parse(r); state = Object.assign(defaultState(), p, {
      attrs: Object.assign(defaultState().attrs, p.attrs || {}), attrBonus: Object.assign(defaultState().attrBonus, p.attrBonus || {}), skills: Object.assign(defaultState().skills, p.skills || {}), skillBonus: Object.assign(defaultState().skillBonus, p.skillBonus || {}), equip: Object.assign({ arma: { nome: '', desc: '', categoria: '', tipo: '' }, armadura: { nome: '', desc: '' }, amuleto: { nome: '', desc: '' } }, p.equip || {}, { arma: Object.assign({ nome: '', desc: '', categoria: '', tipo: '' }, p.equip && p.equip.arma || {}) }), status: Object.assign(defaultState().status, p.status || {}), info: Object.assign(defaultState().info, p.info || {}), classe: Object.assign(defaultState().classe, p.classe || {}), notes: Object.assign(defaultState().notes, p.notes || {}), items:
        p.items && p.items.length > 0
          ? p.items.map(item => {
            if (typeof item === "string") { return { nome: item, desc: "" }; }
            return { nome: item.nome || "", desc: item.desc || "" };
          })
          : defaultState().items, habilidades: p.habilidades || []
    });
  }
} catch (e) { }

let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    LS.set(STORAGE_KEY, JSON.stringify(state));
    el('storageNote').textContent = usingMem ? 'Aviso: dados ficam só nesta sessão.' : 'Salvo automaticamente.';
  }, 150);
}

/* ---- Helpers ---- */
// Aqui estão funções que costumam ser muito usadas no código de forma abreviada
function el(id) { return document.getElementById(id); } // Ele basicamente abrevia o comando de buscar um ID no código
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); } // Limitador de HP basicamente
function rollDie(s) { return 1 + Math.floor(Math.random() * s); } // Código para rolar um dado usando número aleatório
function num(v) { const n = parseInt(v, 10); return isNaN(n) ? 0 : n; } // Código para validar sempre como número em um campo
function effAttr(k) { return (state.attrs[k] || 0) + (num(state.attrBonus[k]) || 0) + (state.classe.atrUp === k ? 1 : 0) + (state.classe.atrDown === k ? -1 : 0); } // Faz o cálculo de atributo effetivo
function effSkill(s) { let v = (state.skills[s] || 0) + (num(state.skillBonus[s]) || 0); if (state.classe.periciaBonus === s) v++; return v; } // Faz o calculo de atributo effetivo, porém agora para as perícias
function accentColor() { if (state.info.alma === 'Personalizada') return state.info.almaCustomColor || '#ff66ff'; return SOUL_COLORS[state.info.alma] || '#FFF'; } // Serve para descobrir/pegar qual a cor da alma do usuário
function textColorFor(hex) { const c = hex.replace('#', ''); if (c.length !== 6) return '#fff'; const r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16); return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#000' : '#fff'; } // Código para calcular e verificar o contraste de cores para garantir controle visual

function calcATK() { return Math.max(0, effAttr('GRR') * 5 + (state.status.atkBonus || 0) + (state.status.love || 0) * 2); } // Cálculo da mecânica de ataque
function calcDEFbase() { return Math.max(0, effAttr('FRM') * 3 + (state.status.love || 0) * 2); } // Cálculo de mecânica de defesa limpa
function calcDEF() { return Math.max(0, calcDEFbase() + (state.status.defBonus || 0)); } // Cálculo da defesa base somada aos bonus
function calcMAG() { return Math.max(0, effAttr('ESP') * 5 + (state.status.magBonus || 0)); } // Calcular Dano Mágico
function calcHPMax() { return Math.max(1, calcDEFbase() + (state.status.hpClassBonus || 0) + (state.status.hpManualBonus || 0) + Math.max(0, (state.level || 1) - 1) * 20); } //Cálculo do HP máximo sendo a soma da defesa base, bonus de hp e bonus manual
function calcHopeMax() { return 5 + effAttr('MRL') * 2 + (state.status.hopeManualBonus || 0); } // Cálculo de esperânça máxima