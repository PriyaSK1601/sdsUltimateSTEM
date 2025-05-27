// Validate email addresses in the registration page using hunter API
// Sends a request to Hunter's API to check if the email is "deliverable" (exists/can receive emails)
// Return true if the email is valid and deliverable, otherwise false

import axios from "axios";

const validateEmail = async (email) => {
    // const apiKey = process.env.REACT_APP_HUNTER_API_KEY;
    // console.log(apiKey);
    const apiKey = "335b0ec9c5e50e20dc7a8222948d09cd7dbd256d" // move this to .env
    const url = `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${apiKey}`

    try {
    const response = await axios.get(url);
    const { data } = response;
        // if data exists and it is valid (can send emails to address successfuly), return true
        // otherwise, false
        if (data && data.data && data.data.result === "deliverable") {
        return true;
        } else {
        return false; 
        }
    } catch (error) {
        console.log(error.message);
    }
};

export default validateEmail;