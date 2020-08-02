sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"../model/formatter",
	'sap/ui/core/Fragment',
	'sap/ui/model/Filter',
	'sap/m/Token',
	'sap/ui/model/FilterOperator',
	'sap/m/Tokenizer',
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/MessageToast",
	"sap/m/Text",

], function (BaseController, JSONModel, History, formatter, Fragment, Filter, Token, FilterOperator, Tokenizer, Button, Dialog,
	MessageToast, Text) {
	"use strict";
	var addedTokens = [];
	return BaseController.extend("com.sdc.GTMcatalog.GTMWorklistApp.controller.Object", {

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
					edit: false
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
			var error = false;
			if (!this.byId('CBPackageType').getValue()) { this.byId('CBPackageType').setValueState("Error"); error = true; };
			if (!this.byId('CBPractice').getValue()) {  this.byId('CBPractice').setValueState("Error"); error = true; };
			if (!this.byId('CBStatus').getValue())  { this.byId('CBStatus').setValueState("Error"); error = true; };
			if (!this.byId('title').getValue())  { this.byId('title').setValueState("Error"); error = true; };
			if (!this.byId('UmbrellaTitle').getValue()) {  this.byId('UmbrellaTitle').setValueState("Error"); error = true; };
			// this.byId('CBPractice').getSelectedKey() 
			// this.byId('CBPractice').getSelectedKey()
			
			// this.byId('title').getValue() 
			// this.byId('UmbrellaTitle').getValue()
			
			if (!error){
			
			var busyDialog = new sap.m.BusyDialog();
			busyDialog.open();
			this.getModel().submitChanges({ // submit for backend update
				success: function (data, response) { //Save button - save successful
					// oDialog.close();
					busyDialog.close();
					var errors = false;
					for (var i = 0; i < data.__batchResponses.length; i++) {
						try {
							if (data.__batchResponses[i]["response"]["statusCode"] !== "200") {
								var errorMessage = JSON.parse(data.__batchResponses[i]["response"]["body"]);
								sap.m.MessageBox.error(errorMessage["error"]["message"]["value"]);
								errors = true;
								break;
							}
						} catch (err) {

						}

					}
					if (!errors) { // save successful
						MessageToast.show("Saved successfully!");
						this.getModel("objectView").setProperty("/edit", false);
					}

				}.bind(this),
				error: function (oError) { //Save button - save failed 
					// oDialog.close();
					busyDialog.close();
					MessageToast.show('Failed to update');
					this.getModel("objectView").setProperty("/edit", false);
				}.bind(this)
			}); // submit for backend update
			}
			else
			{
				sap.m.MessageBox.error('Please fill all mandatory Fields');
			}
		},
		onEdit: function (oEvent) {
			this.getView().getModel("objectView").setProperty("/edit", true);
		},
		onCancel: function (oEvent) {
			if (this.getModel().hasPendingChanges(true)) {
				//open dialog box for confirmation
				var oDialog = new Dialog({
					title: 'Confirm',
					type: 'Message',
					content: new Text({
						text: 'You have unsaved changes. Do you want to save them?'
					}),
					beginButton: new Button({ //Save button
						type: "Emphasized",
						text: 'Save',
						press: function () { //Save button press
							var busyDialog = new sap.m.BusyDialog();
							busyDialog.open();
							this.getModel().submitChanges({ // submit for backend update
								success: function (data, response) { //Save button - save successful
									oDialog.close();
									busyDialog.close();
									var errors = false;
									for (var i = 0; i < data.__batchResponses.length; i++) {
										try {
											if (data.__batchResponses[i]["response"]["statusCode"] !== "200") {
												var errorMessage = JSON.parse(data.__batchResponses[i]["response"]["body"]);
												sap.m.MessageBox.error(errorMessage["error"]["message"]["value"]);
												errors = true;
												break;
											}
										} catch (err) {

										}

									}
									if (!errors) { // save successful
										MessageToast.show("Saved successfully!");
										this.getModel("objectView").setProperty("/edit", false);
									}

								}.bind(this),
								error: function (oError) { //Save button - save failed 
									oDialog.close();
									busyDialog.close();
									MessageToast.show('Failed to update');
									this.getModel("objectView").setProperty("/edit", false);
								}.bind(this)
							}); // submit for backend update

						}.bind(this)
					}),
					endButton: new Button({
						text: 'Discard',
						press: function () {
							this.getModel().resetChanges(null, true);
							this.getModel("objectView").setProperty("/edit", false);
							oDialog.close();
							var sPreviousHash = History.getInstance().getPreviousHash();
							if (sPreviousHash !== undefined) {
								history.go(-1);
							} else {
								this.getRouter().navTo("worklist", {}, true);
							}
						}.bind(this)
					}),
					afterClose: function () {
						oDialog.destroy();
					}
				});

				oDialog.open();

			} else
				this.getModel("objectView").setProperty("/edit", false);
		},
		onEditotReady: function () {
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
			if (sObjectId == "Add") {
				this.getView().unbindElement();
				this.getView().getModel().read('/Packages', {
					urlParameters: {
						"$orderby": "GTMID desc",
						"$select": "GTMID",
						"$top": 1
					},
					success: function (oData, response) {
						var oEntry = this.getView().getModel().createEntry("/Packages", {
							properties: {
								GTMID: oData.results[0].GTMID + 1,
								GTMStatus_ID :1
							}
						});
						this.getView().setBindingContext(oEntry);
						this.getModel("objectView").setProperty("/edit", true);
						this.sObjectId = parseInt(oData.results[0].GTMID + 1);
						// this.byId("rtD").destroy();
					}.bind(this),
					error: function (oError) {}
				});

			} else {
				this.getModel().metadataLoaded().then(function () {
					var sObjectPath = this.getModel().createKey("Packages", {
						GTMID: sObjectId
					});

					// // this._bindView({ path: '/'+ sObjectPath , parameters: { expand: 'GTMStatus'}});
					// this._bindView({ path: '/Packages(1)' , parameters: { expand: 'GTMStatus'}});
					this._bindView("/" + sObjectPath);
				}.bind(this));
			}
			var aDeferredGroups = this.getModel().getDeferredGroups();
			// Append delete's groupId to the list:
			aDeferredGroups = aDeferredGroups.concat(["deleteTokens"]);
			// Set  groups  deferred:
			this.getModel().setDeferredGroups(aDeferredGroups);
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

			this.getView().getModel().read(oView.getElementBinding().getPath(), {
				urlParameters: {
					"$select": "GTMID"
				},
				success: function (oData, response) {
					if (!oData.GTMID)
						this.getRouter().getTargets().display("objectNotFound");
					// return;
				}.bind(this),
				error: function (oError) {
					// No data for the binding
					if (!oElementBinding.getBoundContext()) {
						this.getRouter().getTargets().display("objectNotFound");
						// return;
					}
				}.bind(this)
			});
			// No data for the binding
			// if (!oElementBinding.getBoundContext()) {
			// 	this.getRouter().getTargets().display("objectNotFound");
			// 	return;
			// }

			// var oResourceBundle = this.getResourceBundle(),
			// 	oObject = oView.getBindingContext().getObject(),
			// 	sObjectId = oObject.GTMID,
			// 	sObjectName = oObject.umbrellaTitle;

			// oViewModel.setProperty("/busy", false);

			// oViewModel.setProperty("/shareSendEmailSubject",
			// 	oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			// oViewModel.setProperty("/shareSendEmailMessage",
			// 	oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
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
					name: "com.sdc.GTMcatalog.GTMWorklistApp.view.fragments.multiSelectVHDialog",
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
					var context = this.getView().getModel().createEntry("/" + sEntityPath, {
						properties: {
							GTMID_GTMID: parseInt(this.sObjectId, 10),
							Value_ID: oItem.getBindingContext().getObject().ID,
						}
					});
					addedTokens.push({
						key: oItem.getBindingContext().getObject().ID,
						entity: sEntityPath,
						context: context
					});
					// this.getModel("objectView").setProperty("/edit", this.getView().getModel().hasPendingChanges());
				}.bind(this));
			}
		},

		_onTokenUpdate: function (oEvent) {

			var aTokens,
				sEntityPath = "",
				i;
			var oMultiInput = oEvent.getSource();
			if (oMultiInput.getId().indexOf("MSTechnologies") > -1)
				sEntityPath = "Technologies";
			else if (oMultiInput.getId().indexOf("MSIndustries") > -1)
				sEntityPath = "Industries";
			else if (oMultiInput.getId().indexOf("MSSolProcesses") > -1)
				sEntityPath = "SolProcesses";
			else if (oMultiInput.getId().indexOf("MSPhases") > -1)
				sEntityPath = "Phases";

			if (oEvent.getParameter('type') === Tokenizer.TokenUpdateType.Added) {
				aTokens = oEvent.getParameter('addedTokens');
				aTokens.forEach(function (token) {
					debugger;
					var context = this.getView().getModel().createEntry("/" + sEntityPath, {
						properties: {
							GTMID_GTMID: this.sObjectId,
							Value_ID: token.getKey()
						}
					});

					addedTokens.push({
						key: token.getKey(),
						entity: sEntityPath,
						context: context
					});

				}.bind(this));

			} else if (oEvent.getParameter('type') === Tokenizer.TokenUpdateType.Removed) {
				aTokens = oEvent.getParameter('removedTokens');
				aTokens.forEach(function (token) {
					debugger;
					var result = addedTokens.findIndex(addedToken =>
						addedToken.key === parseInt(token.getKey(), 10) &&
						addedToken.entity === sEntityPath);
					if (result >= 0) {
						this.getView().getModel().deleteCreatedEntry(addedTokens[result].context);
						addedTokens.splice(result, 1);
					} else {
						this.getView().getModel().remove("/" + sEntityPath + "(GTMID_GTMID=" + parseInt(this.sObjectId, 10) + ",Value_ID=" + parseInt(
							token.getKey(), 10) + ")", {
							groupId: "deleteTokens"
						});
						oMultiInput.removeToken(token); // remove token  manually from multiInput as the delete operation is a batch deffered operation 
					}

				}.bind(this));
				// this.getModel("objectView").setProperty("/edit", this.getView().getModel().hasPendingChanges());
				// sTokensText = "Removed tokens: ";
			}
		},
		formatStatus: function (status) {
			switch (status) {
			case "Created":
				// code block
				return sap.ui.core.ValueState.Error;
				break;
			case "Work In Progress":
				// code block
				return sap.ui.core.ValueState.Warning;
				break;
			case "Completed":
				return sap.ui.core.ValueState.Success;
				// code block
				break;
			default:
				// code block
				return sap.ui.core.ValueState.None;
			}
		},
		onDelete: function () {
			//open dialog box for confirmation
			var oDialog = new Dialog({
				title: 'Confirm',
				type: 'Message',
				content: new Text({
					text: 'Are you sure you want to delete this repository Item?'
				}),
				beginButton: new Button({ //Save button
					type: "Emphasized",
					text: 'Yes',
					press: function () { //Save button press
						var busyDialog = new sap.m.BusyDialog();
						busyDialog.open();
						var deletePath = this.getView().getBindingContext().getPath() + "/deletionIndicator";
						this.getModel().setProperty(deletePath, 'X');
						this.getModel().submitChanges({ // submit for backend update
							success: function (data, response) { //Save button - save successful
								oDialog.close();
								busyDialog.close();
								MessageToast.show("Record deleted successfully!");
								var sPreviousHash = History.getInstance().getPreviousHash();

								if (sPreviousHash !== undefined) {
									history.go(-1);
								} else {
									this.getRouter().navTo("worklist", {}, true);
								}

							}.bind(this),
							error: function (oError) { //Save button - save failed 
								oDialog.close();
								busyDialog.close();
								MessageToast.show('Failed to delete record');
								this.getModel("objectView").setProperty("/edit", false);
							}.bind(this)
						}); // submit for backend update

					}.bind(this)
				}),
				endButton: new Button({
					text: 'Cancel',
					press: function () {
						// this.getModel().resetChanges(null, true);
						// this.getModel("objectView").setProperty("/edit", false);
						oDialog.close();
					}.bind(this)
				}),
				afterClose: function () {
					oDialog.destroy();
				}
			});

			oDialog.open();
		},
		onLiveChange:function(oEvent){
			var current = oEvent.getSource().getValueState();
			if (current == sap.ui.core.ValueState.Error)
			oEvent.getSource().setValueState(sap.ui.core.ValueState.Success);
		}

	});

});