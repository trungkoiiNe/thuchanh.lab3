import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Dialog, Portal, TextInput } from "react-native-paper";
import { logout, useMyContextController } from "../store";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

const Setting = ({ navigation }) => {
  const [controller, dispatch] = useMyContextController();
  const { userLogin } = controller;
  const [userInfo, setUserInfo] = useState(null);
  const [visible, setVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  useEffect(() => {
    if (userLogin == null) {
      navigation.navigate("Login");
    } else {
      fetchUserInfo();
    }
  }, [userLogin]);

  const fetchUserInfo = async () => {
    const userDoc = await firestore()
      .collection("UserLab3")
      .doc(userLogin.uid)
      .get();
    if (userDoc.exists) {
      setUserInfo(userDoc.data());
    }
  };

  const handleLogout = () => {
    logout(dispatch);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      alert("New passwords don't match");
      return;
    }

    try {
      const user = auth().currentUser;
      const credential = auth.EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(newPassword);
      alert("Password updated successfully");
      setVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      alert("Error updating password: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      {userInfo && (
        <View>
          <Text style={styles.infoText}>Full Name: {userInfo.fullName}</Text>
          <Text style={styles.infoText}>Address: {userInfo.address}</Text>
          <Text style={styles.infoText}>Phone: {userInfo.phone}</Text>
          <Text style={styles.infoText}>Role: {userInfo.role}</Text>
        </View>
      )}
      <Button
        mode="contained"
        onPress={() => setVisible(true)}
        style={styles.button}
      >
        Change Password
      </Button>
      <Button mode="contained" onPress={handleLogout} style={styles.button}>
        Logout
      </Button>

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Change Password</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={showCurrentPassword ? "eye-off" : "eye"}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                />
              }
            />
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={showNewPassword ? "eye-off" : "eye"}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                />
              }
            />
            <TextInput
              label="Confirm New Password"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry={!showConfirmNewPassword}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={showConfirmNewPassword ? "eye-off" : "eye"}
                  onPress={() =>
                    setShowConfirmNewPassword(!showConfirmNewPassword)
                  }
                />
              }
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Cancel</Button>
            <Button onPress={handleChangePassword}>Change Password</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
});

export default Setting;
