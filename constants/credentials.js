ldap_cred={
    admin:'CN=gsac admin,OU=Service Accounts,DC=lsz,DC=ads,DC=valuelabs,DC=net',
    admin_pwd: 'Value*12',
    lsz:{
    url:'ldap://10.10.52.124/',
    bindDN: 'DC=LSZ,DC=ads,DC=valuelabs,DC=net'
    },
    corp:{
    url:'ldap://10.10.52.100/',
    bindDN:'DC=corp,DC=ads,DC=valuelabs,DC=net',
    },
    sls:{
    url: 'ldap://10.10.52.113/',
    bindDN: 'DC=SLS,DC=ads,DC=valuelabs,DC=net',
    },
    t02:{
    url: 'ldap://10.10.52.136/',
    bindDN: 'DC=T02,DC=ads,DC=valuelabs,DC=net',
    },
    t03:{
    url: 'ldap://10.10.52.153/',
    bindDN: 'DC=T03,DC=ads,DC=valuelabs,DC=net',
    },
    php:{
    url: 'ldap://10.10.52.108/',
    bindDN: 'DC=PHP,DC=ads,DC=valuelabs,DC=net',
    },
    ro:{
    url:'ldap://10.10.52.123/',
    bindDN: 'DC=RO,DC=ads,DC=valuelabs,DC=net'
    }
}

module.exports = {ldap_cred}