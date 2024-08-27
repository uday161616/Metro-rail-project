//require modules 
const express = require("express");
const body_parser = require("body-parser");
const env = require("env");
const fs = require("fs");

const ejs = require("ejs");
const app = express();

const PDFDocument = require('pdfkit');
const cors = require("cors");


//mapping station names to id  for trains 
const mapping = ["none", "Miyapur", "JNTU College", "KPHB Colony", "Kukatpally", "Balanagar", "Moosapet", "Bharat Nagar", "Erragadda", "ESI Hospital", "S.R. Nagar", "Ameerpet", "Madhura Nagar", "Yusufguda", "Road No. 5 Jubilee Hills", "Jubilee Hills Checkpost"];



//require module for sms 
const { Vonage } = require("@vonage/server-sdk");

const vonage = new Vonage({
  apiKey: "ca65f038",
  apiSecret: "Bc8z5kd8BUjVwMS6",
});


//require module for email 
const nodemailer = require("nodemailer");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());
app.use(cors());

//connection with mysql database in php_my_admin
const mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "dbms_project",
  timezone: "+00:00"
});

connection.connect(function (err) {
  if (err) {
    console.error("error in connecting database : " + err.stack);

    return;
  }
  console.log("success in connecting database");
});


//start page of website
app.get("/", function (req, res) {
  res.render("index", {});
  // res.render("train_timing",{});
});

//each functionalities of start page
app.get("/account", function (req, res) {
  res.render("login_page_and_signup_page", {});

});

//signup route
app.post("/signup", function (req, res) {
  console.log(req.body);
  res.redirect("/");
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const password = req.body.password;
  const mobile = req.body.mobile;
  const email = req.body.email;

  var sql =
    "INSERT INTO `sign_up_details` (`first_name`, `last_name`, `mobile_number`, `email`, `password`) VALUES ?";
  var values = [[firstName, lastName, mobile, email, password]];
  connection.query(sql, [values], function (err, result) {
    if (err) {
      console.log("error in inserting at sign_up");
      res.status(301).send(err);
    } else {
      console.log("success in inserting at sign_up");
      res.status(200).send();
    }
  });
});

//login route

app.post("/login", function (req, res) {
  // console.log(req.body);
  const password = req.body.password;
  const email = req.body.email;
  console.log("logged by user " + " " + email);

  var sql =
    "SELECT * FROM `sign_up_details` WHERE `email`=? and `password`=?; ";

  connection.query(sql, [email, password], function (err, result) {
    if (err) {
      console.error("Error querying database: " + err);
      res.status(500).send("Error querying database");
      return;
    }

    console.log(result);
    if (result.length > 0) {
      // User found, redirect to home page or some other page
      res.status(200).send("su");
    } else {
      // User not found, show error message
      res.status(401).send("Invalid email or password");
    }
  });
});

// nodemailer functions
//start
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "testseproject2023@gmail.com", //email ID
    pass: "phjnylboqcfyqgag", //Password
  },
});
function sendmail(email, otp) {
  let texts = otp.toString();
  var details = {
    from: "testseproject2023@gmail.com", // sender address same as above
    to: email, // Receiver's email id
    subject: "Hyderabad Metro OTP verification",
    // Subject of the mail.
    text: "hello  your otp",
    html: texts, // Sending OTP
  };
  transporter.sendMail(details, function (error, data) {
    if (error) {
      console.log(error);
    } else {
      console.log(data);
    }
  });
}


function sendmail2(email, texts, pdf, cont) {
  var details = {
    from: "testseproject2023@gmail.com", // sender address same as above
    to: email, // Receiver's email id
    subject: "Hyderabad Metro Booking ticket confirmation",
    // Subject of the mail.
    text: "Hello my Dear Customer Your booking ticket info",
    html: texts,
    attachments: [{
      filename: pdf,
      content: cont
    }]
  };
  transporter.sendMail(details, function (error, data) {
    if (error) {
      console.log(error);
    } else {
      console.log(data);
    }

  });
}
// end of node of nodemailer function

//forgot_password_start

//global variables for otp verification
let user_email;
let otp_code;
app.post("/forgot", function (req, res) {
  var email = req.body.email;
  var otp = Math.floor(Math.random() * 10000 + 1);
  store(email, otp);

  var sql = "SELECT * FROM `sign_up_details` WHERE `email`=?; ";

  connection.query(sql, [email], function (err, result) {
    if (err) {
      console.error("Error querying database: " + err);
      res.status(500).send("Error querying database");
      return;
    }

    console.log(result);
    if (result.length > 0) {
      // User found, redirect to home page or some other page
      sendmail(email, otp);
      res.status(200).send("su");
    } else {
      // User not found, show error message
      res.status(401).send("Invalid/unregistered email");
    }
  });
});

//password recovery page
app.get("/password_recovery", function (req, res) {
  res.render("recovery_password", { email: user_email });
});

//global variables storing
function store(email, otp) {
  user_email = email;
  otp_code = otp.toString();
  console.log(user_email + " " + otp_code);
}

//verification of forgot password
app.post("/verify_forgot_password", function (req, res) {
  let password = req.body.NewPassword;
  let generated_otp = req.body.OTP;
  let re_password = req.body.ConfirmNewPassword;
  // console.log(req.body);
  if (generated_otp == otp_code && password == re_password) {
    // console.log(generated_otp+ " "+ password);

    var sql = "UPDATE `sign_up_details` SET `password`=?  WHERE `email`=?; ";

    connection.query(sql, [password, user_email], function (err, result) {
      if (err) {
        console.error("Error querying database: " + err);
        res.status(500).send("Error querying database");
        return;
      }

      console.log(result);
      if (result.changedRows > 0) {
        console.log("successfully updated password ");
        res.redirect("/");
      } else {
        // User not found, show error message
        res.status(401).send("unregiseted email ");
      }
    });
  } else {
    res.status(401).send("otp mismatched and wrong password");
  }
});


//forgot_password_end



app.get("/logged_in", function (req, res) {
  var sql =
    "SELECT * FROM `sign_up_details` WHERE `email`=? and `password`=?; ";

  connection.query(sql, [email, password], function (err, result) {
    if (err) {
      console.error("Error querying database: " + err);
      res.status(500).send("Error querying database");
      return;
    }

    console.log(result);
    if (result.length > 0) {
      // User found, redirect to home page or some other page
      res.status(200).send("su");
    } else {
      // User not found, show error message
      res.status(401).send("Invalid email or password");
    }
  });
});
let user_login_details;
app.get("/user_profile", function (req, res) {
  const email = req.query.email;
  const password = req.query.password;
  var sql =
    "SELECT * FROM `sign_up_details` WHERE `email`=? and `password`=?; ";
  connection.query(sql, [email, password], function (err, result) {
    if (err) {
      console.error("Error querying database: " + err);
      res.status(500).send("Error querying database");
      return;
    }

    // console.log(result);
    if (result.length > 0) {
      // User found, redirect to home page or some other page
      //  console.log(result[0]);
      console.log(result[0]);
      user_login_details = result[0];
      console.log("success in finding user login");
      res.render("user_profile", { result: result[0] });
    } else {
      // User not found, show error message
      res.status(401).send("Invalid email or password");
    }
  });
});
app.get("/user_profile/myprofile", function (req, res) {
  // console.log(req.query);
  res.render("my_profile", { result: req.query });
});

app.get("/user_profile/change_password", function (req, res) {
  // console.log(req.query);
  res.render("change_password", { result: req.query });
});

app.get("/user_profile/save_new_password", function (req, res) {
  // return;
  console.log(req.query);
  // return;

  var sql = "UPDATE `sign_up_details` SET `password`=?  WHERE `email`=?; ";

  connection.query(
    sql,
    [req.query.new_password, req.query.email],
    function (err, result) {
      if (err) {
        console.error("Error querying database: " + err);
        res.send("Error querying database");
        return;
      }

      console.log(result);
      if (result.changedRows > 0 || result.affectedRows > 0) {
        console.log("successfully updated password ");
        const result = {
          first_name: req.query.first_name,
          last_name: req.query.last_name,
          mobile_number: req.query.mobile_number,
          email: req.query.email,
          password: req.query.new_password,
          new: "adding",
        };
        res.render("user_profile", { result: result });
        return;
      }
    }
  );
});



//buy ticket
app.get("/user_profile/buy_ticket", function (req, res) {
  console.log(req.query);
  res.render("buy_ticket", { result: req.query });
});





//booking ticket
let fare = 0;
app.get("/user_profile/book", function (req, res) {
  console.log(req.query);


  var sql = "SELECT * FROM `passenger` WHERE `email`=? and `phone_number`=?";

  connection.query(
    sql,
    [req.query.email, req.query.mobile_number],
    function (err, result) {
      if (err) {
        console.error("Error querying in passenger database for finding passenger: " + err);
        res.status(500).send("Error querying database");
        return;
      }

      if (result.length > 0) {
        console.log(result + "we found user in passenger table");

      } else {
        // User not found, show error message
        sql =
          "INSERT INTO `passenger` (`passenger_id`,`first_name`,`last_name`,`email`,`phone_number`) VALUES ?";
        connection.query(
          sql,
          [[[req.query.id, req.query.first_name, req.query.last_name, req.query.email, req.query.mobile_number]]],
          function (err, result) {
            if (err) {
              console.error("Error querying passenger database: " + err);
              res.status(500).send("Error querying database");
              return;
            }
            else {
              console.log("successfully inserted into passenger table");
            }
          }
        );
      }

    }
  );
  let pass_id = parseInt(req.query.id);
  let train_id = (pass_id) % 15 + 1;
  let source_id = parseInt(req.query.from);
  let to_id = parseInt(req.query.to);
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let currentDate = `${year}-${month}-${day}`;
  // console.log(currentDate); 
  let send_info_to_email = "<p>" + "Dear " + req.query.first_name + " " + req.query.last_name + " " + "your booking  is confirmed on " + "<span style=`color:blue;`>" + req.query.date + "</span>" + " Valid for Only 24 hrs" + "</p>";


  let temp_big, temp_small;
  if (source_id > to_id) {
    temp_big = source_id;
    temp_small = to_id;

  }
  else {
    temp_big = to_id;
    temp_small = source_id;
  }

  console.log(temp_big + " " + temp_small + " ");
  sql = "SELECT calculate_fare(?) AS result";
  connection.query(sql, [[temp_small, temp_big]], function (err, results) {
    if (err) {
      console.error("Error in calculate fare problem: " + err);
      res.status(500).send("Error querying database");
      return;
    }
    // console.log(results[0].result);

    fare = parseInt(results[0].result);
    // delete_ticket_pdf();
    create_ticket_pdf(mapping[source_id], mapping[to_id], fare, req.query.email, send_info_to_email);

    sql = "INSERT INTO `ticket` (`passenger_id`,`train_id`,`source_station_id`,`destination_station_id`,`booked_date`,`fare`) VALUES ?";
    connection.query(
      sql,
      [[[pass_id, train_id, source_id, to_id, currentDate, fare]]],
      function (err, result) {


        if (err) {
          console.error("Error querying database: " + err);
          res.status(500).send("Error querying database");
          return;
        }
      }
    );


  })
  // res.render("index",{});
  res.redirect("/");
});




app.get("/user_profile/transactions", function (req, res) {
  console.log(req.query);
  let id = req.query.id;
  // let store;


  sql = "SELECT * FROM `ticket` WHERE `passenger_id`=?";
  connection.query(
    sql,
    [[[id]]],
    function (err, result) {
      if (err) {
        console.error("Error querying database: " + err);
        res.status(500).send("Error querying database");
        return;
      }
      console.log(result);
      var store = result;
      for (let i = 0; i < result.length; i++) {
        store[i].source_station_id = mapping[store[i].source_station_id];
        store[i].destination_station_id = mapping[store[i].destination_station_id];
      }
      console.log(store);
      res.render("transactions", { result: req.query, transaction_sending: store });
    }
  );
  // console.log(store);



});



//get_fare of website_starting functionality of website
app.post("/get_fare", function (req, res) {
  console.log(req.body);
  let to = parseInt(req.body.to);
  let from = parseInt(req.body.from);
  let temp_small, temp_big;
  if (to > from) {
    temp_big = to;
    temp_small = from;
  }
  else {
    temp_big = from;
    temp_small = to;
  }

  const source = mapping[from];
  const destination = mapping[to];

  sql = "SELECT calculate_fare(?) AS result";
  connection.query(sql, [[temp_small, temp_big]], function (err, results) {
    if (err) {
      console.error("Error in calculate fare problem: " + err);
      res.status(500).send("Error querying database");
      return;
    }
    // console.log(results[0].result);

    fare = parseInt(results[0].result);
    console.log(fare);
    const sent = { source: source, destination: destination, fare: fare };
    res.status(200).send(sent);
  })


})




function send_sms(req) {
  let type =
    "Dear " +
    req.query.first_name +
    " " +
    req.query.last_name +
    " you successfully booked metro ticket from " +
    req.query.from +
    " to " +
    req.query.to +
    " on date " +
    req.query.date +
    " Use it within  24 hours day ";
  let number = "91" + req.query.mobile_number;
  const from = "Vonage APIs";
  const to = number;
  const text = type;

  async function sendSMS() {
    await vonage.sms
      .send({ to, from, text })
      .then((resp) => {
        console.log("Message sent successfully");
        console.log(resp);
      })
      .catch((err) => {
        console.log("There was an error sending the messages.");
        console.error(err);
      });
  }

  sendSMS();
}
//deletion of pdf which created after sending it mail
function create_ticket_pdf(from, to, fare, to_mail, send_info_to_email) {
  const doc = new PDFDocument();

  // Set the document information
  doc.info['Title'] = 'Train Fare';

  // Set the document metadata
  doc.metadata = {
    Title: 'Train Fare',
    Author: 'Metro train',
    Subject: 'Train Fare PDF',
    Keywords: 'train fare, pdf, example',
    CreationDate: new Date(),
    ModificationDate: new Date(),
  };

  // Set the font to the default PDF font
  doc.font('Helvetica');
  doc.rect(10, 10, 590, 770)
    .strokeColor('black')
    .lineWidth(1)
    .fillOpacity(0.2)
    .stroke()
    .fill()
    .fillOpacity(1)

  // Set the document content
  doc.image('board.png', {
    fit: [200, 150],
    align: 'center',
    valign: 'center',
    x: 200, // Set the X position to 100 points
    y: 140 // Set the Y position to 200 points
  });
  doc.rect(10, 10, 590, 770).fillColor('#F0F8FF').fill();

  doc.image('logo.png', {
    fit: [400, 400],
    align: 'center',
    valign: 'center',
    x: 120, // Set the X position to 100 points
    y: 440 // Set the Y position to 200 points
  });
  doc.fillColor('blue').fontSize(18).text('ERS Train Ticket', { align: 'center' }).underline(240, 90, 132, 2, { color: 'blue' });
  doc.moveDown();
  let info_fare = 'One-way Ticket - Fare:' + fare.toString();
  doc.fillColor('black').fontSize(18).text(info_fare, { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text('Date: ' + new Date().toDateString(), { align: 'center' });
  doc.moveDown();
  doc.moveDown();
  doc.moveDown();
  doc.fontSize(16).text('From', 100, 200);
  doc.fontSize(16).text('To', 470, 200);
  doc.moveDown();
  doc.fontSize(18).text(from, 50, 230);
  doc.fontSize(18).text(to, 400, 230);
  doc.moveDown();
  doc.fillColor('black').fontSize(20).text(' This ticket is valid for one day only.', 150, 350);
  doc.moveDown();
  doc.fillColor('black').fontSize(20).text('Please retain this ticket for inspection.', 150, 390);
  doc.moveDown();
  doc.fillColor('red').fontSize(20).text('For assistance, please call (555) 555-5555.', 120, 470);

//buffer file content

  const buffers = [];
  doc.on('data', (chunk) => buffers.push(chunk));
  doc.on('end', () => {
    const pdfBuffer = Buffer.concat(buffers);
    let train_fare = "train-fare.pdf"
    sendmail2(to_mail, send_info_to_email, train_fare, pdfBuffer);

  })

  // Pipe the document output to a file
  doc.pipe(fs.createWriteStream('train-fare.pdf'));

  // Finalize the PDF document
  console.log("pdf_created_successfully");
  doc.end();
}


function delete_ticket_pdf() {

  fs.unlink('train-fare.pdf', (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('File deleted successfully');
  });
}

app.get("/train_timing",function(req,res){
  res.render("train_timing",{});
})
app.get("/feedback",function(req,res){
  res.render("feedback",{});
})
app.get("/contact_us",function(req,res){
  res.render("contact_us",{});
})
app.get("/lost_and_found",function(req,res){
  res.render("lost_and_found",{});
})
app.get("/metro_network_map",function(req,res){
  res.render("metro_network_map",{});
})
app.get("/offences_and_penalities",function(req,res){
  res.render("offences_and_penalities",{});
})
app.get("/penalty_charter",function(req,res){
  res.render("penalty_charter",{});
})
app.get("/our_commitment",function(req,res){
  res.render("our_commitment",{});
})

app.post("/feedback/submit",function(req,res){
  // console.log(req.body);
  sql =
          "INSERT INTO `feedback` (`feedback_type`,`name`,`email`,`mobile_number`,`comments`) VALUES ?";
        connection.query(
          sql,
          [[[req.body.type_of_comment, req.body.Name, req.body.Email, req.body.Mobile, req.body.your_comments]]],
          function (err, result) {
            if (err) {
              console.error("Error querying passenger database: " + err);
              res.status(500).send("Error querying database");
              return;
            }
            else {
              sendmail3(req.body.Email,req.body.your_comments);
              console.log("Successfully received feedback");
              res.redirect("/thank_you");
            }
          }
        );
  
})

app.get("/commercial_shoot",function(req,res){
  res.render("commercial_shoots",{});
})
app.get("/thank_you", function (req, res) {
  res.render("thank_you", {});
})
app.get("/covid_update",function(req,res){
  res.render("covid_update",{});
})

function sendmail3(email, otp) {
  let texts = otp.toString();
  var details = {
    from: "testseproject2023@gmail.com", // sender address same as above
    to: email, // Receiver's email id
    subject: "Recieved Your FeedBack Form",
    // Subject of the mail.
    text: "Your FeedBack is ",
    html: texts, // Sending OTP
  };
  transporter.sendMail(details, function (error, data) {
    if (error) {
      console.log(error);
    } else {
      console.log(data);
    }
  });
}
// ports listening functions
app.listen(process.env.PORT || 3000, function () {
  console.log("listening on port 3000");
});
