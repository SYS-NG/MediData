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

  //Time 
  public type Time = Time.Time;

  //Profile fields
  public type Profile = {
    name : Text; 
    age : Nat; 
    registration_date: Time;
    premium_user : Bool; 
    bio : Text;
  }; 

  public type patList = List.List<Principal>;
  let eq: (Nat,Nat) ->Bool = func(x, y) { x == y };
  let keyHash: (Nat) -> Hash.Hash = func(x) { Prim.natToNat32 x };
  let keyToDoc     : Hashmap.HashMap<Nat, Principal> = Hashmap.HashMap<Nat, Principal> (0, eq, keyHash);
  
  
  let docToPatList : Hashmap.HashMap<Principal, patList> = Hashmap.HashMap<Principal, patList> (0, Principal.equal, Principal.hash);
  let patToDoc     : Hashmap.HashMap<Principal, Principal> = Hashmap.HashMap<Principal, Principal> (0, Principal.equal, Principal.hash);


  //* Generate Key
  public shared ({caller}) func genTempKey() : async ?Nat {
    return random.range(32);
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

  //* AcceptNewDoc
  public shared ({caller}) func acceptNewDoc(tempKey: Nat) : async() {
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
    return; 
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

  //==================================================== OLD CODE ==========================================================================
  //*create new profile and store it inside the hashmap : the Key is the principal of the calle and the Value is the Profile submited
  let users        : Hashmap.HashMap<Principal, Profile> = Hashmap.HashMap<Principal, Profile> (0, Principal.equal, Principal.hash);


  //* Create:  Caller is the Principal of the caller
  public shared ({caller}) func create_profile(user : Profile) : async () {
    users.put(caller, user); 
    return; 
  }; 

  //* Read: Optional Type needed 
  public query func read_profile(principal : Principal) : async ?Profile {
    return(users.get(principal));
  };


  //*Update: Result type introduced - Swicth/Case. 
  public shared({caller}) func update_profile(user : Profile) : async Result.Result<Text, Text> {
    switch(users.get(caller)) {
      case(null) return #err("There is no user profile for principal :  " # Principal.toText(caller));
      case(?user) {
        users.put(caller, user); 
        return #err("Profile modified for user with principal : " # Principal.toText(caller)); 
      };
    };
  };


  //* Delete: 
  public shared ({caller}) func delete_profile(principal : Principal) : async Result.Result<(), Text>{
    assert (caller == principal);
    switch (users.remove(principal)) {
      case(null) {
        return #err("There is no profile for user with principal " # Principal.toText(principal)); 
      }; 
      case(?user) {
        return #ok();
      };
    };
  };

};
