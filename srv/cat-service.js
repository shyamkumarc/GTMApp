const cds = require('@sap/cds');

module.exports = cds.service.impl (async function() {
  //const {Books} = cds.entities
  //const {ID} = await SELECT.one.from(Books).columns('max(ID) as ID')
  //let newID = ID - ID % 100 + 100
  //this.on( [ 'CREATE', 'UPDATE' ],'Packages', ( req ) => {  
  //	if (req.data.GTMStatus_ID)
  //	{
  //		console.log("this method is triggered");
  //		parseInt(req.data.GTMStatus_ID); 
  //	}
  //	return req;
  //} );
// });




// module.exports = async function () {

	this.after('READ', 'PackageView', (packages, req) => {
		//unique entries in response
		if (packages.length > 0){
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
		
		packages.splice(0,packages.length);
		 newarr.forEach(newline=> packages.push(newline));
		 console.log(packages);
		}

	})
	
	
})