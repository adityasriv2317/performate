import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  username: string;
  password: string; // hashed
  apiKey: string;
  lastLogin?: Date;
  createdAt?: Date;
}
