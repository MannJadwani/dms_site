import { TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { PriorityValues, PriorityStyling,DocumentStatusValues, DocumentStatusStyling, UserStatusValues, UserStatusStyling, UserRoles } from "./Constants";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";

import chevron_down from "./../static/chevron-down.svg";

function HeaderRows(props:any){
  return(
    <TableHeader>
      <TableRow>
      {props.headingRows.map((heading:any)=>{
        return <TableHead className={heading.length>1?heading[1]:""}>{heading[0]}</TableHead>
      })}
      </TableRow>
    </TableHeader>
  )
}

function BodyRowsMapping(props:any){
  return(
    <TableBody>
      {props.list.map((singleRow:any, index:number)=>{
        let searchValid = true;
        if (props.searchRows.length>0){
          searchValid = false;
          const regEx = new RegExp(props.searchRows[0], "i");
          for (let i=1; i<props.searchRows.length; i++)
            if ((singleRow[props.searchRows[i]]+"").search(regEx)!==-1)
            searchValid=true;
        }

        let filterValid = true
        if (props.filterRows.length>0){
          filterValid = false;
          const filter = props.filterRows[0];
          for (let i=1; i<props.filterRows.length; i++)
            if ((singleRow[props.filterRows[i]]+"")==filter)
            filterValid = true;
        }

        if (searchValid && filterValid)
          return <SingleRow singleRow={singleRow} cellClassName={props.cellClassName} dataType={props.dataType} action={props.action} rowIndex={index}/>
        else
          return <></>
      })}
    </TableBody>
  )
}

function SingleRow(props:any){
  return(
    <TableRow>
      {props.dataType.map((dataType:any, index:number)=>{
        let cellClassName="";
        if (props.cellClassName)
          cellClassName = props.cellClassName[index]
        
        if (dataType=="action")
          return handleAction(props.action[props.rowIndex], cellClassName)

        const item = props.singleRow[index];
        if (dataType=="text")
          return handleText(item, cellClassName);
        if (dataType=="priority")
          return handlePriority(Number(item), cellClassName);
        if (dataType=="docStatus")
          return handleDocStatus(Number(item), cellClassName);
        if (dataType=="userStatus")
          return handleUserStatus(Number(item), cellClassName);
        if (dataType=="role")
          return handleRole(Number(item), cellClassName);    
      })}
    </TableRow>
  )
}

const handleText = (item:String, cellClassName:string) => {
  return <TableCell className={cellClassName}>{item}</TableCell>
}

const handlePriority = (index:number, cellClassName:string) => {
  return(
    <TableCell>
      <div className={`${PriorityStyling[index]} rounded-lg text-center ${cellClassName}`}>
        {PriorityValues[index]}
      </div>
    </TableCell>
  )
}

const handleDocStatus = (index:number, cellClassName:string) => {
  return(
    <TableCell className={`${DocumentStatusStyling[index]} ${cellClassName}`}>
      {DocumentStatusValues[index]}
    </TableCell>
  )
}

const handleUserStatus = (index:number, cellClassName:string) => {
  return (
    <TableCell className={cellClassName}>
      <DropdownMenu>
      <DropdownMenuTrigger className={`${UserStatusStyling[index]} w-28 h-10 text-center rounded-xl `}>
        <div className="flex flex-row w-full" >
          <p className=" m-auto">{UserStatusValues[index]}</p>
          <img className="mr-2" src={chevron_down} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white">
        <DropdownMenuItem className="bg-white text-red-600">{UserStatusValues[0]}</DropdownMenuItem>
        <DropdownMenuItem className="bg-white text-green-600">{UserStatusValues[1]}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </TableCell>
  )
}

const handleRole = (index:number, cellClassName:string) => {
  return <TableCell className={cellClassName}>{UserRoles[index]}</TableCell>
}

const handleAction = (action:any, cellClassName:string) => {
  return <TableCell className={cellClassName}>{action}</TableCell>
}

export { HeaderRows, BodyRowsMapping }

/* 
  props to HeaderRows:
    headingRows= [
      ["Title","text-white bg-white"],
      ["Name"],
    ],

  props to BodyRows:
    bodyRows = [
      [row1 Style, ROw1 Label],
      [Row2 Style, Row2 Label]
    ]

  props to BodyRowsMapping:
    list = {[
      [singleRow1],
      [singleRow2]
    ]}  REQ
    dataType =  ["text", "priority"]  cloumn data type  REQ
    searchRows = [] if searchString is "", else [searchString, 0,1] do regExp search in columns 0 and 1  REQ
    filterRows = [[priority, 2], [companyName, 1]]  REQ
    action ={<>Component to be rendered</>}
    cellClassName={["Styling for Col1", "Styling for Col2"]}
 */



/* 
Data Types:
  text
  Priority Label
  Document Status
  User Status
  Action (Custom)
 */