import { Request, Response } from 'express';
import { readData, writeData } from '../utils/db';
import { User } from '../models/models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'your-secret-key';

export const registerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const data = readData();
  
  const existingUser = data.users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: User = {
    id: Date.now().toString(),
    email,
    password: hashedPassword
  };
  data.users.push(newUser);
  writeData(data);

  const token = jwt.sign({ id: newUser.id, email: newUser.email }, SECRET_KEY, { expiresIn: '1h' });
  res.status(201).json({ user: newUser, token });
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const data = readData();
  
  const user = data.users.find(user => user.email === email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
  res.status(200).json({ user, token });
};

export const getAllUsers = (req: Request, res: Response) => {
  const data = readData();
  res.status(200).json(data.users);
};
