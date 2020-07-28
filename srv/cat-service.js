const cds = require('@sap/cds');

module.exports = cds.service.impl (async function() {


this.before ('READ','PackageView', (req)=>{
   debugger;
  //delete req.query.SELECT.limit; // clear $top restiction on query - commenting out as DISTINCT alone helps in removing duplicate selection
  req.query.SELECT.distinct = true;
  
});

//------------Not used -------------------//
// this.on('READ','PackageView', (req)=> {
//  debugger;
// }
// )
//------------Not used -------------------//



// module.exports = async function () {

// --------------Remove duplicates by comparing GTMID from returned data--------------//

//No need for this piece as 'DISTINCT' on on.before() method seem to help in rmeoving duplicates
//Neverthless , keeping this code in place just as a backup 
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
// --------------Remove duplicates by comparing GTMID from returned data--------------
	})
	
	
})