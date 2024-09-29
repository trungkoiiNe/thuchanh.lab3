import { createStackNavigator } from "@react-navigation/stack";
import React, { useState } from "react";
import { Alert } from "react-native";
import Transaction from "../screens/Transaction";
import AddNewTransaction from "../screens/AddNewTransaction";
import TransactionDetail from "../screens/TransactionDetail";
import { deleteService } from "../store";
import { useMyContextController } from "../store";
import { IconButton, Menu } from "react-native-paper";
// import AddNewTransaction from "../screens/AddNewTransaction";

const Stack = createStackNavigator();

const RouterTransaction = () => {
  const [controller, dispatch] = useMyContextController();
  const { userLogin } = controller;
  const [visible, setVisible] = useState(false);
  // const dispatch = useDispatch();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Stack.Navigator
      initialRouteName="Transaction"
      screenOptions={{
        title: userLogin != null ? userLogin.name : "",
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: "pink",
        },
      }}
    >
      <Stack.Screen
        name="Transaction"
        component={Transaction}
        options={{
          // headerRight: () => (
          //   <IconButton
          //     icon="plus"
          //     onPress={() => {
          //       /* Add new service action */
          //     }}
          //   />
          // ),
        }}
      />
      {userLogin.role === "admin" ? (
        <Stack.Screen
          name="AddNewTransaction"
          component={AddNewTransaction}
        />
      ) : (
       null
      )}
      <Stack.Screen
        name="TransactionDetail"
        component={TransactionDetail}
        options={{
          // headerRight: () => (
          //   <IconButton
          //     icon="plus"
          //     onPress={() => {
          //       /* Add new service action */
          //     }}
          //   />
          // ),
        }}
      />
    </Stack.Navigator>
  );
};

export default RouterTransaction;
