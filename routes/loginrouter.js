// loginRouter.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const loginrouter = express.Router();

loginrouter.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send('Email ou senha incorretos');
    }

    const validPassword = await bcrypt.compare(senha, user.senha);
    if (!validPassword) {
      return res.status(400).send('Email ou senha incorretos');
    }

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send({ token });
  } catch (error) {
    res.status(400).send(error);
  }
});

export { loginrouter };
