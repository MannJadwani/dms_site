//import { useEffect } from "react";
import FieldLabel from "./FieldLabel";

function SelectField (props:{index:number|string, id:string, name: string, options: string[]|readonly string[], required?:boolean, disabled?:boolean, prefillValues:any, setPrefillValues:Function, repeatFields?:boolean, formIndex?:number, sectionType?:string, setFileType?:Function, setCovType?:Function, setOldZone?:Function}){
  //useEffect(()=>console.log(props),[props]);

  return(
    <div key={props.index} className="mb-5 mx-2">
      <FieldLabel key={props.index+"s_1"} index={props.index} id={props.id} name={props.name} required={props.required} disabled={props.disabled} />
      <br/>
      <select key={props.index+props.id+"s_2"} 
        id={props.id} 
        className="bg-white border rounded-if w-full h-10/12 p-4"
        required={props.required} disabled={props.disabled}
        value={props.repeatFields && props.formIndex!=null
          ?props.prefillValues[props.formIndex] && props.prefillValues[props.formIndex][props.id]
            ?props.prefillValues[props.formIndex||0][props.id]
            :""
          :props.prefillValues[props.id]
            ?props.prefillValues[props.id]
            :""
        }
        
        onChange={props.repeatFields && props.formIndex!=null
          ?(e)=>{
            props.setPrefillValues((curr:any)=>{
              curr[props.formIndex||0][props.id]=e.target.value;
              return [...curr];
            })}
          :(e)=>{
            const val = e.target.value;
            
            props.setPrefillValues((curr:any)=>{curr[props.id]=val; return {...curr}});
            
            if (props.id=="T" && props.setFileType){
              props.setFileType(val);
              if (props.setCovType && props.sectionType=="cov")
                props.setCovType(val);
            }
            else if (props.setOldZone && props.id=="Z")
              props.setOldZone(props.prefillValues["Z"]);
          }
        }
      >
        <option key={props.index+"_0"} value={""} disabled>Select {props.name}</option>
        {props.options.map((option:any,optionIndex:any)=>{
            if (optionIndex!=0)
          return <option key={props.index+"_"+optionIndex} value={option}>{option}</option>
        })}
      </select>
    </div>
  )
};

export default SelectField