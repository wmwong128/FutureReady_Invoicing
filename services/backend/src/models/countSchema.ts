import mongoose = require('mongoose');
const { Schema } = mongoose;

const counterSchema = new Schema({
  name: { type: String, required: true },
  value: { type: Number, required: true },
});

const Counter = mongoose.model("Counter", counterSchema);

export = Counter;