const ADD_PORTAL_INFO="UPDATE clients set portal='gsac,gpac' where email = $1";
const ASSIGN_SME =  "UPDATE client_details SET tester = $1 WHERE request_id= $2;"

const CREATE_CLIENT = "INSERT INTO clients (email,client_name,cluster_head_dlt,geography,dlt2,portal) values ($1,$2,$3,$4,$5,$6)";
const CREATE_CLIENT_DETAILS="INSERT INTO client_details (request_id,requester_name,project_name,jo_status,jo_value,jo_value_usd,currency_symbol,commercial_status,project_type,client_id,portal,rfi_type) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)";
const CHECK_USER="SELECT * from clients where email= $1";

const DELETE_USER_SECRET_KEY= "update users set secret_key_gpac = null where email = $1 and portal LIKE 'gpac%'";
const DELETE_MANAGER_SECRET_KEY="update clients set secret_key_gpac = null where email = $1 and portal LIKE 'gpac%'";
const DISPLAY_CONFIG_DETAILS = "SELECT admin_email, admin_password, manager_email FROM configs where  portal = 'gpac';";


const FETCH_ALL_SME = "select username, designation from users where \"role\"= 'sme';"
const FETCH_CLIENT_USING_REQID="select * from clients t1 left join client_details t2 on t1.id = t2.client_id where t2.request_id = $1";

const GET_USER = "SELECT id , username, email, role, admin_status,secret_key_gpac from users where jwt_token_gpac=$1 and portal = 'gpac';";
const GET_MANAGER = "SELECT id, client_name, email,secret_key_gpac from clients where token_gpac=$1";
const GET_PORTAL_INFO="SELECT portal from clients where email= $1";
const GET_ID_FROM_CLIENTS="SELECT id from clients where email= $1";
const GET_QUESTION_ID = "SELECT id from performance_questn";
const GET_SECRET_MANAGER = "SELECT secret_key_gpac FROM clients WHERE email = $1 and portal LIKE 'gpac%'";
const GET_SECRET="SELECT secret_key_gpac FROM users WHERE email = $1 and portal LIKE 'gpac%'";
const GET_GPAC_MAIL_AUTH_DETAILS="SELECT admin_email,admin_password,manager_email from configs where portal ='gpac'";
const GET_PROJECT_DETAILS_PH = "SELECT request_id,(WITH sme_details AS (SELECT array_agg(sme_id) AS ids FROM sme_details WHERE  sme_details.req_id= client_details.request_id) SELECT string_agg(username::text, ',') from users WHERE id = ANY ( SELECT unnest(ids) FROM sme_details))tester,client_name,requester_name,email,project_name,project_status,signed_off,proposed_eta,expected_eta,project_type,rfi_type,commercial_status,project_billing FROM client_details INNER JOIN clients ON clients.id = client_details.client_id WHERE client_details.portal LIKE 'gpac%';";
const GET_PROJECT_DETAILS_SME = "SELECT request_id,requester_name, client_name,email,project_name,project_status,signed_off,proposed_eta,expected_eta,project_type,rfi_type,commercial_status FROM client_details INNER JOIN clients ON clients.id = client_details.client_id INNER JOIN sme_details,project_billing as sme ON sme.req_id=client_details.request_id WHERE client_details.portal LIKE 'gpac%' and sme.sme_id=$1";
const GET_ALL_SME_DETAILS="select username, email, designation from users where role= 'sme';"
const GET_PROJECT_DETAILS = "select t1.client_name, t2.project_name from clients t1 full join client_details t2 on t1.id = t2.client_id where t2.request_id = $1";
const GET_SME_EMAIL = "select email from users where username = $1";
const GET_SME_EMAILID="select array_agg(email) as email from users where username = ANY(SELECT UNNEST(ARRAY[:sme])) and role='sme'"
const GET_CLIENT_INFORMATION = "select t2.request_id, t1.email, t1.client_name, t2.requester_name, t2.project_name, t1.cluster_head_dlt,t1.geography, t1.dlt2, t2.jo_status, t2.jo_value, t2.currency_symbol, t2.jo_value_usd,t2.commercial_status,t2.project_type,t2.project_billing from clients t1 full join client_details t2 on t1.id = t2.client_id where t2.request_id = $1";
const GET_CLIENT_INFORMATION_SME = "select t2.request_id, t1.email, t1.client_name, t2.requester_name, t2.project_name, t1.cluster_head_dlt,t1.geography, t1.dlt2, t2.jo_status, t2.jo_value, t2.currency_symbol, t2.jo_value_usd,t2.commercial_status,t2.project_type,t2.project_billing from clients t1 full join client_details t2 on t1.id = t2.client_id inner join sme_details sme on sme.req_id=t2.request_id where sme.sme_id=$1 and request_id = $2";  
const GET_JO_STATUS="select jo_status from client_details where request_id = $1";
const GET_RFI_ANS= "SELECT q.id, q.quest_type_id, q.questions, a.answers,q.details FROM performance_questn AS q LEFT JOIN performance_ans AS a ON q.id = a.question_id AND a.request_id = $1 ORDER BY q.id";
const GET_GPAC_EMAIL = "SELECT gsac_email FROM configs where portal = 'gpac';";
// const DELETE_SME ="DELETE FROM SME_DETAILS WHERE sme_id=$1;DELETE FROM USERS WHERE id=$1;";
const DELETE_FROM_SME_DETAILS ="DELETE FROM SME_DETAILS WHERE sme_id=$1;";
const DELETE_SME_FROM_USERS ="DELETE FROM USERS WHERE id=$1;";

const INSERT_SECRET_MANAGER = "UPDATE clients SET secret_key_gpac=$1 WHERE email = $2 and portal LIKE 'gpac%'";
const INSERT_SECRET="UPDATE users SET secret_key_gpac= $1 WHERE email = $2 and portal LIKE 'gpac%'";
const INSERT_TOKEN_MANAGER="update clients set token_gpac = $1 WHERE email = $2 and portal LIKE 'gpac%'";
const INSERT_TOKEN = "update users set jwt_token_gpac= $1 WHERE email = $2 and portal LIKE 'gpac%'";

const POPULATE_ANS_TABLE = "INSERT INTO performance_ans (request_id, question_id, answers) VALUES ($1,$2,$3)";

const UPDATE_PROJECT_STATUS ="UPDATE client_details SET project_status=$1 WHERE request_id=$2";
const UPDATE_CLIENT_DETAILS_PH="update client_details set requester_name=$1,project_name=$2,jo_status=$3,jo_value=$4,currency_symbol=$5,jo_value_usd=$6,commercial_status=$7,project_billing=$8 where request_id=$9 "
const UPDATE_CLIENT_DETAILS="update client_details set requester_name=$1,project_name=$2,commercial_status=$3 where request_id=$4 "
const UPDATE_CLIENTS_TABLE="UPDATE clients AS t1 SET cluster_head_dlt =$1,geography=$2,dlt2=$3 FROM client_details AS t2 WHERE t1.id = t2.client_id and t2.request_id = $4"
const UPDATE_RFI_ANS = "UPDATE performance_ans SET answers = $1  where request_id= $2 and question_id=$3";
const UPDATE_SIGNOFF_STATUS = "UPDATE client_details set signed_off=$1 where request_id = $2 ";
const UPDATE_CONFIG_DETAILS = "UPDATE configs SET manager_email =$1, admin_email=$2, admin_password =$3 where portal = 'gpac';"

module.exports = {
 ADD_PORTAL_INFO,
 ASSIGN_SME,
 
 CREATE_CLIENT, 
 CREATE_CLIENT_DETAILS,
 CHECK_USER,

 DELETE_USER_SECRET_KEY,
 DELETE_MANAGER_SECRET_KEY,
 DISPLAY_CONFIG_DETAILS,
//  DELETE_SME,
 DELETE_FROM_SME_DETAILS,
 DELETE_SME_FROM_USERS,

 FETCH_ALL_SME,
 FETCH_CLIENT_USING_REQID,

 GET_ID_FROM_CLIENTS,
 GET_QUESTION_ID,
 GET_PORTAL_INFO,
 GET_SECRET_MANAGER,
 GET_SECRET,
 GET_USER,
 GET_MANAGER,
 GET_GPAC_MAIL_AUTH_DETAILS,
 GET_GPAC_EMAIL,
 

 GET_PROJECT_DETAILS_PH,
 GET_PROJECT_DETAILS_SME,
 GET_ALL_SME_DETAILS,
 GET_PROJECT_DETAILS,
 GET_SME_EMAIL,
 GET_CLIENT_INFORMATION,
 GET_CLIENT_INFORMATION_SME,
 GET_JO_STATUS, 
 GET_RFI_ANS,
 GET_SME_EMAILID,

 INSERT_SECRET_MANAGER,
 INSERT_SECRET,
 INSERT_TOKEN_MANAGER,
 INSERT_TOKEN,

 POPULATE_ANS_TABLE,

 UPDATE_PROJECT_STATUS,
 UPDATE_CLIENT_DETAILS_PH,
 UPDATE_CLIENT_DETAILS,
 UPDATE_CLIENTS_TABLE,
 UPDATE_RFI_ANS,
 UPDATE_SIGNOFF_STATUS,
 UPDATE_CONFIG_DETAILS
}