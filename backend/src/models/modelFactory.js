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
        return target.find(filter).lean();
      }
      return target.find(filter);
    },
    async findOne(filter = {}) {
      const target = getTarget();
      if (dbState.isMongooseConnected) {
        return target.findOne(filter).lean();
      }
      return target.findOne(filter);
    },
    async findById(id) {
      const target = getTarget();
      if (dbState.isMongooseConnected) {
        return target.findOne({ _id: String(id) }).lean();
      }
      return target.findById(id);
    },
    async create(doc) {
      const target = getTarget();
      if (dbState.isMongooseConnected) {
        const created = await target.create(doc);
        return created && created.toObject ? created.toObject() : created;
      }
      return target.create(doc);
    },
    async insertMany(docs) {
      const target = getTarget();
      if (dbState.isMongooseConnected) {
        const created = await target.insertMany(docs);
        return created.map(d => d && d.toObject ? d.toObject() : d);
      }
      return target.insertMany(docs);
    },
    async findByIdAndUpdate(id, update, options = { new: true }) {
      const target = getTarget();
      if (dbState.isMongooseConnected) {
        return target.findOneAndUpdate({ _id: String(id) }, update, { ...options, new: true }).lean();
      }
      return target.findByIdAndUpdate(id, update, options);
    },
    async findByIdAndDelete(id) {
      const target = getTarget();
      if (dbState.isMongooseConnected) {
        return target.findOneAndDelete({ _id: String(id) }).lean();
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
