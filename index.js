const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const { User } = require("./models/User");
const { auth } = require('./middleware/auth');
const config = require('./config/key');

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))
// application/json
app.use(bodyParser.json())
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI)
.then(() => console.log('mongoDB connected'))
.catch(err => console.log(err))


app.get('/', (req, res) => res.send('Hello worlds!!!'))

app.post('/api/users/register', (req, res) => {
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

app.post('/api/users/login', (req, res) => {

    // 요청된 이메일이 데이터베이스에 있는지 확인

    User.findOne({ email: req.body.email })
    .then(user=>{
        if(!user){
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }

        // 요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는지 확인
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch) return res.json({loginSuccess: false, message: "비밀번호가 틀렸습니다."})
        
            //비밀번호까지 맞다면 토큰을 생성하기.

            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err); //status(400) = err

                //토큰을 저장한다. 어디에 ? 쿠키, 로컬스토리지, 세션 등.
                // 일단 쿠키에 저장한다, cookie-parser
                res.cookie("x_auth", user.token)
                .status(200)
                .json({loginSuccess: true, userId: user._id})
            })
        })
    })
    .catch((err)=> {
        return res.status(400).send(err);
    })
    

})

app.get('/api/users/auth', auth ,(req, res) => {
    res.status(200).json({
        _id: res.user._id,
        isAdmin: req.user.role === 0 ? false: true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({_id: req.user._id}, 
        {roken: ''},
        (err, user) => {
            if(err) return res.json({success:false, err });
            return res.status(200).send({
                success:true
            })
        })
})


app.listen(port , () => console.log(`Example app listening on port ${port}!`))