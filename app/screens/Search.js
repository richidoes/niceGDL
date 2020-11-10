import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Image } from "react-native";
import { FireSQL } from "firesql";

import { SearchBar, ListItem, Icon } from "react-native-elements";
import { db } from "../utils/firebase";

const fireSQL = new FireSQL(db, { includeId: "id" });

export default function Search(props) {
  const { navigation } = props;
  const [search, setSearch] = useState("");
  const [places, setPlaces] = useState([]);

  //using sql searching in firebase
  useEffect(() => {
    if (search) {
      fireSQL
        .query(`SELECT * FROM places WHERE name LIKE '${search}%'`)
        .then((response) => {
          setPlaces(response);
        });
    }
  }, [search]);

  return (
    <View>
      <SearchBar
        placeholder="Busca un lugar"
        onChangeText={(e) => setSearch(e)}
        containerStyle={styles.searchBar}
        value={search}
      />
      {places.length === 0 ? (
        <NoFundPlaces />
      ) : (
        <FlatList
          data={places}
          renderItem={(place) => (
            <Place place={place} navigation={navigation} />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
}

const NoFundPlaces = () => {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Image
        source={require("../../assets/img/no-result-found.png")}
        resizeMode="cover"
        style={{ width: 200, height: 200 }}
      />
    </View>
  );
};

const Place = (props) => {
  const { place, navigation } = props;
  const { id, name, images } = place.item;
  return (
    <ListItem
      title={name}
      leftAvatar={{
        source: images[0]
          ? { uri: images[0] }
          : require("../../assets/img/no-image.png"),
      }}
      rightIcon={<Icon type="material-community" name="chevron-right" />}
      onPress={() =>
        navigation.navigate("places", {
          screen: "place",
          params: { id: id, name: name },
        })
      }
    />
  );
};

const styles = StyleSheet.create({
  searchBar: {
    marginTop: 5,
    marginBottom: 20,
  },
});
