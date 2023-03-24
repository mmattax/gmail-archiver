import { Request, Response, NextFunction } from "express";
import jwtDecode from "jwt-decode";
import { userIdTokenRepo, userRepo } from "../db";
import { User } from "../db/UserRepo";
import logger from "../logger";

const publicRoutes: Record<string, string[]> = {
  "/oauth/google": ["POST"],
};
const supportedIssuers = [
  {
    iss: "https://accounts.google.com",
    aud: process.env.GOOGLE_CLIENT_ID,
  },
];

const auth = async (req: Request, res: Response, next: NextFunction) => {
  const isAuthRequired = !publicRoutes[req.path]?.includes(req.method);
  let currentUser: User | undefined | null;

  const authHeader = req.headers.authorization;
  if (authHeader) {
    // Grab the bearer token
    const tokenParts = authHeader.split(" ");
    const token = tokenParts.length > 1 ? tokenParts[1] : undefined;
    if (token) {
      // Do we have a user with this token?
      const userIdToken = await userIdTokenRepo.findByIdToken(token);
      if (userIdToken) {
        // Validate the token
        const decoded = jwtDecode(userIdToken.idToken) as any;
        const hasValidIssuerAndAudience = supportedIssuers.some(
          (issuer) => issuer.iss === decoded.iss && issuer.aud === decoded.aud
        );
        if (hasValidIssuerAndAudience) {
          // The token is valid, get the user
          currentUser = await userRepo.findById(userIdToken.userId);
        }
      }
    }
  }
  if (isAuthRequired && !currentUser) {
    res.status(401).json({
      error: "Unauthorized",
    });
    return;
  }
  req.currentUser = currentUser ?? undefined;
  next();
};

export default auth;
