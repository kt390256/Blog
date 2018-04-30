var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");

//bodyParser is important because we need this for the POST request from the form
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());//this has to go after bodyParser
app.use(express.static("public"));//so we can search a custom stylesheet
app.use(methodOverride("_method"));//For put request, whenever you get a request that
                                    //that has a _method as parameter w/e it is, treat
                                    //that requset as a put request or a delete request
//npm install express ejs body-parser mongoose --save

//=============================Database stuffs=================================//

//conntecting to db
mongoose.connect("mongodb://localhost/blog");


//schema
var blogSchema = new mongoose.Schema({
  title: String,
  image: String, //if no image entered, you can do {type: String, default: "something.jpg"}
  body: String,
  created: {type: Date, default: Date.now}

});

//Schema to model
var Blog = mongoose.model("Blog", blogSchema);
//=============================================================================//

// Blog.create({
//
// title: "asd",
// image: "",
// body:"asd"
//
// });

//=========================Routing==============================================//

//============================INDEX Route=====================//
app.get("/", function(req, res){
  res.redirect("/blogs");//redirect must take the url name not the name of the file
})

//INDEX - Retriving all Blogs from db
app.get("/blogs", function(req, res){

Blog.find({}, function(err, allBlog){
  if(err){
    console.log(err);
  }else{
    res.render("index", {blogs: allBlog});
  }
});
});
//=========================================================//


//====================NEW Route===========================//
app.get("/blogs/new", function(req, res){
  res.render("new.ejs");
})
//========================================================//

//=================CREATE Route==========================//
app.post("/blogs", function(req, res){

  //Sanitize malicious use of script tag
  req.body.blog.body =req.sanitize(req.body.blog.body);

  //create blogs
//the body in first argument is the same as name="blog[title]" in new.ejs
  Blog.create(req.body.blog, function(err, newlyCreated){
    if(err)
    {
      console.log(err);
    }
    else{
        //then redirect
      res.redirect("/blogs");
    }
  });
});
//==========================================================//


//============================SHOW Route=============================//
app.get("/blogs/:id", function(req,res){

  //grabbing a specific item from the db and show it
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err){
      res.redirect("/blogs");
      console.log(err);
    }else{
      res.render("show", {blog: foundBlog});
    }
  })
})
//==================================================================//


//============================Edit Rotue==============================//
app.get("/blogs/:id/edit", function(req, res){//use the same webpage as NEW route

  //grab the specific blogs using findById
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err){
      res.redirect("/blogs");
      console.log(err);
    }else{
      res.render("edit",{blog: foundBlog});
    }
  })
})
//===================================================================//

//======================Update Route================================//
//Side note: HTML form doesn't support PUT request
app.put("/blogs/:id", function(req, res){

req.body.blog.body =req.sanitize(req.body.blog.body);

//this function takes 3 arguments(id, newData, callBack)
Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
  if(err){
    res.redirect("/blogs");
  } else{
    res.redirected("/blogs/"+req.params.id);
  }
})
});

//===============================Delete Route===============================//
app.delete("/blogs/:id", function(req,res){
  //destroyblog
  Blog.findByIdAndRemove(req.params.id, function(err){
    if(err){
      res.redirect("/blogs");
    }else{
      res.redirect("/blogs");
    }
  })

})














app.listen(process.env.PORT || 3000, process.env.IP, function () {
  console.log(`Server Started!!`);
});
