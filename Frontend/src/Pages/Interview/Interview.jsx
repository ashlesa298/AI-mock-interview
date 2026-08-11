import { useState } from "react";
import "./Interview.css";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import API from "../../utils/axios";

const Interview = () => {

  const navigate = useNavigate();

  const [resume, setResume] = useState(null);

  const [selfDescription, setSelfDescription] = useState("");

  const [jobDescription, setJobDescription] = useState("");

  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {

    e.preventDefault();

    if (!resume) {

      return toast.error("Please upload resume");

    }

    const formData = new FormData();

    formData.append("resume", resume);

    formData.append("selfDescription", selfDescription);

    formData.append("jobDescription", jobDescription);

    try {

      setLoading(true);

     const res = await API.post("/interview/questions", formData);

      toast.success("Interview Generated Successfully 🎉");

      navigate(`/report/${res.data.interviewReport._id}`);

    }

    catch (err) {

      toast.error(

        err?.response?.data?.message ||

        "Something went wrong"

      );

    }

    finally {

      setLoading(false);

    }

  };

  return (

    <>

      <Navbar />

      <section className="interview">

        <div className="container">

          <div className="interview-box">

            <h1>🤖 AI Interview Generator</h1>

            <p>

              Upload Resume + Job Description

            </p>

            <form onSubmit={submitHandler}>

              <label>

                Resume (PDF)

              </label>

              <input

                type="file"

                accept=".pdf"

                onChange={(e)=>setResume(e.target.files[0])}

                required

              />

              <label>

                Tell us about yourself

              </label>

              <textarea

                rows="5"

                value={selfDescription}

                onChange={(e)=>setSelfDescription(e.target.value)}

                required

              />

              <label>

                Job Description

              </label>

              <textarea

                rows="8"

                value={jobDescription}

                onChange={(e)=>setJobDescription(e.target.value)}

                required

              />

              <button>

                {

                  loading

                  ?

                  "Generating..."

                  :

                  "🚀 Generate Interview"

                }

              </button>

            </form>

          </div>

        </div>

      </section>

      <Footer/>

    </>

  );

};

export default Interview;