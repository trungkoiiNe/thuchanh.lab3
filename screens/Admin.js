import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import RouterService from "../routers/RouterService";

import Transaction from "./Transaction";
import Customer from "./Customer";
import Setting from "./Setting";
import UserInfo from "./UserInfo";
import RouterTransaction from "../routers/RouterTransaction";
// import Customers from "./Customers";

const Tab = createMaterialBottomTabNavigator();

const Admin = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="RouterService"
        component={RouterService}
        options={{
          title: "Home",
          tabBarIcon: "home",
        }}
      />
      <Tab.Screen
        name="TransactionSerivce"
        component={RouterTransaction}
        options={{
          title:"Transaction",
          tabBarIcon: "cash",
        }}
      />
      <Tab.Screen
        name="UserInfo"
        component={UserInfo}
        options={{
          tabBarIcon: "account",
        }}
      />
      <Tab.Screen
        name="Setting"
        component={Setting}
        options={{
          tabBarIcon: "cog",
        }}
      />
    </Tab.Navigator>
  );
};

export default Admin;
