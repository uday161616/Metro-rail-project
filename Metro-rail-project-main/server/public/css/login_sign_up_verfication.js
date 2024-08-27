const login_form = document.getElementById("login_form");
const signup_form = document.getElementById("register_sign_up");
const forgot_password_form = document.getElementById("forgot_password");
//sign_up_details;
const first_name = document.getElementById("formGroupExampleInput");
const last_name = document.getElementById("formGroupExampleInput2");
const mobile_no = document.getElementById("phone");
const sign_email = document.getElementById("inputEmail4");
const sign_pass = document.getElementById("inputPassword4");
const sign_repass = document.getElementById("inputPassword5");

//login_details
const login_email = document.getElementById("inputEmail6");
const login_pass = document.getElementById("inputPassword6");

//forgot_password details
const forgot_email = document.getElementById("inputEmail7");

//register verification
signup_form.addEventListener("submit", (e) => {
  // let secks = true;
  e.preventDefault();
  validateInputs();
});
const validateInputs = () => {
  const emailValue = sign_email.value.trim();
  const PassValue = sign_pass.value.trim();
  const RepassValue = sign_repass.value.trim();
  const first_value = first_name.value.trim();
  const last_value = last_name.value.trim();
  const mobile_value = mobile_no.value.trim();
  const data = {
    email: emailValue,
    password: PassValue
  };
  
  // Encode the data as a URL query string
  const params = new URLSearchParams(data).toString();

  if (emailValue === "") {
    setError(sign_email, "Email is required");
    return;
  } else if (!isValidEmail(emailValue)) {
    setError(sign_email, "Provide a valid email address");
    return;
  } else if (PassValue === "") {
    SetError(sign_pass, "Password is required");
    return;
  } else if (PassValue.length < 8) {
    SetError(sign_pass, "Password must be at least 8 character.");
    return;
  } else if (RepassValue == "") {
    SetError(sign_repass, "Repassword is required");
    return;
  } else if (RepassValue != PassValue) {
    SetError(sign_repass, "password mismatch");
    return;
  } else if (mobile_value === "") {
    SetError(mobile_no, "please enter mobile number");
    return;
  } else if (first_value === "") {
    SetError(first_name, "please enter first name");
    return;
  } else if (last_value === "") {
    SetError(last_name, "please enter last name");
    return;
  } else {
    var req = new XMLHttpRequest();
    req.open("POST", "/signup");
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.send(
      "firstName=" +
        first_value +
        "&lastName=" +
        last_value +
        "&password=" +
        PassValue +
        "&mobile=" +
        mobile_value +
        "&email=" +
        emailValue
    );
    
    req.onreadystatechange = function () {
      if (req.readyState == 4 && req.status == 200) {
       window.location.assign(`/user_profile/?${params}`);

       
      }
    };
    //   axios.post('/signup', {
    //     // firstName: first_value,
    //     // lastName: last_value,
    //     // email:emailValue,
    //     // password:PassValue,
    //     // mobile:mobile_value
    //     dada:"vinay",
    //     arjun:"vinay"
    //   })
    //     .catch(function (error) {
    //         console.log(error);
    //       });
    //       console.log(emailValue+" "+PassValue+" "+ RepassValue+" "+first_value+" "+last_value+" "+mobile_value);

    // }
  }
};
login_form.addEventListener("submit", (e) => {
  // let secks = true;
  e.preventDefault();
  validate_login();
});
const validate_login = () => {
  const emailValue = login_email.value.trim();
  const PassValue = login_pass.value.trim();
  const data = {
    email: emailValue,
    password: PassValue
  };
  
  // Encode the data as a URL query string
  const params = new URLSearchParams(data).toString();
  if (emailValue === "") {
    setError(login_email, "Email is required");
    return;
  } else if (!isValidEmail(emailValue)) {
    setError(login_email, "Provide a valid email address");
    return;
  } else if (PassValue === "") {
    SetError(login_pass, "Password is required");
    return;
  } else if (PassValue.length < 8) {
    SetError(login_pass, "Password must be at least 8 character.");
    return;
  } else {
    var req = new XMLHttpRequest();
    req.open("POST", "/login");
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.send("&password=" + PassValue + "&email=" + emailValue);
    req.onreadystatechange = function () {
      console.log(req.readyState+" "+req.status);
      if (req.readyState == 4 && req.status == 200) {
        
        window.location.assign(`/user_profile/?${params}`);
      }
    };
  }
};

//forgot password
forgot_password_form.addEventListener("submit", (e) => {
  // let secks = true;
  e.preventDefault();
  validate_forgot();
});
const validate_forgot = () => {
  const emailValue = forgot_email.value.trim();
  if (emailValue === "") {
    setError(forgot_email, "Email is required");
    return;
  } else if (!isValidEmail(emailValue)) {
    setError(forgot_email, "Provide a valid email address");
    return;
  }
  else{
    var req = new XMLHttpRequest();
    req.open("POST", "/forgot");
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.send( "&email=" + emailValue);
    req.onreadystatechange = function () {
      console.log(req.readyState+" "+req.status);
      if (req.readyState == 4 && req.status == 200) {
        
        window.location.href = "/password_recovery";
      }
    };

  }

}

const SetSuccess = (element) => {
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector(".error");

  errorDisplay.innerText = "";
  inputControl.classList.add("success");
  inputControl.classList.remove("error");
};

const SetError = (element, message) => {
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector(".error");

  errorDisplay.innerText = message;
  inputControl.classList.add("error");
  inputControl.classList.remove("success");
};

//isvalid email_verfication
const isValidEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};
