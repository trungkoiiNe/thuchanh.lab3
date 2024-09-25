import { Text, View } from "react-native";
import { Button } from "react-native-paper";
import { logout, useMyContextController } from "../store";
import { useEffect } from "react";

const Setting = ({ navigation }) => {
  const [controller, dispatch] = useMyContextController();
  const { userLogin } = controller;

  const handleLogout = () => {
    logout(dispatch);
  };

  useEffect(() => {
    if (userLogin == null) {
      navigation.navigate("Login");
    }
  }, [userLogin]);

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <Button mode="contained" onPress={handleLogout}>
        Logout
      </Button>
    </View>
  );
};

export default Setting;
