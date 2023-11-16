import Hashmap "mo:base/HashMap";
import Principal "mo:base/Principal"; 
import Result "mo:base/Result";
import Time "mo:base/Time";

actor {
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

//*create new profile and store it inside the hashmap : the Key is the principal of the calle and the Value is the Profile submited
let users : Hashmap.HashMap<Principal, Profile> = Hashmap.HashMap<Principal, Profile> (0, Principal.equal, Principal.hash);

/*Principal methods of the HashMap:
.put() : Create 
.get() : Read 
.replace() : Update 
.delete() : Delete 
*/


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
