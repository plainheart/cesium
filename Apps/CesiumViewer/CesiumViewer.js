/*global define*/
define([
        'DynamicScene/CzmlDataSource',
        'Scene/PerformanceDisplay',
        'Widgets/Viewer/Viewer',
        'Widgets/Viewer/ViewerDropHandler',
        'Widgets/Viewer/ViewerDynamicSceneControls',
        'domReady!'
    ], function(
        CzmlDataSource,
        PerformanceDisplay,
        Viewer,
        ViewerDropHandler,
        ViewerDynamicSceneControls) {
    "use strict";
    /*global console*/

    var viewer = new Viewer('cesiumContainer');
    viewer.extend(ViewerDropHandler);
    viewer.extend(ViewerDynamicSceneControls);

    viewer.onDropError.addEventListener(function(dropHandler, name, error) {
        console.log(error);
        window.alert(error);
    });

    /*
     * 'debug'  : true/false,   // Full WebGL error reporting at substantial performance cost.
     * 'lookAt' : CZML id,      // The CZML ID of the object to track at startup.
     * 'source' : 'file.czml',  // The relative URL of the CZML file to load at startup.
     * 'stats'  : true,         // Enable the FPS performance display.
     * 'theme'  : 'lighter',    // Use the dark-text-on-light-background theme.
     */
    var endUserOptions = {};
    var queryString = window.location.search.substring(1);
    if (queryString !== '') {
        var params = queryString.split('&');
        for ( var i = 0, len = params.length; i < len; ++i) {
            var param = params[i];
            var keyValuePair = param.split('=');
            endUserOptions[keyValuePair[0]] = decodeURIComponent(keyValuePair[1].replace(/\+/g, ' '));
        }
    }

    var scene = viewer.scene;
    var context = scene.getContext();
    if (endUserOptions.debug) {
        context.setValidateShaderProgram(true);
        context.setValidateFramebuffer(true);
        context.setLogShaderCompilation(true);
        context.setThrowOnWebGLError(true);
    }

    if (typeof endUserOptions.source !== 'undefined') {
        var source = new CzmlDataSource();
        source.loadUrl(endUserOptions.source).then(function() {
            viewer.dataSources.add(source);

            var dataClock = source.getClock();
            if (typeof dataClock !== 'undefined') {
                dataClock.clone(viewer.clock);
                viewer.timeline.zoomTo(dataClock.startTime, dataClock.stopTime);
            }

            if (typeof endUserOptions.lookAt !== 'undefined') {
                var dynamicObject = source.getDynamicObjectCollection().getObject(endUserOptions.lookAt);
                if (typeof dynamicObject !== 'undefined') {
                    viewer.trackedObject = dynamicObject;
                } else {
                    window.alert('No object with id ' + endUserOptions.lookAt + ' exists in the provided source.');
                }
            }
        });
    }

    if (endUserOptions.stats) {
        scene.getPrimitives().add(new PerformanceDisplay());
    }

    var theme = endUserOptions.theme;
    if (typeof theme !== 'undefined') {
        if (endUserOptions.theme === 'lighter') {
            document.body.classList.add('cesium-lighter');
            viewer.animation.applyThemeChanges();
        } else {
            window.alert('Unknown theme: ' + theme);
        }
    }
});