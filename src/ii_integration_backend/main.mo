import Hashmap "mo:base/HashMap";
import List "mo:base/List";
import Principal "mo:base/Principal"; 
import Result "mo:base/Result";
import Time "mo:base/Time";
import Random "mo:base/Random";
import Hash "mo:base/Hash";
import Prim "mo:prim";
import Int "mo:base/Int";
import Option "mo:base/Option";


actor {
  
  let seed : Blob = "\14\C9\72\09\03\D4\D5\72\82\95\E5\43\AF\FA\A9\44\49\2F\25\56\13\F3\6E\C7\B0\87\DC\76\08\69\14\CF";
  let random = Random.Finite(seed);
  
  public shared (msg) func whoami() : async Principal {
    msg.caller
  };

  // Time 
  public type Time = Time.Time;

  // Patient
  public type accessLog  = List.List<Text>;
  public type patHist    = List.List<Text>;
  public type patList    = List.List<Principal>;
  public type patData    = {
    name           : Text; 
    healthcare_num : Nat;
    dob            : Text; 
    weight         : Nat;
    height         : Nat;
    sex            : Text;
    gender         : Text;
    history        : patHist;
  };

  public type docData = {
    name    : Text; 
    doc_num : Nat;
    title   : Text;
  };

  // Storage
  let eq: (Nat,Nat) ->Bool = func(x, y) { x == y };
  let keyHash: (Nat) -> Hash.Hash = func(x) { Prim.natToNat32 x };
  let keyToDoc     : Hashmap.HashMap<Nat, Principal>       = Hashmap.HashMap<Nat, Principal> (0, eq, keyHash);
  let docToPatList : Hashmap.HashMap<Principal, patList>   = Hashmap.HashMap<Principal, patList> (0, Principal.equal, Principal.hash);
  let patToDoc     : Hashmap.HashMap<Principal, Principal> = Hashmap.HashMap<Principal, Principal> (0, Principal.equal, Principal.hash);
  let patToRecord  : Hashmap.HashMap<Principal, patData>   = Hashmap.HashMap<Principal, patData> (0, Principal.equal, Principal.hash);
  let docToDocData : Hashmap.HashMap<Principal, docData>   = Hashmap.HashMap<Principal, docData> (0, Principal.equal, Principal.hash);
  let patAccessLog : Hashmap.HashMap<Principal, accessLog> = Hashmap.HashMap<Principal, accessLog> (0, Principal.equal, Principal.hash);

  //* Generate Key
  public shared ({caller}) func genTempKey() : async ?Nat {
    return random.range(32);
  }; 

  //* checkValidDoctorInfo
  public shared ({caller}) func checkValidDoctorInfo() : async Bool {
    var curDocInfo : ?docData = docToDocData.get(caller);
    switch(curDocInfo) {
      case null {return false};
      case (?curDocInfo) {
        if (curDocInfo.name == "") {return false};
        if (curDocInfo.doc_num == 0) {return false};
        if (curDocInfo.title == "") {return false};
        return true;
      }
    };
  }; 

  //* AddNewPatient
  public shared ({caller}) func addNewPatient() : async ?Nat {
    var tempKey = await genTempKey();

    switch(tempKey) {
      case (?tempKey) {keyToDoc.put(tempKey, caller)};
      case null {};
    };

    return tempKey; 
  };

  //* UpdateDocInfo
  public shared ({caller}) func updateDocInfo(newDocInfo : docData) : async Result.Result<Text, Text> {
    var curDocInfo : ?docData = docToDocData.get(caller);

    switch(curDocInfo) {
      case (?curDocInfo) {
        
        var newName : Text = "";
        switch(newDocInfo.name) {
          case "" {newName := curDocInfo.name};
          case _  {newName := newDocInfo.name};
        };

        var newDocNum : Nat = 0;
        switch(newDocInfo.doc_num) {
          case 0 {newDocNum:= curDocInfo.doc_num};
          case _  {newDocNum:= newDocInfo.doc_num};
        };

        var newTitle : Text = "";
        switch(newDocInfo.title) {
          case "" {newTitle:= curDocInfo.title};
          case _  {newTitle:= newDocInfo.title};
        };

        var updatedDocInfo : docData = {
          name = newName;
          doc_num = newDocNum;
          title = newTitle;
        };

        docToDocData.put(caller, updatedDocInfo);
      };

      case null {
        docToDocData.put(caller, newDocInfo);
      };
    };

    return #err("Updated Doctor Information.");
  };

  //* pat_addNewPatRecord
  public shared ({caller}) func addPatRecord(patPrincipal : Principal) : async() {
    var newRecord : patData = {
      name : Text           = "";
      healthcare_num : Nat  = 0;
      dob : Text            = "";
      weight: Nat           = 0;
      height: Nat           = 0;
      sex: Text             = "";
      gender: Text          = "";
      history: patHist      = List.nil<Text>();
    };
    patToRecord.put(patPrincipal, newRecord);

    var newLog : accessLog = List.nil<Text>();
    newLog := List.push("Patient Record Created.", newLog);
    patAccessLog.put(patPrincipal, newLog);

    return;
  };

  //* AcceptNewDoc
  public shared ({caller}) func acceptNewDoc(tempKey: Nat) : async() {

    // Link doctor to patient
    var docPrincipal = keyToDoc.get(tempKey);
    
    switch (docPrincipal) {
      case (?docPrincipal) {
        patToDoc.put(caller, docPrincipal);
        var curList : ?patList = docToPatList.get(docPrincipal);
        var nxtList : patList  = List.nil<Principal>(); 

        switch(curList) {
          case (?curList) {
            nxtList := curList;
          };
          case null {};
        };

        nxtList := List.push<Principal>(caller, nxtList);
        docToPatList.put(docPrincipal, nxtList);
        keyToDoc.delete(tempKey);
      };
      case null {};
    };

    // Create Patient Record if does not exist
    if (patAccessLog.get(caller) == null)
    {
      await addPatRecord(caller);
    };

    return; 
  }; 

  //*Update: Result type. 
  public shared({caller}) func init_patient_record(patPrincipal: Principal, initRecord : patData) : async Result.Result<Text, Text> {
    var oldRecord : ?patData = patToRecord.get(patPrincipal);
    switch(oldRecord) {
      case(null) return #err("There is no patient record for this Patient");
      case(?oldRecord) {
        patToRecord.put(patPrincipal, initRecord); 
        return #err("Record Initialized"); 
      };
    };
  };

  //*Update: Result type. 
  public shared({caller}) func update_patient_record(patPrincipal: Principal, updateRecord : patData) : async Result.Result<Text, Text> {
    var curRecord : ?patData = patToRecord.get(patPrincipal);
    switch(curRecord){
      case(null) return #err("There is no patient record for this Patient");
      case(?curRecord) {
        var newName : Text = "";
        switch (updateRecord.name) {
          case "" { newName := curRecord.name};
          case _  { newName := updateRecord.name};
        };

        var newHC_num : Nat = 0;
        switch (updateRecord.healthcare_num) {
          case 0 { newHC_num := curRecord.healthcare_num};
          case _ { newHC_num := updateRecord.healthcare_num};
        };
        
        var newDoB : Text = "";
        switch (updateRecord.dob) {
          case "" { newDoB:= curRecord.dob};
          case _  { newDoB:= updateRecord.dob};
        };

        var newWeight: Nat = 0;
        switch (updateRecord.weight) {
          case 0 { newWeight:= curRecord.weight};
          case _ { newWeight:= updateRecord.weight};
        };
        
        var newHeight: Nat = 0;
        switch (updateRecord.height) {
          case 0 { newHeight:= curRecord.height};
          case _ { newHeight:= updateRecord.height};
        };

        var newSex : Text = "";
        switch (updateRecord.sex) {
          case "" { newSex:= curRecord.sex};
          case _  { newSex:= updateRecord.sex};
        };

        var newGender : Text = "";
        switch (updateRecord.gender) {
          case "" { newGender:= curRecord.gender};
          case _  { newGender:= updateRecord.gender};
        };

        var newHistory : List.List<Text> = List.nil<Text>();
        switch (updateRecord.history) {
          case null {
            newHistory := curRecord.history;
          };
          case _  {
            newHistory := List.append<Text>(curRecord.history, updateRecord.history);
          };
        };

        var newRecord : patData = {
          name           = newName;
          healthcare_num = newHC_num;
          dob            = newDoB;
          weight         = newWeight;
          height         = newHeight;
          sex            = newSex;
          gender         = newGender;
          history        = newHistory;
        };
        patToRecord.put(patPrincipal, newRecord); 

        var curLog : ?accessLog       = patAccessLog.get(patPrincipal);
        switch (curLog) {
          case null {};
          case (?curLog) {
            var newLog : accessLog = List.push("Record Modified", curLog);
            patAccessLog.put(patPrincipal, newLog);
          };
        };
      };
    };
    return #err("Record modified"); 
  };

  //* Logged Docotor reading Patient Data 
  public shared({caller}) func logged_pat_check_patRecord(patPrincipal: Principal) : async ?patData{

    var accessLogMsg : Text = "";
    var success      : Bool = false;
    var doctorInfo : ?docData = docToDocData.get(caller);

    switch(doctorInfo) {
      case null { accessLogMsg := "Read Access Denied: No Doctor Info" };
      case (?doctorInfo) {
        var doctor_name = doctorInfo.name;
        if (doctor_name != "") {
          var doc_s_Patients : ?patList = docToPatList.get(caller);
          switch (doc_s_Patients) {
            case null {
              accessLogMsg := "Read Access Denied: Patient not under doctor";
            };
            case (?doc_s_Patients) {
              let result : ?Principal = List.find<Principal>(doc_s_Patients, func p {p == patPrincipal});
              switch (result) {
                case null {
                  accessLogMsg := "Read Access Denied: Patient not under doctor";
                };
                case (?Principal) {
                  success := true;
                  accessLogMsg := "Patient Record Viewed by: Doctor" # doctor_name;
                };
              };
            };
          };
        } else {
          accessLogMsg := "Read Access Denied: No Doctor Name";
        };
      };
    };
    
    var curLog : ?accessLog       = patAccessLog.get(patPrincipal);

    switch (curLog) {
      case null {};
      case (?curLog) {
        var newLog : accessLog = List.push(accessLogMsg, curLog);
        patAccessLog.put(patPrincipal, newLog);
      };
    };

    if (success) {
      return(patToRecord.get(patPrincipal));
    } else {
      return null;
    }
  };

//=============================================================READ/QUERIES========================================

  public shared({caller}) func doc_check_doc_patientList() : async ?patList {
    return(docToPatList.get(caller));
  };
  
  //* Read: Optional Type needed 
  public query func check_doc_patientList(docPrincipal : Principal) : async ?patList {
    return(docToPatList.get(docPrincipal));
  };

  //* Read: Optional Type needed 
  public query func check_pat_doctor(patPrincipal : Principal) : async ?Principal {
    return(patToDoc.get(patPrincipal));
  };

  //* Read: Optional Type needed 
  public query func check_key(key: Nat) : async ?Principal {
    return(keyToDoc.get(key));
  };

  //* Read: Optional Type needed 
  public query func check_patRecord(patPrincipal: Principal) : async ?patData{
    return(patToRecord.get(patPrincipal));
  };
  
  //* Read: Optional Type needed 
  public query func check_patName(patPrincipal: Principal) : async Text{
    var PatRecord : ?patData = patToRecord.get(patPrincipal);
    switch (PatRecord) {
      case null {};
      case (?PatRecord) {
        return PatRecord.name;
      };
    };
    return "";
  };

  //* Read: Optional Type needed 
  public query func check_patAccessLog(patPrincipal: Principal) : async ?accessLog{
    return(patAccessLog.get(patPrincipal));
  };

  //* Read: Optional Type needed 
  public query func check_docData(docPrincipal: Principal) : async ?docData{
    return(docToDocData.get(docPrincipal));
  };
};
