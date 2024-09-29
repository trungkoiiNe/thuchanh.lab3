import { View } from "react-native";

import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { login, useMyContextController } from "../store";
// import auth from "@react-native-firebase/auth";
import Loading from "../components/Loading";

import { useEffect, useState } from "react";

const Login = ({ navigation }) => {
  const [controller, dispatch] = useMyContextController();
  const { userLogin } = controller;
  const [email, setEmail] = useState("");
  // setEmail("admin@gmail.com");
  const [password, setPassword] = useState("");
  // setPassword("123456");
  const [hiddenPassword, setHiddenPassword] = useState(false);
  const hasErrorEmail = () => !email.includes("@");
  const hasErrorPassword = () => password.length < 6;
  const [isLoading, setIsLoading] = useState(false);
  const handleLogin = () => {
    login(dispatch, email, password);
    setIsLoading(true);
  };

  useEffect(() => {
    console.log(userLogin);
    if (userLogin !== null) {
      if (userLogin.role === "admin") {
        navigation.navigate("Admin");
      } else {
        navigation.navigate("");
      }
    }
  });
  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Text
        style={{
          fontSize: 30,
          fontWeight: "bold",
          alignSelf: "center",
          color: "pink",
          marginTop: 100,
          marginBottom: 50,
        }}
      >
        Login
      </Text>
      <TextInput label={"Email"} value={email} onChangeText={setEmail} />
      <HelperText type="error" visible={hasErrorEmail()}>
        Địa chỉ Email không hợp lệ
      </HelperText>
      <TextInput
        label={"Password"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={hiddenPassword}
        right={
          <TextInput.Icon
            icon="eye"
            onPress={() => setHiddenPassword(!hiddenPassword)}
          />
        }
      />
      <HelperText type="error" visible={hasErrorPassword()}>
        Password ít nhất 6 kí tự
      </HelperText>
      <Button mode="contained" color="blue" onPress={handleLogin}>
        Login
      </Button>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text>Don't have an account?</Text>
        <Button onPress={() => navigation.navigate("Register")}>
          create new account.
        </Button>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Button onPress={() => navigation.navigate("ForgotPassword")}>
          Forgot Password
        </Button>
      </View>
      {isLoading ? <Loading /> : null}
    </View>
  );
};

export default Login;
