import React, { useState } from 'react';

const UploadQuote = () => {
    const [projectId, setProjectId] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [dripCost, setDripCost] = useState('');
    const [plumbingCost, setPlumbingCost] = useState('');
    const [automationCost, setAutomationCost] = useState('');
    const [labourCost, setLabourCost] = useState('');
    const [totalCost, setTotalCost] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const handleUpload = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append("project_id", projectId);
        formData.append("customer_name", customerName);
        formData.append("drip_cost", dripCost);
        formData.append("plumbing_cost", plumbingCost);
        formData.append("automation_cost", automationCost);
        formData.append("labour_cost", labourCost);
        formData.append("total_cost", totalCost);
        formData.append("pdf", selectedFile); // Ensure file is selected
    
        try {
            const response = await fetch("http://localhost:5000/upload-quote", {
                method: "POST",
                body: formData,
            });
    
            const data = await response.json();
            if (response.ok) {
                alert("Quote uploaded successfully!");
            } else {
                alert("Upload failed: " + data.error);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error uploading quote.");
        }
    };
    
    return (
        <form onSubmit={handleUpload}>
            <input type="text" placeholder="Project ID" onChange={(e) => setProjectId(e.target.value)} required />
            <input type="text" placeholder="Customer Name" onChange={(e) => setCustomerName(e.target.value)} required />
            <input type="number" placeholder="Drip Cost" onChange={(e) => setDripCost(e.target.value)} required />
            <input type="number" placeholder="Plumbing Cost" onChange={(e) => setPlumbingCost(e.target.value)} required />
            <input type="number" placeholder="Automation Cost" onChange={(e) => setAutomationCost(e.target.value)} required />
            <input type="number" placeholder="Labour Cost" onChange={(e) => setLabourCost(e.target.value)} required />
            <input type="number" placeholder="Total Cost" onChange={(e) => setTotalCost(e.target.value)} required />
            <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} required />
            <button type="submit">Upload Quote</button>
        </form>
    );
};

export default UploadQuote;
