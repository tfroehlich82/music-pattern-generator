import createMIDIProcessorBase from '../../midi/processorbase';
import { getMIDIPortByID } from '../../midi/midi';

/**
 * MIDI output port processor.
 */
export function createProcessor(specs, my) {
    var that,
        portID = specs.data.portID,
        midiOutput = getMIDIPortByID(portID),

        /**
         * Process events to happen in a time slice.
         * @param {Number} scanStart Timespan start in ticks from timeline start.
         * @param {Number} scanEnd   Timespan end in ticks from timeline start.
         * @param {Number} nowToScanStart Timespan from current timeline position to scanStart.
         * @param {Number} ticksToMsMultiplier Duration of one tick in milliseconds.
         * @param {Number} offset Time from doc start to timeline start in ticks.
         */
        process = function(scanStart, scanEnd, nowToScanStart, ticksToMsMultiplier, offset) {
            var inputData = my.getInputData(),
                origin = performance.now() - (offset * ticksToMsMultiplier),
                n = inputData.length;
            
            if (midiOutput.state === 'connected') {
                for (var i = 0; i < n; i++) {
                    var item = inputData[i],
                        // item.timestampTicks is time since transport play started
                        timestamp = origin + (item.timestampTicks * ticksToMsMultiplier);
                        
                    switch (item.type) {
                        case 'noteon':
                            midiOutput.send([0x90 + (item.channel - 1), item.pitch, item.velocity], timestamp);
                            break;
                        case 'noteoff':
                            midiOutput.send([0x80 + (item.channel - 1), item.pitch, 0], timestamp);
                            break;
                    }
                }
            }
        },
        
        setEnabled = function(isEnabled) {
            my.isEnabled = isEnabled;
        },

        getMIDIPortID = function() {
            return portID;
        };

        // getProcessorSpecificData = function(data) {
        //     data.midiPortID = midiOutput.id;
        // };


    my = my || {};
    // my.info = {
    //     inputs: 1,
    //     outputs: 0
    // };
    my.isEnabled = true;
    // my.getProcessorSpecificData = getProcessorSpecificData;

    that = createMIDIProcessorBase(specs, my);

    that.process = process;
    that.setEnabled = setEnabled;
    that.getMIDIPortID = getMIDIPortID;
    return that;
}
