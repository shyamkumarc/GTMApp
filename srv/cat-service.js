const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

	this.before('READ', 'PackageView', (req) => {
			debugger;
		////---------IMPORTANT------------------------/////////
		// clearnign any  $top and $skip requests, as it tend to limit the view data fetch 
		if (req.query.SELECT['limit'] )
		delete  req.query.SELECT['limit'] ;
		
		  // THe view fetches all data by default , distinct will remove duplicates
			req.query.distinct();
		// for distinct to take effect , all columns in select need to be part of groupBy
		//Exception: In case of $count from odata , the count is provided from Packages Entity
		 //This is because the view when queried for count (without any where conditions / column names, which is case with $count). 
		 //will show a huge count fo records that would be misleading for the frontend output
			req.query.SELECT.columns.forEach((column) => {
					debugger;
					try {
						req.query.groupBy(column.ref[0]);
					} catch (oError) {
						if (column.func === "count") {
							debugger;
							// req.query.SELECT.from.ref[0] = "CatalogService.Packages";
						}

					}
			});
		// req.query.distinct();

	});

//------------Not used -------------------//
// this.on('READ','PackageView', (req)=> {
//  debugger;
// }
// )
//------------Not used -------------------//

// module.exports = async function () {

this.after('READ', 'PackageView', (packages, req) => {
	// try {

	// 	// -------------If the query is to count records , return the count via 'counted'  parameter
	// 	if (packages[0]['counted'])
	// 		packages[0]['counted'] = packages.length;

	// 	else {

	// --------------Remove duplicates by comparing GTMID from returned data--------------//

	//No need for this piece as 'DISTINCT' with GroupBy() in on.before() method seem to help in rmeoving duplicates
	//Neverthless , keeping this code in place just as a backup 		

	//unique entries in response
	if (packages.length > 0) {
		// Sort by GTMID	
		packages.sort(function (a, b) {
			return (((a.GTMID > b.GTMID) == true) ? 1 : -1);
		});

		//Mark one entry as the first line
		var lv_zeroth = packages[0].GTMID;
		var count = packages.length;
		var newarr = [];
		newarr.push(packages[0]);

		for (var i = 1; i < count; i++) {
			// Note: all lines are sorted by GTMIDs
			// if the new line's GTMID  is same as old, skip it , else add it to new array.
			if (packages[i].GTMID !== lv_zeroth) {
				newarr.push(packages[i]);
				lv_zeroth = packages[i].GTMID;
			}

		}

		packages.splice(0, packages.length);
		newarr.forEach(newline => packages.push(newline));
		console.log(packages);
	}
	// --------------Remove duplicates by comparing GTMID from returned data--------------

	// 	}
	// } catch (oError) {

	// }

})

})