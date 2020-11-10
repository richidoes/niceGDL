import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Places from "../screens/Places/Places";
import AddPlace from "../screens/Places/AddPlace";
import Place from "../screens/Places/Place";

const Stack = createStackNavigator();

//screens to navigate into places
export default PlacesStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="places"
        component={Places}
        options={{ title: "Lugares" }}
      />
      <Stack.Screen
        name="add-place"
        component={AddPlace}
        options={{
          title: "Añadir nuevo lugar",
        }}
      />
      <Stack.Screen name="place" component={Place} />
    </Stack.Navigator>
  );
};
