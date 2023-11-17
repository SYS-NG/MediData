import {
    createActor,
    ii_integration_backend,
} from "../../declarations/ii_integration_backend";
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";

let actor = ii_integration_backend;
console.log(process.env.CANISTER_ID_INTERNET_IDENTITY);
const whoAmIButton = document.getElementById("whoAmI");
whoAmIButton.onclick = async (e) => {
    e.preventDefault();
    whoAmIButton.setAttribute("disabled", true);
    const principal = await actor.whoami();
    whoAmIButton.removeAttribute("disabled");
    document.getElementById("principal").innerText = principal.toString();
    return false;
};
const loginButton = document.getElementById("login");
loginButton.onclick = async (e) => {
    e.preventDefault();
    let authClient = await AuthClient.create();
    // start the login process and wait for it to finish
    await new Promise((resolve) => {
        authClient.login({
            identityProvider:
                process.env.DFX_NETWORK === "ic"
                    ? "https://identity.ic0.app"
                    : `http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai`,
            onSuccess: resolve,
        });
    });
    const identity = authClient.getIdentity();
    const agent = new HttpAgent({ identity });
    actor = createActor(process.env.CANISTER_ID_II_INTEGRATION_BACKEND, {
        agent,
    });
    return false;
};

//add patient record

const addPatientRecordButton = document.getElementById("addPatientData");
addPatientRecordButton.onclick = async (e) => {
    e.preventDefault();

    try {
        const principal = await actor.whoami();
        await actor.addPatRecord(principal);

        console.log("profile was created");
    } catch (error) {
        console.error("error creating profile:", error);
    }

    return false;
};


const makeProfileButton = document.getElementById("createProfile");
makeProfileButton.onclick = async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const h_id = parseInt(document.getElementById("h_id").value,10);
    const weight = parseInt(document.getElementById("weight").value,10);
    const height = parseInt(document.getElementById("height").value,10);
    const sex = document.getElementById("sex").value;
    const gender = document.getElementById("gender").value;
    const age = document.getElementById("age").value;
    const history = document.getElementById("history").value;

    
    const profile = {
        name: name,
        health_care_num: h_id,
        dob:age,
        weight:weight,
        height:height,
        sex:sex,
        gender:gender,
        history:null
    };

    try {
        const principal = await actor.whoami();
        const patprin = await actor.check_doc_patientList(principal);
        await actor.init_patient_record(profile);

        console.log("profile was made");
    } catch (error) {
        console.error("error creating profile:", error);
    }

    return false;
};
const getProfileButton = document.getElementById("getProfile");
getProfileButton.onclick = async (e) => {
    e.preventDefault();
    getProfileButton.setAttribute("disabled", true);

    try {
        const principal = await actor.whoami();
        const profile = await actor.check_patRecord(principal);
        
        if (profile !== null) {
            document.getElementById("profileInfoDiv").innerText = JSON.stringify(profile, null, 2);
        } else {
            document.getElementById("profileInfoDiv").innerText = "Profile not found.";
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
        document.getElementById("profileInfoDiv").innerText= "Error fetching profile.";
    } finally {
        getProfileButton.removeAttribute("disabled");
    }
    return false;
};


/// add new patient button
const addPatientButton = document.getElementById("addPatient");
addPatientButton.onclick = async (e) => {
    e.preventDefault();
    addPatientButton.setAttribute("disabled", true);

    try {
        const p_key = await actor.addNewPatient();
        
        console.log("Generated key: "+p_key);
    } catch (error) {
        console.error("Error fetching key:", error);
    } finally {
        addPatientButton.removeAttribute("disabled");
    }
    return false;
};

const getPatientListButton = document.getElementById("getPatientList");
getPatientListButton.onclick = async (e) => {
    e.preventDefault();
    getPatientListButton.setAttribute("disabled", true);

    try {
        const principal = await actor.whoami();
        const patientList = await actor.check_doc_patientList(principal);
        console.log(patientList);
        patientList.forEach((key, value) => {
            console.log(`Patient: ${value}`);
            //// retrieve name and output as a lisit
          });

    } catch (error) {
        console.error("Error fetching patient list:", error);
        document.getElementById("profileInfoDiv").innerText= "Error fetching profile.";
    } finally {
        getPatientListButton.removeAttribute("disabled");
    }
    return false;
};



///// Page switch functions
const switchPageButton = document.getElementById("switch2");
switchPageButton.onclick = async (e) => {
    e.preventDefault();
    document.getElementById('page1').style.display = 'none';
    document.getElementById('page2').style.display = 'block';
    console.log("pages should be switched");    
    
    return false;
};

const switchPageButton1 = document.getElementById("switch1");
switchPageButton1.onclick = async (e) => {
    e.preventDefault();

    document.getElementById('page1').style.display = 'block';
    document.getElementById('page2').style.display = 'none';  
 
    
    return false;
};