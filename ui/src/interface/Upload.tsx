import React, { SyntheticEvent, useState } from 'react';
import './Interface.css'
import { useNavigate } from "react-router-dom";
import { ProcessReponse, postData, BoxProperties } from '../api/api';
import { ImageDimensions } from "../api/api";
const upload_url = "http://localhost:5000/upload"
const process_url = "http://localhost:5000/process"
const example_api_response = require('./example_api_response.json');

type UploadProps = {
    setBoxProperties: React.Dispatch<React.SetStateAction<BoxProperties | undefined>>,
    setImagePath: React.Dispatch<React.SetStateAction<string | undefined>>,
    setImageWorldDimensions: React.Dispatch<React.SetStateAction<ImageDimensions | undefined>>,
}

function Upload(props: UploadProps) {
    const [selectedFile, setSelectedFile] = useState<File>();
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [uploadFinished, setUploadFinished] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();
    const isDevEnvironment = process.env.NODE_ENV === 'development';

    const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files != null) {
            setSelectedFile(event.target.files[0]);
            setIsFilePicked(true);
        } else {
            setIsFilePicked(false);
        }
        setUploadFinished(false);
    };

    const handleSubmission = (event: SyntheticEvent) => {
        if (selectedFile != null) {
            const formData = new FormData();
            formData.append("file", selectedFile, selectedFile.name);
            setIsUploading(true);
            fetch(upload_url, {
                method: "POST",
                body: formData
            }).then((value: Response) => {
                console.log(value)
                setIsUploading(false);
                setUploadFinished(value.ok);
            }).then(() => {
                if (selectedFile != null) {
                    const data = { "filename": selectedFile.name };
                    setIsProcessing(true);
                    postData(process_url, data).then((response: ProcessReponse) => {
                        console.log(response)
                        setIsProcessing(false);
                        props.setBoxProperties(response.box_outputs);
                        props.setImagePath(response.image_path);
                        props.setImageWorldDimensions(response.image_dimensions)
                        navigate("/edit");
                    });
                }
            });


        } else {
            console.error("No file selected.");
            // Provide a test api response in dev mode
            if (isDevEnvironment) {
                props.setBoxProperties(example_api_response.box_outputs);
                navigate("/edit");
            } 
        }
    };

    const handleProcess = (_: SyntheticEvent) => {
        if (selectedFile != null) {
            const data = { "filename": selectedFile.name };
            setIsProcessing(true);
            postData(process_url, data).then((response: ProcessReponse) => {
                console.log(response)
                setIsProcessing(false);
                props.setBoxProperties(response.box_outputs);
                navigate("/edit")
            });
        }
    }

    return (
        <div className="interface">
            {(!isUploading && !isProcessing && !uploadFinished) &&
                <><p>Choose a .pcd file to upload</p>
                    <input type="file" name="file" onChange={changeHandler} /></>}
            {((isFilePicked || isDevEnvironment) && !isUploading && !isProcessing && !uploadFinished) && <div>
                <button onClick={handleSubmission}>Upload</button>
            </div>}
            {uploadFinished && !isProcessing && <div>
                <button onClick={handleProcess}>Process</button>
            </div>}
            {isUploading &&
                <div>
                    <p> Uploading... </p>
                    <div className='lds-dual-ring'></div>
                </div>}
            {isProcessing &&
                <div>
                    <p> Processing... </p>
                    <div className='lds-dual-ring'></div>
                </div>}
        </div>
    );
}

export default Upload;
