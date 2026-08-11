import API from "../utils/axios";

export const registerUser=(data)=>{

    return API.post("/auth/register",data);

}

export const loginUser=(data)=>{

    return API.post("/auth/login",data);

}

export const logoutUser=()=>{

    return API.get("/auth/logout");

}

export const getCurrentUser=()=>{

    return API.get("/auth/get-me");

}