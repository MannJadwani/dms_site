import { ReactElement, useEffect, useState } from "react";
import useGlobalContext from "../../../GlobalContext";
import { FieldAttributesList, FieldValues, FormDialogTypes, UserSuggestionsList } from "DataTypes";

import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import RequiredFieldsNote from "../BasicComponents/RequiredFieldsNote";
import { SubmitButtonStyling } from "../BasicComponents/PurpleButtonStyling";

import ComboboxField from "../FormFieldComponents/ComboboxField";
import TextField from "../FormFieldComponents/TextField";
import { CircularProgress } from "@mui/material";

type FormDialogProps = {
  index:number, type:FormDialogTypes, edit?:boolean, 
  triggerText:string|ReactElement, triggerClassName?:string, 
  formSize:"small"|"medium"|"large", formTitle:string, submitButton:string, formSubmit:Function, 
  form:FieldAttributesList, 
  currentFields:FieldValues, repeatFields?:boolean,
}

enum FormSizes {
  small= "min-w-[600px] min-h-[300px]",
  medium= "min-w-[800px] min-h-[300px]",
  large= "min-w-[1000px] min-h-[300px]",
};  

function FormDialogTeam(props:FormDialogProps){
  const [open, setOpen] = useState(false);
  const [prefillValues, setPrefillValues] = useState<FieldValues>({});
  const [errorMessage, setErrorMessage] = useState(<></>);
  const [submitButtonText, setSubmitButtonText] = useState(<span>{props.submitButton}</span>);

  useEffect(()=>{
    if (!open)
      setPrefillValues({});
  },[open]);

  const teamMembersRenamingWhileSubmitting = () => {
    const data:FieldValues={};
    data["_id"]=prefillValues["_id"];
    data["N"]=prefillValues["N"];
    data["L"]=prefillValues["L"];
    const sections = ["TD","CD","C","CP","CS","PD"];
    for (let i=0; i<sections.length; i++){
      const section = sections[i];
      const obj = prefillValues[section];
      if (!prefillValues[`${section}M`])
        data[`${section}M`] = obj["M"];
      else
        data[`${section}M`] = prefillValues[`${section}M`].map((obj:any)=>obj.values["E"])
      if (!prefillValues[`${section}C`])
        data[`${section}C`] = obj["C"];
      else
      data[`${section}C`] = prefillValues[`${section}C`].map((obj:any)=>obj.values["E"])

    }
    //console.log("teamMembersRenamingWhileSubmitting result",data);
    return data;
  }

  const findMissingFields = () => {
    const data:any={};
    for (let i=0; i<props.form.length; i++){
      const field = props.form[i];
      if (field.category=="single")
        data[field.id] = field["required"]?true:false;
      else if (field.category=="grid"){
        for (let j=0; j<field.fields.length; j++){
          const gridField = field.fields[j];
          data[gridField.id] = gridField["required"]?true:false;
        }
      }
    }
    return data;
  }

  const validateRequiredFields=()=>{
    const requiredList = findMissingFields();
    let data;
    for (let i=0;i<Object.keys(requiredList).length;i++){
      let key = Object.keys(requiredList)[i];
      let value = requiredList[key];
      data = (props.type=="team" && props.edit)?teamMembersRenamingWhileSubmitting():{...prefillValues};

      if (key=="P" && props.edit)
        continue;
      
      //console.log("RECENTLY ASSIGEND DATA",data);
      if (value && (!(Object.keys(data).includes(key)) || data[key]=="" || data[key]==-1)){
        setErrorMessage(<p className="text-red-600">Please fill all required fields.</p>);
        return false;
      }
    }

    setErrorMessage(<></>);
    if (props.type=="team" && props.edit)
      return data;
    return true;
  }

  const submitFunction = async () => {
    let okToSubmit = validateRequiredFields();
    let submittedData:any = false;
    //console.log("VALIDATED",okToSubmit);
    if (typeof okToSubmit!="boolean"){
      submittedData=okToSubmit;
      okToSubmit=true;
    }
    if(okToSubmit){
      //console.log("prefillValues",prefillValues)
      setSubmitButtonText(<CircularProgress className="mt-1" sx={{color:"white"}} />);
      const res = await props.formSubmit(submittedData==false?{...prefillValues}:submittedData,props.index);
      setSubmitButtonText(<span>{props.submitButton}</span>)
      if (res==200)
        setOpen(false);
      else if (res==422)
        setErrorMessage(<p className="text-red-600">Already exists.</p>);
      else 
        setErrorMessage(<p className="text-yellow-600">Something went wrong.</p>);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen} key={props.index}>
      <DialogTrigger className={props.triggerClassName||""}>{props.triggerText}</DialogTrigger>
      {open
        ?<DialogContent className={`bg-white overflow-y-scroll max-h-screen ${FormSizes[props.formSize]} `}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-normal">{props.formTitle}</DialogTitle>
            <hr/>
          </DialogHeader>
            <RequiredFieldsNote />
            <RenderForm key={"f0"} edit={props.edit||false} formType={props.type} currentFields={props.currentFields} form={props.form} prefillValues={{...prefillValues}} setPrefillValues={setPrefillValues} />
            {errorMessage}
            <br/>
            <div className="flex flex-row">
              <div className="flex-auto"></div>
              <DialogClose className="text-custom-1 border border-custom-1 rounded-xl h-12 w-36 mx-2 align-middle">Cancel</DialogClose>
              <button className={`float-right ${SubmitButtonStyling}`} type="button" onClick={()=>submitFunction()} >
                {submitButtonText}
              </button>
            </div>
        </DialogContent>
        :<></>
      }
    </Dialog>
  )
}

function RenderForm(props:{ edit:boolean, formType:FormDialogTypes, currentFields:FieldValues, form:FieldAttributesList, prefillValues:FieldValues, setPrefillValues:Function}){
  const [leaderSuggestions, setLeaderSuggestions] = useState<UserSuggestionsList>([]);
  const [memberSuggestions, setMemberSuggestions] = useState<UserSuggestionsList>([]);
  const [leaderSelected, setLeaderSelected] = useState(false);
  const [teamMembers, setTeamMembers] = useState<FieldValues>({});

  const {getUserSuggestions, getSingleTeam} = useGlobalContext();

  const filterSuggestions = (suggestionsList:FieldValues[]) => {
    const arr:UserSuggestionsList=[]
    for (let i=0; i<suggestionsList.length; i++){
      const obj = suggestionsList[i];
      arr.push({label:`${obj.N}<${obj.E}>`, values:obj})
    }
    return arr;
  }

  const getLeaderSuggestions = async () => {
    const res = await getUserSuggestions("RM");
    if (res.status==200){
      const arr = filterSuggestions(res.obj)
      setLeaderSuggestions(arr);
    }
    else
      setLeaderSuggestions([]);
  }

  const getMemberSuggestions = async () => {
    const leadName = props.edit?props.prefillValues["L"]:props.prefillValues["L"].values["E"];
    console.log("leadName",leadName);
    const res = await getUserSuggestions("TL",leadName);
    console.log("member data", res);
    if (res.status==200){
      const arr = filterSuggestions(res.obj);
      setMemberSuggestions(arr);
    }
    else
      setMemberSuggestions([]);
  }

  const getTeamData = async () => {
    const res = await getSingleTeam(props.currentFields["_id"]);
    if (res.status==200){
      res.obj["_id"]=props.currentFields["_id"];
      props.setPrefillValues({...res.obj});
      getLeaderSuggestions();
    }
    else
      props.setPrefillValues({});
  }

  const teamMembersCombinedToSeparate = () => {
    const data:any={};
    data["_id"]=props.prefillValues["_id"];
    data["L"]=props.prefillValues["L"];
    const sections = ["TD","CD","C","CP","CS","PD"];
    for (let i=0; i<sections.length; i++){
      const section = sections[i];
      const obj = props.prefillValues[section];
      data[`${section}M`] = obj["M"];
      data[`${section}C`] = obj["C"];
    }
    setTeamMembers(data);
  }
  
  useEffect(()=>{
    if (props.edit)
      getTeamData();
    else
      getLeaderSuggestions();
  },[]);

  useEffect(()=>{
    if (props.edit && Object.keys(props.prefillValues).length!=0)
      teamMembersCombinedToSeparate();

    if (props.prefillValues && props.prefillValues["L"]){
      setLeaderSelected(true);
      getMemberSuggestions();
    }
    //console.log("new prefillvalues",props.prefillValues)
  },[props.prefillValues]);

  useEffect(()=>{
    props.setPrefillValues({...props.currentFields});
  },[props.currentFields]);


  return (
    props.form.map((field,index)=>{
      if (field.category=="label"){
        return <div key={"label"}>
        {leaderSelected?<></>:<div>Please select a team lead before selecting members</div>}
        <div key={index} className={field.sectionClassName}>{field.name}</div>
        </div> 
      }
      else if (field.category=="grid"){
        return(
          <div key={index+"grid"}>
            <div key={index+"grid name"} className={field.sectionClassName||""}>{field.sectionName}</div>
            <div key={index+"gridz"} className={`grid grid-cols-${field.row}`}>
              {field.fields.map((item, itemIndex)=>{
                if (item.type=="combobox"){
                  let disableTeam = false;
                  if ((item.id!="L" && !leaderSelected))
                    disableTeam=true;

                  const immutable = item.immutable==undefined?false:item.immutable
                  const disabled = item.disabled==undefined?false:item.disabled;
                  if (item.id=="L")
                    console.log(item.id,"is disabled", "disabled:",disabled, "immutable",immutable, "disableTeam", disableTeam,"final", (disabled||immutable) && disableTeam)
                  return <span key={index+"_"+itemIndex} className="mr-3">
                    <ComboboxField key={index} index={index} id={item.id} name={item.name} edit={props.edit}
                      required={item.required} disabled={disabled||immutable&&disableTeam} 
                      prefillValue={props.formType=="user"?props.prefillValues[item.id]:teamMembers[item.id]} setPrefillValues={props.setPrefillValues} multiple={item.multiple} suggestions={item.id=="L"?leaderSuggestions:memberSuggestions}
                    />
                  </span>
                }
                else
                  return <span key={index+"_"+itemIndex} className="mr-3">
                    <TextField key={index} index={index} id={item["id"]} name={item["name"]} type={item["type"]}
                      required={item["required"]} disabled={item["disabled"]||(item["immutable"]&&props.edit)} 
                      prefillValues={props.prefillValues} setPrefillValues={props.setPrefillValues} 
                    />
                  </span>
              })}
            </div>
          </div> 
        )
      }
    })
  )
}

export default FormDialogTeam;