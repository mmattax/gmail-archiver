import express from "express";
import { google } from "googleapis";
import jwtDecode from "jwt-decode";

import logger from "../logger";
import { userIdTokenRepo, userRepo } from "../db";
import { DEFAULT_USER_SETTINGS } from "../db/UserRepo";

const router = express.Router();

interface GoogleOauthRequest {
  authuser: string;
  code: string;
  hd: string;
  prompt: string;
  scope: string;
}

interface IdTokenPayload {
  iss: string;
  sub: string;
  given_name: string;
  family_name: string;
  email: string;
  picture: string;
  aud: string;
}

router.post("/google", async (req, res) => {
  const { code } = req.body as GoogleOauthRequest;

  const oauth2Client = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.WEB_URL,
  });

  logger.debug(
    {
      code,
    },
    "Getting Token"
  );
  const tokenResponse = await oauth2Client.getToken(code);
  logger.debug({
    tokenResponse,
  });

  if (tokenResponse.tokens.id_token) {
    const idTokenPayload = jwtDecode<IdTokenPayload>(
      tokenResponse.tokens.id_token
    );
    // Do we have a user with this googleId?
    const googleId = idTokenPayload.sub;
    const googleCredentials = JSON.stringify(tokenResponse.tokens);

    let user = await userRepo.findByGoogleId(googleId);
    if (!user) {
      // If not, create a new user
      user = await userRepo.create({
        googleId,
        googleCredentials,
        email: idTokenPayload.email,
        firstName: idTokenPayload.given_name,
        lastName: idTokenPayload.family_name,
        settings: {
          ...DEFAULT_USER_SETTINGS,
        },
      });
    }
    // Save the idToken which the client will use to authenticate with the API
    await userIdTokenRepo.create({
      userId: user.id,
      idToken: tokenResponse.tokens.id_token,
    });
  }
  res.json({
    idToken: tokenResponse.tokens.id_token,
  });
});

export default router;
