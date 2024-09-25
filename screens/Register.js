import { Alert, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { useState } from "react";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

const Register = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [hiddenPassword, setHiddenPassword] = useState(true);
  const [hiddenPasswordConfirm, setHiddenPasswordConfirm] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const hasErrorFullName = () => fullName;
  const hasErrorEmail = () => email.includes("");
  const hasErrorPassword = () => password.length < 6;
  const hasErrorPasswordConfirm = () => passwordConfirm !== password;
  const USERS = firestore().collection("UserLab3");
  const handleCreateAccount = () => {
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        USERS.doc(email)
          .set({
            fullName,
            email,
            password,
            phone,
            address,
            role: "customer",
          })
          .then(() => navigation.navigate("Login"))
          .catch(() => Alert.alert("Tai khoan ton tai"));
      });
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Text
        style={{
          color: "pink",
          marginTop: 50,
          marginBottom: 50,
        }}
      >
        {" "}
        Register New Account{" "}
      </Text>

      <TextInput
        label={"Full Name"}
        value={fullName}
        onChangeText={setFullName}
      />
      <HelperText type="error" visible={hasErrorFullName()}>
        Full name không được phép để trống
      </HelperText>

      <TextInput label={"Email"} value={email} onChangeText={setEmail} />
      <HelperText type="error" visible={hasErrorEmail()}>
        Địa chỉ email không hợp lệ
      </HelperText>

      <TextInput
        label={"Password"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={hiddenPassword}
        right={
          <TextInput.Icon
            icon={"eye"}
            onPress={() => setHiddenPassword(!hiddenPassword)}
          />
        }
      />
      <HelperText type="error" visible={hasErrorPassword()}>
        Password ít nhất 6 ký tự
      </HelperText>
      <TextInput
        label={"Confirm Password"}
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        secureTextEntry={hiddenPasswordConfirm}
        right={
          <TextInput.Icon
            icon={"eye"}
            onPress={() => setHiddenPasswordConfirm(!hiddenPasswordConfirm)}
          />
        }
      />
      <HelperText type="error" visible={hasErrorPasswordConfirm()}>
        Confirm Password phai so khop vi password
      </HelperText>

      <TextInput
        label={"Address"}
        value={address}
        onChangeText={setAddress}
        style={{ marginBottom: 20 }}
      />
      <TextInput
        label={"Phone"}
        value={phone}
        onChangeText={setPhone}
        style={{ marginBottom: 20 }}
      />
      <Button mode="contained" onPress={handleCreateAccount}>
        Create New Account
      </Button>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Do you have an account?</Text>
        <Button onPress={() => navigation.navigate("Login")}>
          Login Account
        </Button>
      </View>
    </View>
  );
};
export default Register;
