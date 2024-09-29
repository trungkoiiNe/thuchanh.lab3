import { MyContextControllerProvider } from "./store";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import Router from "./routers/Router";
import { Provider as PaperProvider } from "react-native-paper";

const App = () => {
  const USERS = firestore().collection("UserLab3");
  const admin = {
    fullName: "Admin",
    email: "admin@gmail.com",
    password: "123456",
    phone: "0913131732",
    address: "Binh Duong",
    role: "admin",
  };

  useEffect(() => {
    //Dk tai khoan admin
    USERS.doc(admin.email.toLowerCase()).onSnapshot((u) => {
      if (!u.exists) {
        auth()
          .createUserWithEmailAndPassword(admin.email, admin.password)
          .then((response) => {
            USERS.doc(admin.email).set(admin);
            console.log("Add new account admin");
          });
      }
    });
  });
  return (
    <PaperProvider>
      <MyContextControllerProvider>
        <NavigationContainer>
          <Router />
        </NavigationContainer>
      </MyContextControllerProvider>
    </PaperProvider>
  );
};

export default App;
