import React from 'react';
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/Login";
import Register from "../screens/Register";
// import ForgotPassword from "../screens/ForgotPassword";
import Admin from "../screens/Admin";
import Customer from "../screens/Customer";
import { useMyContextController } from "../store";

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Register" component={Register} />
    {/* <Stack.Screen name="ForgotPassword" component={ForgotPassword} /> */}
  </Stack.Navigator>
);

const Router = () => {
  const [controller] = useMyContextController();
  const { userLogin } = controller;

  if (!userLogin) {
    return <AuthStack />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userLogin.role === 'admin' ? (
        <Stack.Screen name="Admin" component={Admin} />
      ) : userLogin.role === 'customer' ? (
        <Stack.Screen name="Customer" component={Customer} />
      ) : (
        <AuthStack />
      )}
    </Stack.Navigator>
  );
};

export default Router;
