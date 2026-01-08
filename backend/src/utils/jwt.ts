import jwt from 'jsonwebtoken';

export const genToken: (fid: string) => string | null = (id: string) => {
  try {
    const payload = { fid: id };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string);
    return token;
  } catch (e: any) {
    console.log(e.message || 'token generation failed');
    return null;
  }
};

export const verToken: (tokenVal: string) => { fid: string } | null = (
  tokenVal: string
) => {
  try {
    const token = tokenVal.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return decoded as { fid: string };
  } catch (e: any) {
    console.log(e.message || 'token verification failed');
    return null;
  }
};
