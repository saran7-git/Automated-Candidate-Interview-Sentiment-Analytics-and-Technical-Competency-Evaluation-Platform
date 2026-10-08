const mongoose = require('mongoose');
const { dbState, getCollection } = require('../config/db');

function createModel(name, schemaDef) {
  let mongooseModel = null;

  const getMongooseModel = () => {
    if (!mongooseModel && dbState.isMongooseConnected) {
      if (mongoose.models[name]) {
        mongooseModel = mongoose.models[name];
      } else {
        const schema = new mongoose.Schema(schemaDef, { timestamps: true });
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
      return target.find(filter);
    },
    async findOne(filter = {}) {
      const target = getTarget();
      return target.findOne(filter);
    },
    async findById(id) {
      const target = getTarget();
      return target.findById(id);
    },
    async create(doc) {
      const target = getTarget();
      return target.create(doc);
    },
    async insertMany(docs) {
      const target = getTarget();
      return target.insertMany(docs);
    },
    async findByIdAndUpdate(id, update, options = { new: true }) {
      const target = getTarget();
      return target.findByIdAndUpdate(id, update, options);
    },
    async findByIdAndDelete(id) {
      const target = getTarget();
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
