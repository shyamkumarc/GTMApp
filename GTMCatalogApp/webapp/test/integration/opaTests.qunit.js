/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/sdc/gtmwl/GTM_UI_V2/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
