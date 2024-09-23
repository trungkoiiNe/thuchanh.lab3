import * as React from "react";
import { GoogleSignIn } from '../components/GoogleSignIn';

import { createStackNavigator } from "@react-navigation/stack";
import { LoginScreen, SignupScreen, ForgotPasswordScreen } from "../screens";
const Stack = createStackNavigator();
export const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          // You can add GoogleSignIn as a header right button
          headerRight: () => <GoogleSignIn />,
        }}
      />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};
