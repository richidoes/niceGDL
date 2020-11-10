import React from "react";
import { View, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";
import { useFocusEffect } from "@react-navigation/native";

import { db, auth } from "../../utils/firebase";
import ListPlaces from "../../components/Places/ListPlaces";

export default function Places(props) {
  const { navigation } = props;
  const [user, setUser] = React.useState(null);
  const [places, setPlaces] = React.useState([]);
  const [totalPlaces, setTotalPlaces] = React.useState(0);
  const [startPlaces, setStartPlaces] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const limitPlaces = 7;

  //verify if logged
  React.useEffect(() => {
    auth.onAuthStateChanged((userInfo) => {
      setUser(userInfo);
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      //obtain collection
      db.collection("places")
        .get()
        .then((snap) => {
          setTotalPlaces(snap.size);
        });

      const resultPlaces = [];
      //getting and ordering  the exact data from firebase
      db.collection("places")
        .orderBy("createAt", "desc")
        .limit(limitPlaces)
        .get()
        .then((response) => {
          setStartPlaces(response.docs[response.docs.length - 1]);

          response.forEach((doc) => {
            const place = doc.data();
            place.id = doc.id; // adding id to places
            resultPlaces.push(place);
          });
          setPlaces(resultPlaces); //seting data and ready to use
        });
    }, [])
  );

  //get more places and store it in state
  const handleLoadMore = () => {
    const resultPlaces = [];
    places.length < totalPlaces && setIsLoading(true);

    db.collection("places")
      .orderBy("createAt", "desc")
      .startAfter(startPlaces.data().createAt)
      .limit(limitPlaces)
      .get()
      .then((response) => {
        if (response.docs.length > 0) {
          setStartPlaces(response.docs[response.docs.length - 1]);
        } else {
          setIsLoading(false);
        }

        response.forEach((doc) => {
          const place = doc.data();
          place.id = doc.id;
          resultPlaces.push(place);
        });

        setPlaces([...places, ...resultPlaces]);
      });
  };

  return (
    <View style={styles.viewBody}>
      <ListPlaces
        places={places}
        handleLoadMore={handleLoadMore}
        isLoading={isLoading}
      />
      {user && (
        <Icon
          reverse
          type="material-community"
          name="plus"
          color="#00a680"
          containerStyle={styles.btnContainer}
          onPress={() => navigation.navigate("add-place")}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: "#fff",
  },
  btnContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
  },
});
