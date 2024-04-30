const { Schema, model } = require('mongoose')

const schema = new Schema({
  //описание базы данных
  level_id: {
    type: Number,
    min: 1,
    max: 100000,
  },

  markup: {
    type: String,
    minLength: 81,
    maxLength: 81,
  }
})


const Level = model('Sudoku_Level', schema)
module.exports = Level