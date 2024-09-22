import { Request, Response } from 'express';
import { readData } from '../utils/db';
import { Product } from '../models/models';

export const getProducts = (req: Request, res: Response) => {
  const data = readData();
  res.json(data.products);
};

export const getProductById = (req: Request, res: Response) => {
  const data = readData();
  const product = data.products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.status(200).json(product);
};

export const getCategories = (req: Request, res: Response) => {
  const data = readData();
  res.json(data.categories);
};
