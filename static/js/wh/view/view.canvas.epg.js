
window.WH = window.WH || {};

(function (ns) {
    
    function createCanvasEPGView(specs) {
        let that,
            processor = specs.processor,
            dynamicCtx = specs.dynamicCtx,
            canvasDirtyCallback = specs.canvasDirtyCallback,
            staticCanvas,
            staticCtx,
            necklaceCanvas,
            necklaceCtx,
            radius = 100,
            necklaceMinRadius = 50,
            centreRadius = 30,
            selectRadius = 25,
            dotRadius = 8,
            position2d,
            isSelected = false,
            doublePI = Math.PI * 2,
            
            initialise = function() {
                // offscreen canvas for static shapes
                staticCanvas = document.createElement('canvas');
                staticCanvas.height = radius * 2;
                staticCanvas.width = radius * 2;
                staticCtx = staticCanvas.getContext('2d');
                
                // offscreen canvas for dots ring and polygon
                necklaceCanvas = document.createElement('canvas');
                necklaceCanvas.height = radius * 2;
                necklaceCanvas.width = radius * 2;
                necklaceCtx = necklaceCanvas.getContext('2d');
                
                // add callback to update before render.
                processor.addSelectCallback(updateSelectCircle);
                
                // add listeners to parameters
                let params = processor.getParameters();
                params.steps.addChangedCallback(updateNecklace);
                params.pulses.addChangedCallback(updateNecklace);
                params.rotation.addChangedCallback(updateNecklace);
                params.position2d.addChangedCallback(updatePosition);
                
                // set drawing values
                position2d = params.position2d.getValue();
                updateNecklace();
                redrawStaticCanvas();
            },
            
            /**
             * Called before this view is deleted.
             */
            terminate = function() {},
            
            /**
             * Update the pattern dots.
             * If the steps, pulses or rotation properties have changed.
             * If steps change it might invalidate the pointer.
             */
            updateNecklace = function() {
                let steps = processor.getParamValue('steps'),
                    rotation = processor.getParamValue('rotation'),
                    euclid = processor.getEuclidPattern(),
                    polygonPoints = [],
                    rad, position2d, necklaceRadius;
                    
                necklaceCtx.strokeStyle = '#cccccc';
                necklaceCtx.clearRect(0, 0, necklaceCanvas.width, necklaceCanvas.height);
                necklaceCtx.beginPath();
                    
                necklaceRadius = necklaceMinRadius + (steps > 16 ? (steps - 16) * 3 : 0);
                for (i = 0; i < steps; i++) {
                    
                    // calculate the dot positions
                    rad = doublePI * (i / steps);
                    position2d = {
                        x: Math.sin(rad) * necklaceRadius,
                        y: Math.cos(rad) * necklaceRadius
                    }
                    
                    if (euclid[i]) {
                        polygonPoints.push(position2d);
                        // active dot
                    } else {
                        // passive dot
                        necklaceCtx.moveTo(radius + position2d.x + dotRadius, radius + position2d.y);
                        necklaceCtx.arc(radius + position2d.x, radius + position2d.y, dotRadius, 0, doublePI, true);
                    }
                }
                
                necklaceCtx.stroke();
                redrawStaticCanvas();
                canvasDirtyCallback();
            },
            
            /**
             * Show circle if the processor is selected, else hide.
             * @param {Boolean} isSelectedView True if selected.
             */
            updateSelectCircle = function(isSelectedView) {
                isSelected = isSelectedView;
                redrawStaticCanvas();
                canvasDirtyCallback();
            },
            
            /**
             * Update pattern's position on the 2D canvas.
             * @param  {Object} param Processor 2D position parameter.
             * @param  {Object} oldValue Previous 2D position as object.
             * @param  {Object} newValue New 2D position as object.
             */
            updatePosition = function(param, oldValue, newValue) {
                position2d = newValue;
                redrawStaticCanvas();
                canvasDirtyCallback();
            },
            
            redrawStaticCanvas = function() {
                staticCtx.strokeStyle = '#cccccc';
                staticCtx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);
                staticCtx.beginPath();
                
                // necklace
                staticCtx.drawImage(necklaceCanvas, 0, 0);
                
                // centre ring
                staticCtx.moveTo(radius + centreRadius, radius);
                staticCtx.arc(radius, radius, centreRadius, 0, doublePI, true);
                
                // select circle
                if (isSelected) {
                    staticCtx.moveTo(radius + selectRadius, radius);
                    staticCtx.arc(radius, radius, selectRadius, 0, doublePI, true);
                }
                staticCtx.stroke();
            },
            
            addToStaticView = function(mainStaticCtx) {
                mainStaticCtx.drawImage(
                    staticCanvas,
                    position2d.x - radius,
                    position2d.y - radius);
            },
            
            intersectsWithPoint = function(x, y) {
                let distance = Math.sqrt(Math.pow(x - position2d.x, 2) + Math.pow(y - position2d.y, 2));
                return distance <= radius;
            },
            
            getProcessor = function() {
                return processor;
            },
            
            setPosition2d = function(position2d) {
                processor.setParamValue('position2d', position2d);
            },
            
            getPosition2d = function() {
                return processor.getParamValue('position2d');
            };
        
        that = specs.that || {};
        
        initialise();
        
        that.addToStaticView = addToStaticView;
        that.intersectsWithPoint = intersectsWithPoint;
        that.getProcessor = getProcessor;
        that.setPosition2d = setPosition2d;
        that.getPosition2d = getPosition2d;
        return that;
    }

    ns.createCanvasEPGView = createCanvasEPGView;

})(WH);