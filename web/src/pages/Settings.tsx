import {
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Select,
  Stack,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { HiLogout } from "react-icons/hi";
import api from "../api";
import { useAuth } from "../context/AuthContext";
export const Settings = () => {
  const daysToWaitOptions = [1, 2, 3, 4, 5, 6, 7];
  const { currentUser, logout } = useAuth();
  const [settings, setSettings] = useState<any | undefined>(
    currentUser.settings
  );

  useEffect(() => {
    if (!settings) {
      return;
    }
    api
      .put("/me/settings", settings)
      .then((res) => {})
      .catch(() => {});
  }, [settings]);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <Box px={4} mb={12}>
        <Flex h={12} alignItems={"center"} justifyContent={"end"}>
          <Button
            leftIcon={<HiLogout />}
            variant="ghost"
            size="xs"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Flex>
      </Box>
      <Container>
        <Tabs isManual>
          <TabList>
            <Tab>General</Tab>
            <Tab>Settings</Tab>
          </TabList>
          <TabPanels>
            <TabPanel></TabPanel>
            <TabPanel>
              <Stack spacing={6}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="enableArchiving" mb="0">
                    Enable Automatic Archiving
                  </FormLabel>
                  <Switch
                    isChecked={settings.isEnabled}
                    onChange={() => {
                      setSettings({
                        ...settings,
                        isEnabled: !settings.isEnabled,
                      });
                    }}
                    id="enableArchiving"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <Stack>
                    <FormLabel htmlFor="email-alerts" mb="0">
                      Wait until the email has been in my inbox for
                    </FormLabel>
                    <Select
                      placeholder="Select option"
                      value={settings.daysToWait}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          daysToWait: Number.parseInt(e.target.value, 10),
                        });
                      }}
                    >
                      {daysToWaitOptions.map((option) => (
                        <option key={option} value={option}>
                          {option} day{option > 1 ? "s" : ""}
                        </option>
                      ))}
                    </Select>
                  </Stack>
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <Stack>
                    <FormLabel htmlFor="email-alerts" mb="0">
                      Don't archive emails that are
                    </FormLabel>
                    <Checkbox
                      isChecked={settings.skip.respondedTo}
                      onChange={() => {
                        setSettings({
                          ...settings,
                          skip: {
                            ...settings.skip,
                            respondedTo: !settings.skip.respondedTo,
                          },
                        });
                      }}
                    >
                      Responded to
                    </Checkbox>
                    <Checkbox
                      isChecked={settings.skip.starred}
                      onChange={() => {
                        setSettings({
                          ...settings,
                          skip: {
                            ...settings.skip,
                            starred: !settings.skip.starred,
                          },
                        });
                      }}
                    >
                      Starred
                    </Checkbox>
                    <Checkbox
                      isChecked={settings.skip.important}
                      onChange={() => {
                        setSettings({
                          ...settings,
                          skip: {
                            ...settings.skip,
                            important: !settings.skip.important,
                          },
                        });
                      }}
                    >
                      Marked as important
                    </Checkbox>
                  </Stack>
                </FormControl>
              </Stack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </>
  );
};
