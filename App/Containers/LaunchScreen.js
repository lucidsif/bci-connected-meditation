import React, { Component } from 'react'
import {
  View,
  ScrollView,
  Text,
  Image,
  ListView,
  NativeModules,
  NativeEventEmitter,
  AppState,
  Button,
  TouchableHighlight
} from 'react-native'
import { connect } from 'react-redux'
import { Images } from '../Themes'
import BleManager from 'react-native-ble-manager'
import BluetoothActions from '../Redux/BluetoothRedux'

// Styles
import styles from './Styles/LaunchScreenStyles'

// Data blob driven abstraction over ScrollView to efficiently render long lists
// rowHasChanged checks if the row has changed
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)

export class LaunchScreen extends Component {
  constructor () {
    super()

    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this)
    this.handleStopScan = this.handleStopScan.bind(this)
    this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(this)
    this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this)
    this.handleAppStateChange = this.handleAppStateChange.bind(this)
  }

  componentDidMount () {
    AppState.addEventListener('change', this.handleAppStateChange)

    BleManager.start({showAlert: false})

    this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral)
    this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan)
    this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral)
    this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic)
  }

  handleAppStateChange (nextAppState) {
    // if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
    console.log('in handleappstate', this.props.bluetooth)
    if (this.props.bluetooth.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
      BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
        console.log('Connected peripherals: ' + peripheralsArray.length)
      })
    }
    // dispatch instead of setting local state
    // this.setState({appState: nextAppState})
    this.props.setAppState(nextAppState)
  }

  componentWillUnmount () {
    this.handlerDiscover.remove()
    this.handlerStop.remove()
    this.handlerDisconnect.remove()
    this.handlerUpdate.remove()
  }

  // NOTE: this has not been called yet!!
  handleDisconnectedPeripheral (data) {
    console.log('disconnected!!!**', data)
    // let peripherals = this.state.peripherals
    let peripherals = this.props.bluetooth.peripherals
    let peripheral = peripherals.get(data.peripheral)
    if (peripheral) {
      peripheral.connected = false
      peripherals.set(peripheral.id, peripheral)
      // this.setState({peripherals})
      this.props.setPeripherals(peripherals)
    }
    console.log('Disconnected from ' + data.peripheral)
  }

  handleUpdateValueForCharacteristic (data) {
    console.log('handleupdate ran???')
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value)
  }

  handleStopScan () {
    // dispatch action creator
    // this.setState({ scanning: false })
    this.props.endScan()
  }

  startScan () {
    // get scanning state from props instead of local state
    // if (!this.state.bluetooth.scanning) {
    if (!this.props.bluetooth.scanning) {
      BleManager.scan([], 120, true).then((results) => {
        console.log('Scanning...', results)
        // dispatch action creator to change state of scanning
        // this.setState({scanning: true})
        this.props.startScan()
      })
    }
  }

  handleDiscoverPeripheral (peripheral) {
    // get peripherals state from props instead of local state
    var peripherals = this.props.bluetooth.peripherals
    if (!peripherals.has(peripheral.id)) {
      // console.log('Got ble peripheral', peripheral)
      peripherals.set(peripheral.id, peripheral)
      // dispatch peripherals action creator instead of settin state locally
      // this.setState({ peripherals })
      this.props.setPeripherals(peripherals)
    }
  }

  test (peripheral) {
    console.log('test clicked')
    if (peripheral) {
      if (peripheral.connected) {
        console.log('peripheral disconnected**')
        BleManager.disconnect(peripheral.id)
      } else {
        BleManager.connect(peripheral.id).then(() => {
          console.log('after connect')
          // let peripherals = this.state.peripherals
          let peripherals = this.props.bluetooth.peripherals
          let p = peripherals.get(peripheral.id)
          if (p) {
            p.connected = true
            peripherals.set(peripheral.id, p)
            // this.setState({peripherals})
            this.props.setPeripherals(peripherals)
          }
          console.log('green' + peripheral.id)
          // this.setTimeout(() => {
            // Test using bleno's pizza example
            // https://github.com/sandeepmistry/bleno/tree/master/examples/pizza
          //   BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
          //     console.log(peripheralInfo)
          //     var service = '13333333-3333-3333-3333-333333333337'
          //     var bakeCharacteristic = '13333333-3333-3333-3333-333333330003'
          //     var crustCharacteristic = '13333333-3333-3333-3333-333333330001'
          //
          //     this.setTimeout(() => {
          //       BleManager.startNotification(peripheral.id, service, bakeCharacteristic).then(() => {
          //         console.log('Started notification on ' + peripheral.id)
          //         this.setTimeout(() => {
          //           BleManager.write(peripheral.id, service, crustCharacteristic, [0]).then(() => {
          //             console.log('Writed NORMAL crust')
          //             BleManager.write(peripheral.id, service, bakeCharacteristic, [1, 95]).then(() => {
          //               console.log('Writed 351 temperature, the pizza should be BAKED')
          //             })
          //           })
          //         }, 500)
          //       }).catch((error) => {
          //         console.log('Notification error', error)
          //       })
          //     }, 200)
          //   })
          // }, 900)
        }).catch((error) => {
          console.log('red', error)
        })
      }
    }
  }

  render () {
    const list = Array.from(this.props.bluetooth.peripherals.values())
    const dataSource = ds.cloneWithRows(list)

    return (
      <View style={styles.mainContainer}>
        <TouchableHighlight style={{marginTop: 40, margin: 20, padding: 20, backgroundColor: '#ccc'}} onPress={() => this.startScan()}>
          <Text>Scan Bluetooth ({this.props.bluetooth.scanning ? 'on' : 'off'})</Text>
        </TouchableHighlight>
        <ScrollView style={styles.scroll}>
          {(list.length == 0) &&
          <View style={{flex: 1, margin: 20}}>
            <Text style={{textAlign: 'center'}}>No peripherals</Text>
          </View>
          }
          <ListView
            enableEmptySections
            dataSource={dataSource}
            renderRow={(item) => {
              const color = item.connected ? 'green' : 'white'
              return (
                <TouchableHighlight onPress={() => this.test(item)}>
                  <View style={[styles.row, {backgroundColor: color}]}>
                    <Text style={{fontSize: 12, textAlign: 'center', color: '#333333', padding: 10}}>{item.name}</Text>
                    <Text style={{fontSize: 8, textAlign: 'center', color: '#333333', padding: 10}}>{item.id}</Text>
                  </View>
                </TouchableHighlight>
              )
            }}
          />
        </ScrollView>
      </View>
    )
  }
}

const mapStateToProps = ({bluetooth}) => ({bluetooth})

// wraps dispatch to create nicer functions to call within our component
const mapDispatchToProps = (dispatch) => ({
  startScan: () => dispatch(BluetoothActions.startScan()),
  endScan: () => dispatch(BluetoothActions.endScan()),
  // am i writing these wrong?
  setPeripherals: (peripherals) => dispatch(BluetoothActions.setPeripherals(peripherals)),
  setAppState: (appState) => dispatch(BluetoothActions.setAppState(appState))
})

export default connect(mapStateToProps, mapDispatchToProps)(LaunchScreen)

// <Button
// onPress={() => this.props.navigation.navigate('AffectScreen')}
// title='Go to Affect Screen'
// accessibilityLabel='Learn more about this button'
//   />

// BUG: clicking scan (and setting a new peripherals map), appState is no logner recognized)
