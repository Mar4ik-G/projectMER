import User from '../models/user.model';

export const getAllUsers = async () => {
  return User.find();
};
