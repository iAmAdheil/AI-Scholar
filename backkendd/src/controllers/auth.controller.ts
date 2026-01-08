import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import { genToken } from "../utils/jwt";

export async function Register(req: Request, res: Response, next: NextFunction) {
  try {
    const { fid } = req.body;
    const user = await User.findOne({ fid: fid });
    if (!user) {
      try {
        const nUser = new User({ fid: fid });
        const cUser = await nUser.save();
        if (!cUser) {
          throw new Error('user creation failed');
        }
      } catch (e: any) {
        res.status(500).json({
          msg: e.message || 'user creation failed',
        });
        return;
      }
    }

    const token = genToken(fid);
    if (!token) {
      throw new Error('Token generation failed');
    }
    res.status(200).json({
      msg: 'user identified successfully',
      token,
    });
  } catch (e: any) {
    console.log(e.message || 'something went wrong');
    res.status(500).json({
      msg: e.message || 'something went wrong',
    });
  }
}