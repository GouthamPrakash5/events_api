var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


const db = require('./database/db');
const Event=require('./models/Model');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




app.post('/events', (req, res) => {
  const { title, description, date } = req.body;

  // Validate required fields
  if (!title || !description || !date) {
    return res.status(400).json({ message: 'Name, description, and date are required' });
  }

  const eventDate = new Date(date);

  // Check if date is valid and in the future
  if (isNaN(eventDate.getTime())) {
    return res.status(400).json({ message: 'Invalid date format' });
  }

  if (eventDate <= new Date()) {
    return res.status(400).json({ message: 'Event date must be in the future' });
  }

  const event = new Event({ title, description, date: eventDate });

  event.save()
    .then(() => {
      res.status(201).json({ message: 'Event created successfully' });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    });
});


app.get('/events',(req,res)=>{
  
  Event.find()
      .then(data => {
          const serializedData = data.map(event => ({
              id: event._id,
              title: event.title,
              description: event.description,
              date: event.date,
          }));
          res.status(200).json({ data: serializedData });
      })
      .catch(error => {
          console.error(error);
          res.status(500).json({ message: 'Internal Server Error' });
      });
});


app.get('/events/:id', (req, res) => {
  const id = req.params.id; 

  Event.findById(id)
    .then(data => {
      if (!data) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.status(200).json({ data: data });
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    });
});

// for updating products


app.put('/events/:id', (req, res) => {
  const Id = req.params.id;
  const { title, description, date } = req.body;


  const event = new Event({ title, description, date });
  
   // Validate required fields
  if (!title || !description || !date) {
    return res.status(400).json({ message: 'Name, description, and date are required' });
  }

  const eventDate = new Date(date);

  // Check if date is valid and in the future
  if (isNaN(eventDate.getTime())) {
    return res.status(400).json({ message: 'Invalid date format' });
  }

  if (eventDate <= new Date()) {
    return res.status(400).json({ message: 'Event date must be in the future' });
  }



  // Update the product in the database
  Event.findByIdAndUpdate(Id, { title, description, date })
      .then(() => {
          res.status(200).json({ message: 'Event updated successfully' });
      })
      .catch(error => {
          console.error(error);
          res.status(500).json({ message: 'Internal Server Error' });
      });
});


//for deleting product


app.delete('/events/:id', (req, res) => {
  const Id = req.params.id;


  Event.findByIdAndDelete(Id)
      .then(() => {
          res.status(200).json({ message: 'Event deleted successfully' });
      })
      .catch(error => {
          console.error(error);
          res.status(500).json({ message: 'Internal Server Error' });
      });
});




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});







module.exports = app;
