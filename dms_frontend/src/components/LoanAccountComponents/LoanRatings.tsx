import { useEffect, useState } from "react";
import useGlobalContext from "../../../GlobalContext";
import { RatingAgencyList, RatingOutlookList, RatingTypeList } from "../../../Constants";
import { FieldValues, FieldAttributesList, LoanCommonProps, ToastOptionsAttributes } from "DataTypes";

import { DataTable } from "../BasicComponents/Table";
import FormDialog from "../FormComponents/FormDialog";
import { FormSectionNavigation } from "../FormComponents/FormSectionNavigation";
import EmptyPageMessage from "../BasicComponents/EmptyPageMessage";
import LoadingMessage from "../BasicComponents/LoadingMessage";

import { CreateButtonStyling } from "../BasicComponents/PurpleButtonStyling";
import Toast from "../BasicComponents/Toast";
//import Search from "../BasicComponents/Search";

function LoanRatings(props:LoanCommonProps) {

  const [fieldList] = useState<FieldAttributesList>([
    { category: "grid", row:2, sectionName:"", fields: [
      { id: "A", type: "select", name: "Rating Agency", options: RatingAgencyList, required:true },
      { id: "T", type: "select", name: "Rating Type", options: RatingTypeList, required:true },
      { id: "DT", type: "date", name: "Date", required:true },
      { id: "O", type: "select", name: "Outlook", options: RatingOutlookList, required:true },
      { id: "L", type: "text", name: "Link", required:true },
      { id: "V", type: "text", name: "Rating Value", required:true },
    ]}
  ]);

  const {addRating, getRatingsList} = useGlobalContext();

  const [ratingsList, setRatingsList] = useState<FieldValues[]>();
  const [added, setAdded] = useState(true);
  const [toastOptions, setToastOptions] = useState<ToastOptionsAttributes>();
  // const [searchString, setSearchString] = useState("");

  useEffect(()=>{
    props.setUnsavedWarning(false);
  },[])

  useEffect(()=>{
    if (added){
      getRatingsList(props.loanId).then((res)=>{
        //console.log(res.arr)
        if (res.status==200)
          setRatingsList(res.arr);
        else
          setRatingsList([]);
      }).catch(err=>{
        console.log(err);
        setRatingsList([]);
      })
      setAdded(false);
    }
  },[added])

  const createRating = async (userValues:any) =>{
    const data:FieldValues = {};

    for (let i=0; i<fieldList.length; i++){
      const field = fieldList[i];
      if (field.category=="single")
        data[field.id] = userValues[field.id];
      else if (field.category=="grid"){
        for (let j=0; j<field.fields.length; j++){
          const gridField = field.fields[j];
          data[gridField.id] = userValues[gridField.id]
        }
      }
    }

    data["AID"]= props.AID;
    data["_loanId"]= props.loanId;
    //console.log("SUBMITTED ratings NOW", data);

    const res  = await addRating(data);
    
    if (res==200){
      setAdded(true);
      setToastOptions({open:true, type:"success", action:"add", section:"Rating"});
    }
    else
      setToastOptions({open:true, type:"error", action:"add", section:"Rating"});
    return res;
  }

  return(
    <div className="mt-8">
      <div className="flex flex-row">
        <div className='flex-auto'>
          {/* <Search setter={setSearchString} label="Search" /> */}
        </div>
        <div>
          <FormDialog index={-1} type="rate"
            triggerText="+ Add Rating" triggerClassName={CreateButtonStyling} formSize="medium"
            formTitle="Add New Rating"  formSubmit={createRating} submitButton="Add Rating"
            form={fieldList} currentFields={{}}
          />
        </div>
      </div>

      <div className="m-5">
        {ratingsList
          ?ratingsList.length==0
            ?<EmptyPageMessage sectionName="ratings" />
            :<DataTable className="border"
              headingRows={["Rating Agency", "Rating Type", "Date", "Outlook", "Link", "Rating Value"]} 
              tableData={ratingsList} columnIDs={["A","T","DT","O","L","V",]} dataTypes={["text", "text", "date", "text", "text", "text"]}
              searchRows={[]} filterRows={[]} cellClassName={["text-center","text-center","text-center","text-center","text-center text-blue-500","text-center"]} 
            />
          :<LoadingMessage sectionName="ratings" />
        }
      </div>
      {toastOptions?<Toast toastOptions={toastOptions} setToastOptions={setToastOptions} />:<></>}
      <FormSectionNavigation isForm={false} currentSection={props.currentSection} setCurrentSection={props.setCurrentSection} sectionCount={props.sectionCount} goToNextSection={props.goToNextSection} />
    </div>
  )
};

export default LoanRatings;