import {
    createActor,
    ii_integration_backend,
} from "../../declarations/ii_integration_backend";
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";

let actor = ii_integration_backend;
console.log(process.env.CANISTER_ID_INTERNET_IDENTITY);
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


const patLoginButton = document.getElementById("login2");
patLoginButton.onclick = async (e) => {
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

const getProfileButton = document.getElementById("getProfile");
getProfileButton.onclick = async (e) => {
    e.preventDefault();
    getProfileButton.setAttribute("disabled", true);
    const principal = await actor.whoami();

    try {
        const principal = await actor.whoami();
        const profile   = await actor.check_patRecord(principal);
        const logs      = await actor.check_patAccessLog(principal);
        console.log(profile);
        
        if (profile !== null) {
            
            const patName    = (profile.name !== "")           ? profile.name    : "Not Recorded";
            const patHN      = (profile.health_care_num !== 0) ? profile.healthcare_num : 0;
            const patDob     = (profile.dob !== null)          ? profile.dob     : "Not Recorded" ;
            const patweight  = (profile.weight !== 0)          ? profile.weight  : 0;
            const patheight  = (profile.height !== 0)          ? profile.height  : 0;
            const patsex     = (profile.sex !== "")            ? profile.sex     : "Not Recorded";
            const patgender  = (profile.gender !== "")         ? profile.gender  : "Not Recorded" ;
            const pathistory = (profile.history.length > 0)    ? profile.history : [] ;

            document.getElementById("myName").innerText   = patName;
            document.getElementById("myHN").innerText     = patHN;
            document.getElementById("myDob").innerText    = patDob;
            document.getElementById("myWeight").innerText = patweight;
            document.getElementById("myHeight").innerText = patheight;
            document.getElementById("mySex").innerText    = patsex;
            document.getElementById("myGender").innerText = patgender;

            document.getElementById("myHist").innerHTML   = "";
            for (const historyNote of pathistory.reverse()) {
                console.log(historyNote);

                const listItem = document.createElement("li");
                listItem.textContent = historyNote;
                document.getElementById("myHist").appendChild(listItem);
            }
        
        } else {
            document.getElementById("profileInfoDiv").innerText = "Profile not found.";
        }
        
        if (logs.length > 0) {
            document.getElementById("myLog").innerHTML   = "";
            for (const log of logs.reverse()) {
                const listItem = document.createElement("li");
                listItem.textContent = log;
                document.getElementById("myLog").appendChild(listItem);
            }

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

        document.getElementById("resultsList").innerHTML = "";
        
        const i=0;
        for (const nestedPrincipal of patientPrincipals) {
            const result = await actor.check_patName(nestedPrincipal);
            console.log("Name: " + result);
            
            const listItem = document.createElement("li");
            listItem.textContent = result;

            const viewProfileButton = document.createElement("button");
            viewProfileButton.textContent = "View Patient Data!";
     
            viewProfileButton.addEventListener("click", async function(event) {
                console.log("Button pressed");
                event.preventDefault();
                event.stopPropagation();
                const principal =  nestedPrincipal;
                console.log("princ attained");

                document.getElementById('page1').style.display = 'none';
                document.getElementById('page2').style.display = 'none';
                document.getElementById('page3').style.display = 'block';

                document.getElementById("Name").innerText   = "";
                document.getElementById("HN").innerText     = "";
                document.getElementById("Dob").innerText    = "";
                document.getElementById("Weight").innerText = "";
                document.getElementById("Height").innerText = "";
                document.getElementById("Sex").innerText    = "";
                document.getElementById("Gender").innerText = "";

                try {
                    const profile   = await actor.logged_pat_check_patRecord(principal);
                    console.log(profile);
                    
                    if (profile !== null) {
                        
                        const patName    = (profile.name !== "")           ? profile.name    : "Not Recorded";
                        const patHN      = (profile.healthcare_num !== 0) ? profile.healthcare_num : 0;
                        const patDob     = (profile.dob !== null)          ? profile.dob     : "Not Recorded" ;
                        const patweight  = (profile.weight !== 0)          ? profile.weight  : 0;
                        const patheight  = (profile.height !== 0)          ? profile.height  : 0;
                        const patsex     = (profile.sex !== "")            ? profile.sex     : "Not Recorded";
                        const patgender  = (profile.gender !== "")         ? profile.gender  : "Not Recorded" ;
                        const pathistory = (profile.history.length > 0)    ? profile.history : [] ;
            
                        document.getElementById("Name").innerText   = patName;
                        document.getElementById("HN").innerText     = patHN;
                        document.getElementById("Dob").innerText    = patDob;
                        document.getElementById("Weight").innerText = patweight;
                        document.getElementById("Height").innerText = patheight;
                        document.getElementById("Sex").innerText    = patsex;
                        document.getElementById("Gender").innerText = patgender;
                        document.getElementById("myHist").innerHTML   = "";
                        for (const historyNote of pathistory.reverse()) {
                            console.log(historyNote);

                            const listItem = document.createElement("li");
                            listItem.textContent = historyNote;
                            document.getElementById("Hist").appendChild(listItem);
                        }
                    
                    } else {
                        document.getElementById("profileInfoDiv").innerText = "Profile not found.";
                    }
                } catch (error) {
                    console.error("Error fetching profile:", error);
                    document.getElementById("profileInfoDiv").innerText= "Error fetching profile.";
                }

                const backButton = document.createElement("button");
                backButton.textContent = "Back";
                backButton.addEventListener("click", async function(event) {
                    console.log("Button pressed");
                    event.preventDefault();
                    event.stopPropagation();
                    console.log("princ attained");
    
                    document.getElementById('page1').style.display = 'block';
                    document.getElementById('page2').style.display = 'none';
                    document.getElementById('page3').style.display = 'none';
    
                    
                });
    
                document.getElementById("goBack").innerHTML = "";
                document.getElementById("goBack").appendChild(backButton);
            });

            const updateButton = document.createElement("button");
            updateButton.textContent = "Update Patient!";
            updateButton.setAttribute("id", "createProfile");
            updateButton.setAttribute("data-nestedPrincipal", nestedPrincipal);
            
            updateButton.addEventListener("click", async function(event) {
                console.log("Button pressed");
                event.preventDefault();
                event.stopPropagation();
                const patPrinc =  nestedPrincipal;
                console.log("princ attained");

                const name    = document.getElementById("name").value;
                const sex     = document.getElementById("sex").value;
                const gender  = document.getElementById("gender").value;
                const dob     = document.getElementById("dob").value;
                var   h_id    = parseInt(document.getElementById("h_id").value);
                var   weight  = parseInt(document.getElementById("weight").value);
                var   height  = parseInt(document.getElementById("height").value);
                const history = document.getElementById("history").value;
            
                h_id   = (isNaN(h_id))   ? 0 : h_id  ;
                weight = (isNaN(weight)) ? 0 : weight;
                height = (isNaN(height)) ? 0 : height;

                const profile = {
                    name: name,
                    healthcare_num: h_id,
                    dob: dob,
                    weight: weight,
                    height: height,
                    sex: sex,
                    gender: gender,
                    history: history,
                };

                try {
                    await actor.update_patient_record(patPrinc, profile);
                    console.log("Profile Updated");
                } catch (error) {
                    console.error("error creating profile:", error);
                }
            });

            
            listItem.appendChild(viewProfileButton);
            listItem.appendChild(updateButton);
            document.getElementById("resultsList").appendChild(listItem);
        }

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
    document.getElementById('page3').style.display = 'none';
    console.log("pages should be switched");    
    
    return false;
};

const switchPageButton1 = document.getElementById("switch1");
switchPageButton1.onclick = async (e) => {
    e.preventDefault();

    document.getElementById('page1').style.display = 'block';
    document.getElementById('page2').style.display = 'none';
    document.getElementById('page3').style.display = 'none';  
 
    
    return false;
};
