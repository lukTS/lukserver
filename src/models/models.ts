export interface User {
  id: string;
  email: string;
  password: string;
}

export interface Product {
  id: string;
  name: string;
  longDescription: string;
  isNew: boolean;
  category_id: number;
}

export interface Order {
  id: string;
  productId: string;
  userId: string;
}

export interface Data {
  users: User[];
  products: Product[];
  categories: any[];
  orders: Order[];
}
