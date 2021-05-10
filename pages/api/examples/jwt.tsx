// This is an example of how to read a JSON Web Token from an API route
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from 'next-auth/jwt';

const secret = process.env.SECRET!

export default async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(secret)
  const token = await jwt.getToken({ req, secret, raw: true })
  res.send(JSON.stringify(token, null, 2))
}
