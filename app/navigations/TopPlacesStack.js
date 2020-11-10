import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import TopPlaces from "../screens/TopPlaces";

const Stack = createStackNavigator();

const TopPlacesStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="top-places"
        component={TopPlaces}
        options={{ title: "Los mejores lugares" }}
      />
    </Stack.Navigator>
  );
};

export default TopPlacesStack;
