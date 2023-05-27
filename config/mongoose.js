const mongoose = require('mongoose');




mongoose.connect('mongodb+srv://shivigupta:12345@cluster0.ndb6esz.mongodb.net/databasehabittracker?retryWrites=true&w=majority');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'DB Error'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

//'mongodb://127.0.0.1:27017/habit_track'
