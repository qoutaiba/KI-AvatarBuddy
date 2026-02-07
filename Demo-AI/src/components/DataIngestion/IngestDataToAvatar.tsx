import {type Dispatch, type SetStateAction, useState} from "react";
import {Box, Button, Checkbox, Dialog, FormControlLabel, TextField} from "@mui/material";


export default function IngestDataToAvatar(prop: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) {

    const {open, setOpen} = prop
    const [ingestedData, setIngestedData] = useState("")
    const [subject, setSubject] = useState("")
    const [source, setSource] = useState("")
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [metaClicked, setMetaClicked] = useState(false);


    type IngestBody = {
        text: string,
        metadata?: {
            "class_id": number,
            "subject": string,
            "source": string
        }
    }
    const handleSubmit = async () => {
        setLoading(true);
        setStatus("");

        const body: IngestBody = {text: ingestedData,}

        //TODO: Body constructor for the api
        if (metaClicked) {
            body.metadata = {source: "ada", subject: "dada", class_id: 12}
        }
        await fetch("http://localhost:8000/ingest", {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(
                body
            ),
        });
        setStatus("Erfolg")
        setIngestedData("")
    };

    //TODO: onclose --> clear all fields

    //TODO: class_id (dropdown the classes )

    //TODO: Server start up default collection set up

    //TODO: PDF Attach file to server

    return (
        <Dialog open={open}>
            <Box sx={{padding: "24px", display: "flex", flexDirection: "column", gap: "8px"}}>
                <TextField onChange={(value) =>
                    setIngestedData(value.target.value)
                }
                           value={ingestedData} label={"Data to ingest.."} required={true}
                >

                </TextField>

                <FormControlLabel control={<Checkbox onClick={() => {
                    setMetaClicked((prevState) => !prevState)
                }
                } value={metaClicked}/>} label={"MetadLabelNeeded"}></FormControlLabel>

                {metaClicked &&
                    <>
                        <TextField label={"source"} onChange={
                            (event) => (setSource(event.target.value))}
                                   value={source}

                        />
                        <TextField label={"subject"} onChange={
                            (event) => (setSubject(event.target.value))}
                                   value={subject}
                        />
                    </>
                }

                <Button onClick={handleSubmit} disabled={(!ingestedData.trim())}>
                    Send Information
                </Button>
                <Button onClick={() =>
                    setOpen(false)
                }> close</Button>
            </Box>
        </Dialog>

    )
}