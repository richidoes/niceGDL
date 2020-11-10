import React, { useState, useEffect, useRef } from "react";
import { View } from "react-native";
import Toast from "react-native-easy-toast";

import { db } from "../utils/firebase";
import ListTopPlaces from "../components/Ranking/ListTopPlaces";

export default function TopPlaces(props) {
  const { navigation } = props;
  const [places, setPlaces] = useState([]);
  const toastRef = useRef();

  useEffect(() => {
    db.collection("places")
      .orderBy("rating", "desc")
      .limit(5)
      .get()
      .then((response) => {
        const placesArray = [];
        response.forEach((doc) => {
          const data = doc.data();
          data.id = doc.id;
          placesArray.push(data);
        });
        setPlaces(placesArray);
      });
  }, []);

  return (
    <View style={{ backgroundColor: "rgba(21, 255, 0, 0.02)" }}>
      <ListTopPlaces places={places} navigation={navigation} />
      <Toast ref={toastRef} position="center" opacity={0.9} />
    </View>
  );
}
