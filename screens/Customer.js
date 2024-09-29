import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import Services from "./Services";

// import Transaction from "./Transaction";
// import Customer from "./Customer";
import Setting from "./Setting";
import RouterTransaction from "../routers/RouterTransaction";
import Router from "../routers/Router";
import UserInfo from "./UserInfo";
// import Customers from "./Customers";

const Tab = createMaterialBottomTabNavigator();

const Customer = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="RouterService"
        component={Services}
        options={{
          title: "Services",
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
        title:"User Info",
        tabBarIcon: "account",
      }}/>
      {/* <Tab.Screen
        name="Customers"
        component={Customer}
        options={{
          tabBarIcon: "account",
        }}
      /> */}
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

export default Customer;
