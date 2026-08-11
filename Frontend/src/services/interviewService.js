import API from "../utils/axios";

export const getReports=()=>{

    return API.get("/interview");

}

export const generateInterview=(data)=>{

    return API.post("/interview/generate",data);

}

export const uploadResume=(formData)=>{

    return API.post("/interview",formData,{
        headers:{
            "Content-Type":"multipart/form-data"
        }
    });

}

export const generateResumePDF=(id)=>{

    return API.post(`/interview/resume/pdf/${id}`);

}