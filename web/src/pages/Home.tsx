import { Box, Heading, Stack, Text } from "@chakra-ui/react";
import GoogleLoginButton from "../components/GoogleLoginButton";

export const Home = () => {
  return (
    <Box
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Stack spacing={6}>
        <Box>
          <Stack spacing={2}>
            <Heading as="h1" size={"2xl"}>
              Inbox zero has never been easier
            </Heading>
            <Text fontSize="xl">
              Build rules to automatically declutter your inbox
            </Text>
            <Box>
              <GoogleLoginButton />
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};
