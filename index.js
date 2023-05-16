const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const { User } = require("./models/User")

const config = require('./config/key')

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))
// application/json
app.use(bodyParser.json())

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI)
.then(() => console.log('mongoDB connected'))
.catch(err => console.log(err))


app.get('/', (req, res) => res.send('Hello worlds!!!'))

app.post('/register', (req, res) => {
    try {
       const user = new User(req.body)
    user.save()
        .then(() => {
            res.status(200).json({success: true})
        })
        .catch((err) => {
            return res.json({success:false, err})
        })
    } catch (err) {
        console.log(err);
    }
    
})

app.listen(port , () => console.log(`Example app listening on port ${port}!`))