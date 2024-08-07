import axios from 'axios';
import { decodeToken, isExpired } from "react-jwt";
import CryptoJS from "crypto-js";
import { FieldValues, UserSuggestionTypes } from 'DataTypes';

//const Base_Url = "http://192.168.1.9:9000/api/v1/allAPI";
const Base_Url = "http://139.5.190.208:9000/api/v1/allAPI";
//const Base_Url="https://dms-pbe2.onrender.com/api/v1/allAPI";

const encryption_key = "JAIBAJRANGBALI";

//HELPERS

const handleEncryption = async (data:object) => {
	try{
		const encryptedText = await CryptoJS.AES.encrypt(JSON.stringify(data), encryption_key).toString();
		return encryptedText;
	}
	catch(err){
		console.log(err);
	}
}

const handleDecryption = async (text:string) => {
	let decryptedString="";
	try{
		decryptedString = await CryptoJS.AES.decrypt(text, encryption_key).toString(CryptoJS.enc.Utf8);
		const obj = await JSON.parse(decryptedString);
		return await obj;
	}
	catch (err){
		return decryptedString;
	}
};

const getEncryptedToken = () => {
	const token = localStorage.getItem('Beacon-DMS-token');
	return token;
}

const getDecryptedToken = async () => {
	const token = getEncryptedToken();
	//console.log("Encrypted token",token);
	if (token==null)
		return null;
	const decryptedToken = await handleDecryption(token);
	//console.log("Decrypted token", decryptedToken)
	let decodedToken;
	if (decryptedToken["TKN"])
		decodedToken = await decodeToken(decryptedToken["TKN"]);
	else
		decodedToken = await decodeToken(decryptedToken);
	//console.log("Decoded token", decodedToken)
	const valid = isExpired(decryptedToken);
	if (!valid)
		return null;
	return await decodedToken;
}

//SUGGESTIONS
const getUserSuggestions = async (type:UserSuggestionTypes, teamLead?:string) => {
	try {
		const query:FieldValues = {type:type};
		if (teamLead)
			query["RM"]=teamLead;
		const token = getEncryptedToken();
		const response = await axios.get(`${Base_Url}/suggestion`, {
			headers:{ "Authorization": `Bearer ${token}` },
			params: query
		});
		const decryptedObject = await handleDecryption(response.data);
		if (response.status==200)
			return {status:200, obj:decryptedObject}
		else
			return {status:response.status, obj:null}
	}
	catch(error:any) {
		if (!error.response)
		return {status:0, obj:null}
		else
		return {status:error.response.status, obj:null}
	}
};

//AUTH
const registerAdmin = async (data:object) => {
	try {
		const req_body = await handleEncryption(data);
		const response = await axios.post(`${Base_Url}/addAdmin`, {data:req_body});
		//console.log("register response",response);
		return response.status;
	} 
	catch (error:any) {
		if (error.response)
			return error.response.status;
		else
			return 0;
	}
}	

const loginUser = async (data: object) => {
	//Conflict Error 409 -> User inactive; contact admin
	//Precondition Failed 412 -> Incorrect Password
	//Unauthorized 401 -> Incorrect Username
	try {
		const req_body = await handleEncryption(data);
		const response = await axios.post(`${Base_Url}/login`, {data:req_body}, {
			headers:{ "Content-type": "application/json" }
		});
		if (response.status == 200){
			localStorage.setItem("Beacon-DMS-token",response["data"]);
			return 200;
		}	
		else
			return response.status;
	} 
	catch (error:any) {
		if (!error.response)
			return 0;
		else
			return error.response.status;
	}
}

const sendOTP = async () => {
	//Error 503 -> Maintainance Mode
	//Error 409 -> 
	try {
		const token = getEncryptedToken();
		const response = await axios.get(`${Base_Url}/sendOTP`, {
			headers:{ "Authorization": `Bearer ${token}` }
		});
		return response.status;
	} 
	catch (error:any) {
		if (!error.response)
			return 0;
		else
			return error.response.status;
	}
}

const verifyOTP = async (otp:any) => {
	//Error 412 -> User already verified
	try {
		const token = await getEncryptedToken();
		const enc_otp = await handleEncryption({otp});
		const response = await axios.post(`${Base_Url}/verifyOTP`,{data: enc_otp},{
			headers:{	"Authorization": `Bearer ${token}` }
		});

		if (response.status==200){
			return {status:200, data:response["data"]}
		}
		else
			return {status:response.status, data:null}
	}
	catch(error:any){
		if (error.response.status)
			return {status:error.status, data:null}
		else	
			return {status:0, data:null}
	}
}

//USER MANAGEMENT
const createUser = async (data:object) => {
	//Conflict Error 409 -> Duplicate User
	//Forbidden 403 -> User is not admin
	try {
		const enc_data = await handleEncryption(data);
		
		const token = getEncryptedToken();
		
		const response = await axios.post(`${Base_Url}/addUser`,{data:enc_data}, {
			headers:{ "Authorization": `Bearer ${token}` }
		});
		
		return response.status;
	}
	catch(error:any) {
		if (!error.response)
			return 0;
		else
			return error.response.status
	}
}

const editUser = async (data:object) => {
	try {
		const token = await getEncryptedToken();
		const enc_data = await handleEncryption(data);
		const response = await axios.post(`${Base_Url}/editUser`,{data:enc_data}, {
			headers:{
				"Authorization": `Bearer ${token}`
			}
		});
		return response.status;
	}
	catch(error:any) {
		if (!error.response)
			return 0;
		else
			return error.response.status
	}
}

const getAllUsers = async () => {
	try {
		const token = await getEncryptedToken();
		const response = await axios.get(`${Base_Url}/listUser`, {
			headers:{ "Authorization": `Bearer ${token}` }
		});
		const decryptedObject = await handleDecryption(response["data"]);
		return {status:response.status, obj:decryptedObject||{}};
	}
	catch(error:any) {
		if (!error.response)
			return {status:0, obj:{}};
		else
			return {status:error.response.status, obj:{}}
	}
}
const getSingleUser = async (id:string) => {
	try {
		const token = await getEncryptedToken();
		const response = await axios.get(`${Base_Url}/getUser`, {
			headers:{ "Authorization": `Bearer ${token}` },
			params:{"_id":id}
		});
		const decryptedObject = await handleDecryption(response["data"]);
		return {status:response.status, obj:decryptedObject||{}};
	}
	catch(error:any) {
		if (!error.response)
			return {status:0, obj:{}};
		else
			return {status:error.response.status, obj:{}}
	}
}

//LOAN ACCOUNT
const getLoanList = async (filterType?:"Z"|"P", filterCategory?:string|string[]) => {
	try {
		const token = getEncryptedToken();
		const response = await axios.get(`${Base_Url}/listLoan`, {
			headers:{ "Authorization": `Bearer ${token}` },
			params:{T:filterType, V:filterCategory }
		});
		const decryptedObject = await handleDecryption(response.data);
		return {status:response.status, arr:decryptedObject||null};
	}
	catch(error:any) {
		if (!error.response)
			return {status:0, arr:null};
		else
			return {status:error.response.status, arr:null};
	}
};

const getLoanFields = async (loanId:string) => {
	try {
		const token = getEncryptedToken();
		const response = await axios.get(`${Base_Url}/getLoan`, {
			headers:{ "Authorization": `Bearer ${token}` },
			params: { "_loanId": loanId },
		});
		const decryptedObject = await handleDecryption(response.data);
		return {status:response.status, obj:decryptedObject||{}};
	}
	catch(error:any) {
		if (!error.response)
			return {status:0, obj:{}};
		else
			return {status:error.response.status, obj:{}};
	}
}


//CREATE LOAN ACCOUNT
const createLoan = async (data:object) => {
	try {
		const token = getEncryptedToken();
		const enc_data = await handleEncryption(data);
		const response = await axios.post(`${Base_Url}/createLoan`,{data:enc_data}, {
			headers:{ "Authorization": `Bearer ${token}` }
		});
		return response.status;
	}
	catch(error:any) {
		if (!error.response)
			return 0;
		else
			return error.response.status
	}
}

const deleteLoan = async (loanId:string) => {
	try {
		const token = getEncryptedToken();
		const response = await axios.delete(`${Base_Url}/deleteLoan`, {
			headers:{ "Authorization": `Bearer ${token}` },
			params: { "_id": loanId },
		});
		return response.status;
	}
	catch(error:any) {
		if (!error.response)
			return 0;
		else
			return error.response.status;
	}
}

const createAID = async (data:object) =>{
	try {
		const token = await getEncryptedToken();
		const enc_data = await handleEncryption(data);
		const response = await axios.post(`${Base_Url}/createAID`,{data:enc_data}, {
			headers:{ "Authorization": `Bearer ${token}` }
		});
		const decryptedObject = await handleDecryption(response.data);
		return {status:response.status,obj:decryptedObject};
	}
	catch(error:any) {
		if (!error.response)
			return {status:0, obj:{}};
		else
			return {status:Number(error.response.status), obj:{}};
	}
}

//CONTACT DETAILS
const addContact = async (data:object, actionType:string) => {
	try {
		const token = getEncryptedToken();
		const enc_data = await handleEncryption(data);
		const response = await axios.post(`${Base_Url}/createContact`,{data:enc_data}, {
			headers:{ "Authorization": `Bearer ${token}` },
			params: { "type": actionType },
		});
		return response.status;
	}
	catch(error:any) {
		if (!error.response)
			return 0;
		else
			return error.response.status;
	}
}

const getContacts = async (loanId:string) => {
	try {
		const token = getEncryptedToken();
		const response = await axios.get(`${Base_Url}/listContact`, {
			headers:{ "Authorization": `Bearer ${token}` },
			params: { "_loanId": loanId },
		});
		const decryptedObject = await handleDecryption(response.data);
		return {status:response.status,data:decryptedObject||{}};
	}
	catch(error:any) {
		if (!error.response)
			return {status:0,data:{}};
		else
			return {status:error.response.status, data:{}}
	}
};

//RATINGS
const addRating = async (data:object) => {
	try {
		const token = getEncryptedToken();
		const enc_data = await handleEncryption(data);
		const response = await axios.post(`${Base_Url}/addRating`, {data: enc_data}, {
			headers:{ "Authorization": `Bearer ${token}` },
		});
		return response.status;
	}
	catch(error:any) {
		if (!error.response)
			return 0;
		else
			return error.response.status;
	}
}

const getRatingsList = async (loanId:string) => {
	try {
		const token = getEncryptedToken();
		const response = await axios.get(`${Base_Url}/listRating`, {
			headers:{ "Authorization": `Bearer ${token}` },
			params: { "_loanId": loanId },
		});
		const decryptedObject = await handleDecryption(response.data);
		return {status:response.status, arr:decryptedObject}; 
	}
	catch(error:any) {
		if (!error.response)
			return {status:0, arr:[]};
		else
			return{status: error.reponse.status, arr:[]};
	}
}

//ROLE MANAGEMENT
const addRole = async (data:object) => {
	try {
		const token = getEncryptedToken();
		const enc_data = await handleEncryption(data);
		const response = await axios.post(`${Base_Url}/addRole`, {data: enc_data}, {
			headers:{ "Authorization": `Bearer ${token}` },
		});
		return response.status;
	}
	catch(error:any) {
		if (!error.response)
			return 0;
		else
			return error.response.status;
	}
}

const getRolesList = async () => {
	try {
		const token = getEncryptedToken();
		const response = await axios.get(`${Base_Url}/listRole`, {
			headers:{ "Authorization": `Bearer ${token}` },
		});
		const decryptedObject = await handleDecryption(response.data);
		
		return {status:response.status, data:decryptedObject||null};
	}
	catch(error:any) {
		if (!error.response)
			return {status:0, data:null};
		else
			return {status:error.response.status, data:null};
	}
}

//TEAM MANAGEMENT
const getTeamsList = async (loanId?:string) => {
	try {
		const token = await getEncryptedToken();
		let response;
		if (loanId)
			response = await axios.get(`${Base_Url}/listTeam`, {
				headers:{ "Authorization": `Bearer ${token}` },
				params:{ "_loanId":loanId}
			});
		else
			response = await axios.get(`${Base_Url}/listTeam`, {
				headers:{ "Authorization": `Bearer ${token}` },
			});
		const decryptedObject = await handleDecryption(response.data);

		return {status:response.status,obj:decryptedObject};	
	}
	catch(error:any) {
		if (!error.response)
			return {status:0, obj:null}
		else
			return {status:error.response.status,obj:null};
	}
};

const addTeam = async (data:any) => {
	try {
		const token = getEncryptedToken();
		const enc_data = await handleEncryption(data);
		const response = await axios.post(`${Base_Url}/updateTeam`, {data: enc_data}, {
			headers:{ "Authorization": `Bearer ${token}` },
		});
		return response.status;
	}
	catch(error:any) {
		if (!error.response)
			return 0;
		else
			return error.response.status;
	}
}

const getSingleTeam = async (teamId:string) => {
	try {
		const token = await getEncryptedToken();
		const response = await axios.get(`${Base_Url}/getTeam`, {
			headers:{ "Authorization": `Bearer ${token}` },
			params:{_id:teamId}
		});
		const decryptedObject = await handleDecryption(response.data);

		return {status:response.status,obj:decryptedObject};	
	}
	catch(error:any) {
		if (!error.response)
			return {status:0, obj:null}
		else
			return {status:error.response.status,obj:null};
	}
};

//DOCUMENTS
const addDocument =  async (data:any) => {
	try {
		const token = getEncryptedToken();

		const enc_data = await handleEncryption(data);

		const response = await axios.post(`${Base_Url}/addDocsDetails`, {data:enc_data}, {
			headers:{ "Authorization": `Bearer ${token}`}});

		const decryptedObject = await handleDecryption(response.data);
		return {status:response.status, id:decryptedObject["_id"]||""};
	}

	catch(error:any) {
		if (!error.response)
			return {status:0, id:""};
		else
			return {status:error.response.status, id:""};
	}
};

const editDocument =  async (data:any) => {
	try {
		const token = getEncryptedToken();

		const enc_data = await handleEncryption(data);

		const response = await axios.post(`${Base_Url}/editDocsDetails`, {data:enc_data}, {
			headers:{ "Authorization": `Bearer ${token}`}});

		const decryptedObject = await handleDecryption(response.data);
		return {status:response.status, id:decryptedObject["_id"]||""};
	}

	catch(error:any) {
		if (!error.response)
			return {status:0, id:""};
		else
			return {status:error.response.status, id:""};
	}
};

const uploadFile = async (data:any,loc:string, docId:string|number, loanId?:string, isPayment?:boolean) => {
	try {
		const token = getEncryptedToken();
		
		const query:FieldValues = { "LOC":loc};
		
		if (isPayment) query["POS"]=docId;

		if (loanId)
			query["_id"]=loanId;
		else
			query["_id"]=docId;
		//console.log("DATA",data)
		const response = await axios.post(`${Base_Url}/uploadDocs`, data, {
			headers:{ "Authorization": `Bearer ${token}`, "Content-Type": 'multipart/form-data' },
			params: query
		});

		return response.status;
	}

	catch(error:any) {
		if (!error.response)
			return 0;
		else
			return error.response.status;
	}
};

const getDocumentsList = async (loanId:string, sectionName:string) =>  {
	try {
		const token = getEncryptedToken();
		const response = await axios.get(`${Base_Url}/listDocsDetail`, {
			headers:{ "Authorization": `Bearer ${token}` },
			params: {"_loanId": loanId, SN:sectionName }
		});
		const decryptedObject = await handleDecryption(response.data);
		
		if (response.status==200)
			return {status: response.status, obj:decryptedObject}; 
		else
			return {status: 0, obj:null};
	}
	catch(error:any) {
		if (!error.response)
			return {status: 0, obj:null};
		else
			return {status: error.status, obj:null};;
	}
};

/* const getFileList = async (AID:string,section_name:string, document_category:string) => {
	try {
		const token = getEncryptedToken();

		const response = await axios.get(`${Base_Url}/listDocs`, {
			headers:{ "Authorization": `Bearer ${token}` },
			params: { LOC: `${AID}/${section_name}/${document_category}` }
		});
		const decryptedObject = await handleDecryption(response.data);
		if (response.status==200)
			return {status: response.status, obj:decryptedObject}; 
		else
			return {status: 0, obj:null};
	}
	catch(error:any) {
		if (!error.response)
			return {status: 0, obj:null};
		else
			return {status: error.status, obj:null};
	}
} */

const fetchDocument = async (AID:string,section_name:string, file_name:string) => {
	try {
		const token = getEncryptedToken();
		const response = await axios.get(`${Base_Url}/viewDocs`, {
			headers:{ "Authorization": `Bearer ${token}` },
			params: { LOC: `${AID}/${section_name}/${file_name}` },
			responseType: 'blob',
		});

		const blob = new Blob([response.data], {type:response.data.type});
		let url = URL.createObjectURL(blob);
		//URL.revokeObjectURL(url);
		
		return {status:response.status, url:url};
	} 
	catch(error:any) {
		if (!error.response)
			return{status:0, url:""};
		else
			return {status:error.response.status, url:""}
	}
};

const deleteDocument = async (AID:string, docId:string, section_name:string, file_name:string) => {
	try {
		const token = getEncryptedToken()
		const response = await axios.delete(`${Base_Url}/deleteDocs`, {
			headers:{ "Authorization": `Bearer ${token}` },
			params: { LOC: `${AID}/${section_name}/${file_name}`, _id:docId },
		});

		return response.status;
	}

	catch(error:any) {
		if (!error.response)
			return 0;
		else
			return error.response.status;
	}
}

const getDealList = async (sectionName:string) =>  {
	try {
		const token = getEncryptedToken();
		const response = await axios.get(`${Base_Url}/assignlistDocsDetail`, {
			headers:{ "Authorization": `Bearer ${token}` },
			params: { SN:sectionName }
		});
		const decryptedObject = await handleDecryption(response.data);
		
		if (response.status==200)
			return {status: response.status, obj:decryptedObject}; 
		else
			return {status: response.status, obj:null};
	}
	catch(error:any) {
		if (!error.response)
			return {status: 0, obj:null};
		else
			return {status: error.response.status, obj:null};;
	}
};

//RELATIONSHING MAPPING
const selectTeam = async (data:any) => {
	try {
		const token = getEncryptedToken();
		const enc_data = await handleEncryption(data);
		const response = await axios.post(`${Base_Url}/selectTeam`, {data: enc_data}, {
			headers:{ "Authorization": `Bearer ${token}` },
		});
		return response.status;
	}
	catch(error:any) {
		if (!error.response)
			return 0;
		else
			return error.response.status;
	}
}

//MASTERS
const addToMasters = async (data:any) => {
	try {
		const token = getEncryptedToken();
		const enc_data = await handleEncryption(data);
		const response = await axios.post(`${Base_Url}/updateMst`, {data: enc_data}, {
			headers:{ "Authorization": `Bearer ${token}` },
		});
		return response.status;
	}
	catch(error:any) {
		if (!error.response)
			return 0;
		else
			return error.response.status;
	}
}

const getMastersList = async () =>  {
	try {
		const token = getEncryptedToken();
		const response = await axios.get(`${Base_Url}/listMst`, {
			headers:{ "Authorization": `Bearer ${token}` },
		});
		const decryptedObject = await handleDecryption(response.data);
		
		return {status: response.status, obj:decryptedObject||null};
	}
	catch(error:any) {
		if (!error.response)
			return {status: 0, obj:null};
		else
			return {status: error.reponse.status, obj:null};;
	}
};

/* const decrypt = async (data:object) => {
	const encryptedText = CryptoJS.AES.encrypt(JSON.stringify(data), encryption_key).toString();
	console.log("ENCRYPTED TEXTZ", encryptedText);
	const reqBody = {"data":encryptedText};

	const obj = await handleDecryption("U2FsdGVkX18wPWv+D83d+QrLDMwoTIwTa3u74O3wG87AtCcHErX7iuHS6Ns48w3i");
	console.log("RESULT", reqBody);
	const response = await axios.post(`${Base_Url}/decrypt`,reqBody);
	return obj;
}
*/

const addPaymentSchedule = async (data:any) => {
	try {
		const token = getEncryptedToken();
		const enc_data = await handleEncryption(data);
		const response = await axios.post(`${Base_Url}/updatePaymentDetails`, {data: enc_data}, {
			headers:{ "Authorization": `Bearer ${token}` },
		});
		return response.status;
	}
	catch(error:any) {
		if (!error.response)
			return 0;
		else
			return error.response.status;
	}
}

const getPaymentSchedule = async (loanId:string) =>  {
	try {
		const token = getEncryptedToken();
		const response = await axios.get(`${Base_Url}/listPaymentDetails`, {
			headers:{ "Authorization": `Bearer ${token}` },
			params:{_loanId:loanId}
		});
		const decryptedObject = await handleDecryption(response.data);
		
		return {status: response.status, obj:decryptedObject||null};
	}
	catch(error:any) {
		if (!error.response)
			return {status: 0, obj:null};
		else
			return {status: error.reponse.status, obj:null};;
	}
};

//deleteContact

//assignlistCriticalCases

//assignListDefault
const getSpecialList = async (type:"def"|"crit") =>  {
	try {
		const token = getEncryptedToken();
		const route = type=="def"?"assignlistDefault":"assignlistCriticalCases";
		const response = await axios.get(`${Base_Url}/${route}`, {
			headers:{ "Authorization": `Bearer ${token}` },
		});
		const decryptedObject = await handleDecryption(response.data);
		
		return {status: response.status, obj:decryptedObject||null};
	}
	catch(error:any) {
		if (!error.response)
			return {status: 0, obj:null};
		else
			return {status: error.reponse.status, obj:null};;
	}
};

const useGlobalContext = () => {
	return {
		getEncryptedToken, getDecryptedToken, handleEncryption, handleDecryption,
		registerAdmin, loginUser,
		sendOTP, verifyOTP,
		createUser, editUser, getAllUsers, getSingleUser,
		createLoan, createAID,
		addContact, getContacts,
		getLoanList, getLoanFields, deleteLoan,
		addRating, getRatingsList,
		addRole, getRolesList,
		getUserSuggestions,
		getTeamsList, addTeam, getSingleTeam,
		addDocument, uploadFile, getDocumentsList, editDocument, /* getFileList, */ deleteDocument, fetchDocument,
		selectTeam,
		addToMasters,getMastersList,
		getDealList,
		addPaymentSchedule, getPaymentSchedule,
		getSpecialList,
	}
}

export default useGlobalContext;