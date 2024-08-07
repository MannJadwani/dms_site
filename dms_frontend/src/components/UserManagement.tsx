import { useEffect, useState } from "react";
import useGlobalContext from "./../../GlobalContext";

import { DataTable } from "./BasicComponents/Table";
import { ZoneList } from "../../Constants";
import FormDialog from "./FormComponents/FormDialog";
import Search from "./BasicComponents/Search";

import { CreateButtonStyling } from "./BasicComponents/PurpleButtonStyling";
import edit_icon from "./static/edit_icon.svg";
//import DeleteConfirmation from "./BasicComponents/DeleteConfirmation";
import EmptyPageMessage from "./BasicComponents/EmptyPageMessage";
import LoadingMessage from "./BasicComponents/LoadingMessage";
import { FieldAttributesList, FieldValues, ToastOptionsAttributes } from "DataTypes";
import Toast from "./BasicComponents/Toast";

function UserManagement(props:{label:string}){
  useEffect(()=>{
		document.title=props.label+" | Beacon DMS"
	},[]);

  const [userData, setUserData]= useState<FieldValues[]>();
  
  const [fieldList] = useState<FieldAttributesList>([
    { category: "grid", row: 2, fields: [
      { id: "N", name: "Name", type: "text", required:true },
      { id: "E", name: "Email", type: "email", immutable: true, required:true },
      { id: "P", name: "Password", type: "password", required:true },
      { id: "Z", name: "Zone", type: "select", options: ZoneList, required:true },
    ]},
    { category:"single", id: "RM", name: "Reporting Manager", type:"combobox", required:true },
    { category:"single", id: "M", name: "User is a Manager", type:"checkbox", required:false },
    { category:"single", id: "R", name:"Role", type:"role", required:true },
  ]);

  const [roleFilter] = useState(-1);
  const [searchString, setSearchString] = useState("");
  const [added, setAdded] = useState(true);
  const [selectedUser,setSelectedUser] = useState(-1);
  const [userStatus, setUserStatus] = useState(-1);
  const [toastOptions, setToastOptions] = useState<ToastOptionsAttributes>();
  
  const newUser = useGlobalContext().createUser;
  const changeUserInfo = useGlobalContext().editUser;
  const getUsers = useGlobalContext().getAllUsers;

  useEffect(()=>{
    if (added)
      getUsers().then((res)=>{
        if (res.status==200){
          //console.log("response",res.obj);
          setUserData(res.obj);
          setAdded(false);
        }
        else
          setUserData([]);
      }).catch(()=> {
        setUserData([]);
      })
  },[added])

  const createUser = async (userValues:any) => {

    const data:any={};
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
    console.log("valid data",data)
    if (userValues["RM"]){
      const email = userValues["RM"]["values"]["E"];
      userValues["RM"]=email;
    }
    
    //console.log ("SUBMITTING DATA", userValues)
    
    if (userValues["UP"]){
      const obj = userValues["UP"];
      userValues["UP"] = JSON.stringify(obj);
    }

    const res = await newUser(userValues);

    if (res==200){
      setAdded(true);
      setToastOptions({open:true, type:"success", action:"add", section:"User"});
    }
    else
      setToastOptions({open:true, type:"error", action:"add", section:"User"});

    
    return res;
  }

  const editUser = async (userValues:any, index:number) => {
    if (selectedUser==-1 && !index || !userData)
      return;
  
    if (selectedUser!=-1){
      const id = userData[selectedUser]["_id"];
      userValues["_id"] = id;
    }

    for (let i=0; i<Object.keys(userData[index]).length; i++){
      const key = Object.keys(userData[index])[i];
      if (userData[index][key]==userValues[key])
        delete userValues[key];
    }

    userValues["_id"] = userData[index]["_id"]

    if (userValues["RM"] && typeof userValues["RM"]!="string"){
      const email = userValues["RM"]["values"]["E"];
      userValues["RM"]=email;
    }
    
    if (userValues["UP"]){
      const obj = userValues["UP"];
      userValues["UP"] = JSON.stringify(obj);
    }

    console.log("SUBMITTING", userValues);

    const res = await changeUserInfo(userValues);

    if (res==200){
      setAdded(true);
      setToastOptions({open:true, type:"success", action:"edit", section:"User"});
    }
    else
      setToastOptions({open:true, type:"error", action:"edit", section:"User"});

    return res;
  }

  useEffect(()=>{
    editUser({"S":userStatus}, selectedUser);
  },[userStatus]);

  /* const deleteUser = (index:number) =>{
    console.log("deleting",index)
  } */

  return(
    <div>
			<p className="text-3xl font-bold m-7">{props.label}</p>
      <div className="flex flex-row">
        <div className='m-auto flex-auto'>
          <Search setter={setSearchString} label="Search Users" className="mx-7"/>
        </div>

        <div className="flex-auto">
          {/* <Filter setter={setRoleFilter} listsAreSame={false} valueList={EnumIteratorKeys(UserRoles)} labelList={EnumIteratorValues(UserRoles)} 
            setPlaceholder={true} placeholderValue={[-1,"Role"]}
          /> */}
        </div>

        <div className="">
          <FormDialog key={-10} index={-10} edit={false} type="user"
            triggerText="+ Add User" triggerClassName={`${CreateButtonStyling} mx-7`} formSize="medium"
            formTitle="Add User" formSubmit={createUser} submitButton="Add User"
            form={fieldList} currentFields={{}} suggestions="RM" getRoles={true}
          />
        </div>
      </div>
      <div className="m-7">
        {userData
          ?userData.length==0
            ?<EmptyPageMessage sectionName="users" emotion />
            :<DataTable className="bg-white rounded-xl" 
              headingRows={["Name", "Email Address","Reporting Manager", "Zone", "Role", "Status", "Action"]}
              tableData={userData} columnIDs={["N","E", "RM", "Z", "R","S"]} dataTypes={["text", "text", "text", "text","text", "user-status", "action"]}
              searchRows={searchString==""?[]:[searchString,"N","E"]} filterRows={roleFilter==-1?[]:[roleFilter,"S"]}
              setEntityStatus={setUserStatus} setSelectedEntity={setSelectedUser}
              action = {userData.map((_:any, index:number)=>{
                return(
                  <div className="flex flex-row">
                    <FormDialog key={index} index={index} type="user" edit
                      triggerClassName={""} triggerText={<img src={edit_icon} className="mr-5"/>}
                      formTitle="Edit User" formSubmit={editUser} submitButton="Edit User" formSize="medium"
                      form={fieldList} currentFields={userData[index]} suggestions="RM" getRoles
                    />
                    {/* <DeleteConfirmation thing="user" deleteFunction={deleteUser} currIndex={index} /> */}
                  </div>
                )
              })}
            />
            
          :<LoadingMessage sectionName="users" />
        }
      </div>
      {toastOptions?<Toast toastOptions={toastOptions} setToastOptions={setToastOptions} />:<></>}
    </div>
  )
}
export default UserManagement;