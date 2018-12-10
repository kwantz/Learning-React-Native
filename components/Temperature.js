import React from 'react';
import {Platform, StyleSheet, Text, View, StatusBar, ToolbarAndroid, FlatList, TouchableOpacity, YellowBox} from 'react-native';
import { createStackNavigator, createAppContainer } from "react-navigation";

class Temperature extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#000000" barStyle="light-content" />
        <ToolbarAndroid title="CRA SILO Logger Avaan"
          titleColor="white"
          style={styles.toolbar} />
        <View>
          <Text>ID BIN: {navigation.getParam('id', 0)}</Text>
        </View>
      </View>
    );
  }
}

const AppNavigator = createStackNavigator({
  Temperature: {
    screen: Temperature
  }
});

export default createAppContainer(AppNavigator);
