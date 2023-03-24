import { Button } from "@chakra-ui/react";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function GoogleLoginButton() {
  const { setToken } = useAuth();
  const handleGoogleLogin = useGoogleLogin({
    flow: "auth-code",
    scope: "https://www.googleapis.com/auth/gmail.modify",
    onSuccess: (tokenResponse) => {
      api.post("/oauth/google", tokenResponse).then((res) => {
        setToken(res.data.idToken);
      });
    },
    onError: (errorResponse) => {
      console.error(errorResponse);
    },
  });

  return (
    <Button leftIcon={<FcGoogle />} onClick={() => handleGoogleLogin()}>
      Login with Google
    </Button>
  );
}
