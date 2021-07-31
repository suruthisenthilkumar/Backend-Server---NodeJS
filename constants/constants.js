const NO_EMAIL_REGISTERED = 'User does not exist!';
const INCORRECT_PASSWORD = 'The password you have entered is incorrect';
const IVALID_OTP = 'Invalid OTP';
const UNAUTHORIZED_ADMIN = 'You are not Admin';
const ALREADY_LOGGED_IN = "Looks like you're already logged in elsewhere!";
const UNREGISTERED_MANAGER = "Looks like you haven't registered yet!";
const QA_SUCCESSFUL_REGISTRATION = "You have successfully registered!";

const SUCCESSFUL_REGISTRATION= "You have successfully registered! Please check your mail for further details.";

const UNAUTHORIZED_ACCESS = 'Your role does not permit you to access this page';

    //change user password
const CONFIG_OLD_PASSWORD_CHANGE = "The old password you have entered is incorrect.";
const CONGIF_DETAILS_UPDATED = "Updated Successfully";

    //change password of gsac email ID -- can be done only be GSAC Admin
    const CHANGE_PWD_NEW = "New password must not be same as the old password";
    const CHANGE_PWD_SUCCESS= "Your password has been changed successfully!";

    const ERROR_SENDING_MAIL ="There was an error while sending the email! Please contact support team.";

    const CHECK_MAIL = "Please check your email for further instructions.";
    const FORGOT_PWD = "Password reset successfully!";

    //New project request raised after login by manager
    const CREATE_NEW_PROJECT_REQUEST =  "New Project Request Created! You can now fill in the RFI details by clicking the edit icon under the 'RFI Tab'";

    // const CREATE_QA_SUCCESS = `Email sent to ${email} for confirmation`; //when security head clicks on submit after clicking on the create QA button this message is displayed

    const LINK_EXPIRED_MSG= '"Ooops!! It looks like you can no longer access this link!"';//for create QA and forgot password links

    //EMAIL CONTENT - Has all the email subjects and contents sent to users from vl.gsac@valuelabs.com
    const REGISTER_MANAGER_SUBJECT = 'Welcome to GSAC';
    // const REGISTER_MANAGER_CONTENT =`<h1>Hi ${client_name},</h1><p>Welcome to GSAC! </p><p>You can now login to GSAC using your email: ${user_email}. Please note your Request ID to view the status of your request on the portal. If you have not filled in the RFI details during registration you can update them after login, by clicking on the edit icon under the 'RFI Tab'</p><p> REQUEST ID:<b> ${request_id}</b></p><p>Regards,<br>GSAC Team</p>`;
    const REGISTER_SUBJECT_SECURITYHEAD = 'GSAC User Alert!';
    // const REGISTER_CONTENT_SECURITYHEAD_RFI = `<h1>Hi,</h1> <p>You have a new user in the GSAC Portal with the following details:</p><p>User: ${client_name}<br> Requester Name: ${requester_name}<br> Request ID: ${request_id} <br> Project Name: ${project_name}.</p><p> Please note that the user has uploaded ${rfi_type} RFI information.</p><p>Please log in to view.</p><p>Regards, <br>GSAC Team</p>`; //if rfi information was also filled in by manager during registration
    // const REGISTER_CONTENT_SECURITYHEAD = `<h1>Hi,</h1> <p>You have a new user in the GSAC Portal with the following details:</p><p>User: ${client_name}<br> Requester Name: ${requester_name}<br> Request ID: ${request_id} <br> Project Name: ${project_name}.</p><p> Please note that the user has not uploaded any RFI information and you will be notified via mail when he/she does so.</p><p>Regards, <br>GSAC Team</p>`;
    
    const OTP_MAIL_SUBJECT= "GSAC Portal OTP";
    // const OTP_MAIL_CONTENT=`<h1>Hi ${client.client_name},</h1><p> Please use the OTP:<b> ${token}</b> to log in. This OTP is valid for 2 minutes.</p><p>Regards,<br>GSAC Team</p>`;
    
    const FORGOT_PWD_SUBJECT=  'GSAC: Password Reset Request';
    // const FORGOT_PWD_CONTENT = `<h1>Hi ${user.username},</h1><p> We received a request to reset your password. Use the link below to set up a new password for your GSAC Account. If you did not request to reset your password ignore this email and the link will expire in 24 hours. <p>Please click on the link to reset your password:</p><p><a href = ${forgotPwdURL}> Reset Password </a></p></p><p>Regards,<br>GSAC Team</p>`;
    
    // const RFI_ANS_UPDATED_SUBJECT=`GSAC RFI Details Updated for ${project_name}`;
    // const RFI_ANS_UPDATED_CONTENT_MANAGER = `<h1>Hi ${client_name},</h1><p> The ${rfi_type} RFI Details for your Request: <b> ${request_id}</b> has been updated and will be reviewed shortly.</p><p>Regards,<br>GSAC Team</p>`;
    // const RFI_ANS_UPDATED_CONTENT_SECURITYHEAD = `<h1>Hi,</h1><p>The ${rfi_type} RFI details have been updated by the following user:</p><p>Manager Name:${client_name}<br> Requester Name: ${requester_name}<br> Request ID: ${request_id} <br> Project Name: ${project_name}.</p><p> Please log in to view.</p><p>Regards, <br>GSAC Team</p>`;
    
    // const NEW_PROJECT_REQUEST_SUBJECT = `New Project Request - ${project_name}`;
    // const NEW_PROJECT_REQUEST_CONTENT_MANAGER = `<h1>Hi ${client_name},</h1><p> You have successfully raised a new request on GSAC. Please note that the RFI details for this request can be filled on the portal by clicking the edit icon under the "RFI Tab".</p><p> REQUEST ID:<b> ${request_id}</b></p><p>Regards,<br>GSAC Team</p>`;
    // const NEW_PROJECT_REQUEST_CONTENT_SECURITYHEAD = `<h1>Hi,</h1><p>You have a new project request raised by ${client_name} in the GSAC Portal. Please find the details below:</p><p> Requester Name: ${requester_name}<br> Request ID: ${request_id} <br> Project Name: ${project_name}.</p><p> Please log in for further details.</p><p>Regards, <br>GSAC Team</p>`;
    
    // const REPORT_UPLOAD_SUBJECT =`GSAC: Security Report ${round_no} Update`;
    // const REPORT_UPLOAD_CONTENT = `<h1>Hi ${clientData.client_name},</h1> <p> Security Report has been uploaded for ${clientData.project_name} - ${round_no}. Please <a href= "http://gsac.valuelabs.com">login </a> to view.</p><p><span>Requester Name: </span> ${clientData.requester_name}</p><p><span>Project Name: </span>${clientData.project_name} </p><p><span>Request ID: </span>${clientData.request_id}</p><p>Regards,<br>GSAC Team</p>`;
    
    const PROJECT_STATUS_UPDATED_SUBJECT ='GSAC: Project Status';
    // const PROJECT_STATUS_UPDATED_CONTENT = `<h1>Hi ${clientData.client_name},</h1> <p> Project status for ${clientData.project_name} has been updated to ${project_status}. Please login for further details.</p><p><span>Requester Name: </span> ${clientData.requester_name}</p><p><span>Project Name: </span>${clientData.project_name} </p><p><span>Request ID: </span>${clientData.request_id}</p><p>Regards,<br>GSAC Team</p>`;
    
    const QA_ASSIGNED_SUBJECT = 'GSAC: New Project Alert';
    // const QA_ASSIGNED_CONTENT = `<h1>Hi,</h1> <p> You have been assigned to a new project with the following details.</p><p><span>User: </span> ${client_name}</p><p><span>Project Name: </span>${project_name} </p><p><span>Request ID: </span>${request_id}</p><p>Please login to view.</p><p>Regards,<br>GSAC Team</p>`;
    
    const QA_UNASSIGNED_SUBJECT = 'GSAC: Relieved from Project';
    // const QA_UNASSIGNED_CONTENT = `<h1>Hi,</h1> <p> Please note that you have been relieved from ${project_name} Project.</p><p><span>Client Name: </span> ${client_name}</p><p><span>Project Name: </span>${project_name} </p><p><span>Request ID: </span>${request_id}</p><p>Regards,<br>GSAC Team</p>`;
    
    const CREATE_QA_SUBJECT = 'Security QA Invite';
    // const CREATE_QA_CONTENT = `<h1>Hi ${name}, </h1><p> Please click on the link to register as a Security QA on the GSAC Portal:</p><p><a href = ${InviteURL}> Click here </a></p><p>Regards,<br>GSAC Team</p>`;

module.exports={
    //login scenarios
    NO_EMAIL_REGISTERED,
    INCORRECT_PASSWORD,
    IVALID_OTP,
    UNAUTHORIZED_ADMIN,
    ALREADY_LOGGED_IN,
    UNREGISTERED_MANAGER,
    QA_SUCCESSFUL_REGISTRATION,
    SUCCESSFUL_REGISTRATION,
    UNAUTHORIZED_ACCESS,
    CONFIG_OLD_PASSWORD_CHANGE,
    CONGIF_DETAILS_UPDATED,
    CHANGE_PWD_NEW,
    CHANGE_PWD_SUCCESS,
    ERROR_SENDING_MAIL,
    CHECK_MAIL,
    FORGOT_PWD,
    CREATE_NEW_PROJECT_REQUEST,
    LINK_EXPIRED_MSG,
    REGISTER_MANAGER_SUBJECT,
    REGISTER_SUBJECT_SECURITYHEAD,
    OTP_MAIL_SUBJECT,
    FORGOT_PWD_SUBJECT,
    PROJECT_STATUS_UPDATED_SUBJECT,
    QA_ASSIGNED_SUBJECT,
    QA_UNASSIGNED_SUBJECT,
    CREATE_QA_SUBJECT

}