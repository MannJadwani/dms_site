import { FieldValues } from "DataTypes";

//Masters
const LoanProductList:string[] = ["-"];
const ZoneList:string[] = ["-"];
const FileTypeList:string[] = ["-", "PDF", "DOCX", "XLSX", "CSV", "PNG", "JPEG"];
const UserRoleList:string[] = ["-"];
const IndustryList:string[] = ["-"];/* , "Real Estate","NBFC", "NBFC-MFI", "Bank", "Diversified Conglomerate", "Education", "Healthcare & Pharma", "Hospitality Manufacturing", "Renewable Energy", "Roads", "Commercial Space", "Others" */
const LoanTypeList:string[] = ["-", "Long Term", "Short Term"];
const DocumentRejectionReasonList:string[] = ["-","Document is expired", "Document is incomplete", "Document is irrelevant"];

//Statuses
const PriorityList =["-", "Low", "Medium", "High"] as const;
const UserStatusList = ["-", "Unverified", "Active", "Inactive"] as const;
const TeamStatusList = ["-", "Active", "Inactive"] as const;
const DocumentStatusList = ["-", "Pending", "In progress", "Verified", "Rejected", "Overdue"] as const;
const FileStatusList = ["-", "Pending",  "Verified"] as const;

//Basics
const FrequencyList:string[] = ["-", "Monthly", "Quarterly", "Half-Yearly", "Yearly"];
const LoanSecuredList:string[] = ["-","Secured","Unsecured"];
const YesOrNoList:string[] = ["-", "Yes","No"];
const HolidayConventionList:string[] = ["-","Precedent","Subsequent","None"];
const InterestTypeList:string[] = ["-", "Fixed","Manual"];

//Loan Details
const ProjectStatusList:string[] = ["-","Not Started","In Progress","Finished"];
const DSRAFormList:string[] = ["-","LC","BG", "FD"];
const LoanSecurityTypeList:string[] = ["-","[PLACEHOLDER DATA] Type A","[PLACEHOLDER DATA] Type B"];
const BankAccountTypeList:string[] = ["-", "Saving", "Current"];

//Contact Details
const ContactTypeList:string[] = ["-", "Borrower" , "Promotor", "Lender", "Lender Agent", "Legal Council", "Banks Legal Team", "Lender Insurance Agent", "Lenders Independent Engineer"];
const EmailRecipientList:string[] = ["-","To", "Cc","Bcc"];

//Ratings
const RatingAgencyList:string[] = ["-", "ICRA", "CRISIL"];
const RatingTypeList:string[] = ["-", "Provisional","Final"];
const RatingOutlookList:string[] = ["-", "Negative", "Stable", "Positive"];

//Documents
const TransactionCategoryList:string[] = ["-", "Common Loan Agreements","Security Trustee Agreement","Lenders Agent Agreement","Escrow Agreement","Substitution Agreement","Subordination Agreement","Supplementary Escrow Agreement","Sponsors Undertakings","Security documents","Pledge Agreement","Consent to Assignment","Trust and Retention Account Agreement"];
const ComplianceCategoryList:string[] = ["-","Common Loan Agreement", "Lenders' Agent Agreement", "Power Purchase Agreement", "Escrow Agreement", "Subordinate Agreement", "Supplementary Escrow Agreement"];

const CovenantCategoryList:string[] = ["-", "Financial Covenant","Non-Financial Covenant"];
const CovenantTypeList:string[] = ["-", "Periodic", "Event-Based"];

const ConditionPrecedentCategoryList:string[] = ["-", "[PLACEHOLDER DATA] Condition A", "[PLACEHOLDER DATA] Condition B"];
const ConditionSubsequentCategoryList:string[] = ["-", "[PLACEHOLDER DATA] Condition A", "[PLACEHOLDER DATA] Condition B"];

const MastersMapping:FieldValues = {
  "-":"-",
  "Zone":ZoneList,
  "Loan Product":LoanProductList,
  "File Types":FileTypeList,
  "Industry":IndustryList,
  "Loan Types":LoanTypeList,
  "Security Types":LoanSecurityTypeList,
  "Transaction Document Categories":TransactionCategoryList,
  "Compliance Document Categories":ComplianceCategoryList,
  "Condition Precedent Categories":ConditionPrecedentCategoryList,
  "Condition Subsequent Categories":ConditionSubsequentCategoryList,
}

export { MastersMapping,
  LoanProductList, ZoneList, FileTypeList, UserRoleList, IndustryList, LoanTypeList, DocumentRejectionReasonList, 
  PriorityList,UserStatusList,TeamStatusList,DocumentStatusList,FileStatusList,
  InterestTypeList, FrequencyList, LoanSecuredList, YesOrNoList, HolidayConventionList,
  ProjectStatusList,DSRAFormList, LoanSecurityTypeList,BankAccountTypeList, 
  ContactTypeList, EmailRecipientList,
  RatingAgencyList,RatingTypeList,RatingOutlookList,
  TransactionCategoryList,ComplianceCategoryList,
  CovenantCategoryList,CovenantTypeList,
  ConditionPrecedentCategoryList,ConditionSubsequentCategoryList
};