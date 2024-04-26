import express from 'express';
import User from '../models/User.js';

const cadastrorouter = express.Router();

cadastrorouter.post('/cadastro', async (req, res) => {
    try {
        // Verifica se o email já está em uso
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).send('Email já cadastrado');
        }
// Criptografando a senha
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(req.body.password, salt);

// Criando um novo usuario
const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
});

// Salvando o usuario no banco de dados
const savedUser = await user.save();
res.send(savedUser);
} catch (error) {
res.status(400).send(error);
}
});

  
export { cadastrorouter };  


