sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"../model/formatter",
	'sap/ui/core/Fragment',
	'sap/ui/model/Filter',
	'sap/m/Token',
	'sap/ui/model/FilterOperator',
	'sap/m/Tokenizer'
], function (BaseController, JSONModel, History, formatter, Fragment, Filter, Token, FilterOperator, Tokenizer) {
	"use strict";

	return BaseController.extend("com.sdc.gtmwl.GTM_UI_V2.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy: true,
					delay: 0,
					saveVisible: true
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function () {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onSave: function (oEvent) {
			this.getView().getModel().submitChanges();
		},
		onEditotReady: function()
		{
			this.byId("HeaderSectionD").focus();
		},
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.sObjectId = sObjectId;
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("Packages", {
					GTMID: sObjectId
				});
				// // this._bindView({ path: '/'+ sObjectPath , parameters: { expand: 'GTMStatus'}});
				// this._bindView({ path: '/Packages(1)' , parameters: { expand: 'GTMStatus'}});
				this._bindView("/" + sObjectPath);
			}.bind(this));
			this.getView().getModel().setDefaultBindingMode("TwoWay");
			this.getModel("objectView").setProperty("/saveVisible", this.getView().getModel().hasPendingChanges());
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function (sObjectPath) {
			var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oDataModel.metadataLoaded().then(function () {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}.bind(this)
				},
				parameters: {
					expand: 'GTMStatus,PackageType,Practice,GTMResponsible'
				}
			});
		},

		_onBindingChange: function () {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.GTMID,
				sObjectName = oObject.umbrellaTitle;

			oViewModel.setProperty("/busy", false);

			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		},
		handleValueHelp: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();

			if (oEvent.getSource().getId().indexOf("MSTechnologies") > -1)
				this.currentMSField = "MSTechnologies";
			if (oEvent.getSource().getId().indexOf("MSIndustries") > -1)
				this.currentMSField = "MSIndustries";
			if (oEvent.getSource().getId().indexOf("MSSolProcesses") > -1)
				this.currentMSField = "MSSolProcesses";
			if (oEvent.getSource().getId().indexOf("MSPhases") > -1)
				this.currentMSField = "MSPhases";

			// create value help dialog
			if (!this._multiSelectVHDialog) {
				Fragment.load({
					id: "valueHelpDialog",
					name: "com.sdc.gtmwl.GTM_UI_V2.view.fragments.multiSelectVHDialog",
					controller: this
				}).then(function (oValueHelpDialog) {
					this._multiSelectVHDialog = oValueHelpDialog;
					// this._multiSelectVHDialog.setModel(this.getView().getModel());
					this.getView().addDependent(this._multiSelectVHDialog);
					this._multiSelectVHDialog.setDraggable(true);
					this._multiSelectVHDialog.setResizable(true);
					this._openValueHelpDialog(sInputValue);
				}.bind(this));
			} else {
				this._openValueHelpDialog(sInputValue);
			}
		},

		_openValueHelpDialog: function (sInputValue) {
			// create a filter for the binding
			if (!this.oItemTemplate)
				this.oItemTemplate = this._multiSelectVHDialog.getBindingInfo("items").template;
			this._multiSelectVHDialog.getBinding("items").filter([new Filter(
				"Text",
				FilterOperator.Contains,
				sInputValue
			)]);
			if (this.currentMSField === "MSTechnologies") {
				// this._multiSelectVHDialog.unbindAggregation("items");
				this._multiSelectVHDialog.bindAggregation("items", {
					path: "/Technologies_all",
					template: this.oItemTemplate,
					templateShareable: true
				});
			} else if (this.currentMSField === "MSIndustries") {
				this._multiSelectVHDialog.bindAggregation("items", {
					path: "/Industries_all",
					template: this.oItemTemplate,
					templateShareable: true
				});
			} else if (this.currentMSField === "MSSolProcesses") {
				this._multiSelectVHDialog.bindAggregation("items", {
					path: "/SolutionProcesses_all",
					template: this.oItemTemplate,
					templateShareable: true
				});
			} else if (this.currentMSField === "MSPhases") {
				this._multiSelectVHDialog.bindAggregation("items", {
					path: "/Phases_all",
					template: this.oItemTemplate,
					templateShareable: true
				});
			}
			// open value help dialog filtered by the input value
			this._multiSelectVHDialog.open(sInputValue);
		},

		_handleValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"Text",
				FilterOperator.Contains,
				sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},

		_handleValueHelpClose: function (evt) {
			var aSelectedItems = evt.getParameter("selectedItems"),
				oMultiInput,
				sEntityPath;
			if (this.currentMSField === "MSTechnologies") {
				oMultiInput = this.byId("MSTechnologies");
				sEntityPath = "Technologies";
			} else if (this.currentMSField === "MSIndustries") {
				oMultiInput = this.byId("MSIndustries");
				sEntityPath = "Industries";
			} else if (this.currentMSField === "MSSolProcesses") {
				oMultiInput = this.byId("MSSolProcesses");
				sEntityPath = "SolProcesses";
			} else if (this.currentMSField === "MSPhases") {
				oMultiInput = this.byId("MSPhases");
				sEntityPath = "Phases";
			}

			// oMultiInput = this.byId("multiinput1");

			if (aSelectedItems && aSelectedItems.length > 0) {
				aSelectedItems.forEach(function (oItem) {
					oMultiInput.addToken(new Token({
						key: oItem.getBindingContext().getObject().ID,
						text: oItem.getTitle()
					}));
					this.getView().getModel().createEntry("/" + sEntityPath, {
						properties: {
							GTMID_GTMID: parseInt(this.sObjectId, 10),
							Value_ID: oItem.getBindingContext().getObject().ID,
						}
					});
					this.getModel("objectView").setProperty("/saveVisible", this.getView().getModel().hasPendingChanges());
				}.bind(this));
			}
		},

		_onTokenUpdate: function (oEvent) {

			var aTokens,
				sEntityPath = "",
				i;
			if (oEvent.getSource().getId().indexOf("MSTechnologies") > -1)
				sEntityPath = "Technologies";
			else if (oEvent.getSource().getId().indexOf("MSIndustries") > -1)
				sEntityPath = "Industries";
			else if (oEvent.getSource().getId().indexOf("MSSolProcesses") > -1)
				sEntityPath = "SolProcesses";
			else if (oEvent.getSource().getId().indexOf("MSPhases") > -1)
				sEntityPath = "Phases";

			if (oEvent.getParameter('type') === Tokenizer.TokenUpdateType.Added) {
				aTokens = oEvent.getParameter('addedTokens');
				aTokens.forEach(function (token) {
					debugger;
					this.getView().getModel().createEntry("/" + sEntityPath, {
						properties: {
							GTMID_GTMID: this.sObjectId,
							Value_ID: token.getKey()
						}
					});
				}.bind(this));

			} else if (oEvent.getParameter('type') === Tokenizer.TokenUpdateType.Removed) {
				aTokens = oEvent.getParameter('removedTokens');
				aTokens.forEach(function (token) {
					debugger;
					this.getView().getModel().remove("/" + sEntityPath + "(GTMID_GTMID=" + parseInt(this.sObjectId, 10) + ",Value_ID=" + parseInt(
						token.getKey(), 10) + ")");
				}.bind(this));
				this.getModel("objectView").setProperty("/saveVisible", this.getView().getModel().hasPendingChanges());
				// sTokensText = "Removed tokens: ";
			}
		}

	});

});