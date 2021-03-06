import setText3d from './text3d.js';
import { getTheme } from '../state/selectors.js';

/**
 * Base object for all processor WebGL object controllers.
 *
 * @export
 * @param {Object} data
 * @param {Object} my Shared properties.
 */
export default function createObject3dControllerBase(data, that, my) {
        
    /**
     * Update the pattern's name.
     */
  const updateLabel = function(labelString) {
      setText3d(my.label3d, labelString.toUpperCase(), getTheme().colorHigh);
    },

    /** 
     * Set the 3D pattern's position in the scene.
     */
    updatePosition = function(state) {
      if (state.selectedId === my.id) {
        const data = state.processors.byId[my.id];
        my.object3d.position.set(data.positionX, data.positionY, data.positionZ);
      }
    },

    updateConnectMode = function(isConnectMode) {
      my.object3d.children.forEach(child3d => {
        if (child3d.name === 'input_hitarea') {
          child3d.getObjectByName('input_active').visible = isConnectMode;
        }
        if (child3d.name === 'output_hitarea') {
          child3d.getObjectByName('output_active').visible = isConnectMode;
        }
      });
    },

    getID = function() {
      return my.id;
    };
  
  my.id = data.object3d.userData.id;
  my.object3d = data.object3d;
  my.hitarea3d = my.object3d.getObjectByName('hitarea');
  my.label3d = my.object3d.getObjectByName('label');
  my.updateLabel = updateLabel;
  my.updatePosition = updatePosition;
  my.updateConnectMode = updateConnectMode;

  that.getID = getID;
  return that;
}
