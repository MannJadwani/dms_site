import { FormFieldAttributes } from "DataTypes";
import { DocumentSectionTypes } from "../../DocumentSectionAttributes";

import FieldLabel from "./FieldLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select/Select";
import { useEffect, useState } from "react";

function SelectField (props:{index:number|string,fieldData:FormFieldAttributes, prefillValues:any, setPrefillValues:Function, repeatFields?:boolean, formIndex?:number, sectionType?:DocumentSectionTypes, setFileType?:Function, setCovType?:Function, setOldZone?:Function, disabled:boolean, error?:boolean, readonly?:boolean}){
  //useEffect(()=>console.log(props),[props]);
  const [value, setValue] = useState("");
  const [error, setError] = useState(props.error);

  useEffect(()=>{
    setValue(props.repeatFields && props.formIndex!=null
      ?props.prefillValues[props.formIndex] && props.prefillValues[props.formIndex][props.fieldData.id]
        ?props.prefillValues[props.formIndex||0][props.fieldData.id]
        :""
      :props.prefillValues[props.fieldData.id]
        ?props.prefillValues[props.fieldData.id]
        :"")
  },[props]);

  useEffect(()=>setError(props.error),[props.error]);

  return(
    <div key={props.index} className="mb-5 mx-2">
      <FieldLabel key={props.index+"s_1"} index={props.index} id={props.fieldData.id} name={props.fieldData.name} required={props.fieldData.required} disabled={props.disabled} />
      <br/>
      <Select key={props.index+props.fieldData.id+"s_3"+value}  error={error}
        color="secondary"
        id={props.fieldData.id} className={`bg-white w-full`}
        required={props.fieldData.required} disabled={props.disabled}

        sx={props.readonly?{"& .MuiOutlinedInput-input.Mui-disabled":{WebkitTextFillColor:"black"}}:{}}

        displayEmpty
        inputProps={{ 'aria-label': 'Without label' }}

        defaultValue={value}
        
        onChange={props.repeatFields && props.formIndex!=null
          ?(e)=>{
            setError(false);
            props.setPrefillValues((curr:any)=>{
              curr[props.formIndex||0][props.fieldData.id]=e.target.value;
              return [...curr];
            })
          }
          :(e)=>{
            setError(false);
            const val = e.target.value;
            props.setPrefillValues((curr:any)=>{curr[props.fieldData.id]=val; return {...curr}});
            if (props.setCovType && props.sectionType=="covenant" && props.fieldData.id=="T")
              props.setCovType(val);
            else if (props.setOldZone && props.fieldData.id=="Z")
              props.setOldZone(props.prefillValues["Z"]);
          }
        }
      >
        <MenuItem  key={props.index+"_0"} value={""} disabled><em>Select {props.fieldData.name}</em></MenuItem>
        {(props.fieldData.options||[]).map((option:any,optionIndex:any)=>{
          if (optionIndex!=0)
            return <MenuItem key={props.index+"_"+optionIndex} value={option}>{option}</MenuItem>
        })}
      </Select>
          
    </div>
  )
};

export default SelectField;


{/* <select key={props.index+props.fieldData.id+"s_2"} 
        id={props.fieldData.id} 
        className="bg-white border rounded-if w-full h-10/12 p-3.5"
        required={props.fieldData.required} disabled={props.disabled}
        value={props.repeatFields && props.formIndex!=null
          ?props.prefillValues[props.formIndex] && props.prefillValues[props.formIndex][props.fieldData.id]
            ?props.prefillValues[props.formIndex||0][props.fieldData.id]
            :""
          :props.prefillValues[props.fieldData.id]
            ?props.prefillValues[props.fieldData.id]
            :""
        }
        
        onChange={props.repeatFields && props.formIndex!=null
          ?(e)=>{
            props.setPrefillValues((curr:any)=>{
              curr[props.formIndex||0][props.fieldData.id]=e.target.value;
              return [...curr];
            })}
          :(e)=>{
            const val = e.target.value;
            
            props.setPrefillValues((curr:any)=>{curr[props.fieldData.id]=val; return {...curr}});
            if (props.setCovType && props.sectionType=="cov" && props.fieldData.id=="T")
              props.setCovType(val);
            
            else if (props.setOldZone && props.fieldData.id=="Z")
              props.setOldZone(props.prefillValues["Z"]);
          }
        }
      >
        <option key={props.index+"_0"} value={""} disabled>Select {props.fieldData.name}</option>
        {(props.fieldData.options||[]).map((option:any,optionIndex:any)=>{
            if (optionIndex!=0)
          return <option key={props.index+"_"+optionIndex} value={option}>{option}</option>
        })}
      </select> */}
