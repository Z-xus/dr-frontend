import React from 'react';
import Navbar from './components/common/Navbar';
import './index.css'
import {
  Outlet,
} from "react-router-dom";
import { Toaster } from "@/components/ui/sonner"


function App() {
  return (
    <div className='transition-colors ease-in-out duration-1000'>
      <Navbar />
      <Toaster />
      <Outlet />
    </div>
  )
}

export default App


// import React, { useState } from "react";
// import axios from "axios";
// import { useDropzone } from "react-dropzone";
//
// const App: React.FC = () => {
//   const [text, setText] = useState<string>("");
//   const [action, setAction] = useState<string>("analyze");
//   const [response, setResponse] = useState<boolean | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//
//   const { getRootProps, getInputProps } = useDropzone({
//     accept: { "application/pdf": [".pdf"], "image/*": [".png", ".jpg", ".jpeg"] },
//     onDrop: (files) => handleFileUpload(files),
//   });
//
//   const handleFileUpload = async (files: File[]) => {
//     if (files.length === 0) return;
//     const file = files[0];
//
//     try {
//       const formData = new FormData();
//       formData.append("file", file);
//
//       const { data } = await axios.post("http://localhost:3000/extract-text", formData); // Fixed URL
//       setText(data.text);
//     } catch (err) {
//       console.error("Error uploading file:", err);
//     }
//   };
//
//   const handleSubmit = async () => {
//     setIsLoading(true);
//     try {
//       let apiEndpoint = "http://localhost:3000/analyze"; // Base URL
//       let requestBody = {};
//
//       switch (action) {
//         case "analyze":
//           requestBody = { text, language: "en" }; // Add optional fields as needed
//           break;
//         case "anonymize":
//           apiEndpoint = "http://localhost:3000/anonymize";
//           requestBody = {
//             text,
//             anonymizers: {
//               DEFAULT: { type: "replace", new_value: "<REDACTED>" },
//             },
//             analyzer_results: [], // Provide mock or actual analyzer results
//           };
//           break;
//         case "deanonymize":
//           apiEndpoint = "http://localhost:3000/deanonymize";
//           requestBody = {
//             text,
//             deanonymizers: {
//               PERSON: { type: "decrypt", key: "WmZq4t7w!z%C&F)J" },
//             },
//             anonymizer_results: [], // Provide mock or actual anonymizer results
//           };
//           break;
//       }
//
//       const { data } = await axios.post(apiEndpoint, requestBody);
//       setResponse(data);
//     } catch (err) {
//       console.error("Error making request:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   return (
//     <div className="min-h-screen p-4 bg-gray-100">
//       <h1 className="text-2xl font-bold mb-4">Text Processing Tool</h1>
//       <textarea
//         className="w-full p-2 mb-4 border border-gray-300 rounded"
//         rows={6}
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         placeholder="Paste your text here or upload a file below"
//       />
//       <div {...getRootProps({ className: "p-4 border-dashed border-2 rounded mb-4 cursor-pointer" })}>
//         <input {...getInputProps()} />
//         <p>Drag & drop a file here, or click to select one</p>
//       </div>
//       <select
//         value={action}
//         onChange={(e) => setAction(e.target.value)}
//         className="p-2 border border-gray-300 rounded mb-4"
//       >
//         <option value="analyze">Analyze</option>
//         <option value="anonymize">Anonymize</option>
//         <option value="deanonymize">Deanonymize</option>
//       </select>
//       <button
//         onClick={handleSubmit}
//         className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-blue-300"
//         disabled={isLoading || !text}
//       >
//         {isLoading ? "Processing..." : "Submit"}
//       </button>
//       {response && (
//         <div className="mt-4 p-4 bg-white border border-gray-300 rounded">
//           <h2 className="text-xl font-bold mb-2">Response</h2>
//           <pre className="overflow-x-auto">{JSON.stringify(response, null, 2)}</pre>
//         </div>
//       )}
//     </div>
//   );
// };
//
// export default App;
