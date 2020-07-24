using { GTM.dataModel as dataModel, sap.common } from '../db/data-model';

service CatalogService {
  entity Packages  as projection on dataModel.TXPackages;
entity Technologies as projection on dataModel.TXTechnologies;
entity SolProcesses as projection on dataModel.TXSolPros;
entity Industries as projection on dataModel.TXIndustries;
entity Phases as projection on dataModel.TXPhases;
entity Phases_all as projection on dataModel.MCPhases ;
entity Practices_all as projection on dataModel.MCPractices ;
entity Users_all as projection on dataModel.MDUsers ;
entity Technologies_all as projection on dataModel.MDTechnologies;
entity SolutionProcesses_all as projection on dataModel.MCSolutionProcesses ;
entity Industries_all as projection on dataModel.MCIndustries ;
entity PackageTypes_all as projection on dataModel.MCPackageTypes;
entity GTMStatuses_all as projection on dataModel.MCGTMStatuses ;
entity PackageView as  
select from dataModel.PackagesView  { * , key GTMID } 
}