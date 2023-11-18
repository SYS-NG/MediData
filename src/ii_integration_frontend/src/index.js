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
    const agent = new HttpAgent({
        identity,
        verifyQuerySignatures: false,
    });
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

const acceptNewDocButton = document.getElementById("acceptNewDoc");
acceptNewDocButton.onclick = async (e) => {
    e.preventDefault();
    const tempKey = parseInt(document.getElementById("doctorAcceptanceKey").value, 10);

    try {
        await actor.acceptNewDoc(tempKey);
        document.getElementById("acceptDocResp").innerText = "Doctor was accepted";
        console.log("Doctor was accepted");
    } catch (error) {
        console.error("error accepting doctor:", error);
    }

    return false;
};


const makeProfileButton = document.getElementById("createProfile");
makeProfileButton.onclick = async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const h_id = parseInt(document.getElementById("h_id").value);
    const weight = parseInt(document.getElementById("weight").value);
    const height = parseInt(document.getElementById("height").value);
    const sex = document.getElementById("sex").value;
    const gender = document.getElementById("gender").value;
    const age = document.getElementById("age").value;
   // let historyArr = [];
  //  const history = document.getElementById("history").value;
  const history = [];
  const patPrinc = await actor.whoami();///document.getElementById("patPrincipal").value;
    
   // historyArr.push(history);

    const profile = {
        name: name,
        healthcare_num: h_id,
        dob:age,    
        weight:weight,
        height:height,
        sex:sex,
        gender:gender,
        history:history
        /*
        newName: name,
        newHC_num: h_id,
        newDoB:age,    
        newWeight:weight,
        newHeight:height,
        newSex:sex,
        newGender:gender,
        newHistory:history*/
    };

    try {
  
       
        await actor.update_patient_record(patPrinc,profile);

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
    const principal = await actor.whoami();

    try {
        const principal = await actor.whoami();
        const profile   = await actor.check_patRecord(principal);
        
        if (profile !== null) {
            
            const patName    = (profile[0].name !== "")           ? profile[0].name : "Not Recorded";
            const patHN      = (profile[0].health_care_num !== 0) ? profile[0].healthcare_num : 0;
            const patDob     = (profile[0].dob !== null)          ? profile[0].dob : "Not Recorded" ;
            const patweight  = (profile[0].weight !== 0)          ? profile[0].weight : 0;
            const patheight  = (profile[0].height !== 0)          ? profile[0].height : 0;
            const patsex     = (profile[0].sex !== "")            ? profile[0].sex : "Not Recorded";
            const patgender  = (profile[0].gender !== "")         ? profile[0].gender : "Not Recorded" ;
            // const pathistory = profile[0].history;

            document.getElementById("myName").innerText   = patName;
            document.getElementById("myHN").innerText     = patHN;
            document.getElementById("myDob").innerText    = patDob;
            document.getElementById("myWeight").innerText = patweight;
            document.getElementById("myHeight").innerText = patheight;
            document.getElementById("mySex").innerText    = patsex;
            document.getElementById("myGender").innerText = patgender;
            // document.getElementById("myHist").innerText   = pathistory;
        
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
        
        document.getElementById("tempKeydisp").innerText = "Gererated key: " + p_key;
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
        const patientPrincipals = await actor.doc_check_doc_patientList();
        console.log(patientPrincipals);
        patientPrincipals.forEach(async(key) => {
            const result = await check_patName(key);
            console.log(result);
            
            const listItem = document.createElement("li");
            listItem.textContent = result;
            document.getElementById("resultsList").appendChild(listItem);
            
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
