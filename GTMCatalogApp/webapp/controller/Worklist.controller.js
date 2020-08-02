sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/m/SearchField'
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, SearchField) {
	"use strict";

	return BaseController.extend("com.sdc.GTMcatalog.GTMCatalogApp.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */

		onInit: function () {
			var oViewModel,
				iOriginalBusyDelay;
			var sViewId = this.getView().getId();
			this.oFilterBar = sap.ui.getCore().byId(sViewId + "--filterBar");

			var oSearchField = this.oFilterBar.getBasicSearch();
			var oBasicSearch;
			if (!oSearchField) {
				oBasicSearch = new SearchField({
					showSearchButton: true,
					search: this.onSearch.bind(this)
				});
			}
			this.oFilterBar.setBasicSearch(oBasicSearch);

		
			this._aTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0
			});
			this.setModel(oViewModel, "worklistView");
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onSearch: function (oEvent) {
			sap.m.MessageToast.show("search triggered");
		},
		onUpdateFinished: function (oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Event handler for navigating back.
		 * We navigate back in the browser history
		 * @public
		 */
		onNavBack: function () {
			// eslint-disable-next-line sap-no-history-manipulation
			history.go(-1);
		},

		onSearch: function (oEvent) {
			var aTableSearchState = [];
			var sQuery = oEvent.getParameter("query");

			if (sQuery && sQuery.length > 0) {
				aTableSearchState = [
					new Filter({
						filters: [
							new Filter("PackageTitle", FilterOperator.Contains, sQuery),
							new Filter("umbrellaTitle", FilterOperator.Contains, sQuery)
						],
						and: false
					})
				];
			}
			this._applySearch(aTableSearchState);
			// }

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function (oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("GTMID")
			});
		},
		onAdd: function (oEvent) {
			this.getRouter().navTo("object", {
				objectId: "Add"
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function (aTableSearchState) {
			var oTable = this.byId("GTMList"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		},
		formatStatus: function (status) {
			switch (status) {
			case 1:
				// code block
				return sap.ui.core.ValueState.Error;
				break;
			case 2:
				// code block
				return sap.ui.core.ValueState.Warning;
				break;
			case 3:
				return sap.ui.core.ValueState.Success;
				// code block
				break;
			default:
				// code block
				return sap.ui.core.ValueState.None;
			}
		},
		_getVal: function (evt) {
			return sap.ui.getCore().byId(evt.getParameter('id')).getText();
		},

		handleEmailPress: function (evt) {
			// evt
			sap.m.URLHelper.triggerEmail(this._getVal(evt) //Email
			, "GTM info Request: " + sap.ui.getCore().byId(evt.getParameter('id')).getParent().getTitle()); //Subject
		},
		onFilter: function (oEvent) {
			var filters = [];
			var oList = this.byId("GTMList");
			oList.bindAggregation("items", {
				path: "/PacakgeView",
				template: this.oObjectListItem2,
				filters: filters
			});

		},
		
		onSearchFB: function () {
			debugger;
			var aTableSearchStateTech = [];
			var aTableSearchStateInd = [];
			var aTableSearchStateSolPros = [];
			// var sQuery = oEvent.getParameter("query");

			// if (sQuery && sQuery.length > 0) 
			this.byId("MCTech").getSelectedItems().forEach((item) => {
				aTableSearchStateTech.push(new Filter("technologyCodes", FilterOperator.EQ, parseInt(item.getKey())))
			});
			this.byId("MCSolPros").getSelectedItems().forEach((item) => {
				aTableSearchStateSolPros.push(new Filter("solProsCodes", FilterOperator.EQ, parseInt(item.getKey())))
			});
			this.byId("MCInd").getSelectedItems().forEach((item) => {
				aTableSearchStateInd.push(new Filter("industryCodes", FilterOperator.EQ, parseInt(item.getKey())))
			});
			
			var finalFilterArray = [];
			if (aTableSearchStateTech.length > 0) {
				var aTableSearchStateTechOR = new Filter({
					filters: aTableSearchStateTech,
					and: false
				});
				finalFilterArray.push(aTableSearchStateTechOR);
			}
			if (aTableSearchStateSolPros.length > 0) {

				var aTableSearchStateSolProsOR = new Filter({
					filters: aTableSearchStateSolPros,
					and: false
				});
				finalFilterArray.push(aTableSearchStateSolProsOR);
				
			}
			if (aTableSearchStateInd.length > 0) {

				var aTableSearchStateIndOR = new Filter({
					filters: aTableSearchStateInd,
					and: false
				});
				finalFilterArray.push(aTableSearchStateIndOR);
			}

			if (aTableSearchStateInd.length > 0 || aTableSearchStateSolPros.length > 0 || aTableSearchStateTech.length > 0) {
				var aTableSearchStateFinal = [
					new Filter({
						filters: finalFilterArray,
						and: true
					})
				];
			}
			this._applySearch(aTableSearchStateFinal);
		}
	});
});