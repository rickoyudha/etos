import React from 'react';
import { StatusBar, StyleSheet, Text, View, Button, AsyncStorage, TouchableOpacity, Image, Picker , NetInfo } from 'react-native';
import { Container, Header, Content, H1, H2, H3 } from 'native-base';
import { StackNavigator, NavigationActions } from 'react-navigation';
import {Select, Option} from "react-native-chooser";
import axios from 'axios';
import KeepAwake from 'react-native-keep-awake'; 
import Modal from 'react-native-simple-modal';

const key = '@MyApp:key'; 
class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Toilet Rating System'
  };
  constructor(props) {
    super(props);
    this.state = {airport : "Select Airport", disabled:true}
  }

  componentWillMount(){
    KeepAwake.activate();
    NetInfo.isConnected.fetch().then(isConnected => {
      console.log('First, is ' + (isConnected ? 'online' : 'offline'));
    });
  }
  
    render() {
    const { navigate } = this.props.navigation;
    const airport = this.state.airport;
    return (
      <View>
        <Text>Please Select your Airport</Text>
        <Picker
          selectedValue={this.state.airport}
          onValueChange={(itemValue, itemIndex) => this.setState({airport: itemValue, disabled:false})}>
          <Picker.Item label="Select Airport" value="" />
          <Picker.Item label="BANDARA PATTIMURA" value="AMQ" />
          <Picker.Item label="BANDARA SYAMSUDIN NOOR" value="BDJ" />
          <Picker.Item label="BANDARA FRANS KAISIEPO" value="BIK" />
          <Picker.Item label="BANDARA SULTAN AJI MUHAMMAD SEPINGGAN" value="BPN" />
          <Picker.Item label="BANDARA I GUSTI NGURAH RAI" value="DPS" />
          <Picker.Item label="BANDARA ADISUTJIPTO" value="JOG" />
          <Picker.Item label="BANDARA EL TARI" value="KOE" />
          <Picker.Item label="BANDARA INTERNASIONAL LOMBOK" value="LOP" />
          <Picker.Item label="BANDARA SAM RATULANGI" value="MDC" />
          <Picker.Item label="BANDARA ADI SOEMARMO" value="SOC" />
          <Picker.Item label="BANDARA AHMAD YANI" value="SRG" />
          <Picker.Item label="BANDARA JUANDA" value="SUB" />
          <Picker.Item label="BANDARA SULTAN HASANUDDIN" value="UPG" />
          </Picker>
        <Button
          onPress={() => navigate('SelectToilet',{ airport: airport })}
          title="Select Airport"
          disabled = {this.state.disabled}
        />
        
      </View>
    );
  }
}

class SelectToilet extends React.Component {

  static navigationOptions = ({ navigation }) => ({
    title: `Please select the toilet in ${navigation.state.params.airport}`,
  });
  constructor(props) {
    super(props);
    this.onPress = this.onPress.bind(this);
    this.state = {value : "Select Toilet", disabled:true};
    this.state={ toilet: []};
    const airport = this.props.navigation.state.params.airport;
  }

  componentDidMount(){
    const airport = this.props.navigation.state.params.airport;
    axios.get('http://toilet.angkasapura-airports.com/service_toilet/index.php/lokasi', {
    params: {
        id_cab:airport
      }
    })
    .then(response => this.setState({toilet: response.data}))
    .catch(function (error) {
      console.log(error);
    });

  }

   onPress(value){
        const { navigate }  = this.props.navigation;
        const toilet        = this.props.navigation.state.params.toilet;
        const airport        = this.props.navigation.state.params.airport;
        const resetAction   = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({ routeName: 'RateScreen', params: {toilet:value, airport:airport}})
          ]
        })
        this.props.navigation.dispatch(resetAction)
    }

  render() {
    const { navigate } = this.props.navigation;
    const { params } = this.props.navigation.state;
    const selectedToilet = this.state.value;
    const airport = params.value;
    var options =this.state.toilet;
    var toilet = this.state.value;
    return (
      <View>
        <Text>Please select toilet in {params.value}</Text>
        <Picker
          selectedValue={this.state.value}
          onValueChange={(itemValue, itemIndex) => this.setState({value: itemValue, disabled2:false})}>
          <Picker.Item label="Select Toilet" value="" />
           {options.map((options) => {
             return (<Picker.Item label={options.ruangan} value={options.kode} key={options.kode}/>) 
            })}
        </Picker>
        <Button
          onPress={() => this.onPress(toilet)}
          title="Select Toilet"
          disabled = {this.state.disabled}
        />
      
      </View>
    );
  }
}



class RateScreen extends React.Component {
  pendingSync : undefined;

static navigationOptions = ({ navigation }) => ({
    header:null
  });

    constructor(props) {
      super(props);

      const toilet = this.props.navigation.state.params.toilet;
      const airport = this.props.navigation.state.params.airport;
      var today = new Date(),
      date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

      var jam = new Date(),
      jam = today.getHours();
      if(jam>=0 && jam<11){
        var greet = "Good Morning";
        var salam = "Selamat Pagi";
      }
      else if(jam>=11 && jam<15){
        var greet = "Good Afternoon";
        var salam = "Selamat Siang";
      }
      else if(jam>=15 && jam<18){
        var greet = "Good Afternoon";
        var salam = "Selamat Sore";
      }                                  
      else if(jam>=18 && jam<23){
        var greet = "Good Evening"
        var salam = "Selamat Malam"
      }
      this.state = {
          visible: false,
          greet: greet,
          salam: salam,
          tanggal: '',
          jam: '',
          kode_pilihan: '',
          reason_id: '',
          kode_lokasi:'',
          modalVisible: false
        };
        AsyncStorage.getItem(key, (error, result) => {
            if (result) {
                let resultParsed = JSON.parse(result)
                this.setState({
                  tanggal: resultParsed.tanggal,
                  jam: resultParsed.jam,
                  kode_lokasi: resultParsed.kode_lokasi,
                  kode_pilihan: resultParsed.kode_pilihan,
                  reason_id: resultParsed.reason_id
                });
            }
        });
    }

  /*onConnectedChange(isConnected){ 
      var pendingSync = this.pendingSync; 
      this.setState({isConnected}); 
      if(pendingSync) { 
                       this.setState({syncStatus : 'Syncing'});  
                       this.submitData(pendingSync).then(()  =>  { 
                       this.setState({syncStatus : 'Sync Complete'});  
                      }); 
                    } 
  } */
  componentDidMount(){
     var today = new Date(),
     var jam1 = today.getHours();

      if(jam1>=0 && jam1<11){
        var greet = "Good Morning";
        var salam = "Selamat Pagi";
      }
      else if(jam1>=11 && jam1<15){
        var greet = "Good Afternoon";
        var salam = "Selamat Siang";
      }
      else if(jam1>=15 && jam1<18){
        var greet = "Good Afternoon";
        var salam = "Selamat Sore";
      }                                  
      else if(jam1>=18 && jam1<23){
        var greet = "Good Evening"
        var salam = "Selamat Malam"
      }

      this.setState({greet: greet, salam:salam});
    setTimeout(() => {this.saveNoReason()}, 10000)
  }

  componentWillMount(){
    KeepAwake.activate();
    NetInfo.isConnected.fetch().then(isConnected => {
      console.log('First, is ' + (isConnected ? 'online' : 'offline'));
    });
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  saveExcellent(props) {

    const toilet = this.props.navigation.state.params.toilet;
    var today = new Date(),
    date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    time = today.getHours() + ':' + today.getMinutes() + ':' + (today.getSeconds());
    let tanggal = date;
    let jam = time;
    let kode_pilihan = 'VS';
    var jam1 = today.getHours();

      if(jam1>=0 && jam1<11){
        var greet = "Good Morning";
        var salam = "Selamat Pagi";
      }
      else if(jam1>=11 && jam1<15){
        var greet = "Good Afternoon";
        var salam = "Selamat Siang";
      }
      else if(jam1>=15 && jam1<18){
        var greet = "Good Afternoon";
        var salam = "Selamat Sore";
      }                                  
      else if(jam1>=18 && jam1<23){
        var greet = "Good Evening"
        var salam = "Selamat Malam"
      }

      this.setState({greet: greet, salam:salam});
    
    let data = {
          tanggal: tanggal,
          jam: jam,
          kode_lokasi: toilet,
          kode_pilihan: kode_pilihan,
          reason_id: '6'
      };
      AsyncStorage.setItem(key, JSON.stringify(data));
      this.setState({
              tanggal: tanggal,
              jam: jam,
              kode_lokasi: toilet,
              kode_pilihan: 'VS',
              reason_id: '6'
              

      });
      axios({
        method: 'post',
        url: 'http://toilet.angkasapura-airports.com/service_toilet/index.php/transaksi',
        data: {
              tanggal: tanggal,
              jam: jam,
              kode_lokasi: toilet,
              kode_pilihan: 'VS',
              reason_id: '6'
        }
      });
      
      this.setModalVisible(true)
      setTimeout(() => {this.setState({modalVisible: false})}, 1500)

      //this.refs.toast.show('THANK YOU FOR YOUR FEEDBACK!\n\nPILIHAN: EXCELLENT');
    }

    saveVeryGood(props) {
      const toilet = this.props.navigation.state.params.toilet;
      var today = new Date(),
      date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      time = today.getHours() + ':' + today.getMinutes() + ':' + (today.getSeconds());
      let tanggal = date;
      let jam = time;
      var jam1 = today.getHours();

      if(jam1>=0 && jam1<11){
        var greet = "Good Morning";
        var salam = "Selamat Pagi";
      }
      else if(jam1>=11 && jam1<15){
        var greet = "Good Afternoon";
        var salam = "Selamat Siang";
      }
      else if(jam1>=15 && jam1<18){
        var greet = "Good Afternoon";
        var salam = "Selamat Sore";
      }                                  
      else if(jam1>=18 && jam1<23){
        var greet = "Good Evening"
        var salam = "Selamat Malam"
      }

      this.setState({greet: greet, salam:salam});
      this.setState({
              tanggal: tanggal,
              jam: time,
              kode_lokasi: toilet,
              kode_pilihan: 'S',
              reason_id: '6'
      });
       let data = {
          tanggal: tanggal,
          jam: jam,
          kode_lokasi: toilet,
          kode_pilihan: 'S',
          reason_id: '6'
      };
      AsyncStorage.setItem(key, JSON.stringify(data));
      axios({
        method: 'post',
        url: 'http://toilet.angkasapura-airports.com/service_toilet/index.php/transaksi',
        data: {
              tanggal: tanggal,
              jam: jam,
              kode_lokasi: toilet,
              kode_pilihan: 'S',
              reason_id: '6'
        }
      });
       this.setModalVisible(true)
      setTimeout(() => {this.setState({modalVisible: false})}, 1500)

    }

    saveGood(props) {
      const toilet = this.props.navigation.state.params.toilet;
      var today = new Date(),
      date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      time = today.getHours() + ':' + today.getMinutes() + ':' + (today.getSeconds());
      let tanggal = date;
      let jam = time;
      var jam1 = today.getHours();

      if(jam1>=0 && jam1<11){
        var greet = "Good Morning";
        var salam = "Selamat Pagi";
      }
      else if(jam1>=11 && jam1<15){
        var greet = "Good Afternoon";
        var salam = "Selamat Siang";
      }
      else if(jam1>=15 && jam1<18){
        var greet = "Good Afternoon";
        var salam = "Selamat Sore";
      }                                  
      else if(jam1>=18 && jam1<23){
        var greet = "Good Evening"
        var salam = "Selamat Malam"
      }

      this.setState({greet: greet, salam:salam});
      this.setState({
              tanggal: tanggal,
              jam: time,
              kode_lokasi: toilet,
              kode_pilihan: 'N',
              reason_id: '6'
      });
       let data = {
          tanggal: tanggal,
          jam: time,
          kode_lokasi: toilet,
          kode_pilihan: 'N',
          reason_id: '6'
      };
      AsyncStorage.setItem(key, JSON.stringify(data));
      axios({
        method: 'post',
        url: 'http://toilet.angkasapura-airports.com/service_toilet/index.php/transaksi',
        data: {
              tanggal: tanggal,
              jam: jam,
              kode_lokasi: toilet,
              kode_pilihan: 'N',
              reason_id: '6'
        }
      });
       this.setModalVisible(true)
      setTimeout(() => {this.setState({modalVisible: false})}, 1500)
    }

    handleBad(props){
        const { navigate }  = this.props.navigation;
        const toilet        = this.props.navigation.state.params.toilet;
        const airport        = this.props.navigation.state.params.airport;
        const resetAction   = NavigationActions.reset({
          index: 1,
          actions: [
          NavigationActions.navigate({ routeName: 'SelectToilet', params: {airport:airport}}),
            NavigationActions.navigate({ routeName: 'ReasonScreen', params: {pilihan:'U', toilet:toilet, airport:airport}})
          ]
        })
        this.props.navigation.dispatch(resetAction)
    }

    handleVeryBad(props){
        const { navigate }  = this.props.navigation;
        const toilet        = this.props.navigation.state.params.toilet;
        const airport        = this.props.navigation.state.params.airport;
        const resetAction   = NavigationActions.reset({
          index: 1,
          actions: [
            NavigationActions.navigate({ routeName: 'SelectToilet', params: {airport:airport}}),
            NavigationActions.navigate({ routeName: 'ReasonScreen', params: {pilihan:'VU', toilet:toilet, airport:airport}})
          ]
        })
        this.props.navigation.dispatch(resetAction)
    }

  
  render(){
    const { navigate } = this.props.navigation;
    const toilet = this.props.navigation.state.params.toilet;
   return (
      
      <Image source={require('./assets/blue.jpeg')} style = {styles.bigContainer}>
      <StatusBar hidden={true}/>
        <View style = {styles.logowrapper}><Image  source={require('./assets/logo2.png')} style = {styles.logo}/>
          <View style ={styles.titleWrapper}>
          <Text style = {styles.Title}>{"\n"}{this.state.salam}!</Text> 
          <Text style = {styles.Title2}>{this.state.greet}!</Text>
          <Text style = {styles.Title}>Mohon Nilai Toilet Kami</Text>
          <Text style = {styles.Title2}>Please Rate Our Toilet</Text>
            <View style = {styles.container}>
                <TouchableOpacity 
                onPress={this.saveExcellent.bind(this)}
                style = {styles.buttonWrapper}>
                <Image source={require('./assets/excellent.png')} style = {styles.smiley} />
                <H1 style = {styles.text}> Excellent </H1>
                </TouchableOpacity>
                <TouchableOpacity 
                onPress={this.saveVeryGood.bind(this)}
                style = {styles.buttonWrapper}>
                <Image source={require('./assets/very_good.png')} style = {styles.smiley} />
                <H1 style = {styles.text}> Very Good </H1>
                </TouchableOpacity>
                <TouchableOpacity 
                onPress={this.saveGood.bind(this)}
                style = {styles.buttonWrapper}>
                <Image source={require('./assets/average.png')} style = {styles.smiley} />
                <H1 style = {styles.text}> Good </H1>
                </TouchableOpacity>
                <TouchableOpacity 
                onPress={this.handleBad.bind(this)}
                style = {styles.buttonWrapper}>
                <Image source={require('./assets/bad.png')} style = {styles.smiley} />
                <H1 style = {styles.text}> Bad </H1>
               </TouchableOpacity>
                <TouchableOpacity 
                onPress={this.handleVeryBad.bind(this)}
                style = {styles.buttonWrapper}>
                <Image source={require('./assets/very_bad.png')} style = {styles.smiley} />
                <H1 style = {styles.text}> Very Bad </H1>
                </TouchableOpacity>
            </View>
          </View>
        </View>
        
        
        <Modal
        offset={this.state.offset}
        open={this.state.modalVisible}
        modalDidOpen={() => console.log('modal did open')}
        modalDidClose={() => this.setState({modalVisible: false})}
        modalStyle={{alignItems: 'center', backgroundColor: 'rgb(21, 151, 235)'}}
        >
          <View style={{alignItems: 'center' }}>
          <Image  source={require('./assets/logo2.png')} style = {styles.logo}/>
          <Text>{'\n'}</Text>
            <Text style={{fontSize: 50, marginBottom: 10, fontFamily: 'norwester', color: 'white'}}>Terima Kasih atas Penilaian anda</Text>
             <Text style={{fontSize: 40, marginBottom: 10, fontFamily: 'norwester', color: 'white'}}>Thank You for your Feedback</Text>
          </View>
        </Modal>
      </Image>
     
    
    )
  }
}

  class ReasonScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    header:null
  });

  constructor(props) {
    super(props);
    const pilihan = this.props.navigation.state.params.pilihan;
    const toilet = this.props.navigation.state.params.toilet;
    var today = new Date(),
    date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        
    this.state = {
        visible: false,
        tanggal: '',
        jam: '',
        kode_pilihan: '',
        kode_lokasi:'',
        reason_id: '',
        modalVisible:false
      };
    }
    componentWillMount(){
    KeepAwake.activate();
    NetInfo.isConnected.fetch().then(isConnected => {
      console.log('First, is ' + (isConnected ? 'online' : 'offline'));
    });
  }

    componentDidMount(){
      setTimeout(() => {this.saveNoReason()}, 10000)
    }

    setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

    saveNoReason(props){
      const { navigate } = this.props.navigation;
      const pilihan = this.props.navigation.state.params.pilihan;
      const toilet = this.props.navigation.state.params.toilet;
      var today = new Date(),
      date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      time = today.getHours() + ':' + today.getMinutes() + ':' + (today.getSeconds());
      let tanggal = date;
      let jam = time;
      var jam1 = today.getHours();

      if(jam1>=0 && jam1<11){
        var greet = "Good Morning";
        var salam = "Selamat Pagi";
      }
      else if(jam1>=11 && jam1<15){
        var greet = "Good Afternoon";
        var salam = "Selamat Siang";
      }
      else if(jam1>=15 && jam1<18){
        var greet = "Good Afternoon";
        var salam = "Selamat Sore";
      }                                  
      else if(jam1>=18 && jam1<23){
        var greet = "Good Evening"
        var salam = "Selamat Malam"
      }

      this.setState({greet: greet, salam:salam});
      this.setState({
              tanggal: tanggal,
              jam: jam,
              kode_lokasi:toilet,
              kode_pilihan: pilihan,
              reason_id: '6'
      });
      let data = {
              tanggal: tanggal,
              jam: jam,
              kode_lokasi:toilet,
              kode_pilihan: pilihan,
              reason_id: '6'
      };
      AsyncStorage.setItem('transaksi', JSON.stringify(data));

      axios({
        method: 'post',
        url: 'http://toilet.angkasapura-airports.com/service_toilet/index.php/transaksi',
        data: {
              tanggal: tanggal,
              jam: jam,
              kode_lokasi:toilet,
              kode_pilihan: pilihan,
              reason_id: '6'
        }
      });
      this.setModalVisible(true)
      setTimeout(() => {this.setState({modalVisible: false})}, 1500)
      setTimeout(() => {this.handleReason()}, 1000)
    }
    saveReason1(props) {
      const { navigate } = this.props.navigation;
      const pilihan = this.props.navigation.state.params.pilihan;
      const toilet = this.props.navigation.state.params.toilet;
      var today = new Date(),
      date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      time = today.getHours() + ':' + today.getMinutes() + ':' + (today.getSeconds());
      let tanggal = date;
      let jam = time;
      var jam1 = today.getHours();

      if(jam1>=0 && jam1<11){
        var greet = "Good Morning";
        var salam = "Selamat Pagi";
      }
      else if(jam1>=11 && jam1<15){
        var greet = "Good Afternoon";
        var salam = "Selamat Siang";
      }
      else if(jam1>=15 && jam1<18){
        var greet = "Good Afternoon";
        var salam = "Selamat Sore";
      }                                  
      else if(jam1>=18 && jam1<23){
        var greet = "Good Evening"
        var salam = "Selamat Malam"
      }

      this.setState({greet: greet, salam:salam});
      this.setState({
              tanggal: tanggal,
              jam: jam,
              kode_lokasi:toilet,
              kode_pilihan: pilihan,
              reason_id: '1'
      });
      let data = {
         tanggal: tanggal,
              jam: jam,
              kode_lokasi:toilet,
              kode_pilihan: pilihan,
              reason_id: '1'
      };
      AsyncStorage.setItem('transaksi', JSON.stringify(data));

      axios({
        method: 'post',
        url: 'http://toilet.angkasapura-airports.com/service_toilet/index.php/transaksi',
        data: {
              tanggal: tanggal,
              jam: jam,
              kode_lokasi:toilet,
              kode_pilihan: pilihan,
              reason_id: '1'
        }
      });
      this.setModalVisible(true)
      setTimeout(() => {this.setState({modalVisible: false})}, 1500)
      setTimeout(() => {this.handleReason()}, 1000)
      
    }

    saveReason2(props) {
      const { navigate } = this.props.navigation;
      const pilihan = this.props.navigation.state.params.pilihan;
      const toilet = this.props.navigation.state.params.toilet;
      var today = new Date(),
      date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      time = today.getHours() + ':' + today.getMinutes() + ':' + (today.getSeconds());
      let tanggal = date;
      let jam = time;
      var jam1 = today.getHours();

      if(jam1>=0 && jam1<11){
        var greet = "Good Morning";
        var salam = "Selamat Pagi";
      }
      else if(jam1>=11 && jam1<15){
        var greet = "Good Afternoon";
        var salam = "Selamat Siang";
      }
      else if(jam1>=15 && jam1<18){
        var greet = "Good Afternoon";
        var salam = "Selamat Sore";
      }                                  
      else if(jam1>=18 && jam1<23){
        var greet = "Good Evening"
        var salam = "Selamat Malam"
      }

      this.setState({greet: greet, salam:salam});
      this.setState({
              tanggal: tanggal,
              jam: time,
              kode_lokasi:toilet,
              kode_pilihan: pilihan,
              reason_id: '2'
      });
       let data = {
          tanggal: tanggal,
          jam: jam,
          kode_lokasi:toilet,
          kode_pilihan: pilihan,
          reason_id: '2'
      };
      AsyncStorage.setItem('transaksi', JSON.stringify(data));
      axios({
        method: 'post',
        url: 'http://toilet.angkasapura-airports.com/service_toilet/index.php/transaksi',
        data: {
              tanggal: tanggal,
              jam: jam,
              kode_lokasi:toilet,
              kode_pilihan: pilihan,
              reason_id: '2'
        }
      });
      this.setModalVisible(true)
      setTimeout(() => {this.setState({modalVisible: false})}, 1500)
      setTimeout(() => {this.handleReason()}, 1000)
    }

    saveReason3(props) {
      const { navigate } = this.props.navigation;
      const pilihan = this.props.navigation.state.params.pilihan;
      const toilet = this.props.navigation.state.params.toilet;
      var today = new Date(),
      date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      time = today.getHours() + ':' + today.getMinutes() + ':' + (today.getSeconds());
      let tanggal = date;
      let jam = time;
      var jam1 = today.getHours();

      if(jam1>=0 && jam1<11){
        var greet = "Good Morning";
        var salam = "Selamat Pagi";
      }
      else if(jam1>=11 && jam1<15){
        var greet = "Good Afternoon";
        var salam = "Selamat Siang";
      }
      else if(jam1>=15 && jam1<18){
        var greet = "Good Afternoon";
        var salam = "Selamat Sore";
      }                                  
      else if(jam1>=18 && jam1<23){
        var greet = "Good Evening"
        var salam = "Selamat Malam"
      }

      this.setState({greet: greet, salam:salam});
      this.setState({
              tanggal: tanggal,
              jam: time,
              kode_lokasi:toilet,
              kode_pilihan: pilihan,
              reason_id: '3'
      });
       let data = {
          tanggal: tanggal,
          jam: time,
          kode_lokasi:toilet,
          kode_pilihan: pilihan,
          reason_id: '3'
      };
      AsyncStorage.setItem('transaksi', JSON.stringify(data));

      axios({
        method: 'post',
        url: 'http://toilet.angkasapura-airports.com/service_toilet/index.php/transaksi',
        data: {
              tanggal: tanggal,
              jam: jam,
              kode_lokasi:toilet,
              kode_pilihan: pilihan,
              reason_id: '3'
        }
      });
      this.setModalVisible(true)
      setTimeout(() => {this.setState({modalVisible: false})}, 1500)
      setTimeout(() => {this.handleReason()}, 1000)
    }

    saveReason4(props) {
      const { navigate } = this.props.navigation;
      const pilihan = this.props.navigation.state.params.pilihan;
      const toilet = this.props.navigation.state.params.toilet;
       var today = new Date(),
      date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      time = today.getHours() + ':' + today.getMinutes() + ':' + (today.getSeconds());
      let tanggal = date;
      let jam = time;
      var jam1 = today.getHours();

      if(jam1>=0 && jam1<11){
        var greet = "Good Morning";
        var salam = "Selamat Pagi";
      }
      else if(jam1>=11 && jam1<15){
        var greet = "Good Afternoon";
        var salam = "Selamat Siang";
      }
      else if(jam1>=15 && jam1<18){
        var greet = "Good Afternoon";
        var salam = "Selamat Sore";
      }                                  
      else if(jam1>=18 && jam1<23){
        var greet = "Good Evening"
        var salam = "Selamat Malam"
      }

      this.setState({greet: greet, salam:salam});
      this.setState({
          tanggal: tanggal,
          jam: time,
          kode_lokasi:toilet,
          kode_pilihan: pilihan,
          reason_id: '4'
      });
       let data = {
          tanggal: tanggal,
          jam: time,
          kode_lokasi:toilet,
          kode_pilihan: pilihan,
          reason_id: '4'
      };

      AsyncStorage.setItem('transaksi', JSON.stringify(data));
      axios({
        method: 'post',
        url: 'http://toilet.angkasapura-airports.com/service_toilet/index.php/transaksi',
        data: {
              tanggal: tanggal,
              jam: jam,
              kode_lokasi:toilet,
              kode_pilihan: pilihan,
              reason_id: '4'
        }
      });
      this.setModalVisible(true)
      setTimeout(() => {this.setState({modalVisible: false})}, 1500)
      setTimeout(() => {this.handleReason()}, 1000)
    }

    saveReason5(props) {
      const { navigate } = this.props.navigation;
      const pilihan = this.props.navigation.state.params.pilihan;
      const toilet = this.props.navigation.state.params.toilet;
      var today = new Date(),
      date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      time = today.getHours() + ':' + today.getMinutes() + ':' + (today.getSeconds());
      let tanggal = date;
      let jam = time;
      var jam1 = today.getHours();

      if(jam1>=0 && jam1<11){
        var greet = "Good Morning";
        var salam = "Selamat Pagi";
      }
      else if(jam1>=11 && jam1<15){
        var greet = "Good Afternoon";
        var salam = "Selamat Siang";
      }
      else if(jam1>=15 && jam1<18){
        var greet = "Good Afternoon";
        var salam = "Selamat Sore";
      }                                  
      else if(jam1>=18 && jam1<23){
        var greet = "Good Evening"
        var salam = "Selamat Malam"
      }

      this.setState({greet: greet, salam:salam});
      this.setState({
          tanggal: tanggal,
          jam: time,
          kode_lokasi:toilet,
          kode_pilihan: pilihan,
          reason_id: '5'
      });
       let data = {
          tanggal: tanggal,
          jam: time,
          kode_lokasi:toilet,
          kode_pilihan: pilihan,
          reason_id: '5'
      };
      AsyncStorage.setItem('transaksi', JSON.stringify(data));
      axios({
        method: 'post',
        url: 'http://toilet.angkasapura-airports.com/service_toilet/index.php/transaksi',
        data: {
              tanggal: tanggal,
              jam: jam,
              kode_lokasi:toilet,
              kode_pilihan: pilihan,
              reason_id: '5'
        }
      });
      this.setModalVisible(true)
      setTimeout(() => {this.setState({modalVisible: false})}, 1500)
      setTimeout(() => {this.handleReason()}, 1000)
    }
    handleReason(props){
        const { navigate }  = this.props.navigation;
        const toilet        = this.props.navigation.state.params.toilet;
        const airport        = this.props.navigation.state.params.airport;
        const pilihan       = this.props.navigation.state.params.pilihan;
        const resetAction   = NavigationActions.reset({
          index: 1,
          actions: [
            NavigationActions.navigate({ routeName: 'SelectToilet', params: {airport:airport}}),
            NavigationActions.navigate({ routeName: 'RateScreen', params: {toilet:toilet, airport:airport}})
          ]
        })
        this.props.navigation.dispatch(resetAction)
      
        
    }

  render(){
    const { navigate } = this.props.navigation;
   return (
      <Image source={require('./assets/blue.jpeg')} style = {styles.bigContainer}>
      <StatusBar hidden={true}/>
        <View style = {styles.logowrapper}><Image  source={require('./assets/logo2.png')} style = {styles.logo}/>
          <View style ={styles.titleWrapper}>
            <Text style = {styles.Title}>{"\n"}Mohon maaf atas ketidaknyamanan anda</Text>
            <Text style = {styles.Title2}>Sorry for the inconvenience</Text>
            <Text style = {styles.Title}>Silahkan sampaikan alasan anda</Text>
            <Text style = {styles.Title2}>Kindly share the reason for your selection</Text>
              <View style = {styles.container}>
                  <TouchableOpacity 
                  onPress={this.saveReason1.bind(this)}
                  style = {styles.buttonWrapper}>
                  <Image source={require('./assets/bau.png')} style = {styles.smiley} />
                  <H1 style = {styles.text}> Foul Smell </H1>
                  </TouchableOpacity>
                  <TouchableOpacity 
                  onPress={this.saveReason2.bind(this)}
                  style = {styles.buttonWrapper}>
                  <Image source={require('./assets/toilet_kotor.png')} style = {styles.smiley} />
                  <H1 style = {styles.text}> Dirty Urinoir/Toilet Bowl </H1>
                  </TouchableOpacity>
                  <TouchableOpacity 
                  onPress={this.saveReason3.bind(this)}
                  style = {styles.buttonWrapper}>
                  <Image source={require('./assets/no-toilet-paper.png')} style = {styles.smiley} />
                  <H1 style = {styles.text}> No Toilet Paper </H1>
                  </TouchableOpacity>
                  <TouchableOpacity 
                  onPress={this.saveReason4.bind(this)}
                  style = {styles.buttonWrapper}>
                  <Image source={require('./assets/wet_floor.png')} style = {styles.smiley} />
                  <H1 style = {styles.text}> Wet Floor </H1>
                 </TouchableOpacity>
                  <TouchableOpacity 
                  onPress={this.saveReason5.bind(this)}
                  style = {styles.buttonWrapper}>
                  <Image source={require('./assets/full_bin.png')} style = {styles.smiley} />
                  <H1 style = {styles.text}> Litter Bin Full </H1>
                  </TouchableOpacity>
              </View>
          </View>
          </View>
         
          
          <Modal
        offset={this.state.offset}
        open={this.state.modalVisible}
        modalDidOpen={() => console.log('modal did open')}
        modalDidClose={() => this.setState({modalVisible: false})}
        modalStyle={{alignItems: 'center', backgroundColor: 'rgb(21, 151, 235)'}}
        >
          <View style={{alignItems: 'center' }}>
          <Image  source={require('./assets/logo2.png')} style = {styles.logo}/>
          <Text>{'\n'}</Text>
             <Text style={{fontSize: 50, marginBottom: 10, fontFamily: 'norwester', color: 'white'}}>Terima Kasih atas Penilaian anda</Text>
             <Text style={{fontSize: 40, marginBottom: 10, fontFamily: 'norwester', color: 'white'}}>Thank You for your Feedback</Text>
          </View>
        </Modal>
      </Image>
      
    
    )
  }
}


export const SimpleApp = StackNavigator({
  Home: { screen: HomeScreen },
  SelectToilet: { screen: SelectToilet },
  RateScreen: {screen: RateScreen},
  ReasonScreen:{screen: ReasonScreen}
});

export default class App extends React.Component {
  componentWillMount(){
    KeepAwake.activate();
  }
  render() {
    return <SimpleApp />;
  }
}

const styles = StyleSheet.create({
  
  bigContainer: {
      flex: 1,
    // remove width and height to override fixed static size
    width: null,
    height: null,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
   },
    bigContainer2: {
      flex: 1,
    // remove width and height to override fixed static size
    width: null,
    height: null,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black'
   },
   container: {
      flex: 1,
    // remove width and height to override fixed static size
    width: null,
    height: null,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
     
   },
   smiley: {
      width: 200,
      height: 200,
      marginLeft: 40
   },
   buttonWrapper:{
    flex:1,
    alignItems:'center',
    justifyContent:'center',
    marginBottom: 200
   },
   logo:{
    width: 270,
      height: 80,

   },
   Title:{
    fontSize: 60,
    color: '#000',
    textAlign: 'center',
    fontFamily: 'norwester'
   },
   Title2:{
    fontSize: 40,
    color: '#000',
    textAlign: 'center',
    fontFamily: 'norwester'
   },
   title2:{
    fontSize: 80,
  
    color: 'yellow',
    textAlign: 'center',
    fontFamily: 'norwester'
   },
   text:{
    color: '#000',
    fontFamily: 'norwester',
    marginLeft: 45
   },
   text2:{
    color: 'yellow',
    fontFamily: 'norwester',
    marginLeft: 45
   },
   logowrapper:{
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 50,
    marginRight: 50
   },
   titleWrapper:{
    flexDirection: 'column',
    alignItems: 'center',
    
   },
});