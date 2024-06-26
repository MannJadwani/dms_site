import { useEffect, useState } from "react";
import useGlobalContext from "./../../../GlobalContext";

import { toast } from "../ui/use-toast";
import upload_icon from "./../static/upload_icon.svg";

function UploadFileButton(props:{index:number, AID:string, sectionName:string, docId:number|string, setAdded:Function, loanId?:string, isPayment?:boolean}){
  const [files, setFiles] = useState<any>([]);

  useEffect(()=>{
    console.log("upload button props",props)
  },[props]);

  const uploadFile = async (userFiles:any) => {
    const { uploadFile } = useGlobalContext();
  
    const formData = new FormData();

    console.log("SENDING FILE","AID",props.AID,"Sec name",props.sectionName,"index",props.docId,"loanId",props.loanId)
    
    for (let i=0; i<userFiles.length; i++)
      formData.append("file", userFiles[i]);
    
    const res = await uploadFile(formData, `${props.AID}/${props.sectionName}`,props.docId, props.loanId, props.isPayment);
    
    return res;
  }

  useEffect(()=>{
    if (files && files.length>0)
      uploadFile(files).then(res=>{
        console.log("FILE UPLOADED",res);
        if (res==200)
          props.setAdded(true);
        else
          toast({
            description:"An error has occured",
            className:"bg-white"
          })
      });
  },[files]);

  return(
    <div key={props.index}>
      <label key={props.index} className="flex flex-row border-2 border-dashed rounded-xl m-auto py-2 w-28 inline-block align-middle" style={{backgroundColor: "rgba(225, 237, 255, 1)", borderColor: "rgba(148, 192, 255, 1)"}} htmlFor="file">
        <div key={props.index+"_"+1} className="m-auto"><img src={upload_icon}/></div>
        <div key={props.index+"_"+2} className="m-auto"><span style={{color: "rgba(71, 145, 249, 1)"}}>Upload</span></div>
      </label>
      <input key={props.index+"_"+3} id="file" type="file" style={{width:"0.1px", opacity:"0"}} 
        multiple
        onChange={
          (e)=>setFiles((curr:any)=>{
            const arr  = [...curr];
            if (e.target.files && e.target.files.length>0)
              for (let i=0; i<e.target.files.length; i++)
                arr.push(e.target.files[i]);
            return arr;
          })
        }
      />
    </div>
  )
};

export default UploadFileButton;