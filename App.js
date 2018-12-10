import {createStackNavigator, createAppContainer} from 'react-navigation';
import React from 'react';
import {Platform, StyleSheet, Text, View, Button, StatusBar, ToolbarAndroid, FlatList, TouchableOpacity, YellowBox} from 'react-native';

class Home extends React.Component {
  static navigationOptions = {
    title: 'CRA SILO Logger',
    headerTitleStyle: {
      color: '#FFFFFF'
    },
    headerStyle: {
      backgroundColor: "#212121"
    },
    headerTintColor: 'white'
  };

  constructor (props) {
    super(props)
    this.state = {
      datetime: '',
      index: 0,
      sites: [],
      bins: []
    }

    this.getSiteAPI = (self) => {
      fetch('http://103.252.101.72:8004/site')
        .then((response) => response.json())
        .then((responseJson) => {
          let sites = []
          for (let i = 0, l = responseJson.results.length; i < l; i++) {
            sites.push({
              key: responseJson.results[i].id,
              title: responseJson.results[i].name,
              desc: responseJson.results[i].description
            })
          }
          self.setState({ sites })
          self.getBinAPI(self, responseJson.results[0].id)
        })
    }

    this.getBinAPI = (self, site) => {
      fetch(`http://103.252.101.72:8004/site/${site}/bin`)
        .then((response) => response.json())
        .then((responseJson) => {
          self.setState({ bins: responseJson.results })
          self.getTemperatureAPI(self, responseJson.results[0].id)
        })
    }

    this.getTemperatureAPI = (self, bin) => {
      fetch(`http://103.252.101.72:8004/bin/${bin}/temperature`)
        .then((response) => response.json())
        .then((responseJson) => {
          let mini, maxi, total, count, datetime;
          for (let i = 0, l = responseJson.results.length; i < l; i++) {
            datetime = responseJson.results[i]['requested_at']
            for (let j = 0; j < 11; j++) {
              const temp = responseJson.results[i][`temp_${j}`];
              if (temp === 0) { continue; }
              if (i === 0) {
                mini = maxi = total = temp;
                count = 1;
              }
              else {
                if (temp < mini) mini = temp
                if (temp > maxi) maxi = temp
                total += temp
                count++
              }
            }
          }

          let bins = self.state.bins
          for (let i = 0, l = bins.length; i < l; i++) {
            bins[i]['min'] = mini / 100;
            bins[i]['max'] = maxi / 100;
            bins[i]['avg'] = (total / 100) / count;
            bins[i]['datetime'] = datetime;
          }
          self.setState({ bins })
        })
    }
  }

  componentWillMount() {
    this.getSiteAPI(this);
  }

  render() {
    let bins = [];
    const {navigate} = this.props.navigation;

    const convertTime = (datetime) => {
      const objDate = new Date(datetime)
      const year = objDate.getFullYear()
      const month = (objDate.getMonth() + 1 < 10) ? '0' + (objDate.getMonth() + 1) : objDate.getMonth() + 1
      const date = (objDate.getDate() < 10) ? '0' + objDate.getDate() : objDate.getDate()
      const hour = (objDate.getHours() < 10) ? '0' + objDate.getHours() : objDate.getHours()
      const minute = (objDate.getMinutes() < 10) ? '0' + objDate.getMinutes() : objDate.getMinutes()
      const second = (objDate.getSeconds() < 10) ? '0' + objDate.getSeconds() : objDate.getSeconds()

      return `${date}/${month}/${year} ${hour}:${minute}:${second}`
    }

    for (let i = 0, l = this.state.bins.length; i < l; i++) {
      bins.push(
        <View style={{backgroundColor: 'white', padding: 10, margin: 5, borderRadius:15}} key={i}>
          <Text>{this.state.bins[i].name} - {this.state.bins[i].description}</Text>
          <Text>Temperature ({convertTime(this.state.bins[i].datetime)})</Text>
          <Text>Min: {this.state.bins[i].min}°C</Text>
          <Text>Max: {this.state.bins[i].max}°C</Text>
          <Text>Avg: {this.state.bins[i].avg}°C</Text>
          <View style={{marginTop: 10}}>
            <Button
              title="See Temperature"
              onPress={() => navigate('Temperature', {id: this.state.bins[i].id})}
            />
          </View>
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#000000" barStyle="light-content" />
        <View>
          <FlatList style={styles.tabmenu}
            horizontal={true}
            data={this.state.sites}
            extraData={this.state}
            keyExtractor={(item) => item.toString()}
            renderItem={({item, index}) => (
              <TouchableOpacity style={this.state.index === index && styles.bg} onPress={() => {
                this.setState({ index: index })
              }}>
                <Text style={styles.text}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
        <View style={{ margin: 5 }}>
          { bins }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#303030',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  toolbar: {
    height: 56,
    backgroundColor: "#212121",
  },
  scene: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 20,
    flex: 1
  },
  tabmenu: {
    backgroundColor: "#212121",
    elevation: 4,
  },
  text: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    color: '#FFFFFF',
    backgroundColor: "#212121"
  },
  bg: {
    backgroundColor: '#008D4C',
    paddingBottom: 5
  },
  bga: {
    backgroundColor: '#212121',
    paddingBottom: 5
  }
});

class Temperature extends React.Component {
  static navigationOptions = {
    title: 'CRA SILO Logger',
    headerTitleStyle: {
      color: '#FFFFFF'
    },
    headerStyle: {
      backgroundColor: "#212121"
    },
    headerTintColor: 'white'
  };

  constructor (props) {
    super(props)
    this.state = {
      temperature: [],
      index: 0
    }

    this.getTemperatureAPI = (self, bin) => {
      fetch(`http://103.252.101.72:8004/bin/${bin}/temperature`)
        .then((response) => response.json())
        .then((responseJson) => {
          let temperature = [];

          for (let i = 0, l = responseJson.results.length; i < l; i++) {
            let temp = [];
            for (let j = 0; j < 11; j++) {
              temp.push(responseJson.results[i][`temp_${j}`]);
            }
            temperature.push({
              key: 'A' + responseJson.results[i]['line'],
              datetime: responseJson.results[i]['requested_at'],
              temp: temp
            });
          }

          self.setState({ temperature });
        })
    }
  }

  componentWillMount() {
    this.getTemperatureAPI(this, this.props.navigation.getParam('id', 0));
  }

  render () {
    const { navigation } = this.props;
    let temperatureView = [];

    if (typeof this.state.temperature[this.state.index] !== 'undefined') {
      for (let i = 0; i < 11; i++) {
        temperatureView.push(
          <View key={i} style={{justifyContent: 'center', alignItems: 'center'}}>
            <Text>|</Text>
            <Text>{this.state.temperature[this.state.index]['temp'][i] / 100}°C</Text>
          </View>
        )
      }
    }

    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#000000" barStyle="light-content" />
        <View>
          <FlatList style={styles.tabmenu}
            horizontal={true}
            data={this.state.temperature}
            extraData={this.state}
            keyExtractor={(item) => item.toString()}
            renderItem={({item, index}) => (
              <TouchableOpacity style={this.state.index === index && styles.bg} onPress={() => {
                this.setState({ index: index })
              }}>
                <Text style={styles.text}>{item.key}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', marginLeft: 100, marginRight: 100, padding: 10}}>
          { temperatureView }
        </View>
      </View>
    );
  }
}

const AppNavigator = createStackNavigator({
  Home: {screen: Home},
  Temperature: {screen: Temperature},
});

export default Project = createAppContainer(AppNavigator);
