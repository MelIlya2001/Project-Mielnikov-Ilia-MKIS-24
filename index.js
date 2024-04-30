const express = require('express')
const mongoose = require('mongoose')

const exphbs = require('express-handlebars')
const levelsRouter = require('./routes/levels')



const PORT = process.env.PORT || 3000

const app = express()  
const hbs = exphbs.create({
  dafultLayout: 'main',
  extname: 'hbs',
  helpers: {
    print_map: function(){
      let result = ""
      for (let i = 0; i < 81; i++){
        result += `<div class="cell"></div>`
      }
      return result
    }
  }
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.urlencoded())
app.use(express.static("public"))
app.use(levelsRouter)

app.use(function(req,res){
    res.status(404).sendfile("./404.html")
});


async function start(){
  try{
    
   await mongoose.connect(
     'mongodb+srv://admin:admin@cluster0.bxue41o.mongodb.net/Sudoku_level').catch(error => handleError(error));

    app.listen(PORT, () => {
      console.log(`App is listening on ${PORT}`)
    })

    
  } catch (e) {
    console.log(e)
  }
}


start()

