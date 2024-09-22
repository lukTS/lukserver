import { Request, Response } from 'express';
import { readData, writeData } from '../utils/db';
import { authenticateToken } from '../middlewares/auth';
import { Order } from '../models/models';

export const createOrder = (req: Request, res: Response) => {
  const data = readData();
  const newOrder: Order = {
    id: Date.now().toString(),
    productId: req.body.productId,
    userId: req.body.userId
  };
  data.orders.push(newOrder);
  writeData(data);
  res.status(201).json(newOrder);
};
