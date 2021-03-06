import React, { Component } from 'react';
import {
  View,
  Button,
  Picker
} from 'react-native';

var WebRTC = require('react-native-webrtc');
var {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
} = WebRTC;

const { ThreeDStreamingClient } = require('js-3dtoolkit');
import Config from '../config';

var streamingClient = new ThreeDStreamingClient(Config,
  {
    RTCPeerConnection: window.mozRTCPeerConnection || window.webkitRTCPeerConnection || RTCPeerConnection,
    RTCSessionDescription: window.mozRTCSessionDescription || window.RTCSessionDescription || RTCSessionDescription,
    RTCIceCandidate: window.mozRTCIceCandidate || window.RTCIceCandidate || RTCIceCandidate
  });

class HomeScreen extends Component {
  static navigationOptions = {
    title: 'React Native 3D Streaming Toolkit Sample'
  };

  constructor(props) {
    super(props);

    if (streamingClient && props.navigation.state.params && props.navigation.state.params.disconnect) {
      streamingClient.disconnect();
    }
    else {
      streamingClient.signIn('ReactClient',
        {
          onaddstream: this.onRemoteStreamAdded.bind(this),
          onremovestream: this.onRemoteStreamRemoved,
          onopen: this.onSessionOpened,
          onclose: this.onSessionClosed,
          onconnecting: this.onSessionConnecting,
          onupdatepeers: this.updatePeerList.bind(this),
          onremotepeerconnected: this.onremotepeerconnected.bind(this)
        })
        .then(streamingClient.startHeartbeat.bind(streamingClient))
        .then(streamingClient.pollSignalingServer.bind(streamingClient, true));
    }

    this.state = {
      otherPeers: streamingClient.otherPeers,
      currentPeerId: streamingClient.otherPeers ? Object.keys(streamingClient.otherPeers)[0] : 0,
      videoURL: null
    };
  }

  componentWillMount() {
  }

  componentWillUpdate(props, nextState) {
  }

  componentWillReceiveProps(nextProps) {
  }

  onremotepeerconnected(peer_id) {
    this.setState({ currentPeerId: peer_id });
  }

  updatePeerList() {
    let peers = streamingClient.otherPeers;

    if (peers) {
      this.setState({ currentPeerId: Object.keys(peers)[0] });
    }

    this.setState({ otherPeers: streamingClient.otherPeers });
  }

  onRemoteStreamAdded(event) {
    this.props.navigation.navigate('VideoPlayback',
      {
        videoURL: event.stream.toURL(),
        sendInputData: streamingClient.sendInputChannelData.bind(streamingClient),
        peerTitle: this.state.otherPeers[this.state.currentPeerId]
      });
  }

  onRemoteStreamRemoved(event) {
  }

  onSessionOpened(event) {
  }

  onSessionClosed(event) {
  }

  onSessionConnecting(event) {
  }

  joinPeer() {
    // Join a peer
    streamingClient.joinPeer(this.state.currentPeerId);
  }

  render() {
    return (
      <View>
        <Picker
          selectedValue={this.state.currentPeerId}
          onValueChange={(itemValue, itemIndex) => this.setState({ currentPeerId: itemValue })}>
          {this.renderPeers()}
        </Picker>
        <Button title="Join peer" onPress={this.joinPeer.bind(this)}>Join Peer</Button>

      </View>
    );
  }

  renderPeers() {
    return Object.keys(this.state.otherPeers).map((key, index) => {
      return <Picker.Item key={index} label={this.state.otherPeers[key]} value={key} />
    });
  }
}

export default HomeScreen;
