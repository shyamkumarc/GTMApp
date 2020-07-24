namespace GTM.dataModel;
using { User, Country, managed } from '@sap/cds/common';


@cds.persistence.exists
  entity PackagesView: managed  {
createdAt  : Timestamp @cds.on.insert : $now;
createdBy  : User      @cds.on.insert : $user;
modifiedAt : Timestamp @cds.on.insert : $now  @cds.on.update : $now;
modifiedBy : User      @cds.on.insert : $user @cds.on.update : $user;
 GTMID : Integer;
 PRACTICE_ID : Integer;
PACKAGETYPE_ID: Integer;
PackageTitle : String;
umbrellaTitle : String;
GTMSTATUS_ID : Integer;
GTMRESPONSIBLE_ID: String;
Comments : String;
Folderlink : String;
technologyCodes : Integer;
industryCodes: Integer;
solProsCodes: Integer;
phaseCodes: Integer;
}
  
  
entity TXPackages: managed  {
createdAt  : Timestamp @cds.on.insert : $now;
createdBy  : User      @cds.on.insert : $user;
modifiedAt : Timestamp @cds.on.insert : $now  @cds.on.update : $now;
modifiedBy : User      @cds.on.insert : $user @cds.on.update : $user;
key GTMID : Integer;
Practice : association to MCPractices;
PackageType : association to MCPackageTypes;
PackageTitle : String;
umbrellaTitle : String;
GTMStatus : association to MCGTMStatuses;
GTMResponsible : association to MDUsers;
Technologies: association to many TXTechnologies  on Technologies.GTMID = $self;
SolPros: association to many TXSolPros on SolPros.GTMID = $self;
Industries: association to many TXIndustries on Industries.GTMID = $self;
Phases: association to many TXPhases on Phases.GTMID = $self;
Comments : String;
Folderlink : String;
}
entity TXTechnologies {
key GTMID : association to TXPackages;
key Value : association to MDTechnologies;
text : String
}
entity TXSolPros {
key GTMID : association to TXPackages;
key Value : association to MCSolutionProcesses;
text : String
}
entity TXIndustries {
key GTMID : association to TXPackages;
key Value : association to MCIndustries;
text : String
}
entity TXPhases {
key GTMID : association to TXPackages;
key Value : association to MCPhases;
text : String
}




entity MCPhases {
key ID : Integer;
Text : String
}
entity MCPractices {
key ID : Integer;
Text : String
}
entity MDUsers {
key ID : String;
Name : String
}
entity MDTechnologies {
key ID : Integer;
Text : String
}
entity MCSolutionProcesses {
key ID : Integer;
Text : String
}
entity MCIndustries {
key ID : Integer;
Text : String
}

entity MCPackageTypes {
key ID : Integer;
Text : String
}

entity MCGTMStatuses {
key ID : Integer;
Text : String
}