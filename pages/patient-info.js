import React, { useState, useEffect } from "react";
import Link from 'next/link';
import downloadpdf from '../pages/download';

// pages/patient-info.js

export default function PatientInfo() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    symptoms: '',
  });

  
  const [canDownload, setDownload] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [showStatus, setStatus] = useState('hidden');
  const [triggeredEffect, setTriggerEffect] = useState(false);
  const [data, setData] = useState(null); // Store response data from API

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDownload = async() => {
    setDownload(true);
    try {
      const response = await fetch("http://localhost:5000/download_file");

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a download link and trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = "output.pdf"; // File name
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Cleanup
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg('Saving...');
    setStatus('visible')
    setTriggerEffect(true); // Trigger the effect after form submission
  };

  useEffect(() => {
    if (triggeredEffect) {
      // Fetch data after form submission
      fetch('http://localhost:5000/medically_translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
        .then((res) => res.json())
        .then((data) => {
          setData(data); // Store the response data
          //downloadpdf(data.file_path);
          setStatusMsg('Data successfully saved!'); // Update status message
          setTriggerEffect(false); // Reset triggeredEffect to stop useEffect
        })
        .catch((error) => {
          console.error('Error:', error);
          setStatusMsg('Failed to save data.'); // Set error message if request fails
          setTriggerEffect(false); // Reset to avoid infinite loop
        });
    } 

  }, [triggeredEffect, formData]); // Dependency array listens to changes in `triggeredEffect` and `formData`

  return (
    <div className="container formContainer">
      <h2 className="pageTitle">Patient Information</h2>
      <form onSubmit={handleSubmit} className="patientForm">
        <label className="formLabel">
          Name:
          <input
            type="text"
            name="name"
            placeholder="Enter patient name..."
            required
            value={formData.name}
            onChange={handleChange}
            className="formInput"
          />
        </label>

        <label className="formLabel">
          Age:
          <input
            type="number"
            name="age"
            min="0"
            max="120"
            placeholder="Enter age..."
            value={formData.age}
            onChange={handleChange}
            className="formInput"
          />
        </label>

        <label className="formLabel">
          Contact Email:
          <input
            type="email"
            name="email"
            placeholder="Enter email..."
            value={formData.email}
            onChange={handleChange}
            className="formInput"
          />
        </label>

        <label className="formLabel">
          Symptoms:
          <textarea
            name="symptoms"
            rows="3"
            placeholder="Describe main symptoms..."
            value={formData.symptoms}
            onChange={handleChange}
            className="formTextarea"
          />
        </label>

        <div className="buttonContainer">
          <button type="submit" className="submitButton">
            Submit
          </button>
          <button type="button" className="submitButton" onClick={handleDownload} style={{ marginLeft: '10px', visibility: showStatus }}>
            See the Bridge Report For Your Doctor!
          </button>
        </div>
      </form>
      {statusMsg && <p className="statusMsg">{statusMsg}</p>}
      <Link href="/">
        <span className="backLink">← Back to Home</span>
      </Link>
    </div>
  )
}