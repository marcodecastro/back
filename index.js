import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import nodemon from 'nodemon';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {body, validationResult} from 'express-validator';
import User from './models/User.js';

dotenv.config();

const app = express();

app.use(cors());

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());


// Conectar ao banco de dados
mongoose.connect('mongodb://localhost:27017/User', {
}).then(() => {
    console.log('Conexão com o MongoDB estabelecida com sucesso');
  }).catch((error) => {
    console.error('Erro ao conectar ao MongoDB:', error.message);
    process.exit(1); // Encerra o processo em caso de erro na conexão
  });

// Criar rota para login
app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: 'Usuário não encontrado.' });
    }

    if (req.body.senha && user.password) {
      const isPasswordValid = await bcrypt.compare(req.body.senha, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Senha inválida.' });
      }
    } else {
      return res.status(400).json({ message: 'Senha não fornecida ou usuário não tem senha.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login bem-sucedido!', token: token });
  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
  }
});


// Rota de cadastro
app.post('/cadastro', async (req, res) => {
  try {
    // Verifica se o email já está em uso
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).send('Email já cadastrado');
    }

    // Criptografando a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Criando um novo usuário
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    // Salvando o usuário no banco de dados
    const savedUser = await user.save();
    res.send(savedUser);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.listen(5000, () => {
    console.log('Servidor rodando na porta 5000');
});

    
    