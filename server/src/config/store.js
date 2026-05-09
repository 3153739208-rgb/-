/**
 * 轻量 JSON 文件存储 — 模拟 Sequelize API，零原生依赖
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const stores = {};

function store(name) {
  if (stores[name]) return stores[name];
  const file = path.join(DATA_DIR, `${name}.json`);
  let data = [];
  let pk = 1;

  if (fs.existsSync(file)) {
    try { data = JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { data = []; }
    const max = data.reduce((m, r) => Math.max(m, r.id || 0), 0);
    pk = max + 1;
  }

  const save = () => fs.writeFileSync(file, JSON.stringify(data, null, 2));

  const q = (records, where) => {
    if (!where) return records;
    return records.filter((r) => {
      for (const [k, v] of Object.entries(where)) {
        if (typeof v === 'object' && v !== null) {
          if (v['$like'] !== undefined) {
            const like = v['$like'].replace(/%/g, '.*');
            if (!new RegExp(like, 'i').test(String(r[k] || ''))) return false;
          } else if (v['$lte'] !== undefined) {
            if (new Date(r[k]) > new Date(v['$lte'])) return false;
          } else if (v['$or'] !== undefined) {
            if (!v['$or'].some((cond) => q([r], cond).length)) return false;
          } else {
            if (r[k] !== v) return false;
          }
        } else if (r[k] !== v) {
          return false;
        }
      }
      return true;
    });
  };

  const model = {
    findAll: async ({ where, order, limit, offset } = {}) => {
      let rows = [...data];
      if (where) rows = q(rows, where);
      if (order) {
        rows.sort((a, b) => {
          for (const [col, dir] of order) {
            const av = a[col], bv = b[col];
            if (av < bv) return dir === 'DESC' ? 1 : -1;
            if (av > bv) return dir === 'DESC' ? -1 : 1;
          }
          return 0;
        });
      }
      if (offset) rows = rows.slice(offset);
      if (limit) rows = rows.slice(0, limit);
      return rows.map((r) => ({ ...r, toJSON: () => ({ ...r }) }));
    },

    findAndCountAll: async ({ where, order, limit, offset }) => {
      let rows = [...data];
      if (where) rows = q(rows, where);
      const count = rows.length;
      if (order) {
        rows.sort((a, b) => {
          for (const [col, dir] of order) {
            const av = a[col], bv = b[col];
            if (av < bv) return dir === 'DESC' ? 1 : -1;
            if (av > bv) return dir === 'DESC' ? -1 : 1;
          }
          return 0;
        });
      }
      if (offset) rows = rows.slice(offset);
      if (limit) rows = rows.slice(0, limit);
      return { count, rows: rows.map((r) => ({ ...r, toJSON: () => ({ ...r }) })) };
    },

    findByPk: async (id) => {
      const r = data.find((r) => r.id === id);
      if (!r) return null;
      return { ...r, update: async (vals) => model.update(vals, { where: { id: r.id } }), destroy: async () => model.destroy({ where: { id: r.id } }), toJSON: () => ({ ...r }) };
    },

    findOne: async ({ where }) => {
      const rows = q(data, where);
      const r = rows[0] || null;
      if (!r) return null;
      return { ...r, update: async (vals) => model.update(vals, { where: { id: r.id } }), destroy: async () => model.destroy({ where: { id: r.id } }), toJSON: () => ({ ...r }) };
    },

    create: async (vals) => {
      const record = { id: pk++, ...vals, created_at: vals.created_at || new Date().toISOString(), updated_at: new Date().toISOString() };
      data.push(record);
      save();
      return { ...record, update: async (v) => model.update(v, { where: { id: record.id } }), destroy: async () => model.destroy({ where: { id: record.id } }), toJSON: () => ({ ...record }) };
    },

    update: async (vals, { where }) => {
      const rows = q(data, where);
      rows.forEach((r) => {
        Object.assign(r, vals, { updated_at: new Date().toISOString() });
      });
      save();
      return [rows.length];
    },

    destroy: async ({ where }) => {
      const before = data.length;
      data = data.filter((r) => !q([r], where).length);
      save();
      return before - data.length;
    },

    count: async ({ where } = {}) => {
      if (!where) return data.length;
      return q(data, where).length;
    },

    // 批量创建
    bulkCreate: async (records) => {
      const results = [];
      for (const vals of records) {
        const record = { id: pk++, ...vals, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        data.push(record);
        results.push(record);
      }
      save();
      return results;
    },
  };

  stores[name] = model;
  return model;
}

module.exports = store;
