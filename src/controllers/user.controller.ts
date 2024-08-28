import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { IGetUserAuthInfoRequest } from '../interfaces/custom';

export const getUsers = async (req: IGetUserAuthInfoRequest, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try{

  }catch (err){

  }
}