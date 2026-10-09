const mongoose = require('mongoose');
const { dbState, getCollection } = require('../config/db');

function createModel(name, schemaDef) {
  let mongooseModel = null;

  const getMongooseModel = () => {
    if (!mongooseModel && dbState.isMongooseConnected) {
      if (mongoose.models[name]) {
        mongooseModel = mongoose.models[name];
      } else {
        const schema = new mongoose.Schema(
          {
            _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
            ...schemaDef
          },
          { timestamps: true }
        );
        mongooseModel = mongoose.model(name, schema);
      }
    }
    return mongooseModel;
  };

  const getTarget = () => {
    if (dbState.isMongooseConnected) {
      return getMongooseModel();
    }
    return getCollection(name.toLowerCase() + 's');
  };

  return {
    async find(filter = {}) {
      const target = getTarget();
      if (dbState.isMongooseConnected) {
        const docs = await target.find(filter).lean();
        return docs.map(d => ({ ...d, id: d._id ? String(d._id) : d.id }));
      }
      return target.find(filter);
    },
    async findOne(filter = {}) {
      const target = getTarget();
      if (dbState.isMongooseConnected) {
        const doc = await target.findOne(filter).lean();
        return doc ? { ...doc, id: doc._id ? String(doc._id) : doc.id } : null;
      }
      return target.findOne(filter);
    },
    async findById(id) {
      if (!id) return null;
      const target = getTarget();
      if (dbState.isMongooseConnected) {
        const doc = await target.findOne({ _id: String(id) }).lean();
        return doc ? { ...doc, id: doc._id ? String(doc._id) : doc.id } : null;
      }
      return target.findById(id);
    },
    async create(doc) {
      const target = getTarget();
      if (dbState.isMongooseConnected) {
        const created = await target.create(doc);
        const obj = created && created.toObject ? created.toObject() : created;
        return { ...obj, id: obj._id ? String(obj._id) : obj.id };
      }
      return target.create(doc);
    },
    async insertMany(docs) {
      const target = getTarget();
      if (dbState.isMongooseConnected) {
        const created = await target.insertMany(docs);
        return created.map(d => {
          const obj = d && d.toObject ? d.toObject() : d;
          return { ...obj, id: obj._id ? String(obj._id) : obj.id };
        });
      }
      return target.insertMany(docs);
    },
    async findByIdAndUpdate(id, update, options = { new: true }) {
      if (!id) return null;
      const target = getTarget();
      if (dbState.isMongooseConnected) {
        const updated = await target.findOneAndUpdate({ _id: String(id) }, update, { ...options, new: true }).lean();
        return updated ? { ...updated, id: updated._id ? String(updated._id) : updated.id } : null;
      }
      return target.findByIdAndUpdate(id, update, options);
    },
    async findByIdAndDelete(id) {
      if (!id) return null;
      const target = getTarget();
      if (dbState.isMongooseConnected) {
        const deleted = await target.findOneAndDelete({ _id: String(id) }).lean();
        return deleted ? { ...deleted, id: deleted._id ? String(deleted._id) : deleted.id } : null;
      }
      return target.findByIdAndDelete(id);
    },
    async deleteMany(filter = {}) {
      const target = getTarget();
      return target.deleteMany(filter);
    },
    async countDocuments(filter = {}) {
      const target = getTarget();
      return target.countDocuments(filter);
    }
  };
}

module.exports = { createModel };
