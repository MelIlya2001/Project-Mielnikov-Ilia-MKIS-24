const router = require('express').Router()
const Level = require('../models/Level')

var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');


router.get('/', async (req, res) => {
  const id = req.query.next_level || JSON.parse(localStorage.getItem('id')) || 1;

  let next_level = JSON.parse(localStorage.getItem('id')) || 1;
  next_level++;
  
  const level = await Level.findOne({level_id: id});
  res.render('index', {
    level_id: level.level_id,
    next_level: next_level,
    level_markup: level.markup,
    map_size: level.markup.length
  })
  
})


router.get('/create', (req, res) => {
  res.render('create', {layout: 'layout2.hbs'})
})


router.post('/create', async (req, res) => {
  const level = new Level({
    level_id: req.body.id,
    markup: req.body.markup
    
  })

  await level.save()
  res.redirect('/')
})


module.exports =  router