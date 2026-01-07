const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { v4 : uuidv4 } =  require( 'uuid');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));


// Create the connection to database
const connection =  mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'gama_app',
  password : '982277'
});
 let  getuser = () => {
    return [
      faker.string.uuid(),
     faker.internet.username(),
     faker.internet.email(),
     faker.internet.password(),
    ]
 } 

 app.get("/",(req,res) =>{
  let q = `SELECT count(*) FROM user`;
  try{
    connection.query(q, (err,result) =>{
       if(err) throw err;
      //  console.log(result[0]);
     let count = result[0] ["count(*)"];
    res.render("home.ejs",{ count });
    // res.send(result[0]);
    });
  }catch(err){
    console.log("err");
    res.send("something error is occured");
  }
 });
const insertUsers = () => {
  let q = "INSERT INTO `user` (id, username, email, password) VALUES ?";
  let data = [];

  for (let i = 0; i < 100; i++) {
    data.push(getuser());
  }

  connection.query(q, [data], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log("100 users inserted");
    }
  });
};
  //to show the all users in the page 
 app.get("/user",(req,res)=>{
  let  q = `SELECT * FROM user`;
  try{
    connection.query(q,(err,users) =>{
      res.render("user.ejs",{users});
      // console.log(result);
      // res.send(result);
    })
  }catch(err){
    console.log("comething error is occured ");
    res.send(err);
  }
 });
 //to patch the request to make the update
 app.patch("/user/:id",(req,res) =>{

    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id = '${id}'`;
    let {username :newusername, password: formpass }  = req.body;

    try{
    connection.query(q, (err,result) =>{
       if(err) throw err;
       let user = result;
       if(formpass != user.password){
        res.send("wrong password uploaded");
       }else{
        let q2 = `UPDATE user SET username = '${newusername}'  WHERE id = '${id}'`;
          connection.query(q2,(err,result) =>{
            if(err) throw err;
            res.redirect("/user");
          });
        }
    });
  }catch(err){
    console.log("err");
    res.send("something error is occured");
  }
 });
 //to senad post request tothe new user
 app.get("/user/new",(req,res) =>{
  res.render("newuser.ejs");
 });

 //to add the new user to the page 
 app.post("/user/new",(req,res) =>{
  let {username, email,password } = req.params;
  let id = uuidv4();
    let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}', '${username}' ,'${email}' , '${password}')`;

  try{
    connection.query(q, (err,result) =>{
      if(err) throw err;
      res.redirect("/user");
       console.log(result);
    });
  }catch(err){
    console.log(err);
    res.send("something err is occured");
  }
 });
//to edit the user and to require the form
  app.get("/user/:id/edit", (req,res) =>{
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id = '${id}'`
    try{
    connection.query(q, (err,result) =>{
       if(err) throw err;
       let user = result[0];
      res.render("edit.ejs",{user});
    // res.send(result[0]);
    });
  }catch(err){
    console.log("err");
    res.send("something error is occured");
  }
 });

 //to delete the perticular user
 app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    console.log('Delete route hit', { id, method: req.method, body: req.body });
    connection.query(q, (err, result) => {
      if (err) {
        console.error('DB error selecting user for delete:', err);
        throw err;
      }
      console.log('DB select result for delete:', result);
      if (!result || result.length === 0) {
        res.status(404).send('User not found');
        return;
      }
      let user = result[0];
      console.log('Comparing passwords', { stored: user.password, provided: password });

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
        connection.query(q2, (err, result) => {
          if (err) {
            console.error('DB error deleting user:', err);
            throw err;
          } else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});
 app.listen("8080",(req,res) =>{
  console.log("app is listning on the port ");
 });

 

