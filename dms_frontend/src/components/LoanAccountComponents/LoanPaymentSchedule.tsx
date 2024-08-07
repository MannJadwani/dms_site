import { useEffect, useState } from "react";
import moment from "moment";
import { FrequencyList, HolidayConventionList, InterestTypeList } from "./../../../Constants";
import { FieldValues, GridFieldAttributes, LoanCommonProps } from "./../../../DataTypes";
import useGlobalContext from "./../../../GlobalContext";

import {Dialog,DialogTitle,DialogContent} from '@mui/material';
import { DataTable } from "../BasicComponents/Table";

import DateField from "../FormFieldComponents/DateField";
import IntegerField from "../FormFieldComponents/IntegerField";
import RadioGroupField from "../FormFieldComponents/RadioGroupField";
import SelectField from "../FormFieldComponents/SelectField";
import { FormSectionNavigation } from "../FormComponents/FormSectionNavigation";
import FloatNumberField from "../FormFieldComponents/FloatNumberField";

function LoanPaymentSchedule(props:LoanCommonProps){
  const [fieldList] = useState<GridFieldAttributes>(
    {category:"grid", row:2, fields:[
      {id:"P", name:"Principal", type:"integer", required:true},
      {id:"F", name:"Frequency", type:"select", options:FrequencyList, required:true, immutable:true},
      {id:"SD", name:"Start Date", type:"date", required:true},
      {id:"ED", name:"End Date", type:"date", required:true},
      {id:"H", name:"Holiday Convention", type:"select", options:HolidayConventionList, required:true, immutable:true},
      {id:"T", name:"Interest Type (%)", type:"radio", options:InterestTypeList, required:true, immutable:true},
    ]},
  );

  const [fieldValues,setFieldValues] = useState<FieldValues>({T:InterestTypeList[1]});
  const [schedule, setSchedule] = useState<{D:string,I?:number|string}[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(<></>);
  const [installmentError, setInstallmentError] = useState(<></>);
  const [editMode, setEditMode] = useState(false);
  const [added, setAdded] = useState(true);

  const {addPaymentSchedule, getPaymentSchedule} = useGlobalContext();

  useEffect(()=>{
    if (added)
      getPaymentSchedule(props.loanId).then(res=>{
        //console.log("response",res);
        if (res.status==200)
          setAdded(false);
        if (res.status==200 && res.obj && Object.keys(res.obj).length!=0){
          setFieldValues(res.obj);
          setEditMode(true);
        }
      })
  },[added]);

  useEffect(()=>console.log("edit mode",editMode),[editMode])


  const validateFields = () => {
    for (let i=0; i<fieldList.fields.length; i++){
      const field = fieldList.fields[i];

      if (field.required && !fieldValues[field.id]){
        setErrorMessage(<p className="text-red-600 mx-3">Please fill all required fields.</p>);
        return;
      }
    }

    if (fieldValues["T"]==InterestTypeList[1] && !fieldValues["I"]){
      setErrorMessage(<p className="text-red-600 mx-3">Please fill all required fields.</p>);
      return;
    }

    setErrorMessage(<></>);

    if (fieldValues["T"]==InterestTypeList[1])
      fixedInterestSchedule();
    else if (fieldValues["T"]==InterestTypeList[2])
      manualInterestSchedule();
  }

  const validateInstallmentAmounts = () =>{
    for (let i=0; i<schedule.length; i++){
      if (schedule[i].I==""){
        setInstallmentError(<p className="text-red-600 mx-3">Please fill all required fields.</p>);
        return;
      }
    }
    setInstallmentError(<></>)
    submitSchedule(schedule);
  }

  const manualInterestSchedule = () =>{
    const arr = generateSchedule();
    setDialogOpen(true);
    setSchedule(arr);
  }

  const fixedInterestSchedule = () => {
    const arr = generateSchedule();
    setSchedule(arr);
    submitSchedule(arr);
  }

  const generateSchedule = () => {
    const arr=[];
    const startDate = Date.parse(fieldValues["SD"]);
    const endDate = Date.parse(fieldValues["ED"]);
    let date = startDate;
    let interval=1;
    if (fieldValues["F"]==FrequencyList[1])
      interval=1
    else if (fieldValues["F"]==FrequencyList[2])
      interval=3;
    else if (fieldValues["F"]==FrequencyList[3])
      interval=6;
    else if (fieldValues["F"]==FrequencyList[4])
      interval=12;

    const applyHolidayConvention = {
      [HolidayConventionList[1]]:-1,
      [HolidayConventionList[2]]:+1,
      [HolidayConventionList[3]]:0
    }
    
    while (date<=endDate){
      const curr_date=new Date(date)
      if (curr_date.getDay()==6)
        curr_date.setDate(curr_date.getDate()+ applyHolidayConvention[fieldValues["H"]]*2);
      else if (curr_date.getDay()==0)
        curr_date.setDate(curr_date.getDate()+ applyHolidayConvention[fieldValues["H"]]*1);
      
      arr.push({D:moment(curr_date).format("yyyy-MM-DD")});
      date = curr_date.setMonth(curr_date.getMonth()+interval);
    }

    return arr;
  }

  const submitSchedule = async (arr:{D:string, I?:number|string}[]) => {
    fieldValues["GS"] = arr;
    fieldValues["_loanId"] = props.loanId;
    fieldValues["P"] = Number(fieldValues["P"]);
    console.log("submitted", fieldValues);
    fieldValues["ND"] = arr[0]["D"];
    const res = await addPaymentSchedule(fieldValues);
    console.log("response",res)
    if (res==200){
      setDialogOpen(false);
      setFieldValues({});
      setErrorMessage(<p className="text-green-600">Schedule successfully generated.</p>);
      setAdded(true);
    }
    else{
      if (fieldValues["T"]==InterestTypeList[1])
        setInstallmentError(<p className="text-yellow-600">Something went wrong</p>)
      else
        setErrorMessage(<p className="text-yellow-600">Something went wrong</p>)
    }
  }

  return(
    <div>
      <div className="grid grid-cols-2">
        {fieldList.fields.map((field,index)=>{
          if (field.type=="integer")
            return <IntegerField key={index} index={index} id={field.id} name={field.name} required={field.required} prefillValues={fieldValues} setPrefillValues={setFieldValues} disabled={editMode&&field.immutable}/>
          else if (field.type=="date")
            return <DateField key={index} index={index} id={field.id} name={field.name} required={field.required} prefillValues={fieldValues} setPrefillValues={setFieldValues} disabled={editMode&&field.immutable} />
          else if (field.type=="select")
            return <SelectField key={index} index={index} id={field.id} name={field.name} options={field.options||[]} required={field.required} prefillValues={fieldValues} setPrefillValues={setFieldValues} disabled={editMode&&field.immutable} />
          else if (field.type=="radio")
            return <RadioGroupField key={index} index={index} id={field.id} name={field.name} options={field.options||[]} required={field.required} prefillValues={fieldValues} setPrefillValues={setFieldValues} disabled={editMode&&field.immutable} />
        })}
        {fieldValues["T"]!=InterestTypeList[2]
          ?<FloatNumberField key={5} index={5} id="I" name="Interest Rate (%)" prefillValues={fieldValues} setPrefillValues={setFieldValues} required />
          :""
        }
        <div className="my-10">
          <button className={`${fieldValues["T"]!=InterestTypeList[2]?"float-right":"float-left"} h-[45px] w-[180px] rounded-xl text-white text-lg bg-custom-1`} onClick={validateFields}>
            {fieldValues["T"]!=InterestTypeList[2]?"Generate Schedule":`${editMode?"Edit":"Enter"} Interest Rates`} 
          </button>
        </div>
      </div>
      <Dialog open={dialogOpen} onClose={()=>setDialogOpen(false)} maxWidth="md" fullWidth>
        {dialogOpen
          ?<>
            <DialogTitle>Enter Interest Rates</DialogTitle>
            <DialogContent>
              <DataTable 
                headingRows={["Installment Number","Installment Date", "Installment Interest Rate(%)"]} headingClassNames={["w-[30%]","w-[30%]",""]}
                tableData={schedule} columnIDs={["D","I"]} dataTypes={["index","date","text-field"]} cellClassName={["","","border-2 rounded-if h-8 float-left p-2"]}
                setValues={setSchedule} 
              />
              {installmentError}
              <button className="float-right my-9 h-[50px] w-[150px] rounded-xl text-white text-md bg-custom-1" onClick={()=>validateInstallmentAmounts()}>Generate Schedule</button>
            </DialogContent>
          </>
          :<></>
        }
      </Dialog>
      {errorMessage}
      <br />
      <FormSectionNavigation currentSection={props.currentSection} setCurrentSection={props.setCurrentSection} sectionCount={props.sectionCount} goToNextSection={props.goToNextSection} isForm={false} />
    </div>
  )
}

export default LoanPaymentSchedule;