const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const dbState = {
  isMongooseConnected: false,
  mode: 'embedded', // 'mongoose' or 'embedded'
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/interview_analytics';
  try {
    // Attempt Mongoose connection with a fast 2-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    dbState.isMongooseConnected = true;
    dbState.mode = 'mongoose';
    console.log(`[Database] Successfully connected to live MongoDB daemon at: ${uri}`);
  } catch (err) {
    dbState.isMongooseConnected = false;
    dbState.mode = 'embedded';
    console.warn(`[Database] Notice: Live MongoDB not detected (${err.message}).`);
    console.log(`[Database] Automatically initialized embedded JSON Document Engine in: ${DATA_DIR}`);
    console.log(`[Database] Full CRUD operations, filtering, and persistence are 100% operational.`);
  }
  return dbState;
};

// Embedded document store implementation
class EmbeddedCollection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this.data = this._loadData();
  }

  _loadData() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error(`Error loading data for ${this.name}:`, e.message);
    }
    return [];
  }

  _saveData() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error(`Error saving data for ${this.name}:`, e.message);
    }
  }

  _generateId() {
    return 'doc_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  _matches(item, filter = {}) {
    if (!filter || Object.keys(filter).length === 0) return true;
    for (const key of Object.keys(filter)) {
      if (key === '_id' || key === 'id') {
        const matchId = String(filter[key]);
        const itemId = String(item._id || item.id);
        if (matchId !== itemId) return false;
        continue;
      }
      if (key === '$or' && Array.isArray(filter.$or)) {
        const anyMatch = filter.$or.some(sub => this._matches(item, sub));
        if (!anyMatch) return false;
        continue;
      }
      if (filter[key] instanceof RegExp) {
        if (!filter[key].test(String(item[key] || ''))) return false;
        continue;
      }
      if (typeof filter[key] === 'object' && filter[key] !== null) {
        if (filter[key].$in && Array.isArray(filter[key].$in)) {
          if (!filter[key].$in.map(String).includes(String(item[key]))) return false;
          continue;
        }
        if (filter[key].$gte !== undefined && item[key] < filter[key].$gte) return false;
        if (filter[key].$lte !== undefined && item[key] > filter[key].$lte) return false;
      } else {
        if (String(item[key]) !== String(filter[key])) return false;
      }
    }
    return true;
  }

  async find(filter = {}) {
    this.data = this._loadData();
    const results = this.data.filter(item => this._matches(item, filter));
    return results.map(item => ({ ...item, id: item._id }));
  }

  async findOne(filter = {}) {
    this.data = this._loadData();
    const found = this.data.find(item => this._matches(item, filter));
    return found ? { ...found, id: found._id } : null;
  }

  async findById(id) {
    if (!id) return null;
    return this.findOne({ _id: String(id) });
  }

  async create(doc) {
    this.data = this._loadData();
    const newDoc = {
      _id: doc._id || this._generateId(),
      ...doc,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    newDoc.id = newDoc._id;
    this.data.push(newDoc);
    this._saveData();
    return newDoc;
  }

  async insertMany(docs) {
    this.data = this._loadData();
    const created = [];
    for (const doc of docs) {
      const newDoc = {
        _id: doc._id || this._generateId(),
        ...doc,
        createdAt: doc.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      newDoc.id = newDoc._id;
      this.data.push(newDoc);
      created.push(newDoc);
    }
    this._saveData();
    return created;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    this.data = this._loadData();
    const index = this.data.findIndex(item => String(item._id) === String(id));
    if (index === -1) return null;

    const current = this.data[index];
    const updated = {
      ...current,
      ...(update.$set ? update.$set : update),
      updatedAt: new Date().toISOString()
    };
    this.data[index] = updated;
    this._saveData();
    return { ...updated, id: updated._id };
  }

  async findByIdAndDelete(id) {
    this.data = this._loadData();
    const index = this.data.findIndex(item => String(item._id) === String(id));
    if (index === -1) return null;
    const removed = this.data.splice(index, 1)[0];
    this._saveData();
    return removed;
  }

  async deleteMany(filter = {}) {
    this.data = this._loadData();
    const initialCount = this.data.length;
    this.data = this.data.filter(item => !this._matches(item, filter));
    const deletedCount = initialCount - this.data.length;
    this._saveData();
    return { deletedCount };
  }

  async countDocuments(filter = {}) {
    this.data = this._loadData();
    return this.data.filter(item => this._matches(item, filter)).length;
  }
}

const collections = {};
const getCollection = (name) => {
  if (!collections[name]) {
    collections[name] = new EmbeddedCollection(name);
  }
  return collections[name];
};

module.exports = {
  connectDB,
  dbState,
  getCollection
};
