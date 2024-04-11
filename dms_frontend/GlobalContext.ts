import axios from 'axios'
import { decodeToken } from "react-jwt";

const Base_Url = "http://192.168.1.2:3000/api/v1/allAPI/";

const RegisterAdmin = async (data:object) => {
	try {
		const response = await axios.post(`${Base_Url}addAdmin`, data);
		return response;
	} 
	catch (error) {
		throw error;
	}
}

const RegisterUser = async (data: object) => {
	try {
		const response = await axios.post(`${Base_Url}register`, data);
		return response;
	} 
	catch (error) {
		throw error;
	}
}
const LoginUser = async (data: object) => {
	try {
		const response = await axios.post(`${Base_Url}login`, data, {
			headers:{
				"Content-type": "application/json"
			}
		});
		if (response.status == 409)
			return "verify_email";
		else if (response.status == 200){
			localStorage.setItem("Beacon-DMS-token",response.data.message);
			return "logged_in";
		}	
		else
			return "failure";
	} 
	catch (error) {
		throw error;
	}
}

const isLoggedIn = () => {
	const token = localStorage.getItem('Beacon-DMS-token')
	if (token) {	
		const decodedToken = decodeToken(token);
		if (decodedToken)
			return decodedToken;
	}
	else
		return false;
}

const sendOTP = async (token: any) => {
	try {
		const response = await axios.get(`${Base_Url}sendOTP`,{
			headers:{
			"Authorization": `Bearer ${token}`
		}
		});
		return response;
	}
	catch(error){
		throw error;
	}
}

const verifyOTP = async (token: any, otp:any) => {
	try {
		const response = await axios.post(`${Base_Url}verifyOTP`,{otp:otp},{
			headers:{
			"Authorization": `Bearer ${token}`
		}
		});
		return response;
	}
	catch(error){
		throw error;
	}
}

const useGlobalContext = () => {
	return {
		RegisterAdmin,
		RegisterUser,
		LoginUser,
		isLoggedIn,
		sendOTP,
		verifyOTP
	}
}

export default useGlobalContext;