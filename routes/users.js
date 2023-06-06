const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { check, validationResult } = require('express-validator');

module.exports = function(db) {

  router.post('/signup', [
    // email must be valid and password must be at least 5 chars long
    check('email').isEmail(),
    check('password').isLength({ min: 5 })
  ], async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 8);

      const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

      db.run("INSERT INTO users (email, password, verificationToken) VALUES (?, ?, ?)", [email, hashedPassword, verificationToken], function(err) {
        if (err) {
          // handle error...
        }

        // send verification email
        const transporter = nodemailer.createTransport({
          service: 'outlook',
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_USERNAME,
          to: email,
          subject: 'Please confirm your email',
          text: `Please confirm your email by clicking on the following link: \nhttp:\/\/localhost:3001\/users\/verify\/${verificationToken}\n\n`
        };

        transporter.sendMail(mailOptions, function(err, response) {
          if (err) {
            console.error('there was an error: ', err);
          } else {
            console.log('here is the res: ', response);
            res.status(200).json('recovery email sent');
          }
        });
      });
    } catch (error) {
      // handle error...
    }
  });

  router.get('/verify/:token', (req, res) => {
    const { token } = req.params;

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const { email } = payload;

      db.run("UPDATE users SET emailVerified = true WHERE email = ?", [email], function(err) {
        if (err) {
          // handle error...
        }
        res.redirect('http://localhost:3000/verified');
      });
    } catch (error) {
      // handle error...
    }
  });

  return router;
}
