import React, { useEffect, useState } from "react";
import "./App.css";
import { ChakraProvider, Container, Flex, Spinner } from "@chakra-ui/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { io } from "socket.io-client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";
import api from "./api";
import { AuthProvider, useAuth } from "./context/AuthContext";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("REACT_APP_GOOGLE_CLIENT_ID is not defined");
  }

  /*
  useEffect(() => {
    const socket = io("http://localhost:5001", {
      path: "/io",
    });
    socket.on("countUpdate", (data) => {
      console.log(data);
    });
    return () => {
      socket.disconnect();
    };
  }, []);
  */

  const Loading = () => {
    return (
      <Container>
        <Flex
          justifyContent={"center"}
          alignItems="center"
          style={{ height: "100vh" }}
        >
          <Spinner size={"xl"} />
        </Flex>
      </Container>
    );
  };

  const Root = () => {
    const { loading, currentUser } = useAuth();
    if (loading) {
      return <Loading />;
    } else if (currentUser) {
      return <Settings />;
    } else {
      return <Home />;
    }
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
    },
  ]);

  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <ChakraProvider>
          <RouterProvider router={router}></RouterProvider>
        </ChakraProvider>
      </GoogleOAuthProvider>
    </AuthProvider>
  );
}

export default App;
