const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send({ user });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/login', async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(400).send({ error: 'Invalid login credentials' });
      }
      const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isPasswordMatch) {
        return res.status(400).send({ error: 'Invalid login credentials' });
      }
      const token = await user.generateAuthToken();
      res.send({ user, token });
    } catch (error) {
      res.status(500).send(error);
    }
  });
  

// other routes...

module.exports = router;
