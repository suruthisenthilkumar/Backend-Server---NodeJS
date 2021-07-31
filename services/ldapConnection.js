const {
    NO_EMAIL_REGISTERED,
} = require('../constants/constants');
var ldap = require('ldapjs');
const { ldap_cred } = require('../constants/credentials');



class ldapConnection{

  ldap_cred = (location) => {
       
    switch (location) {
        case 'corp.ads.valuelabs.net':
            return ldap_cred.corp;
        case 'lsz.ads.valuelabs.net':
            return ldap_cred.lsz;
        case 'SLS.ads.valuelabs.net':
            return ldap_cred.sls;
        case 'T02.ads.valuelabs.net':
            return ldap_cred.t02;
        case 'T03.ads.valuelabs.net':
            return ldap_cred.t03;
        case 'php.ads.valuelabs.net':
            return ldap_cred.php;
        case 'ro.ads.valuelabs.net':
            return ldap_cred.ro;
    }

}

ldap_search = (req,response,email,location)=>{
return new Promise((resolve, reject)=> {
    // Some imaginary 2000 ms timeout simulating a db call

    console.log('in ldap mail check auth');
    console.log(location);
    var ldap_credentials = this.ldap_cred(location);
    var client = ldap.createClient({
        url: ldap_credentials.url,
        bindDN: ldap_credentials.bindDN,
        // timeLimit: 7000,
        // idleTimeout: 3000,
        connectTimeout: 2000
    })
    client.bind(ldap_cred.admin, ldap_cred.admin_pwd, (err)=> {
        if (err) {
            // response.status(500).send({ error: 'Failed to connect to LDAP' });
            reject({error: 'Failed to connect to LDAP'});
        }
        else {
            try {
                console.log('Connected to LDAP as DN User');
              

                var filter = `(mail=${email})`

                client.search(ldap_credentials.bindDN, { filter: filter, scope: 'sub', attributes: ['distinguishedName','name','department','title'] }, function (error, resp) {
                    console.log('in search function');
                    if (error) {
                        // response.status(500).send({ error: "LDAP search failed" });
                        reject({error:'LDAP search failed'});
                    }

                    else {
                        try {
                            console.log('user present');
                            
                            let arr = [];
                            resp.on('searchEntry', (entry) => {
                                console.log('in entry');
                                

                                for (var i = 0; i < entry.attributes.length; i++) {
                                    arr.push(
                                        // type: entry.attributes[i].type,
                                        entry.attributes[i]._vals.toString()
                                    );
                                }

                                console.log(arr);
                                console.log(arr[0]);
                           


                            })
                            resp.on('error', (err) => {
                               
                  
                                // response.status(500).send({ error: "LDAP search failed" });
                                reject({error:'LDAP search failed'});

                            })
                            resp.on('end', (val) => {
                               
                                if (arr.length >1) {
                                    console.log('User exists');
                                    console.log('arrrrrr');
                                    console.log(arr);
                                    resolve({msg:'User exists', data:arr[1],ldap_connection:client,project:arr[2],name:arr[3],designation:arr[0]});
                                    // return {user:arr[0]};
                                }

                                else {
                                    // response.status(400).send({ error: NO_EMAIL_REGISTERED });
                                    reject({error:NO_EMAIL_REGISTERED});

                                }
                            })
                        }

                        catch (error) {
                            console.log('error in catch');
                            console.log(error);
                        }

                    }


                });
            }
            catch (err) {
                console.log('error in final response');
                console.log((err));
                // response.status(500).send({ error: 'Connection Failed' });
                reject({error:'Connection failed'});
            }
        }
    })
    client.on('error', function (err) {
        console.log('Timeout .....' + err);   
        // response.status(400).send({error:"LDAP connection error"});
        reject({error:'Connection error'});

             
    });
    client.on('connectTimeout', (err) => {
        console.log('*******************connectTimeout err', err);
        // response.status(408).send({error:"Connection timeout!"});
        reject({error:'Connection timeout'});

    })
});
}

 
}
module.exports= ldapConnection;
  