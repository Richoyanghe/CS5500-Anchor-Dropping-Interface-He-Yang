import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions';
import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline';
import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor';

class AnchorTool extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.setState({
            wavesurfer: WaveSurfer.create({
                container: '#waveform',
                scrollParent: true,
                waveColor: 'violet',
                progressColor: 'purple',
                loaderColor: 'purple',
                cursorColor: 'navy',
                backgroundColor: '#eeeeee',
                plugins: [
                    RegionsPlugin.create({
                        regions: [],
                        maxRegions: 1,
                        dragSelection: true
                    }),
                    TimelinePlugin.create({
                        container: "#timeline",

                    }),
                    CursorPlugin.create({
                        showTime: true
                    })
                ]
            })
        });
    }

    onXmlFileChange = (e) => {
        let xmlFile = e.target.files[0];
        let reader = new FileReader();
        reader.addEventListener("load", () => {
            this.setState({ xmlFileText: reader.result });
        })
        reader.readAsText(xmlFile);

    }

    onAudioFileChange = (e) => {
        let audioFile = e.target.files[0];
        var wavesurfer = this.state.wavesurfer;
        wavesurfer.loadBlob(audioFile);
        wavesurfer.on('ready', () => {
            // wavesurfer.play();
            this.setState({wavesurferReady: true});
        });
        wavesurfer.on('region-created', region => {
            this.setState({ waveRegion: region })
        });
        wavesurfer.on('region-update-end', region => {
            this.setState({ waveRegion: region })
        });
        wavesurfer.on('seek', (position) => {
            var currentTime = position * wavesurfer.getDuration();
            this.setState({seekTime: currentTime});
        });


    }

    playPause = ()=>{
        if (!this.state.wavesurfer){
            return;
        }
        this.state.wavesurfer.playPause();
    }

    render() {
        
        let waveRegion = this.state.waveRegion;
        let wavesurfer = this.state.wavesurfer;
        let wavesurferReady = this.state.wavesurferReady;
        if(wavesurfer){
            console.log(wavesurfer.getCurrentTime());
        }
        
        return (<div>
            <h1>Anchor Dropping Tool</h1>

            <Form.Group controlId="xmlFile" className="mb-3">
                <Form.Label>XML File</Form.Label>
                <Form.Control type="file" accept='.xml' onChange={this.onXmlFileChange} />
            </Form.Group>
            <Form.Group controlId="audioFile" className="mb-3">
                <Form.Label>Audio File</Form.Label>
                <Form.Control type="file" accept="audio/*" onChange={this.onAudioFileChange} />
            </Form.Group>


            {this.state.xmlFileText && <>
                <h6>XML Text</h6><div>{this.state.xmlFileText}</div>
            </>}

            <h6>Audio</h6>
            <div id='waveform'></div>
            <div id='timeline'></div>
            {wavesurferReady && <Button variant="primary" onClick={this.playPause}>Play / Pause</Button>}

            {waveRegion && <>
                <div>Selected Region: {waveRegion.start} to {waveRegion.end}</div>
            </>}

            {wavesurfer && <>
                <div>Current time: {wavesurfer.getCurrentTime()}</div>
            </>}

        </div>);
    }


}

export default AnchorTool;