const Habit = require('../models/habitModel');
const Month = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
//controller for habitspage
module.exports.habitsPage = async (req, res) => {
  try {
    const habits = await Habit.find({});
    return res.render('dashboard',{
      title: 'Habits Dashboard', 
      habits: habits,
    });
    
  } catch (error) {
    console.log('Error while render',error);
    return;
  }

};

//create new habit.
module.exports.create = async (req, res) => {
  try {
    const today = new Date();
    const date = today.getDate();
    const habit = await Habit.create({
      description: req.body.habit,
      creation_date: date,
      days: ['None', 'None', 'None', 'None', 'None', 'None', 'None'],
      completed: 0,
      streak: 0,
    });
    console.log(habit);
    return res.redirect('back');
  } catch (err) {
    console.log('Error while creating Habit', err);
    return res.redirect('back');
  }
};


//action for deleting habit
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const habit = await Habit.findByIdAndDelete(id);
    console.log('Successfully deleted Habit');
    return res.redirect('back');
  } catch (err) {
    console.log('Error in deleting from database', err);
    return res.redirect('back');
  }
};


//checking update status
module.exports.weeklyview = async (req, res) => {
  try {
    //send date array
    const date = new Date();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d =
        date.getDate() + ',' + Month[date.getMonth()] + ' ' + date.getFullYear();
      date.setDate(date.getDate() - 1); //decrease date one by one
      days.push(d);
    }
    //reverse array for desired
    days.reverse();
    const habits = await Habit.find({});
    updateData(habits);
    if(habits.length == 0){
      return res.render('dashboard',{
        title: 'Habits Dashboard', 
        habits: habits,
      });
    }
    return res.render('weeklyview', {
      title: 'Habits Weekly View',
      habits: habits,
      days,
    });
  } catch (err) {
    console.log('Error while fetching data from Atlas DB', err);
    return res.redirect('/');
  }
};


//action for updating status
module.exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const day = req.params.day;
    const status = req.params.status;
    const habit = await Habit.findById(id);
    if (!habit) {
      console.log('Error: Habit not found');
      return res.redirect('back');
    }
    habit.days[day] = status;
    await habit.save();
    updateStreakandCompleted(habit);
    return res.redirect('back');
  } catch (err) {
    console.log('Error while updating habit', err);
    return res.redirect('back');
  }
};


//function to update values
let updateData = (habits) => {
  let todaysDate = new Date().getDate();
  //find if creation date and todays date is diff or not
  //if yes find the diff, and update the data in database
  for (let habit of habits) {
    let id = habit.id;
    let diff = todaysDate - habit.creation_date;

    if (diff > 0 && diff < 8) {
      for (let i = diff, j = 0; i < habit.days.length; i++, j++) {
        habit.days[j] = habit.days[i];
      }
      let remPos = habit.days.length - diff;
      for (let i = remPos; i < habit.days.length; i++) {
        habit.days[i] = 'None';
      }
      habit.creation_date = todaysDate;
      updateStreakandCompleted(habit);
      habit.save();
    } else if (diff > 7) {
      for (let i = 0; i < 7; i++) {
        habit.days[i] = 'None';
        habit.creation_date = todaysDate;
        updateStreakandCompleted(habit);
        habit.save();
      }
    }
  }
};

let updateStreakandCompleted = async (habit) => {
  try {
    let curr_completed = 0;
    let maxStreak = 0; // to save latest value
    let curr_streak = 0;
    for (let i = 0; i < habit.days.length; i++) {
      if (habit.days[i] == 'Done') {
        curr_completed++;
        curr_streak++;
      } else {
        if (curr_streak > maxStreak) {
          maxStreak = curr_streak;
          curr_streak = 0;
        } else {
          streak = 0;
        }
      }
    }

    if (curr_streak > maxStreak) {
      maxStreak = curr_streak;
    }
    await Habit.findByIdAndUpdate(habit.id, {
      streak: maxStreak,
      completed: curr_completed,
    });
    // console.log('updated');
  } catch (error) {
    if (error) {
      console.log(error);
    }
  }
};
