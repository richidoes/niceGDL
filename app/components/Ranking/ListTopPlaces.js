import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Card, Image, Icon, Rating } from "react-native-elements";

export default function ListTopPlaces(props) {
  const { places, navigation } = props;

  return (
    <FlatList
      data={places}
      renderItem={(place) => <Place place={place} navigation={navigation} />}
      keyExtractor={(item, index) => index.toString()}
    />
  );
}

const Place = (props) => {
  const { place, navigation } = props;
  const { name, rating, images, description, id } = place.item;
  const [iconColor, setIconColor] = useState("#000");

  //set ranking colors to state
  useEffect(() => {
    if (place.index === 0) {
      setIconColor("#efb819");
    } else if (place.index === 1) {
      setIconColor("#e3e4e5");
    } else if (place.index === 2) {
      setIconColor("#cd7f32");
    }
  }, []);

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("places", {
          screen: "place",
          params: { id: id, name: name },
        })
      }
    >
      <Card containerStyle={styles.containerCard}>
        <Icon
          type="material-community"
          name="chess-queen"
          color={iconColor}
          size={40}
          containerStyle={styles.containerIcon}
        />
        <Image
          style={styles.placeImage}
          resizeMode="cover"
          source={
            images[0]
              ? { uri: images[0] }
              : require("../../../assets/img/no-image.png")
          }
        />
        <Rating
          imageSize={20}
          startingValue={rating}
          readonly
          style={styles.rating}
        />
        <View style={styles.titleInfo}>
          <Text style={styles.title}>{name}</Text>
        </View>
        <Text style={styles.description}>{description}</Text>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  containerCard: {
    marginBottom: 30,
    borderWidth: 0,
    borderRadius: 15,
  },
  containerIcon: {
    position: "absolute",
    top: -30,
    left: -30,
    zIndex: 1,
  },
  placeImage: {
    width: "100%",
    height: 200,
  },
  rating: {
    left: 110,
    marginTop: 10,
    backgroundColor: "transparent",
  },
  titleInfo: {
    flexDirection: "row",
    marginTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  description: {
    color: "gray",
    marginTop: 0,
    textAlign: "justify",
  },
});
