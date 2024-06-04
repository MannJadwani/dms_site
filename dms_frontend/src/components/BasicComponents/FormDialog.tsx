import { useEffect, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ComboboxField, DateField, NumberField, RoleField, SelectField, TextAreaField, TextField } from "./FormFieldsDialog";
import { SubmitButtonStyling } from "./PurpleButtonStyling";
import RequiredFieldsNote from "./RequiredFieldsNote";
import useGlobalContext from "./../../../GlobalContext";

function FormDialog(props:{index:number, edit?:boolean, triggerText:any, triggerClassName?:string, formSize:"small"|"medium"|"large", formTitle:string, formSubmit:Function, submitButton:string, form:any, fieldValues:any, setter:Function, currentFields:any, repeatFields?:boolean, suggestions?:"AU"|"TT"|"UM" }){
  const [open, setOpen] = useState(false);
  const [prefillValues, setPrefillValues] = useState<any>({});
  const [errorMessage, setErrorMessage] = useState(<></>);
  const [suggestions, setSuggestions] = useState<any>([]);

  enum FormSizes {
    small= "min-w-[600px] min-h-[300px]",
    medium= "min-w-[800px] min-h-[300px]",
    large= "min-w-[1000px] min-h-[300px]",
  };

  const {getUserSuggestions} = useGlobalContext();

  useEffect(()=>{
    if (props.suggestions)
      getUserSuggestions(props.suggestions).then(res=>{
        const arr = res.map((obj:any)=> {return{label:`${obj.N}<${obj.E}>`, values:obj}})
        setSuggestions(arr);
      }).catch(()=>{
        setSuggestions([]);
      });
  },[]);


  const validateRequiredFields=()=>{
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

    for (let i=0;i<Object.keys(data).length;i++){
      const key = Object.keys(data)[i];
      const value = data[key];
      if (value && (!(Object.keys(prefillValues).includes(key)) || prefillValues[key]=="" || prefillValues[key]==-1)){
        setErrorMessage(<p className="text-red-600">Please fill all required fields.</p>);
        return false;
      }
    };

    setErrorMessage(<></>);
    return true;
  }

  const submitFunction = () => {
    const okToSubmit = validateRequiredFields();
    if(okToSubmit){
      //console.log("pre submit prefil values", prefillValues);
      props.formSubmit(prefillValues);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} key={props.index}>
      <DialogTrigger className={props.triggerClassName||""}>{props.triggerText}</DialogTrigger>
      <DialogContent className={`bg-white overflow-y-scroll max-h-screen ${FormSizes[props.formSize]} `}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-normal">{props.formTitle}</DialogTitle>
          <hr/>
        </DialogHeader>
          <RequiredFieldsNote />
          <RenderForm key={"f0"} setter={props.setter} edit={props.edit||false} currentFields={props.currentFields} fieldValues={props.fieldValues} form={props.form} prefillValues={{...prefillValues}} setPrefillValues={setPrefillValues} suggestionsList={props.suggestions?suggestions:[]} />
          {errorMessage}
          <br/>
          <div className="flex flex-row">
            <div className="flex-auto"></div>
            <DialogClose className="text-custom-1 border border-custom-1 rounded-xl h-12 w-36 mx-2 align-middle">Cancel</DialogClose>
            <button className={`float-right ${SubmitButtonStyling}`} type="button" onClick={()=>submitFunction()} >
              {props.submitButton}
            </button>
          </div>
      </DialogContent>
    </Dialog>
  )
}

function RenderForm(props:{setter:Function, edit:boolean, currentFields:any, fieldValues:any, form:any, prefillValues:any, setPrefillValues:Function, suggestionsList?:any}){
  useEffect(()=>{
    if (props.edit)
      props.setPrefillValues(props.currentFields);
    else
    props.setPrefillValues(props.fieldValues);
  },[props.fieldValues,props.currentFields]);

  return (
    props.form.map((field:any,index:number)=>{
      if (field["category"]=="label"){
        return <div key={index} className={field["sectionClassName"]}>{field["name"]}</div>
      }
      else if (field["category"]=="single"){
        if (field["type"]=="combobox")
          return <ComboboxField key={index} index={index} id={field["id"]} name={field["name"]}
            required={field["required"]} disabled={field["disabled"]?true:(field["immutable"]?(props.edit&&true):false)} 
            prefillValues={props.prefillValues} setPrefillValues={props.setPrefillValues} multiple={field["multiple"]} suggestions={props.suggestionsList}
          />
        else if (field["type"]=="role")
          return <RoleField key={index} index={index} id={field["id"]} name={field["name"]} 
            required={field["required"]} disabled={field["disabled"]?true:(field["immutable"]?(props.edit&&true):false)} 
            prefillValues={{...props.prefillValues}} setPrefillValues={props.setPrefillValues} 
          />
        else if (field["type"]=="textarea")
          return <TextAreaField key={index} index={index} id={field["id"]} name={field["name"]} 
            required={field["required"]} disabled={field["disabled"]?true:(field["immutable"]?(props.edit&&true):false)} 
            prefillValues={props.prefillValues} setPrefillValues={props.setPrefillValues}
          />
        else if (field["type"]=="date")
          return <DateField key={index} index={index} id={field["id"]} name={field["name"]} 
            required={field["required"]} disabled={field["disabled"]?true:(field["immutable"]?(props.edit&&true):false)} 
            prefillValues={props.prefillValues} setPrefillValues={props.setPrefillValues} repeatField={field["repeatable"]}
          />
        else if (field["type"]=="number")
          return <NumberField key={index} index={index} id={field["id"]} name={field["name"]} 
            required={field["required"]} disabled={field["disabled"]?true:(field["immutable"]?(props.edit&&true):false)} 
            prefillValues={props.prefillValues} setPrefillValues={props.setPrefillValues}  repeatField={field["repeatable"]}
          />
        else if (field["type"]=="select") 
          return <SelectField key={index} index={index} id={field["id"]} name={field["name"]} options={field["options"]}
            required={field["required"]} disabled={field["disabled"]?true:(field["immutable"]?(props.edit&&true):false)} 
            prefillValues={props.prefillValues} setPrefillValues={props.setPrefillValues} repeatField={field["repeatable"]}
          />
        else
          return <TextField key={index} index={index} id={field["id"]} name={field["name"]} type={field["type"]}
            required={field["required"]} disabled={field["disabled"]?true:(field["immutable"]?(props.edit&&true):false)} 
            prefillValues={props.prefillValues} setPrefillValues={props.setPrefillValues} repeatField={field["repeatable"]}
          />
      }
      else if (field["category"]=="grid"){
        let gridStyle = "grid grid-cols-"; 
        if (field["customWidth"])
          gridStyle = "flex flex-row"
        else
          gridStyle = gridStyle + field["row"];
        return(
          <div key={index+"grid"}>
            <div key={index+"grid name"} className={field["sectionClassName"]||""}>{field["sectionName"]}</div>
            <div key={index+"gridz"} className={gridStyle}>
              {field.fields.map((item:any, itemIndex:number)=>{
                if (item["type"]=="combobox")
                  return <span key={index+"_"+itemIndex} className="mr-3">
                    <ComboboxField key={index} index={index} id={item["id"]} name={item["name"]}
                      required={item["required"]} disabled={item["disabled"]?true:(item["immutable"]?(props.edit&&true):false)} 
                      prefillValues={props.prefillValues} setPrefillValues={props.setPrefillValues} multiple={item["multiple"]} suggestions={props.suggestionsList}
                    />
                  </span> 
                else if (item["type"]=="select")
                  return <span key={index+"_"+itemIndex} className="mr-3">
                    <SelectField key={index} index={index} id={item["id"]} name={item["name"]} options={item["options"]}
                      required={item["required"]} disabled={item["disabled"]?true:(item["immutable"]?(props.edit&&true):false)} 
                      prefillValues={props.prefillValues} setPrefillValues={props.setPrefillValues} 
                    />
                  </span>
                else
                  return <span key={index+"_"+itemIndex} className="mr-3">
                    <TextField key={index} index={index} id={item["id"]} name={item["name"]} type={item["type"]}
                      required={item["required"]} disabled={item["disabled"]?true:(item["immutable"]?(props.edit&&true):false)} 
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

export default FormDialog;